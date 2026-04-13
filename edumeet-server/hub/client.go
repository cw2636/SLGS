package hub

import (
	"encoding/json"
	"fmt"
	"os"
	"sync"
	"time"

	"edumeet-server/events"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/websocket"
	"github.com/rs/zerolog/log"
)

// tokenBucket is a simple per-client rate limiter.
// Clients may send at most burst messages instantly, then refill at rate/sec.
type tokenBucket struct {
	mu     sync.Mutex
	tokens float64
	max    float64
	rate   float64 // tokens per millisecond
	last   time.Time
}

func newTokenBucket(ratePerSec, burst float64) *tokenBucket {
	return &tokenBucket{
		tokens: burst,
		max:    burst,
		rate:   ratePerSec / 1000,
		last:   time.Now(),
	}
}

func (tb *tokenBucket) Allow() bool {
	tb.mu.Lock()
	defer tb.mu.Unlock()
	now := time.Now()
	elapsed := float64(now.Sub(tb.last).Milliseconds())
	tb.last = now
	tb.tokens = min(tb.max, tb.tokens+elapsed*tb.rate)
	if tb.tokens < 1 {
		return false
	}
	tb.tokens--
	return true
}

func min(a, b float64) float64 {
	if a < b {
		return a
	}
	return b
}

// ReadPump pumps messages from the WebSocket connection to the hub.
func (c *Client) ReadPump() {
	defer func() {
		c.Hub.Unregister(c)
		c.Conn.Close()
	}()

	// Allow 30 msg/sec burst of 60 — enough for fast whiteboard drawing
	// while still preventing flooding attacks.
	limiter := newTokenBucket(30, 60)

	c.Conn.SetReadLimit(maxMsgSize)
	c.Conn.SetReadDeadline(time.Now().Add(pongWait))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Error().Err(err).Str("user", c.Name).Msg("read error")
			}
			break
		}

		// Drop message if client is exceeding rate limit
		if !limiter.Allow() {
			log.Warn().Str("user", c.Name).Msg("rate limit — message dropped")
			continue
		}

		var env events.Envelope
		if err := json.Unmarshal(message, &env); err != nil {
			log.Warn().Err(err).Str("user", c.Name).Msg("invalid JSON")
			continue
		}

		// Stamp sender info
		env.From = c.UserID
		env.RoomID = c.RoomID
		env.Timestamp = time.Now()

		// Enrich chat messages with sender name
		if env.Type == events.TypeChatMessage {
			if payload, ok := env.Payload.(map[string]interface{}); ok {
				payload["name"] = c.Name
				env.Payload = payload
			}
		}

		// Enrich hand raise/lower with sender name
		if env.Type == events.TypeHandRaise || env.Type == events.TypeHandLower {
			if payload, ok := env.Payload.(map[string]interface{}); ok {
				payload["name"] = c.Name
				env.Payload = payload
			}
		}

		// WebRTC signaling → send to target peer only (not broadcast)
		if env.Target != "" && (env.Type == events.TypeWebRTCOffer ||
			env.Type == events.TypeWebRTCAnswer || env.Type == events.TypeWebRTCIce) {
			c.Hub.SendToUser(&env)
			continue
		}

		// Breakout room join → generate LiveKit token for sub-room and send back to requester
		if env.Type == events.TypeBreakoutJoin {
			payload, _ := env.Payload.(map[string]interface{})
			breakoutRoomID, _ := payload["roomId"].(string)
			if breakoutRoomID != "" {
				token, lkURL, err := generateBreakoutToken(breakoutRoomID, c.UserID, c.Name, c.Role)
				if err != nil {
					log.Error().Err(err).Str("user", c.Name).Msg("failed to generate breakout token")
				} else {
					resp := &events.Envelope{
						Type:   "breakout_token",
						From:   "server",
						RoomID: c.RoomID,
						Target: c.UserID,
						Payload: map[string]interface{}{
							"roomId": breakoutRoomID,
							"token":  token,
							"url":    lkURL,
						},
						Timestamp: time.Now(),
					}
					c.Hub.SendToUser(resp)
				}
			}
			// Also broadcast so teacher sees updated state
			c.Hub.BroadcastToRoom(c.RoomID, &env)
			continue
		}

		c.Hub.BroadcastToRoom(c.RoomID, &env)
	}
}

// WritePump pumps messages from the hub to the WebSocket connection.
func (c *Client) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := c.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
				return
			}

			// Drain queued messages — each as its own WebSocket frame
			n := len(c.Send)
			for i := 0; i < n; i++ {
				c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
				if err := c.Conn.WriteMessage(websocket.TextMessage, <-c.Send); err != nil {
					return
				}
			}

		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// breakoutClaims mirrors the JWT structure LiveKit expects.
type breakoutClaims struct {
	Video struct {
		RoomJoin       bool   `json:"roomJoin"`
		Room           string `json:"room"`
		CanPublish     bool   `json:"canPublish"`
		CanPublishData bool   `json:"canPublishData"`
		CanSubscribe   bool   `json:"canSubscribe"`
	} `json:"video"`
	Identity string `json:"identity,omitempty"`
	Kind     string `json:"kind,omitempty"`
	Name     string `json:"name,omitempty"`
	Metadata string `json:"metadata,omitempty"`
	jwt.RegisteredClaims
}

// generateBreakoutToken creates a LiveKit JWT for a breakout sub-room.
func generateBreakoutToken(roomName, identity, name, role string) (string, string, error) {
	apiKey := os.Getenv("LIVEKIT_API_KEY")
	apiSecret := os.Getenv("LIVEKIT_API_SECRET")
	lkURL := os.Getenv("LIVEKIT_URL")
	if apiKey == "" || apiSecret == "" {
		return "", "", fmt.Errorf("LIVEKIT_API_KEY or LIVEKIT_API_SECRET not set")
	}
	if lkURL == "" {
		lkURL = "ws://localhost:7880"
	}

	now := time.Now()
	claims := breakoutClaims{
		Identity: identity,
		Kind:     "standard",
		Name:     name,
		Metadata: fmt.Sprintf(`{"role":"%s"}`, role),
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    apiKey,
			Subject:   identity,
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(2 * time.Hour)),
		},
	}
	claims.Video.RoomJoin = true
	claims.Video.Room = roomName
	claims.Video.CanPublish = true
	claims.Video.CanPublishData = true
	claims.Video.CanSubscribe = true

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(apiSecret))
	if err != nil {
		return "", "", err
	}
	return signed, lkURL, nil
}
