# Swagger CrowdSec ```
1.0.0
[ Base URL: 127.0.0.1/v1 ]
```

[https://raw.githubusercontent.com/crowdsecurity/crowdsec/master/pkg/models/localapi\_swagger.yaml](https://raw.githubusercontent.com/crowdsecurity/crowdsec/master/pkg/models/localapi_swagger.yaml)

CrowdSec local API

[Contact the developer](mailto:contact@crowdsec.net)

[Find out more about CrowdSec](https://github.com/crowdsecurity/crowdsec)

Schemes https http

Authorize

### Remediation component Operations about decisions : bans, captcha, rate-limit etc.

GET /decisions /stream

getDecisionsStream HEAD /decisions /stream

GetDecisionsStream GET /decisions

getDecisions HEAD /decisions

GetDecisions POST /usage-metrics

Send usage metrics ### watchers Operations about watchers : cscli & crowdsec

DELETE /decisions

deleteDecisions DELETE /decisions /{decision\_id}

DeleteDecision POST /watchers

RegisterWatcher DELETE /watchers /self

DeleteWatcher POST /watchers /login

AuthenticateWatcher POST /alerts

pushAlerts GET /alerts

searchAlerts HEAD /alerts

searchAlerts DELETE /alerts

deleteAlerts GET /alerts /{alert\_id}

GetAlertByID HEAD /alerts /{alert\_id}

GetAlertByID DELETE /alerts /{alert\_id}

DeleteAlert POST /usage-metrics

Send usage metrics GET /allowlists

getAllowlists GET /allowlists /{allowlist\_name}

getAllowlist HEAD /allowlists /{allowlist\_name}

getAllowlist GET /allowlists /check /{ip\_or\_range}

checkAllowlist HEAD /allowlists /check /{ip\_or\_range}

checkAllowlist POST /allowlists /check

postCheckAllowlist

#### Models

WatcherRegistrationRequest

WatcherAuthRequest

WatcherAuthResponse

Alert

Source

Metrics

MetricsBouncerInfo

MetricsAgentInfo

Decision

DeleteDecisionResponse

AddAlertsRequest

AddAlertsResponse

AlertsResponse

DeleteAlertsResponse

DecisionsStreamResponse

Event

GetDecisionsResponse

Meta

RemediationComponentsMetrics

LogProcessorsMetrics

LapiMetrics

AllMetrics

BaseMetrics

OSversion

DetailedMetrics

MetricsDetailItem

MetricsMeta

MetricsLabels

ConsoleOptions

HubItems

HubItem

GetAllowlistsResponse

GetAllowlistResponse

AllowlistItem

CheckAllowlistResponse

BulkCheckAllowlistRequest

```