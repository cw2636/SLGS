package handlers

import (
	"net/http"

	"edumeet-server/hub"
	"edumeet-server/rooms"

	"github.com/gin-gonic/gin"
)

// apiKeyMiddleware rejects requests that don't carry the correct X-API-Key header.
// If no API key is configured (empty string), the middleware is skipped so dev
// environments work without extra config.
func apiKeyMiddleware(apiKey string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if apiKey == "" {
			c.Next()
			return
		}
		if c.GetHeader("X-API-Key") != apiKey {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid or missing API key"})
			return
		}
		c.Next()
	}
}

// RESTHandlers registers REST API endpoints for room management.
func RESTHandlers(r *gin.Engine, h *hub.Hub, rm *rooms.Manager, apiKey string) {
	api := r.Group("/api")

	// LiveKit token generation (no API key — client calls this after portal login)
	api.POST("/livekit-token", IssueLiveKitToken)

	// IT admin server-side auth (replaces client-side credential check)
	api.POST("/it-auth", ValidateITSession)

	// LiveKit reverse proxy — bridges client v2 API with livekit-server v1.7.2.
	// v1 paths (livekit-client ≥2.18 default, singlePeerConnection: true)
	r.GET("/lk/rtc/v1/validate", ProxyValidate)
	r.GET("/lk/rtc/v1", ProxyRTC)
	// v0 paths (singlePeerConnection: false — forces old protocol, compatible with livekit-server v1.x)
	r.GET("/lk/rtc/validate", ProxyValidate)
	r.GET("/lk/rtc", ProxyRTC)

	// Health check
	api.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"service": "edumeet-server",
		})
	})

	// List active rooms
	api.GET("/rooms", func(c *gin.Context) {
		roomList := rm.List()
		if roomList == nil {
			roomList = make([]*rooms.Room, 0)
		}
		c.JSON(http.StatusOK, roomList)
	})

	// Get room details + participants
	api.GET("/rooms/:id", func(c *gin.Context) {
		roomID := c.Param("id")
		room, exists := rm.Get(roomID)
		if !exists {
			c.JSON(http.StatusNotFound, gin.H{"error": "room not found"})
			return
		}

		participants := h.GetRoomParticipants(roomID)
		c.JSON(http.StatusOK, gin.H{
			"room":         room,
			"participants": participants,
		})
	})

	// Create a room — requires API key
	api.POST("/rooms", apiKeyMiddleware(apiKey), func(c *gin.Context) {
		var body struct {
			ID       string `json:"id" binding:"required"`
			Title    string `json:"title" binding:"required"`
			HostID   string `json:"host_id"`
			HostName string `json:"host_name"`
		}
		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if _, exists := rm.Get(body.ID); exists {
			c.JSON(http.StatusConflict, gin.H{"error": "room already exists"})
			return
		}

		room := rm.Create(body.ID, body.Title, body.HostID, body.HostName)
		c.JSON(http.StatusCreated, room)
	})

	// Delete a room — requires API key
	api.DELETE("/rooms/:id", apiKeyMiddleware(apiKey), func(c *gin.Context) {
		roomID := c.Param("id")
		if _, exists := rm.Get(roomID); !exists {
			c.JSON(http.StatusNotFound, gin.H{"error": "room not found"})
			return
		}
		rm.Delete(roomID)
		c.JSON(http.StatusOK, gin.H{"deleted": roomID})
	})
}
