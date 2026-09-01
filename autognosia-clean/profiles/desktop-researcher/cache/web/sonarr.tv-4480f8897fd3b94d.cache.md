v3.0.0

OpenAPI 3.0.1

# Sonarr

[GPL-3.0](https://github.com/Sonarr/Sonarr/blob/develop/LICENSE)

Download OpenAPI Document
json
Download OpenAPI Document
yaml

Sonarr API docs - The v3 API docs apply to both v3 and v4 versions of Sonarr. Some functionality may only be available in v4 of the Sonarr application.

Server

Server:{protocol}://{hostpath}

protocol

Selected:  http

hostpath

## AuthenticationRequired

Selected Auth Type: X-Api-Key

|     |
| --- |
| Apikey passed as header |
| Name : <br>X-Api-Key<br>Clear Value |
| Value : <br>Show Password |

Client Libraries

Shell

Ruby

Node.js

PHP

Python

MoreSelect from all clients

Shell Curl

## ApiInfo

​Copy link

ApiInfo Operations

- get/api

### /api

​Copy link

Auth Required

Responses

- 200









OK


Request Example for get/api

Shell Curl

```curl
curl http://localhost:8989/api \
  --header 'X-Api-Key: YOUR_SECRET_TOKEN'
```

cURLCopy

cURLCopy

Test Request(get /api)

Status: 200

No Body

OK

## Authentication  (Collapsed)

​Copy link

Authentication Operations

- post/login
- get/logout

Show More

## StaticResource  (Collapsed)

​Copy link

StaticResource Operations

- get/login
- get/content/{path}
- get/
- get/{path}

Show More

Show sidebar

GET

Server: {protocol}://{hostpath}

/api

Copy URL

Send Send get request to {protocol}://{hostpath}/api

GET

Copy URLSend Send get request to {protocol}://{hostpath}/api

Close Client

AllAuthCookiesHeadersQuery

All

## AuthenticationRequired

Selected Auth Type: X-Api-Key

|     |
| --- |
| Apikey passed as header |
| Name : <br>X-Api-Key<br>Clear Value |
| Value : <br>Show Password |

## Variables

| Enabled | Key | Value |
| --- | --- | --- |

## Cookies

| Enabled | Key | Value |
| --- | --- | --- |
|  |  |  |

## Headers

| Enabled | Key | Value |
| --- | --- | --- |
|  | accept | \*/\* |
|  |  |  |

## Query Parameters

| Enabled | Key | Value |
| --- | --- | --- |
|  |  |  |

## Request Body

No Body

| None |
| --- |

## Code Snippet (Collapsed)

Shell Curl

Response

AllCookiesHeadersBody

All

[Powered By Scalar.com](https://www.scalar.com/)

.,,uod8B8bou,,. ..,uod8BBBBBBBBBBBBBBBBRPFT?l!i:. \|\|\|\|\|\|\|\|\|\|\|\|\|\|!?TFPRBBBBBBBBBBBBBBB8m=, \|\|\|\| '""^^!!\|\|\|\|\|\|\|\|\|\|TFPRBBBVT!:...! \|\|\|\| '""^^!!\|\|\|\|\|?!:.......! \|\|\|\| \|\|\|\|.........! \|\|\|\| \|\|\|\|.........! \|\|\|\| \|\|\|\|.........! \|\|\|\| \|\|\|\|.........! \|\|\|\| \|\|\|\|.........! \|\|\|\| \|\|\|\|.........! \|\|\|\|, \|\|\|\|.........\` \|\|\|\|\|!!-.\_ \|\|\|\|.......;. ':!\|\|\|\|\|\|\|\|\|!!-.\_ \|\|\|\|.....bBBBBWdou,. bBBBBB86foi!\|\|\|\|\|\|\|!!-..:\|\|\|!..bBBBBBBBBBBBBBBY! ::!?TFPRBBBBBB86foi!\|\|\|\|\|\|\|\|!!bBBBBBBBBBBBBBBY..! :::::::::!?TFPRBBBBBB86ftiaabBBBBBBBBBBBBBBY....! :::;\`"^!:;::::::!?TFPRBBBBBBBBBBBBBBBBBBBY......! ;::::::...''^::::::::::!?TFPRBBBBBBBBBBY........! .ob86foi;::::::::::::::::::::::::!?TFPRBY..........\` .b888888888886foi;:::::::::::::::::::::::..........\` .b888888888888888888886foi;::::::::::::::::...........b888888888888888888888888888886foi;:::::::::......\`!Tf998888888888888888888888888888888886foi;:::....\` '"^!\|Tf9988888888888888888888888888888888!::..\` '"^!\|Tf998888888888888888888888889!! '\` '"^!\|Tf9988888888888888888!!\` iBBbo. '"^!\|Tf998888888889!\` WBBBBbo. '"^!\|Tf9989!\` YBBBP^' '"^!\` \`

Send Request

ctrlControl

↵Enter