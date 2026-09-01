# Internal API Â· louislam/uptime-kuma Wiki Â· GitHub
URL: https://github.com/louislam/uptime-kuma/wiki/Internal-API
Author: louislam

Internal API Â· louislam/uptime-kuma Wiki Â· GitHub

# Internal API

Jump to bottom

Frank Elsinga edited this page Jun 16, 2026 Â· 3 revisions

# Uptime Kuma Internal API Documentation

Warning

This documentation describes Uptime Kuma's internal API. This API is primarily designed for the application's own use and is not officially supported for third-party integrations. Breaking changes may occur between versions without prior notice. Use at your own risk.

Uptime Kuma primarily uses Socket.io for real-time communication after authentication. It also provides RESTful API endpoints for push monitors, status badges, Prometheus metrics, and public status page data.

## Authentication

### REST API

- Push Monitors (`/api/push/:pushToken`): Authenticated via the unique`:pushToken` in the URL path. No other authentication needed for this endpoint.
- Metrics (`/metrics`): Authentication depends on server settings (`Settings`->`Security`->`API Keys`):
- - API Key Authentication (If Enabled):
- - Method: HTTP Basic Auth.
- Username: (empty string or any value, it's ignored).
- Password: Your generated API Key (e.g.,`uk2_somereallylongkey`).
- Basic User Authentication (If API Keys Disabled or Not Provided):
- - Method: HTTP Basic Auth.
- Username: Your Uptime Kuma username.
- Password: Your Uptime Kuma password.
- No Authentication (If Auth Disabled in Settings):
- - No credentials required. Access is open.
- Badges & Public Status Pages: These endpoints are generally public. Access to monitor-specific badges depends on the monitor being included in a public group on any status page. Status page data endpoints (`/api/status-page/...`) require the status page itself to be published.

### Socket.io API

1. Establish a Socket.io connection.
2. Authentication: The client must authenticate after connection using one of these events:
3. - `login` Event: Provide username, password, and optionally a 2FA token.
- `loginByToken` Event: Provide a JWT token obtained from a previous successful login where "Remember Me" was selected.
4. Authorization: Once authenticated via`login` or`loginByToken`, all subsequent events sent on that specific socket connection are authorized for the logged-in user.

## Common Data Structures

(Used in Socket.io events and some API responses)

Monitor Object (Partial Example):

```
{
  "id": 1,
  "name": "My Website",
  "type": "http",
  "url": "https://example.com",
  "method": "GET",
  "interval": 60,
  "retryInterval": 60,
  "resendInterval": 0,
  "maxretries": 0,
  "hostname": null,
  "port": null,
  "active": true,
  "tags": [
    {
      "tag_id": 1,
      "monitor_id": 1,
      "value": null,
      "name": "production",
      "color": "#059669"
    }
  ],
  "notificationIDList": { "1": true },
  // ... other monitor-type specific fields
  "accepted_statuscodes_json": "[\"200-299\"]",
  "conditions": "[]" // JSON string of condition groups
}
```

Heartbeat Object:

```
{
  "monitorID": 1,
  "status": 1, // 0=DOWN, 1=UP, 2=PENDING,