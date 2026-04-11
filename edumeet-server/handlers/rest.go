package handlers

import (
	"net/http"

	"edumeet-server/hub"
	"edumeet-server/rooms"

	"github.com/gin-gonic/gin"
)

// RESTHandlers registers REST API endpoints for room management.
func RESTHandlers(r *gin.Engine, h *hub.Hub, rm *rooms.Manager) {
	api := r.Group("/api")

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

	// Create a room
	api.POST("/rooms", func(c *gin.Context) {
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

	// Delete a room
	api.DELETE("/rooms/:id", func(c *gin.Context) {
		roomID := c.Param("id")
		if _, exists := rm.Get(roomID); !exists {
			c.JSON(http.StatusNotFound, gin.H{"error": "room not found"})
			return
		}
		rm.Delete(roomID)
		c.JSON(http.StatusOK, gin.H{"deleted": roomID})
	})
}
