[Skip to content](https://docs.tubearchivist.com/api/docs/#api-documentation)

# API Documentation [\#](https://docs.tubearchivist.com/api/docs/\#api-documentation "Permanent link")

Note

Complete API documentation with swagger implementation is also available on your **Tube Archivist** instance at `/api/docs/`.

Swagger UI

## Tube Archivist API  ```  v0.5.10  ```    ``` OAS 3.0 ```

[../schema.yaml](https://docs.tubearchivist.com/api/schema.yaml)

API documentation for Tube Archivist backend.

Authorize

### appsettings

GET
/api/appsettings/backup/

POST
/api/appsettings/backup/

GET
/api/appsettings/backup/{filename}/

POST
/api/appsettings/backup/{filename}/

DELETE
/api/appsettings/backup/{filename}/

GET
/api/appsettings/config/

POST
/api/appsettings/config/

GET
/api/appsettings/cookie/

POST
/api/appsettings/cookie/

PUT
/api/appsettings/cookie/

DELETE
/api/appsettings/cookie/

POST
/api/appsettings/manual-import/

GET
/api/appsettings/membership/profile/

POST
/api/appsettings/membership/sync/

GET
/api/appsettings/membership/token/

POST
/api/appsettings/membership/token/

DELETE
/api/appsettings/membership/token/

POST
/api/appsettings/rescan-filesystem/

GET
/api/appsettings/snapshot/

POST
/api/appsettings/snapshot/

GET
/api/appsettings/snapshot/{snapshot\_id}/

POST
/api/appsettings/snapshot/{snapshot\_id}/

DELETE
/api/appsettings/snapshot/{snapshot\_id}/

GET
/api/appsettings/token/

DELETE
/api/appsettings/token/

### channel

GET
/api/channel/

POST
/api/channel/

GET
/api/channel/{channel\_id}/

POST
/api/channel/{channel\_id}/

DELETE
/api/channel/{channel\_id}/

GET
/api/channel/{channel\_id}/aggs/

GET
/api/channel/{channel\_id}/nav/

GET
/api/channel/search/

### download

GET
/api/download/

POST
/api/download/

PATCH
/api/download/

DELETE
/api/download/

GET
/api/download/{video\_id}/

POST
/api/download/{video\_id}/

DELETE
/api/download/{video\_id}/

GET
/api/download/aggs/

### health

GET
/api/health/

### notification

GET
/api/notification/

### ping

GET
/api/ping/

### playlist

GET
/api/playlist/

POST
/api/playlist/

GET
/api/playlist/{playlist\_id}/

POST
/api/playlist/{playlist\_id}/

DELETE
/api/playlist/{playlist\_id}/

POST
/api/playlist/custom/

POST
/api/playlist/custom/{playlist\_id}/

### refresh

GET
/api/refresh/

POST
/api/refresh/

### search

GET
/api/search/

### stats

GET
/api/stats/biggestchannels/

GET
/api/stats/channel/

GET
/api/stats/download/

GET
/api/stats/downloadhist/

GET
/api/stats/playlist/

GET
/api/stats/video/

GET
/api/stats/watch/

### task

GET
/api/task/by-id/{task\_id}/

POST
/api/task/by-id/{task\_id}/

GET
/api/task/by-name/

GET
/api/task/by-name/{task\_name}/

POST
/api/task/by-name/{task\_name}/

GET
/api/task/notification/

POST
/api/task/notification/

DELETE
/api/task/notification/

POST
/api/task/notification/test/

GET
/api/task/schedule/

GET
/api/task/schedule/{task\_name}/

POST
/api/task/schedule/{task\_name}/

DELETE
/api/task/schedule/{task\_name}/

### user

GET
/api/user/account/

POST
/api/user/login/

POST
/api/user/logout/

GET
/api/user/me/

POST
/api/user/me/

### video

GET
/api/video/

GET
/api/video/{video\_id}/

DELETE
/api/video/{video\_id}/

GET
/api/video/{video\_id}/comment/

GET
/api/video/{video\_id}/nav/

POST
/api/video/{video\_id}/progress/

DELETE
/api/video/{video\_id}/progress/

GET
/api/video/{video\_id}/similar/

### watched

POST
/api/watched/

#### Schemas

Account

ActionEnum

AddDownloadItem

AddDownloadItemStatusEnum

AddToDownloadList

AppConfig

AppConfigApp

AppConfigDownloads

AppConfigSub

AsyncTaskResponse

BackupFile

BiggestChannelItem

BulkUpdateDowloadDataStatusEnum

Channel

ChannelAgg

ChannelAggBucket

ChannelList

ChannelNav

ChannelOverwrite

ChannelStats

ChannelUpdate

CommentItem

CommentSortEnum

CookieUpdate

CookieValidation

CustomPeriodicTask

DownloadAggBucket

DownloadAggs

DownloadHistItem

DownloadItem

DownloadItemStatusEnum

DownloadItemVidTypeEnum

DownloadList

DownloadQueueItemUpdate

DownloadQueueItemUpdateStatusEnum

DownloadStats

DynamicDict

ErrorResponse

ExtEnum

FileSizeUnitEnum

LevelEnum

Login

ManualImportConfig

MembershipProfile

MembershipUser

Notification

NotificationCommandEnum

NullEnum

Pagination

PatchedBulkUpdateDowloadData

Ping

PingUpdate

Player

Playlist

PlaylistBulkAdd

PlaylistCustomPost

PlaylistEntry

PlaylistList

PlaylistListCustomPost

PlaylistNavItem

PlaylistNavMeta

PlaylistNavVideo

PlaylistSingleAdd

PlaylistSingleUpdate

PlaylistSortOrderEnum

PlaylistStats

PlaylistSubscribedEnum

PlaylistTypeEnum

RefreshAddData

RefreshResponse

RememberMeEnum

RescanFileSystemConfig

ResponseEnum

SnapshotCreateResponse

SnapshotItem

SnapshotList

SnapshotRestoreResponse

SortByEnum

SortOrderEnum

SourceEnum

SponsorBlock

SponsorBlockSegment

Sponsortier

StateEnum

Stats

StreamItem

StylesheetEnum

SubtitleItem

SubtitleSourceEnum

TaskCreateData

TaskIDData

TaskIDDataCommandEnum

TaskNameEnum

TaskNotificationItem

TaskNotificationPost

TaskNotificationTest

TaskResult

TaskResultStatusEnum

TokenResponse

TypeEnum

UserMeConfig

VidTypeFilterEnum

Video

VideoList

VideoProgressUpdate

VideoStats

VideoStatsItem

ViewStyleHomeEnum

ViewStylePlaylistEnum

WatchItemStats

WatchStats

WatchTotalStats

WatchedData