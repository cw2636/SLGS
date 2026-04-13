// Package handlers implements WebSocket upgrade and REST API endpoints.
package handlers

import (
	"net/http"
	"strings"

	"edumeet-server/auth"
	"edumeet-server/hub"
	"edumeet-server/rooms"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/rs/zerolog/log"
)

// makeUpgrader returns a WebSocket upgrader that only allows connections from
// known origins. allowedOrigins is a comma-separated list (or a single value).
func makeUpgrader(allowedOrigins string) websocket.Upgrader {
	origins := strings.Split(allowedOrigins, ",")
	for i := range origins {
		origins[i] = strings.TrimSpace(origins[i])
	}
	return websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			origin := r.Header.Get("Origin")
			if origin == "" {
				return false // reject requests with no origin header
			}
			for _, o := range origins {
				if strings.EqualFold(origin, o) {
					return true
				}
			}
			log.Warn().Str("origin", origin).Msg("WebSocket origin rejected")
			return false
		},
	}
}

// WSHandler upgrades HTTP to WebSocket for a classroom session.
func WSHandler(h *hub.Hub, rm *rooms.Manager, jwtSecret, allowedOrigins string) gin.HandlerFunc {
	upgrader := makeUpgrader(allowedOrigins)
	return func(c *gin.Context) {
		roomID := c.Query("room")
		token := c.Query("token")

		if roomID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "room parameter required"})
			return
		}

		// Validate JWT
		var userID, name, role string
		if token != "" {
			claims, err := auth.ValidateToken(token, jwtSecret)
			if err != nil {
				log.Warn().Err(err).Msg("invalid token, using guest identity")
				userID = "guest-" + c.ClientIP()
				name = c.DefaultQuery("name", "Guest")
				role = "student" // never trust role from URL params on token failure
			} else {
				userID = claims.UserID
				name = claims.Name
				role = claims.Role
			}
		} else {
			// No token: allow connection but cap role at student regardless of URL param.
			// This prevents privilege escalation (e.g. ?role=teacher) in demo/dev mode.
			userID = c.DefaultQuery("user_id", "guest-"+c.ClientIP())
			name = c.DefaultQuery("name", "Guest")
			role = "student" // SECURITY: never accept role from unauthenticated URL params
		}

		// Ensure room exists
		if _, exists := rm.Get(roomID); !exists {
			rm.Create(roomID, roomID, userID, name)
		}

		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Error().Err(err).Msg("websocket upgrade failed")
			return
		}

		client := &hub.Client{
			Hub:    h,
			Conn:   conn,
			Send:   make(chan []byte, 256),
			UserID: userID,
			Name:   name,
			Role:   role,
			RoomID: roomID,
		}

		h.Register(client)

		go client.WritePump()
		go client.ReadPump()
	}
}
