[Learn how to guard your webserver in real-time with the CrowdSec WAF](https://doc.crowdsec.net/docs/next/appsec/intro)
Security Engine Local API
Security Engine version: Next v1.7 v1.6
This is documentation for CrowdSec **v1.6** , which is no longer actively maintained.
For up-to-date documentation, see the **latest version** (Next).
* Local API
Version: v1.6
On this page

# Local API
The Local API (LAPI) is one of the core components of the Security Engine to :
* Allow Log Processors to push alerts & decisions to a database
* Allow Remediation Components to consume said alerts & decisions from database
* Allow `cscli` to manage the database (list, delete, etc)
You can find the swagger documentation [here](https://crowdsecurity.github.io/api_doc/lapi/) .
This allows you to create [multi-machines architectures](https://crowdsec.net/multi-server-setup/) around CrowdSec or leverage [orchestration technologies](https://crowdsec.net/secure-docker-compose-stacks-with-crowdsec/) .
All subcategories below are related to the Local API and its functionalities. If you are utilizing a multi server architecture, you will only need to configure the functionality that you want to use on the LAPI server.

...

## Authentication ​
LAPI offers multiple different authentication methods, which has their own restrictions based on the method used.
You can find more information about the authentication methods here .

## Profiles ​
Profiles are a set of rules processed by the LAPI to determine if an alert should trigger a decision, notification or just simply log. They are processed in order of definition and can be used to make complex decisions based on the alert.
You can find more information about profiles here .

## Notification Plugins ​
Notification plugins are used to send alerts to external services.
You can find more information about configuring the plugins here .

## Databases ​
Databases documentation showcases which database the LAPI supports and how to configure the database to allow the LAPI to utilize it.
You can find more information about the databases here .
[Edit this page](https://github.com/crowdsecurity/crowdsec-docs/edit/main/crowdsec-docs/versioned_docs/version-v1.6/local_api/intro.md)
Previous Alert Context Next Introduction
* Authentication
* Profiles
* Notification Plugins
* Databases
CrowdSec
Console
Centralized, real-time visibility across all your engines.
Free 3rd-party Blocklists
Additional Alert Context
Stack-wide health metrics
C
CrowdSec Docs
Safer together.
OPEN-SOURCE · CROWDSOURCED
[GitHub](https://github.com/crowdsecurity/crowdsec "GitHub") [Discord](https://discord.gg/crowdsec "Discord")
[Privacy](https://crowdsec.net/privacy) [Terms](https://crowdsec.net/terms) [Status](https://crowdsec.net/status)
CrowdSec Docs
We use cookies
Accept Decline