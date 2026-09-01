# Server
## OAuth2 Authorization Request
On a valid request, it will return a 302-redirect (usually with a `Location:` header), which will point to the ABS-configured OAuth2 Provider.
It will include your generated `state` -parameter, check if it matches.
You would usually then have to open this redirect-URL in a Browser to present to the user.

...

# Library Items
## Update a Library Item's Media
### Parameters
#### Author Parameters
The server will automatically find the ID of the author or create one.
| Parameter | Type | Description |
| `name` | String | The name of the author. |

#### Series Parameters
The server will automatically find the ID of the series or create one.
| Parameter | Type | Description |
| `name` | String | The name of the series. |
| `sequence` | String or null | The position in the series the book is. |

...

## Update a Library Item's Audio Tracks
### Response
| Status | Meaning | Description | Schema |
| 200 | OK | Success | Library Item |
| 500 | Internal Server Error | The library item's media type must be `book` for this endpoint. |  |

...

# Me
## Sync Local Media Progress
This endpoint syncs a mobile client's local media progress with the server. For any local media progress with a greater `lastUpdate` time than the `lastUpdate` time of the matching media progress on the server, the server's media progress is updated.
If the server's `lastUpdate` time is greater, than the local media progress will be returned with the updated information.

...

### Response
#### Response Schema
| Attribute | Type | Description |
| `numServerProgressUpdates` | Integer | The number of media progress items that were updated on the server. |
| `serverProgressUpdates` | Array of Media Progress | Media progress items that were updated on the server (local more recent). |

...

# Podcasts
## Create a Podcast
### Parameters
| Parameter | Type | Description |
| `path` | String | The path of the new podcast library item on the server. |
| `folderId` | String | The ID of the folder to put the new podcast library item in. |
| `media` | New Podcast Parameters Object (See Below) | The created library item's podcast media. |

...

## Check for New Podcast Episodes
This endpoint checks for new episodes for a podcast, which the server downloads, and returns the podcast episode feed data.

...

# Misc
## Update Server Settings
### HTTP Request
`PATCH http://abs.example.com/api/settings`

...

# Schemas
## Media Progress
> Media Progress with Media

...

### Media Progress with Media
#### Added Attributes
| Attribute | Type | Description |
| `media` | Book Expanded or Podcast Expanded Object | The media of the library item the media progress is for. |
| `episode` | Podcast Episode | The podcast episode the media progress is for. Will only exist if the media progress is for a podcast episode. |