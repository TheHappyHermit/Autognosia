# HTTP API | Prometheus
URL: https://prometheus.io/docs/prometheus/latest/querying/api

HTTP API | Prometheus

Show nav

# HTTP API

The current stable HTTP API is reachable under`/api/v1` on a Prometheus server. Any non-breaking additions will be added under that endpoint.

## OpenAPI Specification

An OpenAPI specification for the HTTP API is available at`/api/v1/openapi.yaml`. By default, it returns OpenAPI 3.1 for broader compatibility. Use`?openapi_version=3.2` for OpenAPI 3.2, which includes advanced features and endpoints like`/api/v1/notifications/live`.

This machine-readable specification describes all available endpoints, request parameters, response formats, and schemas.

The OpenAPI specification can be used to:

- Generate client libraries in various programming languages.
- Validate API requests and responses.
- Generate interactive API documentation.
- Test API endpoints.

## Format overview

The API response format is JSON. Every successful API request returns a`2xx` status code.

Invalid requests that reach the API handlers return a JSON error object and one of the following HTTP response codes:

- `400 Bad Request` when parameters are missing or incorrect.
- `422 Unprocessable Entity` when an expression can't be executed (RFC4918).
- `503 Service Unavailable` when queries time out or abort.

Other non-`2xx` codes may be returned for errors occurring before the API endpoint is reached.

An array of warnings may be returned if there are errors that do not inhibit the request execution. An additional array of info-level annotations may be returned for potential query issues that may or may not be false positives. All of the data that was successfully collected will be returned in the data field.

The JSON response envelope format is as follows:

```
{
  "status": "success" | "error",
  "data": <data>,

  // Only set if status is "error". The data field may still hold
  // additional data.
  "errorType": "<string>",
  "error": "<string>",

  // Only set if there were warnings while executing the request.
  // There will still be data in the data field.
  "warnings": ["<string>"],
  // Only set if there were info-level annotations while executing the request.
  "infos": ["<string>"]
}
```

Generic placeholders are defined as follows:

- ` `: Input timestamps may be provided either in RFC3339 format or as a Unix timestamp in seconds, with optional decimal places for sub-second precision. Output timestamps are always represented as Unix timestamps in seconds.
- `<series_selector>`: Prometheus time series selectors like`http_requests_total` or`http_requests_total{method=~"(GET|POST)"}` and need to be URL-encoded.
- ` `: the subset of Prometheus float literals using time units. For example,`5m` refers to a duration of 5 minutes.
- ` `: boolean values (strings`true` and`false`).

Note: Names of query parameters that may be repeated end with`[]`.

## Expression queries

Query language expressions may be evaluated at a single instant or over a range of time. The sections below describe the API endpoints for each type of expre