# Get Session History
[Buy me a coffee](https://buymeacoffee.com/plexopedia)
Plex stores information about the media play sessions for both videos and music tracks. This API command will return the information about each of those play sessions.

## URL
```
GET http://{ip_address}:32400/status/sessions/history/all?X-Plex-Token={plex_token}&{filter}
```

### Parameters
| Name | Description |
| ip_address | The IP address of the Plex Media server. |
| filter | (Optional) The filter to apply to the response. See the Filtering section below for parameters that can be used to filter the response. |

## Return Status
| HTTP Code | Description |
| 200 | Success - The request was successful. |
| 401 | Unauthorized - The Plex token provided was not valid. |

## Response
XML string value that lists all media being played from the Plex server. An example of the XML returned from the request is shown below for a video being transcoded:
```
<?xml version="1.0" encoding="UTF-8"?>
<?xml version="1.0" encoding="UTF-8"?>
<MediaContainer size="3693">
<Video historyKey="/status/sessions/history/1" key="/library/metadata/218860" ratingKey="218860" librarySectionID="2" title="Captain America: The Winter Soldier" type="movie" thumb="/library/metadata/218860/thumb/-1" viewedAt="1419652344" accountID="1" />
```

...

```
<Video historyKey="/status/sessions/history/7" librarySectionID="2" title="Thomas and Friends Best of Percy" type="movie" viewedAt="1419653744" accountID="1" />
<Video historyKey="/status/sessions/history/8" librarySectionID="2" title="Thomas and Friends Best of Percy" type="movie" viewedAt="1419653744" accountID="1" />
```

...

The XML returned provides a list of all the play session history on the Plex server. The root is the `MediaContainer` element. This element contains one attribute that provides a count of the number of items in the session history.
| Attribute | Description |
| size | The number of sessions history. |
Within the `MediaContainer` element are one or more `Video` elements. Each `Video` element represent the playing of one video at a point in time.
The attributes within a `Video` element is dependent on the type of video that was played.
| Attribute | Description |
| historyKey | The unique identifier the history record. |
| key | The relative URL of the video information. |
| ratingKey | A key associated with the video. |
| librarySectionID | The ID of the library section. |
| parentKey | The unique identifier for the season. |
| grandparentKey | The unique identifier for the TV show. |
| title | The title of the video. |
| grandparentTitle | The title of the TV show. |
| type | The type of media. |
| thumb | The thumbnail for the video. |

...

| Attribute | Description |
| historyKey | The unique identifier the history record. |
| key | The relative URL of the video information. |
| ratingKey | A key associated with the video. |
| librarySectionID | The ID of the library section. |
| grandparentThumb | The thumbnail for the TV show. |
| grandparentArt | The background artwork used to represent the TV show. |
| index | The index of the video. |
| parentIndex | The index of the season. |
| originallyAvailableAt | The original release date of the video. |

...

A `Track` element can also be found within the `MediaContainer` element. Each `Track` element represents on music track that was played from the Plex server.

...

| Attribute | Description |
| historyKey | The unique identifier the history record. |
| key | The relative URL of the music track information. |
| ratingKey | A key associated with the music track. |
| librarySectionID | The ID of the library section. |
| title | The title of the music track. |

...

| Attribute | Description |
| historyKey | The unique identifier the history record. |
| key | The relative URL of the music track information. |
| ratingKey | A key associated with the music track. |
| librarySectionID | The ID of the library section. |
| parentIndex | The index of the artist. |

...

## Filtering
To reduce the number of items returned, you can filter the API response to only return items that meet a specific criteria.
For more information, check out the Filter page.
The results from this endpoint can be filtered by adding the following optional parameters to the request:
| Parameter | Description |

## Examples
curl Python Powershell
```
curl -X GET http://{ip_address}:32400/status/sessions/history/all?X-Plex-Token={plex_token}
```
```
import requests
plex_url = http://{ip_address}:32400/status/sessions/history/all?X-Plex-Token={plex_token}
response = requests.get(plex_url)
print(response.text)
```
```
$response = Invoke-RestMethod 'http://{ip_address}:32400/status/sessions/history/all?X-Plex-Token={plex_token}' -Method GET
Write-Output $response
```