// EduMeet Signaling Server — entry point.
//
// A lightweight Go WebSocket server that handles real-time classroom communication
// for the SLGS school platform. Manages rooms, chat, whiteboard, hand raises,
// and quiz events. Designed to work alongside the existing Node/React frontend.
//
// Usage:
//
//	EDUMEET_PORT=4000 JWT_SECRET=your-secret go run main.go
package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"edumeet-server/config"
	"edumeet-server/handlers"
	"edumeet-server/hub"
	"edumeet-server/rooms"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	// Pretty console logging
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	cfg := config.Load()

	// Hub + room manager
	h := hub.New()
	go h.Run()

	rm := rooms.NewManager()

	// Gin router
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Recovery())

	// CORS — allow the React frontend
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{cfg.CORSOrigin, "http://localhost:3000", "http://localhost:3001"},
		AllowMethods:     []string{"GET", "POST", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// WebSocket endpoint — origin-validated
	allowedWSOrig := cfg.CORSOrigin + ",http://localhost:3000,http://localhost:3001"
	r.GET("/ws/join", handlers.WSHandler(h, rm, cfg.JWTSecret, allowedWSOrig))

	// REST API
	handlers.RESTHandlers(r, h, rm, cfg.APIKey)

	// Graceful shutdown
	go func() {
		quit := make(chan os.Signal, 1)
		signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
		<-quit
		log.Info().Msg("shutting down EduMeet server...")
		os.Exit(0)
	}()

	addr := fmt.Sprintf(":%d", cfg.Port)
	log.Info().Str("addr", addr).Str("cors", cfg.CORSOrigin).Msg("EduMeet signaling server starting")

	if err := r.Run(addr); err != nil {
		log.Fatal().Err(err).Msg("server failed")
	}
}
