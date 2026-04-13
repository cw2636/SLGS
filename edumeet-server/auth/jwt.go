// Package auth validates JWT tokens issued by the Python/Node backend.
package auth

import (
	"errors"
	"fmt"

	"github.com/golang-jwt/jwt/v5"
)

// Claims represents the JWT payload shared with the school backend.
type Claims struct {
	UserID string `json:"user_id"`
	Name   string `json:"name"`
	Role   string `json:"role"` // student, teacher, staff, principal
	jwt.RegisteredClaims
}

// ValidateToken parses and validates a JWT string using the shared secret.
func ValidateToken(tokenStr, secret string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return []byte(secret), nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token claims")
	}

	return claims, nil
}

// GenerateDevToken creates a token for local development (no Redis needed).
func GenerateDevToken(userID, name, role, secret string) (string, error) {
	claims := &Claims{
		UserID: userID,
		Name:   name,
		Role:   role,
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}
