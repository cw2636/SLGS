// Package rooms manages virtual classroom rooms.
package rooms

import (
	"sync"
	"time"
)

// Room represents a virtual classroom session.
type Room struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Host        string    `json:"host"`
	HostName    string    `json:"host_name"`
	CreatedAt   time.Time `json:"created_at"`
	Participants int      `json:"participants"`
}

// Manager maintains the registry of active rooms.
type Manager struct {
	mu    sync.RWMutex
	rooms map[string]*Room
}

// NewManager creates a room manager.
func NewManager() *Manager {
	return &Manager{rooms: make(map[string]*Room)}
}

// Create registers a new room.
func (m *Manager) Create(id, title, hostID, hostName string) *Room {
	m.mu.Lock()
	defer m.mu.Unlock()

	room := &Room{
		ID:        id,
		Title:     title,
		Host:      hostID,
		HostName:  hostName,
		CreatedAt: time.Now(),
	}
	m.rooms[id] = room
	return room
}

// Get returns a room by ID.
func (m *Manager) Get(id string) (*Room, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	r, ok := m.rooms[id]
	return r, ok
}

// List returns all active rooms.
func (m *Manager) List() []*Room {
	m.mu.RLock()
	defer m.mu.RUnlock()
	var list []*Room
	for _, r := range m.rooms {
		list = append(list, r)
	}
	return list
}

// Delete removes a room.
func (m *Manager) Delete(id string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.rooms, id)
}

// UpdateParticipantCount sets participant count for a room.
func (m *Manager) UpdateParticipantCount(id string, count int) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if r, ok := m.rooms[id]; ok {
		r.Participants = count
	}
}
