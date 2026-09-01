# API Overview
> Understanding the Jellyfin Server REST API architecture
Jellyfin Server provides a comprehensive REST API for managing and accessing media content, user data, and server configuration.

## API Architecture
The Jellyfin API is built using ASP.NET Core and follows RESTful principles:
* **Framework**: ASP.NET Core with Kestrel web server
* **API Documentation**: Swagger/OpenAPI 3.0
* **Authentication**: Custom authentication scheme with API keys and user tokens
* **Response Format**: JSON (primary), XML (supported)
* **Base URL**: `http://localhost:8096` (default)

...

### Project Structure
| Project | Purpose |
| `Jellyfin.Api` | API controllers, models, and middleware |
| `MediaBrowser.Controller` | Core interfaces and business logic contracts |
| `MediaBrowser.Model` | Shared DTOs and data models |
| `Emby.Server.Implementations` | Core business logic implementations |

## API Documentation
Jellyfin provides interactive API documentation through Swagger UI:
<Steps>
<Step title="Start the Jellyfin Server">
Run the server locally (see [Building from Source](./building-from-source)).
</Step>
<Step title="Access Swagger UI">
Navigate to: `http://localhost:8096/api-docs/swagger/index.html`
</Step>
<Step title="Explore and Test Endpoints">
Use the interactive documentation to:
```
* Browse all available endpoints
* View request/response schemas
* Test endpoints directly from your browser
```
</Step>
</Steps>
<Info>
ReDoc documentation is also available at: `http://localhost:8096/api-docs/redoc/index.html`
</Info>

## Authentication
The Jellyfin API uses a custom authentication scheme defined in the `Jellyfin.Api/Constants/AuthenticationSchemes.cs` file.

...

### Authentication Methods
```
```bash theme={null}
curl -H "X-Emby-Authorization: MediaBrowser Token=\"YOUR_API_KEY\"" \
  http://localhost:8096/System/Info
```

<Note>
  API keys can be created in the Jellyfin web interface under Dashboard > API Keys.
</Note>
```
</Tab>
<Tab title="User Token">
User tokens authenticate as a specific user with their permissions.
```
```bash theme={null}
curl -H "X-Emby-Authorization: MediaBrowser Client=\"MyApp\", Device=\"MyDevice\", Token=\"USER_TOKEN\"" \
  http://localhost:8096/Users/Me
```
```
</Tab>

...

```
```bash theme={null}
curl -X POST http://localhost:8096/Users/AuthenticateByName \
  -H "Content-Type: application/json" \
  -H "X-Emby-Authorization: MediaBrowser Client=\"MyApp\", Device=\"MyDevice\", DeviceId=\"12345\", Version=\"1.0.0\"" \
  -d '{
    "Username": "admin",
    "Pw": "password"
  }'
```
```

...

### Authorization Header Format
The custom authorization header has the following format:
```
X-Emby-Authorization: MediaBrowser Client="ClientName", Device="DeviceName", DeviceId="UniqueDeviceId", Version="1.0.0", Token="AccessToken"
```
<Warning>
The authentication scheme is named `CustomAuthentication` internally and is configured in `Jellyfin.Server/Startup.cs`.
</Warning>

## Core API Controllers
Here are the main API controllers in `Jellyfin.Api/Controllers/`:

### Media Management
<CardGroup cols={2}>
<Card title="ItemsController" icon="folder">
**Route**: `/Items`
```
Query and retrieve media items with extensive filtering options:

* Search media library
* Filter by type, genre, year, etc.
* Pagination and sorting
* Resume points and play state
```
</Card>
<Card title="LibraryController" icon="books">
**Route**: `/Library`
```
Manage library content:

* Get similar items
* Get media folders
* Get physical paths
* Refresh metadata
```
</Card>
<Card title="VideosController" icon="video">
**Route**: `/Videos`
```
Video-specific operations:

* Get additional parts
* Delete alternate sources
* Merge versions
```
</Card>
<Card title="AudioController" icon="music">
**Route**: `/Audio`
```
Audio streaming and management:

* Stream audio files
* Get audio stream info
* Universal audio endpoint
```
</Card>
</CardGroup>

...

### System & Configuration
<CardGroup cols={2}>
<Card title="SystemController" icon="server">
**Route**: `/System`
```
System information and operations (see `Jellyfin.Api/Controllers/SystemController.cs`):

* Get system info
* Server endpoints
* Restart/shutdown
```
</Card>
<Card title="ConfigurationController" icon="gear">
**Route**: `/Configuration`
```
Server configuration:

* Get/update server config
* Media encoding settings
* Network configuration
```
</Card>
<Card title="PluginsController" icon="plug">
**Route**: `/Plugins`
```
Plugin management (see `Jellyfin.Api/Controllers/PluginsController.cs`):

* List installed plugins
* Enable/disable plugins
* Plugin configuration
* Uninstall plugins
```
</Card>
</CardGroup>

### Media Streaming
<CardGroup cols={2}>
<Card title="DynamicHlsController" icon="stream">
**Route**: `/Videos/{itemId}/master.m3u8`
```
HLS adaptive streaming:

* Generate HLS playlists
* Transcode on-the-fly
* Multiple quality levels
```
</Card>
<Card title="SubtitleController" icon="closed-captioning">
**Route**: `/Subtitles`
```
Subtitle operations:

* Get subtitle streams
* Search for subtitles
* Upload subtitles
```
</Card>
</CardGroup>

...

## Common API Patterns
### Authorization Policies
Common policies defined in `Jellyfin.Api/Constants/Policies.cs`:
* `RequiresElevation` - Admin only
* `DefaultAuthorization` - Any authenticated user
* `FirstTimeSetupOrIgnoreParentalControl` - Setup or unrestricted

...

### Response Types
```csharp theme={null}
[HttpGet]
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public ActionResult<PluginInfo> GetPlugin([FromRoute, Required] Guid pluginId)
{
    var plugin = _pluginManager.GetPlugin(pluginId);
    if (plugin is null)
    {
```

...

## Making API Requests
### Example: Get System Info
<CodeGroup>
```bash cURL theme={null}
curl -H "X-Emby-Authorization: MediaBrowser Token=\"YOUR_API_KEY\"" \
  http://localhost:8096/System/Info
```
```javascript JavaScript (Fetch) theme={null}
const response = await fetch('http://localhost:8096/System/Info', {
  headers: {
    'X-Emby-Authorization': 'MediaBrowser Token="YOUR_API_KEY"'
  }
});
const systemInfo = await response.json();
console.log(systemInfo);
```

...

```csharp C# theme={null}
using var httpClient = new HttpClient();
httpClient.DefaultRequestHeaders.Add(
    "X-Emby-Authorization", 
    "MediaBrowser Token=\"YOUR_API_KEY\""
);

var response = await httpClient.GetAsync("http://localhost:8096/System/Info");
```

...

### Example: Query Media Items
<CodeGroup>
```bash cURL theme={null}
curl -X GET "http://localhost:8096/Items?userId=USER_ID&includeItemTypes=Movie&limit=10" \
  -H "X-Emby-Authorization: MediaBrowser Token=\"YOUR_API_KEY\""
```
```javascript JavaScript theme={null}
const params = new URLSearchParams({
  userId: 'USER_ID',
  includeItemTypes: 'Movie',
  limit: '10',
  sortBy: 'SortName',
  sortOrder: 'Ascending'
});

const response = await fetch(`http://localhost:8096/Items?${params}`, {
  headers: {
    'X-Emby-Authorization': 'MediaBrowser Token="YOUR_API_KEY"'
  }
});
const items = await response.json();
```
</CodeGroup>

### Example: Update Plugin Configuration
```bash cURL theme={null}
curl -X POST "http://localhost:8096/Plugins/{pluginId}/Configuration" \
  -H "Content-Type: application/json" \
  -H "X-Emby-Authorization: MediaBrowser Token=\"YOUR_API_KEY\"" \
  -d '{
    "ApiKey": "new-api-key",
    "Enabled": true
  }'
```

## WebSocket API
Jellyfin also provides real-time updates via WebSocket connections for:
* Library updates
* Playback sessions
* Plugin installation progress
* System messages
WebSocket messages are defined in `MediaBrowser.Controller/Net/WebSocketMessages/`.
<Tip>
Connect to the WebSocket endpoint at `ws://localhost:8096/socket` with proper authentication.
</Tip>

## API Best Practices
<CardGroup cols={2}>
<Card title="Use API Keys for Services" icon="key">
For server-to-server integrations, use API keys rather than user credentials.
</Card>
<Card title="Implement Pagination" icon="list">
Always use `startIndex` and `limit` parameters when querying large datasets.
</Card>
<Card title="Cache Responses" icon="database">
Cache static data like system info and library structure to reduce API calls.
</Card>
<Card title="Handle Rate Limits" icon="clock">
Implement exponential backoff for failed requests and respect server limits.
</Card>
</CardGroup>

## Extending the API
To add new API endpoints:
<Steps>
<Step title="Create a Controller">
Add a new controller in `Jellyfin.Api/Controllers/`:
```
```csharp theme={null}
namespace Jellyfin.Api.Controllers;

[Authorize]
public class MyCustomController : BaseJellyfinApiController
{
    [HttpGet("MyEndpoint")]
    public ActionResult<MyResponse> GetData()
    {
        return Ok(new MyResponse());
    }
}
```
```
</Step>
<Step title="Add Response Models">
Define DTOs in `MediaBrowser.Model/` or `Jellyfin.Api/Models/`.
</Step>
<Step title="Implement Business Logic">
Use interfaces from `MediaBrowser.Controller/` and implementations from `Emby.Server.Implementations/`.
</Step>
<Step title="Test Your Endpoint">
Write tests in `tests/Jellyfin.Api.Tests/Controllers/`.
</Step>
</Steps>

## Next Steps
<CardGroup cols={2}>
<Card title="Plugin Development" icon="plug" href="./plugin-development">
Create plugins that extend the Jellyfin API
</Card>
<Card title="Contributing Guide" icon="code-branch" href="./contributing">
Learn how to contribute API changes to Jellyfin
</Card>
<Card title="Building from Source" icon="hammer" href="./building-from-source">
Set up your development environment
</Card>
<Card title="API Documentation" icon="book" href="http://localhost:8096/api-docs/swagger/index.html">
Explore the interactive API documentation
</Card>
</CardGroup>