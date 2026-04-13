// Package hub implements the central WebSocket hub that manages client connections,
// room membership, and message broadcasting.
package hub

import (
	"encoding/json"
	"sync"
	"time"

	"edumeet-server/events"

	"github.com/gorilla/websocket"
	"github.com/rs/zerolog/log"
)

const (
	writeWait  = 10 * time.Second
	pongWait   = 60 * time.Second
	pingPeriod = (pongWait * 9) / 10
	maxMsgSize = 131072 // 128 KB — WebRTC SDPs with screen-share + camera can exceed 8 KB
)

// Client represents a single WebSocket connection.
type Client struct {
	Hub    *Hub
	Conn   *websocket.Conn
	Send   chan []byte
	UserID string
	Name   string
	Role   string
	RoomID string
}

// Hub maintains the set of active clients and broadcasts messages to rooms.
type Hub struct {
	mu         sync.RWMutex
	clients    map[*Client]bool
	register   chan *Client
	unregister chan *Client
	broadcast  chan *events.Envelope
	targeted   chan *events.Envelope // messages with Target field
}

// New creates a new Hub instance.
func New() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan *events.Envelope, 256),
		targeted:   make(chan *events.Envelope, 256),
	}
}

// Run starts the hub's event loop. Call this in a goroutine.
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
			log.Info().Str("user", client.Name).Str("room", client.RoomID).Msg("client joined")

			// Notify room
			h.BroadcastToRoom(client.RoomID, &events.Envelope{
				Type:      events.TypeRoomJoin,
				From:      client.UserID,
				RoomID:    client.RoomID,
				Payload:   map[string]string{"name": client.Name, "role": client.Role},
				Timestamp: time.Now(),
			})

			// Send participant list
			h.sendParticipantList(client.RoomID)

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.Send)
			}
			h.mu.Unlock()
			log.Info().Str("user", client.Name).Str("room", client.RoomID).Msg("client left")

			h.BroadcastToRoom(client.RoomID, &events.Envelope{
				Type:      events.TypeRoomLeave,
				From:      client.UserID,
				RoomID:    client.RoomID,
				Payload:   map[string]string{"name": client.Name},
				Timestamp: time.Now(),
			})
			h.sendParticipantList(client.RoomID)

		case env := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				if client.RoomID == env.RoomID {
					select {
					case client.Send <- mustJSON(env):
					default:
						close(client.Send)
						delete(h.clients, client)
					}
				}
			}
			h.mu.RUnlock()

		case env := <-h.targeted:
			h.mu.RLock()
			for client := range h.clients {
				if client.RoomID == env.RoomID && client.UserID == env.Target {
					select {
					case client.Send <- mustJSON(env):
					default:
						close(client.Send)
						delete(h.clients, client)
					}
					break
				}
			}
			h.mu.RUnlock()
		}
	}
}

// Register adds a client to the hub.
func (h *Hub) Register(c *Client) {
	h.register <- c
}

// Unregister removes a client from the hub.
func (h *Hub) Unregister(c *Client) {
	h.unregister <- c
}

// BroadcastToRoom sends an event to all clients in a room.
func (h *Hub) BroadcastToRoom(roomID string, env *events.Envelope) {
	h.broadcast <- env
}

// SendToUser sends an event to a specific user in a room (for WebRTC signaling).
func (h *Hub) SendToUser(env *events.Envelope) {
	h.targeted <- env
}

// GetRoomParticipants returns a list of participants in a room.
func (h *Hub) GetRoomParticipants(roomID string) []map[string]string {
	h.mu.RLock()
	defer h.mu.RUnlock()
	var participants []map[string]string
	for c := range h.clients {
		if c.RoomID == roomID {
			participants = append(participants, map[string]string{
				"user_id": c.UserID,
				"name":    c.Name,
				"role":    c.Role,
			})
		}
	}
	return participants
}

func (h *Hub) sendParticipantList(roomID string) {
	participants := h.GetRoomParticipants(roomID)
	h.BroadcastToRoom(roomID, &events.Envelope{
		Type:      events.TypeParticipantList,
		RoomID:    roomID,
		Payload:   participants,
		Timestamp: time.Now(),
	})
}

func mustJSON(v interface{}) []byte {
	b, _ := json.Marshal(v)
	return b
}
