## Readarr  ```  1.0.0  ```    ``` OAS3 ```

[https://raw.githubusercontent.com/Readarr/Readarr/develop/src/Readarr.Api.V1/openapi.json](https://raw.githubusercontent.com/Readarr/Readarr/develop/src/Readarr.Api.V1/openapi.json)

Readarr API docs

[GPL-3.0](https://github.com/Readarr/Readarr/blob/develop/LICENSE.md)

Servers

{protocol}://{hostpath}

Computed URL:`http://localhost:8787`

#### Server variables

|     |     |
| --- | --- |
| protocol | httphttps |
| hostpath |  |

Authorize

### [ApiInfo](https://readarr.com/docs/api/\#/ApiInfo)

GET[/api](https://readarr.com/docs/api/#/ApiInfo/get_api)

### [Authentication](https://readarr.com/docs/api/\#/Authentication)

POST[/login](https://readarr.com/docs/api/#/Authentication/post_login)

GET[/logout](https://readarr.com/docs/api/#/Authentication/get_logout)

### [StaticResource](https://readarr.com/docs/api/\#/StaticResource)

GET[/login](https://readarr.com/docs/api/#/StaticResource/get_login)

GET[/content/{path}](https://readarr.com/docs/api/#/StaticResource/get_content__path_)

GET[/](https://readarr.com/docs/api/#/StaticResource/get_)

GET[/{path}](https://readarr.com/docs/api/#/StaticResource/get__path_)

### [Author](https://readarr.com/docs/api/\#/Author)

GET[/api/v1/author](https://readarr.com/docs/api/#/Author/get_api_v1_author)

POST[/api/v1/author](https://readarr.com/docs/api/#/Author/post_api_v1_author)

PUT[/api/v1/author/{id}](https://readarr.com/docs/api/#/Author/put_api_v1_author__id_)

DELETE[/api/v1/author/{id}](https://readarr.com/docs/api/#/Author/delete_api_v1_author__id_)

GET[/api/v1/author/{id}](https://readarr.com/docs/api/#/Author/get_api_v1_author__id_)

### [AuthorEditor](https://readarr.com/docs/api/\#/AuthorEditor)

PUT[/api/v1/author/editor](https://readarr.com/docs/api/#/AuthorEditor/put_api_v1_author_editor)

DELETE[/api/v1/author/editor](https://readarr.com/docs/api/#/AuthorEditor/delete_api_v1_author_editor)

### [AuthorLookup](https://readarr.com/docs/api/\#/AuthorLookup)

GET[/api/v1/author/lookup](https://readarr.com/docs/api/#/AuthorLookup/get_api_v1_author_lookup)

### [Backup](https://readarr.com/docs/api/\#/Backup)

GET[/api/v1/system/backup](https://readarr.com/docs/api/#/Backup/get_api_v1_system_backup)

DELETE[/api/v1/system/backup/{id}](https://readarr.com/docs/api/#/Backup/delete_api_v1_system_backup__id_)

POST[/api/v1/system/backup/restore/{id}](https://readarr.com/docs/api/#/Backup/post_api_v1_system_backup_restore__id_)

POST[/api/v1/system/backup/restore/upload](https://readarr.com/docs/api/#/Backup/post_api_v1_system_backup_restore_upload)

### [Blocklist](https://readarr.com/docs/api/\#/Blocklist)

GET[/api/v1/blocklist](https://readarr.com/docs/api/#/Blocklist/get_api_v1_blocklist)

DELETE[/api/v1/blocklist/{id}](https://readarr.com/docs/api/#/Blocklist/delete_api_v1_blocklist__id_)

DELETE[/api/v1/blocklist/bulk](https://readarr.com/docs/api/#/Blocklist/delete_api_v1_blocklist_bulk)

### [Book](https://readarr.com/docs/api/\#/Book)

GET[/api/v1/book](https://readarr.com/docs/api/#/Book/get_api_v1_book)

POST[/api/v1/book](https://readarr.com/docs/api/#/Book/post_api_v1_book)

GET[/api/v1/book/{id}/overview](https://readarr.com/docs/api/#/Book/get_api_v1_book__id__overview)

PUT[/api/v1/book/{id}](https://readarr.com/docs/api/#/Book/put_api_v1_book__id_)

DELETE[/api/v1/book/{id}](https://readarr.com/docs/api/#/Book/delete_api_v1_book__id_)

GET[/api/v1/book/{id}](https://readarr.com/docs/api/#/Book/get_api_v1_book__id_)

PUT[/api/v1/book/monitor](https://readarr.com/docs/api/#/Book/put_api_v1_book_monitor)

### [BookEditor](https://readarr.com/docs/api/\#/BookEditor)

PUT[/api/v1/book/editor](https://readarr.com/docs/api/#/BookEditor/put_api_v1_book_editor)

DELETE[/api/v1/book/editor](https://readarr.com/docs/api/#/BookEditor/delete_api_v1_book_editor)

### [BookFile](https://readarr.com/docs/api/\#/BookFile)

GET[/api/v1/bookfile](https://readarr.com/docs/api/#/BookFile/get_api_v1_bookfile)

PUT[/api/v1/bookfile/{id}](https://readarr.com/docs/api/#/BookFile/put_api_v1_bookfile__id_)

DELETE[/api/v1/bookfile/{id}](https://readarr.com/docs/api/#/BookFile/delete_api_v1_bookfile__id_)

GET[/api/v1/bookfile/{id}](https://readarr.com/docs/api/#/BookFile/get_api_v1_bookfile__id_)

PUT[/api/v1/bookfile/editor](https://readarr.com/docs/api/#/BookFile/put_api_v1_bookfile_editor)

DELETE[/api/v1/bookfile/bulk](https://readarr.com/docs/api/#/BookFile/delete_api_v1_bookfile_bulk)

### [BookLookup](https://readarr.com/docs/api/\#/BookLookup)

GET[/api/v1/book/lookup](https://readarr.com/docs/api/#/BookLookup/get_api_v1_book_lookup)

### [Bookshelf](https://readarr.com/docs/api/\#/Bookshelf)

POST[/api/v1/bookshelf](https://readarr.com/docs/api/#/Bookshelf/post_api_v1_bookshelf)

### [Calendar](https://readarr.com/docs/api/\#/Calendar)

GET[/api/v1/calendar](https://readarr.com/docs/api/#/Calendar/get_api_v1_calendar)

GET[/api/v1/calendar/{id}](https://readarr.com/docs/api/#/Calendar/get_api_v1_calendar__id_)

### [CalendarFeed](https://readarr.com/docs/api/\#/CalendarFeed)

GET[/feed/v1/calendar/readarr.ics](https://readarr.com/docs/api/#/CalendarFeed/get_feed_v1_calendar_readarr_ics)

### [Command](https://readarr.com/docs/api/\#/Command)

POST[/api/v1/command](https://readarr.com/docs/api/#/Command/post_api_v1_command)

GET[/api/v1/command](https://readarr.com/docs/api/#/Command/get_api_v1_command)

DELETE[/api/v1/command/{id}](https://readarr.com/docs/api/#/Command/delete_api_v1_command__id_)

GET[/api/v1/command/{id}](https://readarr.com/docs/api/#/Command/get_api_v1_command__id_)

### [CustomFilter](https://readarr.com/docs/api/\#/CustomFilter)

GET[/api/v1/customfilter](https://readarr.com/docs/api/#/CustomFilter/get_api_v1_customfilter)

POST[/api/v1/customfilter](https://readarr.com/docs/api/#/CustomFilter/post_api_v1_customfilter)

PUT[/api/v1/customfilter/{id}](https://readarr.com/docs/api/#/CustomFilter/put_api_v1_customfilter__id_)

DELETE[/api/v1/customfilter/{id}](https://readarr.com/docs/api/#/CustomFilter/delete_api_v1_customfilter__id_)

GET[/api/v1/customfilter/{id}](https://readarr.com/docs/api/#/CustomFilter/get_api_v1_customfilter__id_)

### [CustomFormat](https://readarr.com/docs/api/\#/CustomFormat)

POST[/api/v1/customformat](https://readarr.com/docs/api/#/CustomFormat/post_api_v1_customformat)

GET[/api/v1/customformat](https://readarr.com/docs/api/#/CustomFormat/get_api_v1_customformat)

PUT[/api/v1/customformat/{id}](https://readarr.com/docs/api/#/CustomFormat/put_api_v1_customformat__id_)

DELETE[/api/v1/customformat/{id}](https://readarr.com/docs/api/#/CustomFormat/delete_api_v1_customformat__id_)

GET[/api/v1/customformat/{id}](https://readarr.com/docs/api/#/CustomFormat/get_api_v1_customformat__id_)

GET[/api/v1/customformat/schema](https://readarr.com/docs/api/#/CustomFormat/get_api_v1_customformat_schema)

### [Cutoff](https://readarr.com/docs/api/\#/Cutoff)

GET[/api/v1/wanted/cutoff](https://readarr.com/docs/api/#/Cutoff/get_api_v1_wanted_cutoff)

GET[/api/v1/wanted/cutoff/{id}](https://readarr.com/docs/api/#/Cutoff/get_api_v1_wanted_cutoff__id_)

### [DelayProfile](https://readarr.com/docs/api/\#/DelayProfile)

POST[/api/v1/delayprofile](https://readarr.com/docs/api/#/DelayProfile/post_api_v1_delayprofile)

GET[/api/v1/delayprofile](https://readarr.com/docs/api/#/DelayProfile/get_api_v1_delayprofile)

DELETE[/api/v1/delayprofile/{id}](https://readarr.com/docs/api/#/DelayProfile/delete_api_v1_delayprofile__id_)

PUT[/api/v1/delayprofile/{id}](https://readarr.com/docs/api/#/DelayProfile/put_api_v1_delayprofile__id_)

GET[/api/v1/delayprofile/{id}](https://readarr.com/docs/api/#/DelayProfile/get_api_v1_delayprofile__id_)

PUT[/api/v1/delayprofile/reorder/{id}](https://readarr.com/docs/api/#/DelayProfile/put_api_v1_delayprofile_reorder__id_)

### [DevelopmentConfig](https://readarr.com/docs/api/\#/DevelopmentConfig)

GET[/api/v1/config/development](https://readarr.com/docs/api/#/DevelopmentConfig/get_api_v1_config_development)

PUT[/api/v1/config/development/{id}](https://readarr.com/docs/api/#/DevelopmentConfig/put_api_v1_config_development__id_)

GET[/api/v1/config/development/{id}](https://readarr.com/docs/api/#/DevelopmentConfig/get_api_v1_config_development__id_)

### [DiskSpace](https://readarr.com/docs/api/\#/DiskSpace)

GET[/api/v1/diskspace](https://readarr.com/docs/api/#/DiskSpace/get_api_v1_diskspace)

### [DownloadClient](https://readarr.com/docs/api/\#/DownloadClient)

GET[/api/v1/downloadclient](https://readarr.com/docs/api/#/DownloadClient/get_api_v1_downloadclient)

POST[/api/v1/downloadclient](https://readarr.com/docs/api/#/DownloadClient/post_api_v1_downloadclient)

PUT[/api/v1/downloadclient/{id}](https://readarr.com/docs/api/#/DownloadClient/put_api_v1_downloadclient__id_)

DELETE[/api/v1/downloadclient/{id}](https://readarr.com/docs/api/#/DownloadClient/delete_api_v1_downloadclient__id_)

GET[/api/v1/downloadclient/{id}](https://readarr.com/docs/api/#/DownloadClient/get_api_v1_downloadclient__id_)

PUT[/api/v1/downloadclient/bulk](https://readarr.com/docs/api/#/DownloadClient/put_api_v1_downloadclient_bulk)

DELETE[/api/v1/downloadclient/bulk](https://readarr.com/docs/api/#/DownloadClient/delete_api_v1_downloadclient_bulk)

GET[/api/v1/downloadclient/schema](https://readarr.com/docs/api/#/DownloadClient/get_api_v1_downloadclient_schema)

POST[/api/v1/downloadclient/test](https://readarr.com/docs/api/#/DownloadClient/post_api_v1_downloadclient_test)

POST[/api/v1/downloadclient/testall](https://readarr.com/docs/api/#/DownloadClient/post_api_v1_downloadclient_testall)

POST[/api/v1/downloadclient/action/{name}](https://readarr.com/docs/api/#/DownloadClient/post_api_v1_downloadclient_action__name_)

### [DownloadClientConfig](https://readarr.com/docs/api/\#/DownloadClientConfig)

GET[/api/v1/config/downloadclient](https://readarr.com/docs/api/#/DownloadClientConfig/get_api_v1_config_downloadclient)

PUT[/api/v1/config/downloadclient/{id}](https://readarr.com/docs/api/#/DownloadClientConfig/put_api_v1_config_downloadclient__id_)

GET[/api/v1/config/downloadclient/{id}](https://readarr.com/docs/api/#/DownloadClientConfig/get_api_v1_config_downloadclient__id_)

### [Edition](https://readarr.com/docs/api/\#/Edition)

GET[/api/v1/edition](https://readarr.com/docs/api/#/Edition/get_api_v1_edition)

### [FileSystem](https://readarr.com/docs/api/\#/FileSystem)

GET[/api/v1/filesystem](https://readarr.com/docs/api/#/FileSystem/get_api_v1_filesystem)

GET[/api/v1/filesystem/type](https://readarr.com/docs/api/#/FileSystem/get_api_v1_filesystem_type)

GET[/api/v1/filesystem/mediafiles](https://readarr.com/docs/api/#/FileSystem/get_api_v1_filesystem_mediafiles)

### [Health](https://readarr.com/docs/api/\#/Health)

GET[/api/v1/health](https://readarr.com/docs/api/#/Health/get_api_v1_health)

### [History](https://readarr.com/docs/api/\#/History)

GET[/api/v1/history](https://readarr.com/docs/api/#/History/get_api_v1_history)

GET[/api/v1/history/since](https://readarr.com/docs/api/#/History/get_api_v1_history_since)

GET[/api/v1/history/author](https://readarr.com/docs/api/#/History/get_api_v1_history_author)

POST[/api/v1/history/failed/{id}](https://readarr.com/docs/api/#/History/post_api_v1_history_failed__id_)

### [HostConfig](https://readarr.com/docs/api/\#/HostConfig)

GET[/api/v1/config/host](https://readarr.com/docs/api/#/HostConfig/get_api_v1_config_host)

PUT[/api/v1/config/host/{id}](https://readarr.com/docs/api/#/HostConfig/put_api_v1_config_host__id_)

GET[/api/v1/config/host/{id}](https://readarr.com/docs/api/#/HostConfig/get_api_v1_config_host__id_)

### [ImportList](https://readarr.com/docs/api/\#/ImportList)

GET[/api/v1/importlist](https://readarr.com/docs/api/#/ImportList/get_api_v1_importlist)

POST[/api/v1/importlist](https://readarr.com/docs/api/#/ImportList/post_api_v1_importlist)

PUT[/api/v1/importlist/{id}](https://readarr.com/docs/api/#/ImportList/put_api_v1_importlist__id_)

DELETE[/api/v1/importlist/{id}](https://readarr.com/docs/api/#/ImportList/delete_api_v1_importlist__id_)

GET[/api/v1/importlist/{id}](https://readarr.com/docs/api/#/ImportList/get_api_v1_importlist__id_)

PUT[/api/v1/importlist/bulk](https://readarr.com/docs/api/#/ImportList/put_api_v1_importlist_bulk)

DELETE[/api/v1/importlist/bulk](https://readarr.com/docs/api/#/ImportList/delete_api_v1_importlist_bulk)

GET[/api/v1/importlist/schema](https://readarr.com/docs/api/#/ImportList/get_api_v1_importlist_schema)

POST[/api/v1/importlist/test](https://readarr.com/docs/api/#/ImportList/post_api_v1_importlist_test)

POST[/api/v1/importlist/testall](https://readarr.com/docs/api/#/ImportList/post_api_v1_importlist_testall)

POST[/api/v1/importlist/action/{name}](https://readarr.com/docs/api/#/ImportList/post_api_v1_importlist_action__name_)

### [ImportListExclusion](https://readarr.com/docs/api/\#/ImportListExclusion)

GET[/api/v1/importlistexclusion](https://readarr.com/docs/api/#/ImportListExclusion/get_api_v1_importlistexclusion)

POST[/api/v1/importlistexclusion](https://readarr.com/docs/api/#/ImportListExclusion/post_api_v1_importlistexclusion)

PUT[/api/v1/importlistexclusion/{id}](https://readarr.com/docs/api/#/ImportListExclusion/put_api_v1_importlistexclusion__id_)

DELETE[/api/v1/importlistexclusion/{id}](https://readarr.com/docs/api/#/ImportListExclusion/delete_api_v1_importlistexclusion__id_)

GET[/api/v1/importlistexclusion/{id}](https://readarr.com/docs/api/#/ImportListExclusion/get_api_v1_importlistexclusion__id_)

### [Indexer](https://readarr.com/docs/api/\#/Indexer)

GET[/api/v1/indexer](https://readarr.com/docs/api/#/Indexer/get_api_v1_indexer)

POST[/api/v1/indexer](https://readarr.com/docs/api/#/Indexer/post_api_v1_indexer)

PUT[/api/v1/indexer/{id}](https://readarr.com/docs/api/#/Indexer/put_api_v1_indexer__id_)

DELETE[/api/v1/indexer/{id}](https://readarr.com/docs/api/#/Indexer/delete_api_v1_indexer__id_)

GET[/api/v1/indexer/{id}](https://readarr.com/docs/api/#/Indexer/get_api_v1_indexer__id_)

PUT[/api/v1/indexer/bulk](https://readarr.com/docs/api/#/Indexer/put_api_v1_indexer_bulk)

DELETE[/api/v1/indexer/bulk](https://readarr.com/docs/api/#/Indexer/delete_api_v1_indexer_bulk)

GET[/api/v1/indexer/schema](https://readarr.com/docs/api/#/Indexer/get_api_v1_indexer_schema)

POST[/api/v1/indexer/test](https://readarr.com/docs/api/#/Indexer/post_api_v1_indexer_test)

POST[/api/v1/indexer/testall](https://readarr.com/docs/api/#/Indexer/post_api_v1_indexer_testall)

POST[/api/v1/indexer/action/{name}](https://readarr.com/docs/api/#/Indexer/post_api_v1_indexer_action__name_)

### [IndexerConfig](https://readarr.com/docs/api/\#/IndexerConfig)

GET[/api/v1/config/indexer](https://readarr.com/docs/api/#/IndexerConfig/get_api_v1_config_indexer)

PUT[/api/v1/config/indexer/{id}](https://readarr.com/docs/api/#/IndexerConfig/put_api_v1_config_indexer__id_)

GET[/api/v1/config/indexer/{id}](https://readarr.com/docs/api/#/IndexerConfig/get_api_v1_config_indexer__id_)

### [IndexerFlag](https://readarr.com/docs/api/\#/IndexerFlag)

GET[/api/v1/indexerflag](https://readarr.com/docs/api/#/IndexerFlag/get_api_v1_indexerflag)

### [Language](https://readarr.com/docs/api/\#/Language)

GET[/api/v1/language](https://readarr.com/docs/api/#/Language/get_api_v1_language)

GET[/api/v1/language/{id}](https://readarr.com/docs/api/#/Language/get_api_v1_language__id_)

### [Localization](https://readarr.com/docs/api/\#/Localization)

GET[/api/v1/localization](https://readarr.com/docs/api/#/Localization/get_api_v1_localization)

### [Log](https://readarr.com/docs/api/\#/Log)

GET[/api/v1/log](https://readarr.com/docs/api/#/Log/get_api_v1_log)

### [LogFile](https://readarr.com/docs/api/\#/LogFile)

GET[/api/v1/log/file](https://readarr.com/docs/api/#/LogFile/get_api_v1_log_file)

GET[/api/v1/log/file/{filename}](https://readarr.com/docs/api/#/LogFile/get_api_v1_log_file__filename_)

### [ManualImport](https://readarr.com/docs/api/\#/ManualImport)

POST[/api/v1/manualimport](https://readarr.com/docs/api/#/ManualImport/post_api_v1_manualimport)

GET[/api/v1/manualimport](https://readarr.com/docs/api/#/ManualImport/get_api_v1_manualimport)

### [MediaCover](https://readarr.com/docs/api/\#/MediaCover)

GET[/api/v1/mediacover/author/{authorId}/{filename}](https://readarr.com/docs/api/#/MediaCover/get_api_v1_mediacover_author__authorId___filename_)

GET[/api/v1/mediacover/book/{bookId}/{filename}](https://readarr.com/docs/api/#/MediaCover/get_api_v1_mediacover_book__bookId___filename_)

### [MediaManagementConfig](https://readarr.com/docs/api/\#/MediaManagementConfig)

GET[/api/v1/config/mediamanagement](https://readarr.com/docs/api/#/MediaManagementConfig/get_api_v1_config_mediamanagement)

PUT[/api/v1/config/mediamanagement/{id}](https://readarr.com/docs/api/#/MediaManagementConfig/put_api_v1_config_mediamanagement__id_)

GET[/api/v1/config/mediamanagement/{id}](https://readarr.com/docs/api/#/MediaManagementConfig/get_api_v1_config_mediamanagement__id_)

### [Metadata](https://readarr.com/docs/api/\#/Metadata)

GET[/api/v1/metadata](https://readarr.com/docs/api/#/Metadata/get_api_v1_metadata)

POST[/api/v1/metadata](https://readarr.com/docs/api/#/Metadata/post_api_v1_metadata)

PUT[/api/v1/metadata/{id}](https://readarr.com/docs/api/#/Metadata/put_api_v1_metadata__id_)

DELETE[/api/v1/metadata/{id}](https://readarr.com/docs/api/#/Metadata/delete_api_v1_metadata__id_)

GET[/api/v1/metadata/{id}](https://readarr.com/docs/api/#/Metadata/get_api_v1_metadata__id_)

GET[/api/v1/metadata/schema](https://readarr.com/docs/api/#/Metadata/get_api_v1_metadata_schema)

POST[/api/v1/metadata/test](https://readarr.com/docs/api/#/Metadata/post_api_v1_metadata_test)

POST[/api/v1/metadata/testall](https://readarr.com/docs/api/#/Metadata/post_api_v1_metadata_testall)

POST[/api/v1/metadata/action/{name}](https://readarr.com/docs/api/#/Metadata/post_api_v1_metadata_action__name_)

### [MetadataProfile](https://readarr.com/docs/api/\#/MetadataProfile)

POST[/api/v1/metadataprofile](https://readarr.com/docs/api/#/MetadataProfile/post_api_v1_metadataprofile)

GET[/api/v1/metadataprofile](https://readarr.com/docs/api/#/MetadataProfile/get_api_v1_metadataprofile)

DELETE[/api/v1/metadataprofile/{id}](https://readarr.com/docs/api/#/MetadataProfile/delete_api_v1_metadataprofile__id_)

PUT[/api/v1/metadataprofile/{id}](https://readarr.com/docs/api/#/MetadataProfile/put_api_v1_metadataprofile__id_)

GET[/api/v1/metadataprofile/{id}](https://readarr.com/docs/api/#/MetadataProfile/get_api_v1_metadataprofile__id_)

### [MetadataProfileSchema](https://readarr.com/docs/api/\#/MetadataProfileSchema)

GET[/api/v1/metadataprofile/schema](https://readarr.com/docs/api/#/MetadataProfileSchema/get_api_v1_metadataprofile_schema)

### [MetadataProviderConfig](https://readarr.com/docs/api/\#/MetadataProviderConfig)

GET[/api/v1/config/metadataprovider](https://readarr.com/docs/api/#/MetadataProviderConfig/get_api_v1_config_metadataprovider)

PUT[/api/v1/config/metadataprovider/{id}](https://readarr.com/docs/api/#/MetadataProviderConfig/put_api_v1_config_metadataprovider__id_)

GET[/api/v1/config/metadataprovider/{id}](https://readarr.com/docs/api/#/MetadataProviderConfig/get_api_v1_config_metadataprovider__id_)

### [Missing](https://readarr.com/docs/api/\#/Missing)

GET[/api/v1/wanted/missing](https://readarr.com/docs/api/#/Missing/get_api_v1_wanted_missing)

GET[/api/v1/wanted/missing/{id}](https://readarr.com/docs/api/#/Missing/get_api_v1_wanted_missing__id_)

### [NamingConfig](https://readarr.com/docs/api/\#/NamingConfig)

GET[/api/v1/config/naming](https://readarr.com/docs/api/#/NamingConfig/get_api_v1_config_naming)

PUT[/api/v1/config/naming/{id}](https://readarr.com/docs/api/#/NamingConfig/put_api_v1_config_naming__id_)

GET[/api/v1/config/naming/{id}](https://readarr.com/docs/api/#/NamingConfig/get_api_v1_config_naming__id_)

GET[/api/v1/config/naming/examples](https://readarr.com/docs/api/#/NamingConfig/get_api_v1_config_naming_examples)

### [Notification](https://readarr.com/docs/api/\#/Notification)

GET[/api/v1/notification](https://readarr.com/docs/api/#/Notification/get_api_v1_notification)

POST[/api/v1/notification](https://readarr.com/docs/api/#/Notification/post_api_v1_notification)

PUT[/api/v1/notification/{id}](https://readarr.com/docs/api/#/Notification/put_api_v1_notification__id_)

DELETE[/api/v1/notification/{id}](https://readarr.com/docs/api/#/Notification/delete_api_v1_notification__id_)

GET[/api/v1/notification/{id}](https://readarr.com/docs/api/#/Notification/get_api_v1_notification__id_)

GET[/api/v1/notification/schema](https://readarr.com/docs/api/#/Notification/get_api_v1_notification_schema)

POST[/api/v1/notification/test](https://readarr.com/docs/api/#/Notification/post_api_v1_notification_test)

POST[/api/v1/notification/testall](https://readarr.com/docs/api/#/Notification/post_api_v1_notification_testall)

POST[/api/v1/notification/action/{name}](https://readarr.com/docs/api/#/Notification/post_api_v1_notification_action__name_)

### [Parse](https://readarr.com/docs/api/\#/Parse)

GET[/api/v1/parse](https://readarr.com/docs/api/#/Parse/get_api_v1_parse)

### [Ping](https://readarr.com/docs/api/\#/Ping)

GET[/ping](https://readarr.com/docs/api/#/Ping/get_ping)

HEAD[/ping](https://readarr.com/docs/api/#/Ping/head_ping)

### [QualityDefinition](https://readarr.com/docs/api/\#/QualityDefinition)

PUT[/api/v1/qualitydefinition/{id}](https://readarr.com/docs/api/#/QualityDefinition/put_api_v1_qualitydefinition__id_)

GET[/api/v1/qualitydefinition/{id}](https://readarr.com/docs/api/#/QualityDefinition/get_api_v1_qualitydefinition__id_)

GET[/api/v1/qualitydefinition](https://readarr.com/docs/api/#/QualityDefinition/get_api_v1_qualitydefinition)

PUT[/api/v1/qualitydefinition/update](https://readarr.com/docs/api/#/QualityDefinition/put_api_v1_qualitydefinition_update)

### [QualityProfile](https://readarr.com/docs/api/\#/QualityProfile)

POST[/api/v1/qualityprofile](https://readarr.com/docs/api/#/QualityProfile/post_api_v1_qualityprofile)

GET[/api/v1/qualityprofile](https://readarr.com/docs/api/#/QualityProfile/get_api_v1_qualityprofile)

DELETE[/api/v1/qualityprofile/{id}](https://readarr.com/docs/api/#/QualityProfile/delete_api_v1_qualityprofile__id_)

PUT[/api/v1/qualityprofile/{id}](https://readarr.com/docs/api/#/QualityProfile/put_api_v1_qualityprofile__id_)

GET[/api/v1/qualityprofile/{id}](https://readarr.com/docs/api/#/QualityProfile/get_api_v1_qualityprofile__id_)

### [QualityProfileSchema](https://readarr.com/docs/api/\#/QualityProfileSchema)

GET[/api/v1/qualityprofile/schema](https://readarr.com/docs/api/#/QualityProfileSchema/get_api_v1_qualityprofile_schema)

### [Queue](https://readarr.com/docs/api/\#/Queue)

DELETE[/api/v1/queue/{id}](https://readarr.com/docs/api/#/Queue/delete_api_v1_queue__id_)

DELETE[/api/v1/queue/bulk](https://readarr.com/docs/api/#/Queue/delete_api_v1_queue_bulk)

GET[/api/v1/queue](https://readarr.com/docs/api/#/Queue/get_api_v1_queue)

### [QueueAction](https://readarr.com/docs/api/\#/QueueAction)

POST[/api/v1/queue/grab/{id}](https://readarr.com/docs/api/#/QueueAction/post_api_v1_queue_grab__id_)

POST[/api/v1/queue/grab/bulk](https://readarr.com/docs/api/#/QueueAction/post_api_v1_queue_grab_bulk)

### [QueueDetails](https://readarr.com/docs/api/\#/QueueDetails)

GET[/api/v1/queue/details](https://readarr.com/docs/api/#/QueueDetails/get_api_v1_queue_details)

### [QueueStatus](https://readarr.com/docs/api/\#/QueueStatus)

GET[/api/v1/queue/status](https://readarr.com/docs/api/#/QueueStatus/get_api_v1_queue_status)

### [Release](https://readarr.com/docs/api/\#/Release)

POST[/api/v1/release](https://readarr.com/docs/api/#/Release/post_api_v1_release)

GET[/api/v1/release](https://readarr.com/docs/api/#/Release/get_api_v1_release)

### [ReleaseProfile](https://readarr.com/docs/api/\#/ReleaseProfile)

GET[/api/v1/releaseprofile](https://readarr.com/docs/api/#/ReleaseProfile/get_api_v1_releaseprofile)

POST[/api/v1/releaseprofile](https://readarr.com/docs/api/#/ReleaseProfile/post_api_v1_releaseprofile)

PUT[/api/v1/releaseprofile/{id}](https://readarr.com/docs/api/#/ReleaseProfile/put_api_v1_releaseprofile__id_)

DELETE[/api/v1/releaseprofile/{id}](https://readarr.com/docs/api/#/ReleaseProfile/delete_api_v1_releaseprofile__id_)

GET[/api/v1/releaseprofile/{id}](https://readarr.com/docs/api/#/ReleaseProfile/get_api_v1_releaseprofile__id_)

### [ReleasePush](https://readarr.com/docs/api/\#/ReleasePush)

POST[/api/v1/release/push](https://readarr.com/docs/api/#/ReleasePush/post_api_v1_release_push)

### [RemotePathMapping](https://readarr.com/docs/api/\#/RemotePathMapping)

POST[/api/v1/remotepathmapping](https://readarr.com/docs/api/#/RemotePathMapping/post_api_v1_remotepathmapping)

GET[/api/v1/remotepathmapping](https://readarr.com/docs/api/#/RemotePathMapping/get_api_v1_remotepathmapping)

DELETE[/api/v1/remotepathmapping/{id}](https://readarr.com/docs/api/#/RemotePathMapping/delete_api_v1_remotepathmapping__id_)

PUT[/api/v1/remotepathmapping/{id}](https://readarr.com/docs/api/#/RemotePathMapping/put_api_v1_remotepathmapping__id_)

GET[/api/v1/remotepathmapping/{id}](https://readarr.com/docs/api/#/RemotePathMapping/get_api_v1_remotepathmapping__id_)

### [RenameBook](https://readarr.com/docs/api/\#/RenameBook)

GET[/api/v1/rename](https://readarr.com/docs/api/#/RenameBook/get_api_v1_rename)

### [RetagBook](https://readarr.com/docs/api/\#/RetagBook)

GET[/api/v1/retag](https://readarr.com/docs/api/#/RetagBook/get_api_v1_retag)

### [RootFolder](https://readarr.com/docs/api/\#/RootFolder)

POST[/api/v1/rootfolder](https://readarr.com/docs/api/#/RootFolder/post_api_v1_rootfolder)

GET[/api/v1/rootfolder](https://readarr.com/docs/api/#/RootFolder/get_api_v1_rootfolder)

PUT[/api/v1/rootfolder/{id}](https://readarr.com/docs/api/#/RootFolder/put_api_v1_rootfolder__id_)

DELETE[/api/v1/rootfolder/{id}](https://readarr.com/docs/api/#/RootFolder/delete_api_v1_rootfolder__id_)

GET[/api/v1/rootfolder/{id}](https://readarr.com/docs/api/#/RootFolder/get_api_v1_rootfolder__id_)

### [Search](https://readarr.com/docs/api/\#/Search)

GET[/api/v1/search](https://readarr.com/docs/api/#/Search/get_api_v1_search)

### [Series](https://readarr.com/docs/api/\#/Series)

GET[/api/v1/series](https://readarr.com/docs/api/#/Series/get_api_v1_series)

### [System](https://readarr.com/docs/api/\#/System)

GET[/api/v1/system/status](https://readarr.com/docs/api/#/System/get_api_v1_system_status)

GET[/api/v1/system/routes](https://readarr.com/docs/api/#/System/get_api_v1_system_routes)

GET[/api/v1/system/routes/duplicate](https://readarr.com/docs/api/#/System/get_api_v1_system_routes_duplicate)

POST[/api/v1/system/shutdown](https://readarr.com/docs/api/#/System/post_api_v1_system_shutdown)

POST[/api/v1/system/restart](https://readarr.com/docs/api/#/System/post_api_v1_system_restart)

### [Tag](https://readarr.com/docs/api/\#/Tag)

GET[/api/v1/tag](https://readarr.com/docs/api/#/Tag/get_api_v1_tag)

POST[/api/v1/tag](https://readarr.com/docs/api/#/Tag/post_api_v1_tag)

PUT[/api/v1/tag/{id}](https://readarr.com/docs/api/#/Tag/put_api_v1_tag__id_)

DELETE[/api/v1/tag/{id}](https://readarr.com/docs/api/#/Tag/delete_api_v1_tag__id_)

GET[/api/v1/tag/{id}](https://readarr.com/docs/api/#/Tag/get_api_v1_tag__id_)

### [TagDetails](https://readarr.com/docs/api/\#/TagDetails)

GET[/api/v1/tag/detail](https://readarr.com/docs/api/#/TagDetails/get_api_v1_tag_detail)

GET[/api/v1/tag/detail/{id}](https://readarr.com/docs/api/#/TagDetails/get_api_v1_tag_detail__id_)

### [Task](https://readarr.com/docs/api/\#/Task)

GET[/api/v1/system/task](https://readarr.com/docs/api/#/Task/get_api_v1_system_task)

GET[/api/v1/system/task/{id}](https://readarr.com/docs/api/#/Task/get_api_v1_system_task__id_)

### [UiConfig](https://readarr.com/docs/api/\#/UiConfig)

PUT[/api/v1/config/ui/{id}](https://readarr.com/docs/api/#/UiConfig/put_api_v1_config_ui__id_)

GET[/api/v1/config/ui/{id}](https://readarr.com/docs/api/#/UiConfig/get_api_v1_config_ui__id_)

GET[/api/v1/config/ui](https://readarr.com/docs/api/#/UiConfig/get_api_v1_config_ui)

### [Update](https://readarr.com/docs/api/\#/Update)

GET[/api/v1/update](https://readarr.com/docs/api/#/Update/get_api_v1_update)

### [UpdateLogFile](https://readarr.com/docs/api/\#/UpdateLogFile)

GET[/api/v1/log/file/update](https://readarr.com/docs/api/#/UpdateLogFile/get_api_v1_log_file_update)

GET[/api/v1/log/file/update/{filename}](https://readarr.com/docs/api/#/UpdateLogFile/get_api_v1_log_file_update__filename_)

#### Schemas

AddAuthorOptions

AddBookOptions

AllowFingerprinting

ApiInfoResource

ApplyTags

AuthenticationRequiredType

AuthenticationType

Author

AuthorEditorResource

AuthorLazyLoaded

AuthorMetadata

AuthorMetadataLazyLoaded

AuthorResource

AuthorStatisticsResource

AuthorStatusType

AuthorTitleInfo

BackupResource

BackupType

BlocklistBulkResource

BlocklistResource

BlocklistResourcePagingResource

Book

BookAddType

BookEditorResource

BookFile

BookFileListLazyLoaded

BookFileListResource

BookFileResource

BookLazyLoaded

BookListLazyLoaded

BookResource

BookResourcePagingResource

BookStatisticsResource

BooksMonitoredResource

BookshelfAuthorResource

BookshelfResource

CertificateValidationType

Command

CommandPriority

CommandResource

CommandResult

CommandStatus

CommandTrigger

CustomFilterResource

CustomFormat

CustomFormatResource

CustomFormatSpecificationSchema

DatabaseType

DelayProfileResource

DevelopmentConfigResource

DiskSpaceResource

DownloadClientBulkResource

DownloadClientConfigResource

DownloadClientResource

DownloadProtocol

Edition

EditionLazyLoaded

EditionListLazyLoaded

EditionResource

EntityHistoryEventType

Field

FileDateType

HealthCheckResult

HealthResource

HistoryResource

HistoryResourcePagingResource

HostConfigResource

ICustomFormatSpecification

ImportListBulkResource

ImportListExclusionResource

ImportListMonitorType

ImportListResource

ImportListType

IndexerBulkResource

IndexerConfigResource

IndexerFlagResource

IndexerFlags

IndexerResource

IsoCountry

LanguageResource

Links

LogFileResource

LogResource

LogResourcePagingResource

ManualImportResource

ManualImportUpdateResource

MediaCover

MediaCoverTypes

MediaInfoModel

MediaInfoResource

MediaManagementConfigResource

MetadataProfile

MetadataProfileLazyLoaded

MetadataProfileResource

MetadataProviderConfigResource

MetadataResource

MonitorTypes

MonitoringOptions

NamingConfigResource

NewItemMonitorTypes

NotificationResource

ParseResource

ParsedBookInfo

ParsedTrackInfo

PingResource

ProfileFormatItem

ProfileFormatItemResource

ProperDownloadTypes

ProviderMessage

ProviderMessageType

ProxyType

Quality

QualityDefinitionResource

QualityModel

QualityProfile

QualityProfileLazyLoaded

QualityProfileQualityItem

QualityProfileQualityItemResource

QualityProfileResource

QueueBulkResource

QueueResource

QueueResourcePagingResource

QueueStatusResource

Ratings

Rejection

RejectionType

ReleaseProfileResource

ReleaseResource

RemotePathMappingResource

RenameBookResource

RescanAfterRefreshType

RetagBookResource

Revision

RootFolderResource

RuntimeMode

SelectOption

Series

SeriesBookLink

SeriesBookLinkListLazyLoaded

SeriesBookLinkResource

SeriesLazyLoaded

SeriesListLazyLoaded

SeriesResource

SortDirection

SystemResource

TagDetailsResource

TagDifference

TagResource

TaskResource

TrackedDownloadState

TrackedDownloadStatus

TrackedDownloadStatusMessage

UiConfigResource

UpdateChanges

UpdateMechanism

UpdateResource

WriteAudioTagsType

WriteBookTagsType