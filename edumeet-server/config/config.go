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

	corsOrigin := os.Getenv("CORS_ORIGIN")
	if corsOrigin == "" {
		corsOrigin = "http://localhost:3001"
	}

	return &Config{
		Port:       port,
		RedisURL:   redisURL,
		JWTSecret:  jwtSecret,
		CORSOrigin: corsOrigin,
	}
}
