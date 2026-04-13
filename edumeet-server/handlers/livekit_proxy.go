package handlers

// LiveKit reverse proxy — bridges the livekit-client v2 API with livekit-server v1.7.2.
//
// Problem: livekit-client ≥2.18 calls GET /rtc/v1/validate before connecting.
// livekit-server 1.7.2 only has GET /rtc/validate (no /v1/).
// This proxy is transparent: the client talks to us on :4000/lk/*, we forward to :7880/*.

import (
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

func livekitURL() string {
	u := os.Getenv("LIVEKIT_URL")
	if u == "" {
		u = "ws://localhost:7880"
	}
	return u
}

func lkHTTPBase() string {
	u := livekitURL()
	u = strings.Replace(u, "ws://", "http://", 1)
	u = strings.Replace(u, "wss://", "https://", 1)
	return u
}

// ProxyValidate handles GET /lk/rtc/v1/validate
// livekit-client calls this; we forward it as /rtc/validate to livekit-server.
func ProxyValidate(c *gin.Context) {
	target := lkHTTPBase() + "/rtc/validate?" + c.Request.URL.RawQuery
	resp, err := http.Get(target) //nolint:gosec
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "livekit unreachable"})
		return
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	for k, vv := range resp.Header {
		for _, v := range vv {
			c.Header(k, v)
		}
	}
	c.Data(resp.StatusCode, resp.Header.Get("Content-Type"), body)
}

// ProxyRTC handles WebSocket GET /lk/rtc/v1 — bidirectional WebSocket proxy.
func ProxyRTC(c *gin.Context) {
	// Upgrade client connection
	clientUpgrader := websocket.Upgrader{
		ReadBufferSize:  65536,
		WriteBufferSize: 65536,
		CheckOrigin:     func(_ *http.Request) bool { return true },
	}
	clientConn, err := clientUpgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}
	defer clientConn.Close()

	// Connect to upstream livekit-server
	lkBase := livekitURL()
	lkBase = strings.Replace(lkBase, "http://", "ws://", 1)
	lkBase = strings.Replace(lkBase, "https://", "wss://", 1)

	// livekit-server v1.x WebSocket path is /rtc (client sends /rtc/v1 but server has no v1 prefix)
	upstreamURL := lkBase + "/rtc?" + c.Request.URL.RawQuery
	header := http.Header{}
	// Forward subprotocols if any
	if proto := c.Request.Header.Get("Sec-Websocket-Protocol"); proto != "" {
		header.Set("Sec-Websocket-Protocol", proto)
	}

	upstream, _, err := websocket.DefaultDialer.Dial(upstreamURL, header) //nolint:bodyclose
	if err != nil {
		clientConn.WriteMessage( //nolint:errcheck
			websocket.CloseMessage,
			websocket.FormatCloseMessage(websocket.CloseInternalServerErr, "upstream unavailable"),
		)
		return
	}
	defer upstream.Close()

	errc := make(chan error, 2)

	// client → upstream
	go func() {
		for {
			mt, msg, err := clientConn.ReadMessage()
			if err != nil {
				errc <- err
				return
			}
			if err := upstream.WriteMessage(mt, msg); err != nil {
				errc <- err
				return
			}
		}
	}()

	// upstream → client
	go func() {
		for {
			mt, msg, err := upstream.ReadMessage()
			if err != nil {
				errc <- err
				return
			}
			if err := clientConn.WriteMessage(mt, msg); err != nil {
				errc <- err
				return
			}
		}
	}()

	<-errc // block until either side closes
}

// ProxyLKHTTP proxies arbitrary HTTP requests to LiveKit (e.g. /lk/*)
// Used for any other LiveKit endpoints the client might call.
func ProxyLKHTTP(c *gin.Context) {
	path := strings.TrimPrefix(c.Param("path"), "/")
	rawQuery := c.Request.URL.RawQuery
	target := lkHTTPBase() + "/" + path
	if rawQuery != "" {
		target += "?" + rawQuery
	}

	req, err := http.NewRequest(c.Request.Method, target, c.Request.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	for k, vv := range c.Request.Header {
		for _, v := range vv {
			req.Header.Add(k, v)
		}
	}
	// Rewrite host
	parsed, _ := url.Parse(target)
	req.Host = parsed.Host

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "livekit unreachable"})
		return
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	c.Data(resp.StatusCode, resp.Header.Get("Content-Type"), body)
}
