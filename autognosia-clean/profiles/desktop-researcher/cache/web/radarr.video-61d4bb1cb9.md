## Radarr  ```  3.0.0  ```    ``` OAS3 ```

[https://raw.githubusercontent.com/Radarr/Radarr/develop/src/Radarr.Api.V3/openapi.json](https://raw.githubusercontent.com/Radarr/Radarr/develop/src/Radarr.Api.V3/openapi.json)

Radarr API docs

[GPL-3.0](https://github.com/Radarr/Radarr/blob/develop/LICENSE)

Servers

{protocol}://{hostpath}

Computed URL:`http://localhost:7878`

#### Server variables

|     |     |
| --- | --- |
| protocol | httphttps |
| hostpath |  |

Authorize

### [AlternativeTitle](https://radarr.video/docs/api/\#/AlternativeTitle)

GET[/api/v3/alttitle](https://radarr.video/docs/api/#/AlternativeTitle/get_api_v3_alttitle)

GET[/api/v3/alttitle/{id}](https://radarr.video/docs/api/#/AlternativeTitle/get_api_v3_alttitle__id_)

### [ApiInfo](https://radarr.video/docs/api/\#/ApiInfo)

GET[/api](https://radarr.video/docs/api/#/ApiInfo/get_api)

### [Authentication](https://radarr.video/docs/api/\#/Authentication)

POST[/login](https://radarr.video/docs/api/#/Authentication/post_login)

GET[/logout](https://radarr.video/docs/api/#/Authentication/get_logout)

### [StaticResource](https://radarr.video/docs/api/\#/StaticResource)

GET[/login](https://radarr.video/docs/api/#/StaticResource/get_login)

GET[/content/{path}](https://radarr.video/docs/api/#/StaticResource/get_content__path_)

GET[/](https://radarr.video/docs/api/#/StaticResource/get_)

GET[/{path}](https://radarr.video/docs/api/#/StaticResource/get__path_)

### [AutoTagging](https://radarr.video/docs/api/\#/AutoTagging)

POST[/api/v3/autotagging](https://radarr.video/docs/api/#/AutoTagging/post_api_v3_autotagging)

GET[/api/v3/autotagging](https://radarr.video/docs/api/#/AutoTagging/get_api_v3_autotagging)

PUT[/api/v3/autotagging/{id}](https://radarr.video/docs/api/#/AutoTagging/put_api_v3_autotagging__id_)

DELETE[/api/v3/autotagging/{id}](https://radarr.video/docs/api/#/AutoTagging/delete_api_v3_autotagging__id_)

GET[/api/v3/autotagging/{id}](https://radarr.video/docs/api/#/AutoTagging/get_api_v3_autotagging__id_)

GET[/api/v3/autotagging/schema](https://radarr.video/docs/api/#/AutoTagging/get_api_v3_autotagging_schema)

### [Backup](https://radarr.video/docs/api/\#/Backup)

GET[/api/v3/system/backup](https://radarr.video/docs/api/#/Backup/get_api_v3_system_backup)

DELETE[/api/v3/system/backup/{id}](https://radarr.video/docs/api/#/Backup/delete_api_v3_system_backup__id_)

POST[/api/v3/system/backup/restore/{id}](https://radarr.video/docs/api/#/Backup/post_api_v3_system_backup_restore__id_)

POST[/api/v3/system/backup/restore/upload](https://radarr.video/docs/api/#/Backup/post_api_v3_system_backup_restore_upload)

### [Blocklist](https://radarr.video/docs/api/\#/Blocklist)

GET[/api/v3/blocklist](https://radarr.video/docs/api/#/Blocklist/get_api_v3_blocklist)

GET[/api/v3/blocklist/movie](https://radarr.video/docs/api/#/Blocklist/get_api_v3_blocklist_movie)

DELETE[/api/v3/blocklist/{id}](https://radarr.video/docs/api/#/Blocklist/delete_api_v3_blocklist__id_)

DELETE[/api/v3/blocklist/bulk](https://radarr.video/docs/api/#/Blocklist/delete_api_v3_blocklist_bulk)

### [Calendar](https://radarr.video/docs/api/\#/Calendar)

GET[/api/v3/calendar](https://radarr.video/docs/api/#/Calendar/get_api_v3_calendar)

### [CalendarFeed](https://radarr.video/docs/api/\#/CalendarFeed)

GET[/feed/v3/calendar/radarr.ics](https://radarr.video/docs/api/#/CalendarFeed/get_feed_v3_calendar_radarr_ics)

### [Collection](https://radarr.video/docs/api/\#/Collection)

GET[/api/v3/collection](https://radarr.video/docs/api/#/Collection/get_api_v3_collection)

PUT[/api/v3/collection](https://radarr.video/docs/api/#/Collection/put_api_v3_collection)

PUT[/api/v3/collection/{id}](https://radarr.video/docs/api/#/Collection/put_api_v3_collection__id_)

GET[/api/v3/collection/{id}](https://radarr.video/docs/api/#/Collection/get_api_v3_collection__id_)

### [Command](https://radarr.video/docs/api/\#/Command)

POST[/api/v3/command](https://radarr.video/docs/api/#/Command/post_api_v3_command)

GET[/api/v3/command](https://radarr.video/docs/api/#/Command/get_api_v3_command)

DELETE[/api/v3/command/{id}](https://radarr.video/docs/api/#/Command/delete_api_v3_command__id_)

GET[/api/v3/command/{id}](https://radarr.video/docs/api/#/Command/get_api_v3_command__id_)

### [Credit](https://radarr.video/docs/api/\#/Credit)

GET[/api/v3/credit](https://radarr.video/docs/api/#/Credit/get_api_v3_credit)

GET[/api/v3/credit/{id}](https://radarr.video/docs/api/#/Credit/get_api_v3_credit__id_)

### [CustomFilter](https://radarr.video/docs/api/\#/CustomFilter)

GET[/api/v3/customfilter](https://radarr.video/docs/api/#/CustomFilter/get_api_v3_customfilter)

POST[/api/v3/customfilter](https://radarr.video/docs/api/#/CustomFilter/post_api_v3_customfilter)

PUT[/api/v3/customfilter/{id}](https://radarr.video/docs/api/#/CustomFilter/put_api_v3_customfilter__id_)

DELETE[/api/v3/customfilter/{id}](https://radarr.video/docs/api/#/CustomFilter/delete_api_v3_customfilter__id_)

GET[/api/v3/customfilter/{id}](https://radarr.video/docs/api/#/CustomFilter/get_api_v3_customfilter__id_)

### [CustomFormat](https://radarr.video/docs/api/\#/CustomFormat)

GET[/api/v3/customformat](https://radarr.video/docs/api/#/CustomFormat/get_api_v3_customformat)

POST[/api/v3/customformat](https://radarr.video/docs/api/#/CustomFormat/post_api_v3_customformat)

PUT[/api/v3/customformat/{id}](https://radarr.video/docs/api/#/CustomFormat/put_api_v3_customformat__id_)

DELETE[/api/v3/customformat/{id}](https://radarr.video/docs/api/#/CustomFormat/delete_api_v3_customformat__id_)

GET[/api/v3/customformat/{id}](https://radarr.video/docs/api/#/CustomFormat/get_api_v3_customformat__id_)

PUT[/api/v3/customformat/bulk](https://radarr.video/docs/api/#/CustomFormat/put_api_v3_customformat_bulk)

DELETE[/api/v3/customformat/bulk](https://radarr.video/docs/api/#/CustomFormat/delete_api_v3_customformat_bulk)

GET[/api/v3/customformat/schema](https://radarr.video/docs/api/#/CustomFormat/get_api_v3_customformat_schema)

### [Cutoff](https://radarr.video/docs/api/\#/Cutoff)

GET[/api/v3/wanted/cutoff](https://radarr.video/docs/api/#/Cutoff/get_api_v3_wanted_cutoff)

### [DelayProfile](https://radarr.video/docs/api/\#/DelayProfile)

POST[/api/v3/delayprofile](https://radarr.video/docs/api/#/DelayProfile/post_api_v3_delayprofile)

GET[/api/v3/delayprofile](https://radarr.video/docs/api/#/DelayProfile/get_api_v3_delayprofile)

DELETE[/api/v3/delayprofile/{id}](https://radarr.video/docs/api/#/DelayProfile/delete_api_v3_delayprofile__id_)

PUT[/api/v3/delayprofile/{id}](https://radarr.video/docs/api/#/DelayProfile/put_api_v3_delayprofile__id_)

GET[/api/v3/delayprofile/{id}](https://radarr.video/docs/api/#/DelayProfile/get_api_v3_delayprofile__id_)

PUT[/api/v3/delayprofile/reorder/{id}](https://radarr.video/docs/api/#/DelayProfile/put_api_v3_delayprofile_reorder__id_)

### [DiskSpace](https://radarr.video/docs/api/\#/DiskSpace)

GET[/api/v3/diskspace](https://radarr.video/docs/api/#/DiskSpace/get_api_v3_diskspace)

### [DownloadClient](https://radarr.video/docs/api/\#/DownloadClient)

GET[/api/v3/downloadclient](https://radarr.video/docs/api/#/DownloadClient/get_api_v3_downloadclient)

POST[/api/v3/downloadclient](https://radarr.video/docs/api/#/DownloadClient/post_api_v3_downloadclient)

PUT[/api/v3/downloadclient/{id}](https://radarr.video/docs/api/#/DownloadClient/put_api_v3_downloadclient__id_)

DELETE[/api/v3/downloadclient/{id}](https://radarr.video/docs/api/#/DownloadClient/delete_api_v3_downloadclient__id_)

GET[/api/v3/downloadclient/{id}](https://radarr.video/docs/api/#/DownloadClient/get_api_v3_downloadclient__id_)

PUT[/api/v3/downloadclient/bulk](https://radarr.video/docs/api/#/DownloadClient/put_api_v3_downloadclient_bulk)

DELETE[/api/v3/downloadclient/bulk](https://radarr.video/docs/api/#/DownloadClient/delete_api_v3_downloadclient_bulk)

GET[/api/v3/downloadclient/schema](https://radarr.video/docs/api/#/DownloadClient/get_api_v3_downloadclient_schema)

POST[/api/v3/downloadclient/test](https://radarr.video/docs/api/#/DownloadClient/post_api_v3_downloadclient_test)

POST[/api/v3/downloadclient/testall](https://radarr.video/docs/api/#/DownloadClient/post_api_v3_downloadclient_testall)

POST[/api/v3/downloadclient/action/{name}](https://radarr.video/docs/api/#/DownloadClient/post_api_v3_downloadclient_action__name_)

### [DownloadClientConfig](https://radarr.video/docs/api/\#/DownloadClientConfig)

GET[/api/v3/config/downloadclient](https://radarr.video/docs/api/#/DownloadClientConfig/get_api_v3_config_downloadclient)

PUT[/api/v3/config/downloadclient/{id}](https://radarr.video/docs/api/#/DownloadClientConfig/put_api_v3_config_downloadclient__id_)

GET[/api/v3/config/downloadclient/{id}](https://radarr.video/docs/api/#/DownloadClientConfig/get_api_v3_config_downloadclient__id_)

### [ExtraFile](https://radarr.video/docs/api/\#/ExtraFile)

GET[/api/v3/extrafile](https://radarr.video/docs/api/#/ExtraFile/get_api_v3_extrafile)

### [FileSystem](https://radarr.video/docs/api/\#/FileSystem)

GET[/api/v3/filesystem](https://radarr.video/docs/api/#/FileSystem/get_api_v3_filesystem)

GET[/api/v3/filesystem/type](https://radarr.video/docs/api/#/FileSystem/get_api_v3_filesystem_type)

GET[/api/v3/filesystem/mediafiles](https://radarr.video/docs/api/#/FileSystem/get_api_v3_filesystem_mediafiles)

### [Health](https://radarr.video/docs/api/\#/Health)

GET[/api/v3/health](https://radarr.video/docs/api/#/Health/get_api_v3_health)

### [History](https://radarr.video/docs/api/\#/History)

GET[/api/v3/history](https://radarr.video/docs/api/#/History/get_api_v3_history)

GET[/api/v3/history/since](https://radarr.video/docs/api/#/History/get_api_v3_history_since)

GET[/api/v3/history/movie](https://radarr.video/docs/api/#/History/get_api_v3_history_movie)

POST[/api/v3/history/failed/{id}](https://radarr.video/docs/api/#/History/post_api_v3_history_failed__id_)

### [HostConfig](https://radarr.video/docs/api/\#/HostConfig)

GET[/api/v3/config/host](https://radarr.video/docs/api/#/HostConfig/get_api_v3_config_host)

PUT[/api/v3/config/host/{id}](https://radarr.video/docs/api/#/HostConfig/put_api_v3_config_host__id_)

GET[/api/v3/config/host/{id}](https://radarr.video/docs/api/#/HostConfig/get_api_v3_config_host__id_)

### [ImportList](https://radarr.video/docs/api/\#/ImportList)

GET[/api/v3/importlist](https://radarr.video/docs/api/#/ImportList/get_api_v3_importlist)

POST[/api/v3/importlist](https://radarr.video/docs/api/#/ImportList/post_api_v3_importlist)

PUT[/api/v3/importlist/{id}](https://radarr.video/docs/api/#/ImportList/put_api_v3_importlist__id_)

DELETE[/api/v3/importlist/{id}](https://radarr.video/docs/api/#/ImportList/delete_api_v3_importlist__id_)

GET[/api/v3/importlist/{id}](https://radarr.video/docs/api/#/ImportList/get_api_v3_importlist__id_)

PUT[/api/v3/importlist/bulk](https://radarr.video/docs/api/#/ImportList/put_api_v3_importlist_bulk)

DELETE[/api/v3/importlist/bulk](https://radarr.video/docs/api/#/ImportList/delete_api_v3_importlist_bulk)

GET[/api/v3/importlist/schema](https://radarr.video/docs/api/#/ImportList/get_api_v3_importlist_schema)

POST[/api/v3/importlist/test](https://radarr.video/docs/api/#/ImportList/post_api_v3_importlist_test)

POST[/api/v3/importlist/testall](https://radarr.video/docs/api/#/ImportList/post_api_v3_importlist_testall)

POST[/api/v3/importlist/action/{name}](https://radarr.video/docs/api/#/ImportList/post_api_v3_importlist_action__name_)

### [ImportListConfig](https://radarr.video/docs/api/\#/ImportListConfig)

GET[/api/v3/config/importlist](https://radarr.video/docs/api/#/ImportListConfig/get_api_v3_config_importlist)

PUT[/api/v3/config/importlist/{id}](https://radarr.video/docs/api/#/ImportListConfig/put_api_v3_config_importlist__id_)

GET[/api/v3/config/importlist/{id}](https://radarr.video/docs/api/#/ImportListConfig/get_api_v3_config_importlist__id_)

### [ImportListExclusion](https://radarr.video/docs/api/\#/ImportListExclusion)

GET[/api/v3/exclusions](https://radarr.video/docs/api/#/ImportListExclusion/get_api_v3_exclusions)

POST[/api/v3/exclusions](https://radarr.video/docs/api/#/ImportListExclusion/post_api_v3_exclusions)

GET[/api/v3/exclusions/paged](https://radarr.video/docs/api/#/ImportListExclusion/get_api_v3_exclusions_paged)

PUT[/api/v3/exclusions/{id}](https://radarr.video/docs/api/#/ImportListExclusion/put_api_v3_exclusions__id_)

DELETE[/api/v3/exclusions/{id}](https://radarr.video/docs/api/#/ImportListExclusion/delete_api_v3_exclusions__id_)

GET[/api/v3/exclusions/{id}](https://radarr.video/docs/api/#/ImportListExclusion/get_api_v3_exclusions__id_)

POST[/api/v3/exclusions/bulk](https://radarr.video/docs/api/#/ImportListExclusion/post_api_v3_exclusions_bulk)

DELETE[/api/v3/exclusions/bulk](https://radarr.video/docs/api/#/ImportListExclusion/delete_api_v3_exclusions_bulk)

### [ImportListMovies](https://radarr.video/docs/api/\#/ImportListMovies)

GET[/api/v3/importlist/movie](https://radarr.video/docs/api/#/ImportListMovies/get_api_v3_importlist_movie)

POST[/api/v3/importlist/movie](https://radarr.video/docs/api/#/ImportListMovies/post_api_v3_importlist_movie)

### [Indexer](https://radarr.video/docs/api/\#/Indexer)

GET[/api/v3/indexer](https://radarr.video/docs/api/#/Indexer/get_api_v3_indexer)

POST[/api/v3/indexer](https://radarr.video/docs/api/#/Indexer/post_api_v3_indexer)

PUT[/api/v3/indexer/{id}](https://radarr.video/docs/api/#/Indexer/put_api_v3_indexer__id_)

DELETE[/api/v3/indexer/{id}](https://radarr.video/docs/api/#/Indexer/delete_api_v3_indexer__id_)

GET[/api/v3/indexer/{id}](https://radarr.video/docs/api/#/Indexer/get_api_v3_indexer__id_)

PUT[/api/v3/indexer/bulk](https://radarr.video/docs/api/#/Indexer/put_api_v3_indexer_bulk)

DELETE[/api/v3/indexer/bulk](https://radarr.video/docs/api/#/Indexer/delete_api_v3_indexer_bulk)

GET[/api/v3/indexer/schema](https://radarr.video/docs/api/#/Indexer/get_api_v3_indexer_schema)

POST[/api/v3/indexer/test](https://radarr.video/docs/api/#/Indexer/post_api_v3_indexer_test)

POST[/api/v3/indexer/testall](https://radarr.video/docs/api/#/Indexer/post_api_v3_indexer_testall)

POST[/api/v3/indexer/action/{name}](https://radarr.video/docs/api/#/Indexer/post_api_v3_indexer_action__name_)

### [IndexerConfig](https://radarr.video/docs/api/\#/IndexerConfig)

GET[/api/v3/config/indexer](https://radarr.video/docs/api/#/IndexerConfig/get_api_v3_config_indexer)

PUT[/api/v3/config/indexer/{id}](https://radarr.video/docs/api/#/IndexerConfig/put_api_v3_config_indexer__id_)

GET[/api/v3/config/indexer/{id}](https://radarr.video/docs/api/#/IndexerConfig/get_api_v3_config_indexer__id_)

### [IndexerFlag](https://radarr.video/docs/api/\#/IndexerFlag)

GET[/api/v3/indexerflag](https://radarr.video/docs/api/#/IndexerFlag/get_api_v3_indexerflag)

### [Language](https://radarr.video/docs/api/\#/Language)

GET[/api/v3/language](https://radarr.video/docs/api/#/Language/get_api_v3_language)

GET[/api/v3/language/{id}](https://radarr.video/docs/api/#/Language/get_api_v3_language__id_)

### [Localization](https://radarr.video/docs/api/\#/Localization)

GET[/api/v3/localization](https://radarr.video/docs/api/#/Localization/get_api_v3_localization)

GET[/api/v3/localization/language](https://radarr.video/docs/api/#/Localization/get_api_v3_localization_language)

### [Log](https://radarr.video/docs/api/\#/Log)

GET[/api/v3/log](https://radarr.video/docs/api/#/Log/get_api_v3_log)

### [LogFile](https://radarr.video/docs/api/\#/LogFile)

GET[/api/v3/log/file](https://radarr.video/docs/api/#/LogFile/get_api_v3_log_file)

GET[/api/v3/log/file/{filename}](https://radarr.video/docs/api/#/LogFile/get_api_v3_log_file__filename_)

### [ManualImport](https://radarr.video/docs/api/\#/ManualImport)

GET[/api/v3/manualimport](https://radarr.video/docs/api/#/ManualImport/get_api_v3_manualimport)

POST[/api/v3/manualimport](https://radarr.video/docs/api/#/ManualImport/post_api_v3_manualimport)

### [MediaCover](https://radarr.video/docs/api/\#/MediaCover)

GET[/api/v3/mediacover/{movieId}/{filename}](https://radarr.video/docs/api/#/MediaCover/get_api_v3_mediacover__movieId___filename_)

### [MediaManagementConfig](https://radarr.video/docs/api/\#/MediaManagementConfig)

GET[/api/v3/config/mediamanagement](https://radarr.video/docs/api/#/MediaManagementConfig/get_api_v3_config_mediamanagement)

PUT[/api/v3/config/mediamanagement/{id}](https://radarr.video/docs/api/#/MediaManagementConfig/put_api_v3_config_mediamanagement__id_)

GET[/api/v3/config/mediamanagement/{id}](https://radarr.video/docs/api/#/MediaManagementConfig/get_api_v3_config_mediamanagement__id_)

### [Metadata](https://radarr.video/docs/api/\#/Metadata)

GET[/api/v3/metadata](https://radarr.video/docs/api/#/Metadata/get_api_v3_metadata)

POST[/api/v3/metadata](https://radarr.video/docs/api/#/Metadata/post_api_v3_metadata)

PUT[/api/v3/metadata/{id}](https://radarr.video/docs/api/#/Metadata/put_api_v3_metadata__id_)

DELETE[/api/v3/metadata/{id}](https://radarr.video/docs/api/#/Metadata/delete_api_v3_metadata__id_)

GET[/api/v3/metadata/{id}](https://radarr.video/docs/api/#/Metadata/get_api_v3_metadata__id_)

GET[/api/v3/metadata/schema](https://radarr.video/docs/api/#/Metadata/get_api_v3_metadata_schema)

POST[/api/v3/metadata/test](https://radarr.video/docs/api/#/Metadata/post_api_v3_metadata_test)

POST[/api/v3/metadata/testall](https://radarr.video/docs/api/#/Metadata/post_api_v3_metadata_testall)

POST[/api/v3/metadata/action/{name}](https://radarr.video/docs/api/#/Metadata/post_api_v3_metadata_action__name_)

### [MetadataConfig](https://radarr.video/docs/api/\#/MetadataConfig)

GET[/api/v3/config/metadata](https://radarr.video/docs/api/#/MetadataConfig/get_api_v3_config_metadata)

PUT[/api/v3/config/metadata/{id}](https://radarr.video/docs/api/#/MetadataConfig/put_api_v3_config_metadata__id_)

GET[/api/v3/config/metadata/{id}](https://radarr.video/docs/api/#/MetadataConfig/get_api_v3_config_metadata__id_)

### [Missing](https://radarr.video/docs/api/\#/Missing)

GET[/api/v3/wanted/missing](https://radarr.video/docs/api/#/Missing/get_api_v3_wanted_missing)

### [Movie](https://radarr.video/docs/api/\#/Movie)

GET[/api/v3/movie](https://radarr.video/docs/api/#/Movie/get_api_v3_movie)

POST[/api/v3/movie](https://radarr.video/docs/api/#/Movie/post_api_v3_movie)

PUT[/api/v3/movie/{id}](https://radarr.video/docs/api/#/Movie/put_api_v3_movie__id_)

DELETE[/api/v3/movie/{id}](https://radarr.video/docs/api/#/Movie/delete_api_v3_movie__id_)

GET[/api/v3/movie/{id}](https://radarr.video/docs/api/#/Movie/get_api_v3_movie__id_)

### [MovieEditor](https://radarr.video/docs/api/\#/MovieEditor)

PUT[/api/v3/movie/editor](https://radarr.video/docs/api/#/MovieEditor/put_api_v3_movie_editor)

DELETE[/api/v3/movie/editor](https://radarr.video/docs/api/#/MovieEditor/delete_api_v3_movie_editor)

### [MovieFile](https://radarr.video/docs/api/\#/MovieFile)

GET[/api/v3/moviefile](https://radarr.video/docs/api/#/MovieFile/get_api_v3_moviefile)

PUT[/api/v3/moviefile/{id}](https://radarr.video/docs/api/#/MovieFile/put_api_v3_moviefile__id_)

DELETE[/api/v3/moviefile/{id}](https://radarr.video/docs/api/#/MovieFile/delete_api_v3_moviefile__id_)

GET[/api/v3/moviefile/{id}](https://radarr.video/docs/api/#/MovieFile/get_api_v3_moviefile__id_)

PUT[/api/v3/moviefile/editor](https://radarr.video/docs/api/#/MovieFile/put_api_v3_moviefile_editor)

DELETE[/api/v3/moviefile/bulk](https://radarr.video/docs/api/#/MovieFile/delete_api_v3_moviefile_bulk)

PUT[/api/v3/moviefile/bulk](https://radarr.video/docs/api/#/MovieFile/put_api_v3_moviefile_bulk)

### [MovieFolder](https://radarr.video/docs/api/\#/MovieFolder)

GET[/api/v3/movie/{id}/folder](https://radarr.video/docs/api/#/MovieFolder/get_api_v3_movie__id__folder)

### [MovieImport](https://radarr.video/docs/api/\#/MovieImport)

POST[/api/v3/movie/import](https://radarr.video/docs/api/#/MovieImport/post_api_v3_movie_import)

### [MovieLookup](https://radarr.video/docs/api/\#/MovieLookup)

GET[/api/v3/movie/lookup/tmdb](https://radarr.video/docs/api/#/MovieLookup/get_api_v3_movie_lookup_tmdb)

GET[/api/v3/movie/lookup/imdb](https://radarr.video/docs/api/#/MovieLookup/get_api_v3_movie_lookup_imdb)

GET[/api/v3/movie/lookup](https://radarr.video/docs/api/#/MovieLookup/get_api_v3_movie_lookup)

### [NamingConfig](https://radarr.video/docs/api/\#/NamingConfig)

GET[/api/v3/config/naming](https://radarr.video/docs/api/#/NamingConfig/get_api_v3_config_naming)

PUT[/api/v3/config/naming/{id}](https://radarr.video/docs/api/#/NamingConfig/put_api_v3_config_naming__id_)

GET[/api/v3/config/naming/{id}](https://radarr.video/docs/api/#/NamingConfig/get_api_v3_config_naming__id_)

GET[/api/v3/config/naming/examples](https://radarr.video/docs/api/#/NamingConfig/get_api_v3_config_naming_examples)

### [Notification](https://radarr.video/docs/api/\#/Notification)

GET[/api/v3/notification](https://radarr.video/docs/api/#/Notification/get_api_v3_notification)

POST[/api/v3/notification](https://radarr.video/docs/api/#/Notification/post_api_v3_notification)

PUT[/api/v3/notification/{id}](https://radarr.video/docs/api/#/Notification/put_api_v3_notification__id_)

DELETE[/api/v3/notification/{id}](https://radarr.video/docs/api/#/Notification/delete_api_v3_notification__id_)

GET[/api/v3/notification/{id}](https://radarr.video/docs/api/#/Notification/get_api_v3_notification__id_)

GET[/api/v3/notification/schema](https://radarr.video/docs/api/#/Notification/get_api_v3_notification_schema)

POST[/api/v3/notification/test](https://radarr.video/docs/api/#/Notification/post_api_v3_notification_test)

POST[/api/v3/notification/testall](https://radarr.video/docs/api/#/Notification/post_api_v3_notification_testall)

POST[/api/v3/notification/action/{name}](https://radarr.video/docs/api/#/Notification/post_api_v3_notification_action__name_)

### [Parse](https://radarr.video/docs/api/\#/Parse)

GET[/api/v3/parse](https://radarr.video/docs/api/#/Parse/get_api_v3_parse)

### [Ping](https://radarr.video/docs/api/\#/Ping)

GET[/ping](https://radarr.video/docs/api/#/Ping/get_ping)

HEAD[/ping](https://radarr.video/docs/api/#/Ping/head_ping)

### [QualityDefinition](https://radarr.video/docs/api/\#/QualityDefinition)

PUT[/api/v3/qualitydefinition/{id}](https://radarr.video/docs/api/#/QualityDefinition/put_api_v3_qualitydefinition__id_)

GET[/api/v3/qualitydefinition/{id}](https://radarr.video/docs/api/#/QualityDefinition/get_api_v3_qualitydefinition__id_)

GET[/api/v3/qualitydefinition](https://radarr.video/docs/api/#/QualityDefinition/get_api_v3_qualitydefinition)

PUT[/api/v3/qualitydefinition/update](https://radarr.video/docs/api/#/QualityDefinition/put_api_v3_qualitydefinition_update)

GET[/api/v3/qualitydefinition/limits](https://radarr.video/docs/api/#/QualityDefinition/get_api_v3_qualitydefinition_limits)

### [QualityProfile](https://radarr.video/docs/api/\#/QualityProfile)

POST[/api/v3/qualityprofile](https://radarr.video/docs/api/#/QualityProfile/post_api_v3_qualityprofile)

GET[/api/v3/qualityprofile](https://radarr.video/docs/api/#/QualityProfile/get_api_v3_qualityprofile)

DELETE[/api/v3/qualityprofile/{id}](https://radarr.video/docs/api/#/QualityProfile/delete_api_v3_qualityprofile__id_)

PUT[/api/v3/qualityprofile/{id}](https://radarr.video/docs/api/#/QualityProfile/put_api_v3_qualityprofile__id_)

GET[/api/v3/qualityprofile/{id}](https://radarr.video/docs/api/#/QualityProfile/get_api_v3_qualityprofile__id_)

### [QualityProfileSchema](https://radarr.video/docs/api/\#/QualityProfileSchema)

GET[/api/v3/qualityprofile/schema](https://radarr.video/docs/api/#/QualityProfileSchema/get_api_v3_qualityprofile_schema)

### [Queue](https://radarr.video/docs/api/\#/Queue)

DELETE[/api/v3/queue/{id}](https://radarr.video/docs/api/#/Queue/delete_api_v3_queue__id_)

DELETE[/api/v3/queue/bulk](https://radarr.video/docs/api/#/Queue/delete_api_v3_queue_bulk)

GET[/api/v3/queue](https://radarr.video/docs/api/#/Queue/get_api_v3_queue)

### [QueueAction](https://radarr.video/docs/api/\#/QueueAction)

POST[/api/v3/queue/grab/{id}](https://radarr.video/docs/api/#/QueueAction/post_api_v3_queue_grab__id_)

POST[/api/v3/queue/grab/bulk](https://radarr.video/docs/api/#/QueueAction/post_api_v3_queue_grab_bulk)

### [QueueDetails](https://radarr.video/docs/api/\#/QueueDetails)

GET[/api/v3/queue/details](https://radarr.video/docs/api/#/QueueDetails/get_api_v3_queue_details)

### [QueueStatus](https://radarr.video/docs/api/\#/QueueStatus)

GET[/api/v3/queue/status](https://radarr.video/docs/api/#/QueueStatus/get_api_v3_queue_status)

### [Release](https://radarr.video/docs/api/\#/Release)

POST[/api/v3/release](https://radarr.video/docs/api/#/Release/post_api_v3_release)

GET[/api/v3/release](https://radarr.video/docs/api/#/Release/get_api_v3_release)

### [ReleaseProfile](https://radarr.video/docs/api/\#/ReleaseProfile)

POST[/api/v3/releaseprofile](https://radarr.video/docs/api/#/ReleaseProfile/post_api_v3_releaseprofile)

GET[/api/v3/releaseprofile](https://radarr.video/docs/api/#/ReleaseProfile/get_api_v3_releaseprofile)

DELETE[/api/v3/releaseprofile/{id}](https://radarr.video/docs/api/#/ReleaseProfile/delete_api_v3_releaseprofile__id_)

PUT[/api/v3/releaseprofile/{id}](https://radarr.video/docs/api/#/ReleaseProfile/put_api_v3_releaseprofile__id_)

GET[/api/v3/releaseprofile/{id}](https://radarr.video/docs/api/#/ReleaseProfile/get_api_v3_releaseprofile__id_)

### [ReleasePush](https://radarr.video/docs/api/\#/ReleasePush)

POST[/api/v3/release/push](https://radarr.video/docs/api/#/ReleasePush/post_api_v3_release_push)

### [RemotePathMapping](https://radarr.video/docs/api/\#/RemotePathMapping)

POST[/api/v3/remotepathmapping](https://radarr.video/docs/api/#/RemotePathMapping/post_api_v3_remotepathmapping)

GET[/api/v3/remotepathmapping](https://radarr.video/docs/api/#/RemotePathMapping/get_api_v3_remotepathmapping)

DELETE[/api/v3/remotepathmapping/{id}](https://radarr.video/docs/api/#/RemotePathMapping/delete_api_v3_remotepathmapping__id_)

PUT[/api/v3/remotepathmapping/{id}](https://radarr.video/docs/api/#/RemotePathMapping/put_api_v3_remotepathmapping__id_)

GET[/api/v3/remotepathmapping/{id}](https://radarr.video/docs/api/#/RemotePathMapping/get_api_v3_remotepathmapping__id_)

### [RenameMovie](https://radarr.video/docs/api/\#/RenameMovie)

GET[/api/v3/rename](https://radarr.video/docs/api/#/RenameMovie/get_api_v3_rename)

### [RootFolder](https://radarr.video/docs/api/\#/RootFolder)

POST[/api/v3/rootfolder](https://radarr.video/docs/api/#/RootFolder/post_api_v3_rootfolder)

GET[/api/v3/rootfolder](https://radarr.video/docs/api/#/RootFolder/get_api_v3_rootfolder)

DELETE[/api/v3/rootfolder/{id}](https://radarr.video/docs/api/#/RootFolder/delete_api_v3_rootfolder__id_)

GET[/api/v3/rootfolder/{id}](https://radarr.video/docs/api/#/RootFolder/get_api_v3_rootfolder__id_)

### [System](https://radarr.video/docs/api/\#/System)

GET[/api/v3/system/status](https://radarr.video/docs/api/#/System/get_api_v3_system_status)

GET[/api/v3/system/routes](https://radarr.video/docs/api/#/System/get_api_v3_system_routes)

GET[/api/v3/system/routes/duplicate](https://radarr.video/docs/api/#/System/get_api_v3_system_routes_duplicate)

POST[/api/v3/system/shutdown](https://radarr.video/docs/api/#/System/post_api_v3_system_shutdown)

POST[/api/v3/system/restart](https://radarr.video/docs/api/#/System/post_api_v3_system_restart)

### [Tag](https://radarr.video/docs/api/\#/Tag)

GET[/api/v3/tag](https://radarr.video/docs/api/#/Tag/get_api_v3_tag)

POST[/api/v3/tag](https://radarr.video/docs/api/#/Tag/post_api_v3_tag)

PUT[/api/v3/tag/{id}](https://radarr.video/docs/api/#/Tag/put_api_v3_tag__id_)

DELETE[/api/v3/tag/{id}](https://radarr.video/docs/api/#/Tag/delete_api_v3_tag__id_)

GET[/api/v3/tag/{id}](https://radarr.video/docs/api/#/Tag/get_api_v3_tag__id_)

### [TagDetails](https://radarr.video/docs/api/\#/TagDetails)

GET[/api/v3/tag/detail](https://radarr.video/docs/api/#/TagDetails/get_api_v3_tag_detail)

GET[/api/v3/tag/detail/{id}](https://radarr.video/docs/api/#/TagDetails/get_api_v3_tag_detail__id_)

### [Task](https://radarr.video/docs/api/\#/Task)

GET[/api/v3/system/task](https://radarr.video/docs/api/#/Task/get_api_v3_system_task)

GET[/api/v3/system/task/{id}](https://radarr.video/docs/api/#/Task/get_api_v3_system_task__id_)

### [UiConfig](https://radarr.video/docs/api/\#/UiConfig)

PUT[/api/v3/config/ui/{id}](https://radarr.video/docs/api/#/UiConfig/put_api_v3_config_ui__id_)

GET[/api/v3/config/ui/{id}](https://radarr.video/docs/api/#/UiConfig/get_api_v3_config_ui__id_)

GET[/api/v3/config/ui](https://radarr.video/docs/api/#/UiConfig/get_api_v3_config_ui)

### [Update](https://radarr.video/docs/api/\#/Update)

GET[/api/v3/update](https://radarr.video/docs/api/#/Update/get_api_v3_update)

### [UpdateLogFile](https://radarr.video/docs/api/\#/UpdateLogFile)

GET[/api/v3/log/file/update](https://radarr.video/docs/api/#/UpdateLogFile/get_api_v3_log_file_update)

GET[/api/v3/log/file/update/{filename}](https://radarr.video/docs/api/#/UpdateLogFile/get_api_v3_log_file_update__filename_)

#### Schemas

AddMovieMethod

AddMovieOptions

AlternativeTitleResource

ApiInfoResource

ApplyTags

AuthenticationRequiredType

AuthenticationType

AutoTaggingResource

AutoTaggingSpecificationSchema

BackupResource

BackupType

BlocklistBulkResource

BlocklistResource

BlocklistResourcePagingResource

CalendarReleaseType

CertificateValidationType

CollectionMovieResource

CollectionResource

CollectionUpdateResource

ColonReplacementFormat

Command

CommandPriority

CommandResource

CommandResult

CommandStatus

CommandTrigger

CreditResource

CreditType

CustomFilterResource

CustomFormatBulkResource

CustomFormatResource

CustomFormatSpecificationSchema

DatabaseType

DelayProfileResource

DiskSpaceResource

DownloadClientBulkResource

DownloadClientConfigResource

DownloadClientResource

DownloadProtocol

ExtraFileResource

ExtraFileType

Field

FileDateType

HealthCheckResult

HealthResource

HistoryResource

HistoryResourcePagingResource

HostConfigResource

ImportListBulkResource

ImportListConfigResource

ImportListExclusionBulkResource

ImportListExclusionResource

ImportListExclusionResourcePagingResource

ImportListResource

ImportListType

ImportRejectionResource

IndexerBulkResource

IndexerConfigResource

IndexerFlagResource

IndexerResource

Language

LanguageResource

LocalizationLanguageResource

LogFileResource

LogResource

LogResourcePagingResource

ManualImportReprocessResource

ManualImportResource

MediaCover

MediaCoverTypes

MediaInfoResource

MediaManagementConfigResource

MetadataConfigResource

MetadataResource

Modifier

MonitorTypes

MovieCollectionResource

MovieEditorResource

MovieFileListResource

MovieFileResource

MovieHistoryEventType

MovieResource

MovieResourcePagingResource

MovieRuntimeFormatType

MovieStatisticsResource

MovieStatusType

NamingConfigResource

NotificationResource

ParseResource

ParsedMovieInfo

PingResource

PrivacyLevel

ProfileFormatItemResource

ProperDownloadTypes

ProviderMessage

ProviderMessageType

ProxyType

Quality

QualityDefinitionLimitsResource

QualityDefinitionResource

QualityModel

QualityProfileQualityItemResource

QualityProfileResource

QualitySource

QueueBulkResource

QueueResource

QueueResourcePagingResource

QueueStatus

QueueStatusResource

RatingChild

RatingType

Ratings

RejectionType

ReleaseProfileResource

ReleaseResource

RemotePathMappingResource

RenameMovieResource

RescanAfterRefreshType

Revision

RootFolderResource

RuntimeMode

SelectOption

SortDirection

SourceType

SystemResource

TMDbCountryCode

TagDetailsResource

TagResource

TaskResource

TrackedDownloadState

TrackedDownloadStatus

TrackedDownloadStatusMessage

UiConfigResource

UnmappedFolder

UpdateChanges

UpdateMechanism

UpdateResource