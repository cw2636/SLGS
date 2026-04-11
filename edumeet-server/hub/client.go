package hub

import (
	"encoding/json"
	"time"

	"edumeet-server/events"

	"github.com/gorilla/websocket"
	"github.com/rs/zerolog/log"
)

// ReadPump pumps messages from the WebSocket connection to the hub.
func (c *Client) ReadPump() {
	defer func() {
		c.Hub.Unregister(c)
		c.Conn.Close()
	}()

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

			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Drain queued messages
			n := len(c.Send)
			for i := 0; i < n; i++ {
				w.Write([]byte("\n"))
				w.Write(<-c.Send)
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
