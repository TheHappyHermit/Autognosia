[Skip to content](https://docs.tubearchivist.com/api/introduction/#introduction)

# Introduction [\#](https://docs.tubearchivist.com/api/introduction/\#introduction "Permanent link")

This page has a generic overview with how the Tube Archivist API functions. This is the place to start.

Note

These API endpoints _have_ changed in the past and _will_ change again while building out additional integrations and functionality. For the time being, don't expect backwards compatibility for third party integrations using these endpoints.

Note

Not all endpoints will return expected status codes for errors, e.g. sometimes you'll see an error **500 Server Error** even though it should be **400 Bad request**. If you encounter any such cases, [please fix them](https://github.com/tubearchivist/tubearchivist/blob/master/CONTRIBUTING.md#how-to-make-a-pull-request) as you find them, no need to clutter up the issue queue.

Note

If you are sending POST requests to the API, you'll have to specify the content type as json like so: `"Content-Type: application/json"`.

## Authentication [\#](https://docs.tubearchivist.com/api/introduction/\#authentication "Permanent link")

API token will get automatically created, accessible on the settings page. Token needs to be passed as an authorization header with every request. Additionally session based authentication is enabled too: When you are logged into your TubeArchivist instance, you'll have access to the api in the browser for testing.

Curl example:

```
curl -v /api/video/<video-id>/ \
    -H "Authorization: Token xxxxxxxxxx"
```

Python requests example:

```
import requests

url = "/api/video/<video-id>/"
headers = {"Authorization": "Token xxxxxxxxxx"}
response = requests.get(url, headers=headers)
```

## Pagination [\#](https://docs.tubearchivist.com/api/introduction/\#pagination "Permanent link")

The list views return a paginate object with the following keys:

- page\_size: _int_ current page size set in config
- page\_from: _int_ first result idx
- prev\_pages: _array of ints_ of previous pages, if available
- current\_page: _int_ current page from query
- max\_hits: _bool_ if max of 10k results is reached
- params: _str_ additional url encoded query parameters
- last\_page: _int_ of last page link
- next\_pages: _array of ints_ of next pages
- total\_hits: _int_ total results

Pass page number as a query parameter: `page=2`. Defaults to _0_, `page=1` is redundant and falls back to _0_. If a page query doesn't return any results, you'll get `HTTP 404 Not Found`.