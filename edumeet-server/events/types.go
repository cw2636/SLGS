// Package events defines all WebSocket event types exchanged between clients and the Go signaling server.
package events

import "time"

// Envelope is the standard JSON message format for all WebSocket communication.
type Envelope struct {
	Type      string      `json:"type"`
	From      string      `json:"from,omitempty"`
	Target    string      `json:"target,omitempty"` // for peer-to-peer signaling
	RoomID    string      `json:"room_id"`
	Payload   interface{} `json:"payload"`
	Timestamp time.Time   `json:"timestamp,omitempty"`
}

// Event types — inbound (client → server) and outbound (server → client).
const (
	// Connection lifecycle
	TypeRoomJoin  = "room_join"
	TypeRoomLeave = "room_leave"

	// Chat
	TypeChatMessage = "chat_message"

	// Whiteboard
	TypeWhiteboardDraw       = "whiteboard_draw"
	TypeWhiteboardClear      = "whiteboard_clear"
	TypeWhiteboardPermission = "whiteboard_permission" // teacher grants/revokes

	// Interactive
	TypeHandRaise   = "hand_raise"
	TypeHandLower   = "hand_lower"
	TypeQuizAnswer  = "quiz_answer"
	TypeQuizStart   = "quiz_start"
	TypePollVote    = "poll_vote"

	// WebRTC signaling (peer-to-peer, uses Target field)
	TypeWebRTCOffer     = "webrtc_offer"
	TypeWebRTCAnswer    = "webrtc_answer"
	TypeWebRTCIce       = "webrtc_ice"
	TypeWebRTCReady     = "webrtc_ready"     // new peer ready for offers

	// Screen sharing
	TypeScreenShareStart = "screen_share_start"
	TypeScreenShareStop  = "screen_share_stop"

	// Breakout rooms
	TypeBreakoutCreate = "breakout_create" // teacher creates breakout rooms
	TypeBreakoutAssign = "breakout_assign" // teacher assigns users
	TypeBreakoutJoin   = "breakout_join"
	TypeBreakoutLeave  = "breakout_leave"
	TypeBreakoutClose  = "breakout_close"  // teacher closes all breakouts
	TypeBreakoutList   = "breakout_list"   // server sends list of breakout rooms

	// System
	TypeParticipantList = "participant_list"
	TypeError           = "error"
)

// ChatPayload is the payload for chat_message events.
type ChatPayload struct {
	Text string `json:"text"`
	Name string `json:"name,omitempty"`
}

// WhiteboardPayload carries drawing data.
type WhiteboardPayload struct {
	Tool   string      `json:"tool"` // pen, eraser, text, shape
	Points interface{} `json:"points"`
	Color  string      `json:"color"`
	Width  float64     `json:"width"`
}

// HandPayload signals hand raise/lower.
type HandPayload struct {
	Raised bool   `json:"raised"`
	Name   string `json:"name,omitempty"`
}

// QuizPayload carries quiz answers.
type QuizPayload struct {
	QuizID   string `json:"quiz_id"`
	Question int    `json:"question"`
	Answer   string `json:"answer"`
}
