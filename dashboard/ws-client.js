/**
 * Autognosia // Command Deck — WebSocket Real-Time Client
 * Connects to WebSocket server on port 8089 for live updates.
 * Falls back to polling if WebSocket unavailable.
 */
class DashboardWebSocket {
    constructor() {
        this.ws = null;
        this.reconnectDelay = 3000;
        this.maxReconnectDelay = 30000;
        this.connected = false;
        this.connect();
    }

    connect() {
        try {
            const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${location.hostname}:8089`;
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('[WS] Connected to dashboard server');
                this.reconnectDelay = 3000;
                this.connected = true;
                this._updateIndicator('connected');
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'dashboard_update' && window.commandDeck) {
                        if (data.section && typeof window.commandDeck['fetch' + data.section] === 'function') {
                            window.commandDeck['fetch' + data.section]();
                        } else {
                            window.commandDeck.refreshAllData();
                        }
                    }
                } catch (e) {
                    console.warn('[WS] Message parse error:', e);
                }
            };

            this.ws.onclose = () => {
                console.log(`[WS] Disconnected, retrying in ${this.reconnectDelay}ms`);
                this.connected = false;
                this._updateIndicator('disconnected');
                setTimeout(() => this.connect(), this.reconnectDelay);
                this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
            };

            this.ws.onerror = (err) => {
                console.warn('[WS] Connection error:', err);
                this.connected = false;
                this._updateIndicator('error');
            };
        } catch (e) {
            console.warn('[WS] Failed to connect:', e);
            this._updateIndicator('error');
        }
    }

    _updateIndicator(status) {
        let indicator = document.getElementById('ws-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'ws-indicator';
            indicator.style.cssText = 'position:fixed;bottom:16px;right:16px;z-index:9999;padding:4px 12px;border-radius:999px;font-family:monospace;font-size:11px;font-weight:600;letter-spacing:0.5px;transition:all 0.2s;user-select:none;';
            document.body.appendChild(indicator);
        }

        const styles = {
            connected: { bg: 'oklch(0.78 0.13 160 / 0.2)', color: 'oklch(0.78 0.13 160)', text: '● LIVE' },
            disconnected: { bg: 'oklch(0.80 0.13 80 / 0.2)', color: 'oklch(0.80 0.13 80)', text: '● RECONNECTING...' },
            error: { bg: 'oklch(0.65 0.19 25 / 0.2)', color: 'oklch(0.65 0.19 25)', text: '● ERROR' }
        };

        const s = styles[status] || styles.error;
        indicator.style.background = s.bg;
        indicator.style.color = s.color;
        indicator.textContent = s.text;
    }
}

// Instantiate when DOM is ready and CommandDeck is loaded
function _initWebSocket() {
    if (typeof CommandDeck !== 'undefined' && window.commandDeck) {
        new DashboardWebSocket();
    } else {
        // Retry in 500ms if CommandDeck not ready
        setTimeout(_initWebSocket, 500);
    }
}
document.addEventListener('DOMContentLoaded', _initWebSocket);
