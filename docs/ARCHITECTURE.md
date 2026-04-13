# SLGS EduMeet — Architecture & Technical Documentation

## Sierra Leone Grammar School — Virtual Classroom Platform

**Author:** Christopher Wilson  
**Date:** April 2026  
**Stack:** React · Node.js/Express · Go (Gin) · LiveKit SFU · MongoDB · WebSocket

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Why LiveKit SFU](#2-why-livekit-sfu)
3. [System Architecture](#3-system-architecture)
4. [Technical Challenges & Solutions](#4-technical-challenges--solutions)
5. [Code Overview](#5-code-overview)
6. [Feature Deep Dives](#6-feature-deep-dives)
7. [Performance & Scalability](#7-performance--scalability)
8. [Deployment Considerations](#8-deployment-considerations)
9. [Lessons Learned](#9-lessons-learned)

---

## 1. Project Overview

SLGS EduMeet is a purpose-built virtual classroom platform for Sierra Leone Grammar School. Unlike generic video conferencing tools (Zoom, Teams, Google Meet), it provides **education-specific features** designed for real classroom workflows:

- Live video with SFU-powered scalability (100+ participants)
- Real-time collaborative whiteboard
- Hand raise queue with ordered acknowledgement
- In-class polls, quizzes, and focus checks
- Breakout rooms with automatic student grouping
- Class-wide Pomodoro timer
- Shared class notes with teacher pinning
- Floating emoji reactions

The platform runs as three coordinated services:
- **Express.js** (port 3000) — Main web server, authentication, MongoDB
- **Go/Gin** (port 4000) — Real-time signaling hub, LiveKit token generation
- **LiveKit SFU** (port 7880) — Video/audio media server

---

## 2. Why LiveKit SFU

### The Problem: Mesh Topology Doesn't Scale

The original implementation used **peer-to-peer WebRTC** via a custom `useWebRTC` hook. Each participant maintained a direct connection to every other participant.

```
Participants    Connections    Bandwidth (per user)
     2              1              1 stream
     4              6              3 streams
     8             28              7 streams
    30            435             29 streams
```

This is O(n²) connections and O(n) bandwidth per user. Beyond 4-5 participants:
- CPU usage spikes (encoding/decoding every peer's stream)
- Bandwidth exhausts (uploading your stream N-1 times)
- Connection failures cascade (one dropped peer disrupts others)
- No server-side recording or stream optimization possible

### The Solution: Selective Forwarding Unit (SFU)

LiveKit SFU sits between all participants. Each user sends their stream **once** to the server. The server forwards it to all subscribers without re-encoding.

```
Participants    Upload (per user)    Download (per user)
     2              1 stream            1 stream
     8              1 stream            7 streams (server-optimized)
    30              1 stream           29 streams (simulcast + SVC)
   100              1 stream           adaptive (server decides quality)
```

**Key advantages chosen for SLGS:**
- **Simulcast**: Server chooses quality tier per subscriber based on viewport size and bandwidth
- **Server-side recording**: Can record sessions for absent students
- **Scalability**: Tested to 100+ participants per room
- **Dynamic track subscription**: Late joiners automatically receive all active streams
- **ICE/TURN built-in**: Handles NAT traversal for Sierra Leone's network infrastructure

### Why LiveKit Specifically (vs Jitsi, Mediasoup, etc.)

| Feature | LiveKit | Jitsi | Mediasoup |
|---------|---------|-------|-----------|
| Language | Go (single binary) | Java (complex stack) | C++/Node (custom) |
| Deployment | Single binary + YAML | Docker + Oracleserver + Oracleserver | Library, build yourself |
| React SDK | First-class (`@livekit/components-react`) | iframe embed | DIY |
| Built-in TURN | Yes | Separate server | No |
| Protocol | Protobuf over WebSocket | XMPP + Oracleserver | Custom signaling |
| Scaling | Cloud-native, multi-node | Oracleserver clustering | Manual |

LiveKit won on **operational simplicity** (single Go binary, one YAML config) and **React integration** (first-class component library with hooks).

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (React)                          │
│                                                                  │
│  ┌──────────────┐  ┌───────────────┐  ┌───────────────────────┐ │
│  │ EduMeetLive  │  │ LiveKit Room  │  │ WebSocket Hook        │ │
│  │ (Classroom)  │  │ (Video/Audio) │  │ (Chat/WB/Polls/etc)  │ │
│  └──────┬───────┘  └───────┬───────┘  └───────────┬───────────┘ │
│         │                  │                      │              │
└─────────┼──────────────────┼──────────────────────┼──────────────┘
          │                  │                      │
          │                  │ WebSocket            │ WebSocket
          │                  │ (protobuf)           │ (JSON)
          │                  │                      │
          ▼                  ▼                      ▼
  ┌──────────────┐  ┌───────────────┐  ┌───────────────────────┐
  │ Express.js   │  │ LiveKit SFU   │  │ Go Edumeet Server     │
  │ Port 3000    │  │ Port 7880     │  │ Port 4000             │
  │              │  │               │  │                       │
  │ • Auth       │  │ • Video relay │  │ • Token generation    │
  │ • Pages/API  │  │ • Audio relay │  │ • WebSocket hub       │
  │ • MongoDB    │  │ • Screen share│  │ • Room management     │
  │ • Sessions   │  │ • TURN server │  │ • Breakout tokens     │
  │              │  │ • ICE/DTLS    │  │ • Rate limiting       │
  └──────┬───────┘  └───────────────┘  └───────────┬───────────┘
         │                                          │
         ▼                                          │
  ┌──────────────┐                                  │
  │   MongoDB    │◄─────────────────────────────────┘
  │ (user data,  │    (participant list, session data)
  │  courses,    │
  │  grades)     │
  └──────────────┘
```

### Data Flow Separation

| Data Type | Transport | Server | Why |
|-----------|-----------|--------|-----|
| Video/Audio streams | WebRTC (UDP/TCP) | LiveKit SFU | Low latency, bandwidth optimization |
| Screen share | WebRTC (TCP preferred) | LiveKit SFU | High resolution, content hint |
| Chat messages | WebSocket (JSON) | Go Hub | Reliable delivery, ordering |
| Whiteboard strokes | WebSocket (JSON, batched) | Go Hub | Coordination, replay |
| Polls/Quiz/Focus | WebSocket (JSON) | Go Hub | State synchronization |
| Hand raise queue | WebSocket (JSON) | Go Hub | Ordered queue semantics |
| LiveKit tokens | HTTP POST | Go Server | JWT signing |
| Authentication | HTTP | Express | Session management |

---

## 4. Technical Challenges & Solutions

### Challenge 1: WSL2 ICE Candidate Failure

**Symptom:** `leave-reconnect disconnected` infinite loop. LiveKit connection never established.

**Root Cause:** LiveKit generated UDP ICE candidates on ephemeral ports (e.g., `127.0.0.1:59847`). In WSL2, only bound TCP ports are forwarded to the Windows host browser. UDP ephemeral ports are silently unreachable.

**Debug Process:**
1. Server logs showed `sessionDuration: "0s"` — connection died instantly
2. `SIGNAL_SOURCE_CLOSE` with `TRANSPORT_FAILURE` — signal WebSocket worked, but peer connection failed
3. Extracted ICE candidates from logs: `candidate:2878742611 1 udp 2130706431 127.0.0.1 59847` — UDP on random port
4. Browser candidates: `172.18.80.1:53159` — WSL2 virtual adapter, unreachable from LiveKit

**Solution:**
```yaml
# livekit.yaml
rtc:
  force_tcp: true            # Only generate TCP ICE candidates
  tcp_port: 7881             # Stable port, forwarded by WSL2
  enable_loopback_candidate: true
turn:
  enabled: true              # Built-in TURN as fallback
  udp_port: 3478
```

**Lesson:** Always check the ICE candidate exchange when WebRTC fails — the answer is in the SDP.

---

### Challenge 2: React StrictMode Double Mount

**Symptom:** LiveKit WebSocket connected, immediately disconnected, then reconnected — causing duplicate participants and state corruption.

**Root Cause:** React 18 StrictMode mounts components twice in development. The first mount opens a LiveKit WebSocket, the second mount opens another, and the first's cleanup closes the connection the second mount is using.

**Solution:** Disabled StrictMode for the classroom route:
```jsx
// index.js — StrictMode disabled (documented)
// React 18 double-mount in dev kills LiveKit WS connection
ReactDOM.createRoot(root).render(<App />);
```

---

### Challenge 3: Protocol Version Mismatch

**Symptom:** `JOIN_FAILURE` after WebSocket connect.

**Root Cause:** `livekit-client` v2.18.1 uses protocol version 16. The installed LiveKit server was v1.7.2 (protocol 13). The server rejected the client's join request.

**Solution:** Upgraded LiveKit server binary from v1.7.2 to v1.10.1 (protocol 16 compatible).

---

### Challenge 4: Whiteboard Stroke Fragmentation

**Symptom:** Drawing locally was smooth, but remote viewers saw scattered dots instead of connected lines.

**Root Cause (dual):**
1. **Rate limiting:** Go WebSocket hub limited clients to 10 msg/sec (burst 20). `mousemove` fires ~60 times/sec during drawing. 80% of stroke messages were silently dropped.
2. **Coordinate mismatch:** Canvas used `canvas.width` (internal resolution) for normalization but `getBoundingClientRect()` (CSS display size) for mouse position — different values when CSS scales the canvas.

**Solution:**
```javascript
// Fixed 1920×1080 internal resolution — identical on every client
const CW = 1920, CH = 1080;

// Mouse position mapped through CSS→canvas transform
const getPos = (e) => ({
    x: ((clientX - rect.left) / rect.width) * CW,
    y: ((clientY - rect.top) / rect.height) * CH,
});

// Batch points: flush every 50ms instead of per-mousemove
// One message carries the full polyline, not just 2 points
```

Server rate limit increased from 10/20 to 30/60 msg/sec.

---

### Challenge 5: Camera Persisting After Leave

**Symptom:** Browser camera LED stayed on after leaving the classroom. Required full page refresh.

**Root Cause:** `navigate(-1)` fired before React unmounted `LiveKitRoom`. The component's cleanup ran after navigation started, creating a race where `MediaStreamTrack.stop()` never executed.

**Solution:** Added a `useEffect` cleanup on the main classroom component:
```javascript
useEffect(() => {
    return () => {
        // Stop every MediaStreamTrack on unmount
        document.querySelectorAll('video, audio').forEach(el => {
            const ms = el.srcObject;
            if (ms && ms.getTracks) ms.getTracks().forEach(t => t.stop());
            el.srcObject = null;
        });
    };
}, []);
```

This fires when React unmounts the component for any reason — navigation, error boundary, route change.

---

### Challenge 6: Hand Count Never Decreased

**Symptom:** Teacher clicked "Call on student" but the hand count badge never went down.

**Root Cause:** When teacher sends `hand_call`, the event's `from` field is the **teacher's** ID (the sender). The counting logic did `s.delete(e.from)` — deleting the teacher (who never raised their hand). The student's hand stayed in the Set.

**Solution:**
```javascript
// Before (wrong): deleted teacher's ID
if (e.type === 'hand_call') s.delete(e.from);

// After (correct): delete the student referenced in payload
if (e.type === 'hand_call' && e.payload?.userId) s.delete(e.payload.userId);
```

---

### Challenge 7: Breakout Rooms Non-Functional

**Symptom:** Student clicked "Join Breakout Room" — nothing happened. No error, no token, no room switch.

**Root Cause:** The Go server had event type constants for `breakout_join` but **no handler**. The hub just broadcast the event to the room. Nobody generated a LiveKit token for the sub-room.

**Solution:** Added a breakout token handler in the Go WebSocket hub:
```go
if env.Type == events.TypeBreakoutJoin {
    payload, _ := env.Payload.(map[string]interface{})
    breakoutRoomID, _ := payload["roomId"].(string)
    token, lkURL, err := generateBreakoutToken(breakoutRoomID, c.UserID, c.Name, c.Role)
    // Send breakout_token back to requesting student
    resp := &events.Envelope{
        Type:   "breakout_token",
        Target: c.UserID,
        Payload: map[string]interface{}{
            "roomId": breakoutRoomID, "token": token, "url": lkURL,
        },
    }
    c.Hub.SendToUser(resp)
}
```

---

## 5. Code Overview

### File Structure

```
SLGS/
├── app.js                          # Express.js main server
├── livekit.yaml                    # LiveKit SFU configuration
├── edumeet-server/                 # Go signaling server
│   ├── main.go                     # Gin router, CORS, WebSocket upgrade
│   ├── config/config.go            # Environment-based configuration
│   ├── handlers/
│   │   ├── livekit.go              # POST /api/livekit-token (JWT signing)
│   │   ├── livekit_proxy.go        # WebSocket proxy routes (dev)
│   │   ├── rest.go                 # IT admin auth endpoint
│   │   └── ws.go                   # WebSocket upgrade handler
│   ├── hub/
│   │   ├── hub.go                  # Central message router (broadcast/targeted)
│   │   └── client.go               # Per-client read/write pumps, rate limiter,
│   │                               # breakout token generation
│   └── events/types.go             # Event type constants
├── client/src/
│   ├── edumeet/
│   │   ├── EduMeetLive.js          # Main classroom (LiveKit-powered)
│   │   ├── hooks/
│   │   │   └── useEdumeetSocket.js # Go WebSocket hook (reconnect, sequencing)
│   │   └── components/
│   │       ├── LiveKitVideoGrid.js # SFU video grid + screen share tiles
│   │       ├── Whiteboard.js       # Collaborative canvas (1920×1080, batched)
│   │       ├── HandQueue.js        # Ordered hand raise queue
│   │       ├── BreakoutRooms.js    # Auto-group + LiveKit room switching
│   │       ├── LivePoll.js         # Real-time voting
│   │       ├── QuizMode.js         # Timed in-class quiz
│   │       ├── FocusCheck.js       # Comprehension pulse
│   │       ├── PomodoroTimer.js    # Class-wide study timer
│   │       ├── ReactionsOverlay.js # Floating emoji reactions
│   │       └── ClassNotes.js       # Shared notepad
│   └── styles/index.css            # Complete classroom CSS (dark theme)
```

### Key Design Decisions

1. **Dual transport** — LiveKit for media, Go WebSocket for everything else. Avoids coupling feature state to video infrastructure.

2. **TrackRefContext pattern** — Every `<VideoTrack>` is wrapped in `<TrackRefContext.Provider>`. This prevents the `"No TrackRef"` crash in livekit-client v2.x that unmounts the entire LiveKitRoom.

3. **Fixed whiteboard resolution** — 1920×1080 internal canvas, CSS-scaled to fit container. Coordinates are absolute (not normalized), identical on every client regardless of window size.

4. **Token-bucket rate limiting** — Server-side per-client: 30 msg/sec, burst 60. Prevents DoS while allowing fast whiteboard drawing.

5. **Monotonic event sequencing** — `__seq` counter on each WebSocket message survives the 200-event rolling window trim, ensuring whiteboard/chat replay doesn't miss events.

---

## 6. Feature Deep Dives

### Whiteboard Synchronization

Drawing events are batched client-side (50ms flush interval) to reduce WebSocket message count from ~60/sec to ~20/sec:

```
Local draw → accumulate points → flush timer fires → send polyline → remote replay
```

Each message carries a full polyline segment (N points), not individual line segments. The remote side draws the complete polyline in one `ctx.beginPath()` call.

### Breakout Room Flow

```
Teacher                    Go Server                  Student
   |                          |                          |
   |--- breakout_create ----->|--- broadcast ----------->|
   |   (rooms, assignments,   |                          |
   |    durationMin)          |                          |
   |                          |                          |
   |                          |<--- breakout_join -------|
   |                          |    (roomId)              |
   |                          |                          |
   |                          |--- breakout_token ------>|
   |                          |    (JWT for sub-room)    |
   |                          |                          |
   |                          |              LiveKit reconnect
   |                          |              to sub-room SFU
   |                          |                          |
   |--- breakout_close ------>|--- broadcast ----------->|
   |                          |              LiveKit reconnect
   |                          |              to main room
```

### Screen Share Architecture

```javascript
// Capture: 1080p, 15fps, detail-optimized
await localParticipant.setScreenShareEnabled(true, {
    resolution: { width: 1920, height: 1080, frameRate: 15 },
    contentHint: 'detail',  // Optimize for text/code, not motion
}, {
    videoEncoding: { maxBitrate: 3_000_000, maxFramerate: 15 },
});
```

The `LiveKitVideoGrid` subscribes to both `Camera` and `ScreenShare` track sources separately. Screen share tiles render in spotlight mode with `object-fit: contain` (not `cover`) to preserve aspect ratio.

---

## 7. Performance & Scalability

| Metric | P2P (before) | LiveKit SFU (after) |
|--------|-------------|---------------------|
| Max participants (stable) | 4-5 | 100+ |
| Upload bandwidth per user | N-1 streams | 1 stream |
| CPU per user (encoding) | N-1 encodes | 1 encode |
| Server-side recording | Impossible | Built-in |
| Late join | Manual state sync | Automatic |
| Screen share quality | 720p (limited by mesh) | 1080p@3Mbps |

---

## 8. Deployment Considerations

For production (Ubuntu on AWS/Azure):

1. **LiveKit config:** Remove `force_tcp`, `enable_loopback_candidate` (WSL2-only workarounds). Enable UDP, STUN, external IP detection.
2. **TLS:** Nginx reverse proxy with Let's Encrypt. All WebSocket connections upgrade to WSS.
3. **Secrets:** Rotate `LIVEKIT_API_SECRET`, `SESSION_SECRET`. Use env vars or secrets manager.
4. **Ports:** Open 7880 (LiveKit HTTP), 7881-7882 (ICE TCP/UDP), 3478 (TURN), 50000-60000 (media relay).
5. **MongoDB:** Enable authentication, use connection string with credentials.
6. **Process management:** systemd services or Docker Compose for all three servers.

---

## 9. Lessons Learned

1. **Always trace ICE candidates** when WebRTC fails. The SDP exchange tells you exactly which network paths are being attempted and which fail.

2. **Rate limiting kills real-time features silently.** The whiteboard worked locally but was fragmented remotely — no errors, just dropped messages. Always test with separate clients.

3. **React component lifecycle matters for hardware.** Camera cleanup must happen at the React level (`useEffect` return), not just at the library level. Browsers don't release media devices until `MediaStreamTrack.stop()` is explicitly called.

4. **Event-driven architecture pays off.** The Go WebSocket hub broadcasts typed events (JSON envelopes). Adding a new feature (polls, quiz, focus check) requires zero server-side changes — just define a new event type and the hub broadcasts it.

5. **Debug by reading server logs, not client errors.** The client said "leave-reconnect disconnected" (unhelpful). The server said `SIGNAL_SOURCE_CLOSE, reason: TRANSPORT_FAILURE, sessionDuration: 0s` (root cause).
