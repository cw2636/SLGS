// Package config loads environment configuration for the EduMeet signaling server.
package config

import (
	"os"
	"strconv"
)

type Config struct {
	Port       int
	RedisURL   string
	JWTSecret  string
	CORSOrigin string
	APIKey     string // required on mutating REST endpoints (POST/DELETE /api/rooms)
}

func Load() *Config {
	port := 4000
	if p, err := strconv.Atoi(os.Getenv("EDUMEET_PORT")); err == nil {
		port = p
	}

	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "localhost:6379"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "slgs-edumeet-dev-secret"
	}

	// CORS_ORIGIN may be a comma-separated list, e.g. "https://slgs.edu.sl,http://localhost:3001"
	corsOrigin := os.Getenv("CORS_ORIGIN")
	if corsOrigin == "" {
		corsOrigin = "http://localhost:3001"
	}

	apiKey := os.Getenv("EDUMEET_API_KEY")

	return &Config{
		Port:       port,
		RedisURL:   redisURL,
		JWTSecret:  jwtSecret,
		CORSOrigin: corsOrigin,
		APIKey:     apiKey,
	}
}
