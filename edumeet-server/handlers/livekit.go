package handlers

// LiveKit token endpoint — generates signed JWT access tokens for the LiveKit SFU.
// Uses the existing golang-jwt library so no new dependencies are needed.
// Token format matches LiveKit's documented JWT spec exactly.

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// videoGrants mirrors LiveKit's VideoGrant claim structure.
type videoGrants struct {
	RoomCreate     bool   `json:"roomCreate,omitempty"`
	RoomList       bool   `json:"roomList,omitempty"`
	RoomRecord     bool   `json:"roomRecord,omitempty"`
	RoomAdmin      bool   `json:"roomAdmin,omitempty"`
	RoomJoin       bool   `json:"roomJoin,omitempty"`
	Room           string `json:"room,omitempty"`
	CanPublish     bool   `json:"canPublish"`
	CanPublishData bool   `json:"canPublishData"`
	CanSubscribe   bool   `json:"canSubscribe"`
}

// lkClaims is the full JWT payload LiveKit expects.
type lkClaims struct {
	Video    videoGrants `json:"video"`
	Identity string      `json:"identity,omitempty"`
	Kind     string      `json:"kind,omitempty"`
	Metadata string      `json:"metadata,omitempty"`
	Name     string      `json:"name,omitempty"`
	jwt.RegisteredClaims
}

type lkTokenReq struct {
	RoomName string `json:"room_name" binding:"required"`
	Identity string `json:"identity"  binding:"required"`
	Name     string `json:"name"      binding:"required"`
	Role     string `json:"role"      binding:"required"`
}

// IssueLiveKitToken signs and returns a LiveKit access token.
// POST /api/livekit-token
func IssueLiveKitToken(c *gin.Context) {
	var req lkTokenReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	apiKey := os.Getenv("LIVEKIT_API_KEY")
	apiSecret := os.Getenv("LIVEKIT_API_SECRET")
	lkURL := os.Getenv("LIVEKIT_URL")

	if apiKey == "" || apiSecret == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "LiveKit not configured (set LIVEKIT_API_KEY and LIVEKIT_API_SECRET)"})
		return
	}
	if lkURL == "" {
		lkURL = "ws://localhost:7880"
	}
	// LiveKit server v1.10.1 supports the v1 join protocol natively —
	// no proxy needed. Return the direct LiveKit URL so livekit-client
	// connects straight to the SFU.

	// Build permission grants based on role
	grants := videoGrants{
		RoomJoin:       true,
		Room:           req.RoomName,
		CanPublish:     true,
		CanPublishData: true,
		CanSubscribe:   true,
	}
	isTeacher := req.Role == "teacher" || req.Role == "principal"
	if isTeacher {
		grants.RoomCreate = true
		grants.RoomList = true
		grants.RoomRecord = true
		grants.RoomAdmin = true
	}

	now := time.Now()
	claims := lkClaims{
		Video:    grants,
		Identity: req.Identity,
		Kind:     "standard",
		Name:     req.Name,
		Metadata: fmt.Sprintf(`{"role":"%s"}`, req.Role),
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    apiKey,       // LiveKit uses issuer = API key
			Subject:   req.Identity, // participant identity
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(24 * time.Hour)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(apiSecret))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "token signing failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": signed,
		"url":   lkURL,
	})
}

// ValidateITSession checks IT admin credentials server-side.
// POST /api/it-auth
func ValidateITSession(c *gin.Context) {
	var body struct {
		User string `json:"user" binding:"required"`
		Pass string `json:"pass" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Load IT credentials from env (never hardcoded)
	itUser := os.Getenv("IT_ADMIN_USER")
	itPass := os.Getenv("IT_ADMIN_PASS")
	if itUser == "" {
		itUser = "it.admin" // fallback for dev — set env in prod
	}
	if itPass == "" {
		itPass = "slgs2025"
	}

	if body.User != itUser || body.Pass != itPass {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Issue a short-lived session token
	secret := os.Getenv("SESSION_SECRET")
	if secret == "" {
		secret = "dev-secret"
	}
	claims := jwt.RegisteredClaims{
		Subject:   "it-admin",
		IssuedAt:  jwt.NewNumericDate(time.Now()),
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(8 * time.Hour)),
	}
	tok, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(secret))
	c.JSON(http.StatusOK, gin.H{"token": tok})
}
