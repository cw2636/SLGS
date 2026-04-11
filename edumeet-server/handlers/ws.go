// Package handlers implements WebSocket upgrade and REST API endpoints.
package handlers

import (
	"net/http"

	"edumeet-server/auth"
	"edumeet-server/hub"
	"edumeet-server/rooms"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/rs/zerolog/log"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // CORS handled by gin middleware
	},
}

// WSHandler upgrades HTTP to WebSocket for a classroom session.
func WSHandler(h *hub.Hub, rm *rooms.Manager, jwtSecret string) gin.HandlerFunc {
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
				log.Warn().Err(err).Msg("invalid token, using guest")
				userID = "guest-" + c.ClientIP()
				name = "Guest"
				role = "student"
			} else {
				userID = claims.UserID
				name = claims.Name
				role = claims.Role
			}
		} else {
			// Dev mode: allow anonymous connections with query params
			userID = c.DefaultQuery("user_id", "guest-"+c.ClientIP())
			name = c.DefaultQuery("name", "Guest")
			role = c.DefaultQuery("role", "student")
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
