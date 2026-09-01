[Skip to content](https://github.com/tubearchivist/tubearchivist/releases/tag/v0.5.0#start-of-content)

You signed in with another tab or window. [Reload](https://github.com/tubearchivist/tubearchivist/releases/tag/v0.5.0) to refresh your session.You signed out in another tab or window. [Reload](https://github.com/tubearchivist/tubearchivist/releases/tag/v0.5.0) to refresh your session.You switched accounts on another tab or window. [Reload](https://github.com/tubearchivist/tubearchivist/releases/tag/v0.5.0) to refresh your session.Dismiss alert

{{ message }}

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/tubearchivist/tubearchivist/releases/tag/v0.5.0).

[tubearchivist](https://github.com/tubearchivist)/ **[tubearchivist](https://github.com/tubearchivist/tubearchivist)** Public

- Sponsor







# Sponsor tubearchivist/tubearchivist























##### GitHub Sponsors

[Learn more about Sponsors](https://github.com/sponsors)







[![@bbilly1](https://avatars.githubusercontent.com/u/35427372?s=80&v=4)](https://github.com/bbilly1)



[bbilly1](https://github.com/bbilly1)



[bbilly1](https://github.com/bbilly1)



[Sponsor](https://github.com/sponsors/bbilly1)









##### External links





![ko_fi](https://github.githubassets.com/assets/ko_fi-53a60c17e75c.svg)



[ko-fi.com/ **bbilly1**](https://ko-fi.com/bbilly1)











[https://paypal.me/bbilly1](https://paypal.me/bbilly1)









[Learn more about funding links in repositories](https://docs.github.com/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/displaying-a-sponsor-button-in-your-repository).




[Report abuse](https://github.com/contact/report-abuse?report=tubearchivist%2Ftubearchivist+%28Repository+Funding+Links%29)

- [Notifications](https://github.com/login?return_to=%2Ftubearchivist%2Ftubearchivist) You must be signed in to change notification settings
- [Fork\\
424](https://github.com/login?return_to=%2Ftubearchivist%2Ftubearchivist)
- [Star\\
8.4k](https://github.com/login?return_to=%2Ftubearchivist%2Ftubearchivist)


# v0.5.0

Compare

# Choose a tag to compare

## Sorry, something went wrong.

Filter

Loading

## Sorry, something went wrong.

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/tubearchivist/tubearchivist/releases/tag/v0.5.0).

## No results found

[View all tags](https://github.com/tubearchivist/tubearchivist/tags)

![@bbilly1](https://avatars.githubusercontent.com/u/35427372?s=40&v=4)[bbilly1](https://github.com/bbilly1)

released this

Mar 9, 2025
09 Mar 14:46


·
[480 commits](https://github.com/tubearchivist/tubearchivist/compare/v0.5.0...master)
to master
since this release


[v0.5.0](https://github.com/tubearchivist/tubearchivist/tree/v0.5.0)

[`ac7ce2c`](https://github.com/tubearchivist/tubearchivist/commit/ac7ce2ce3c169276b5fd6416da943f75d60a5db0)

This commit was signed with the committer’s **verified signature**.
The key has expired.


[![](https://avatars.githubusercontent.com/u/35427372?s=64&v=4)](https://github.com/bbilly1)[bbilly1](https://github.com/bbilly1)
Simon


GPG key ID: 2C15AA5E89985DD4

Expired

Verified
on Mar 9, 2025, 10:39 AM

[Learn about vigilant mode](https://docs.github.com/github/authenticating-to-github/displaying-verification-statuses-for-all-of-your-commits).


## Project Updates, Breaking changes

- There are several breaking changes, read this carefully _before_ updating.

  - If you accidentally updated _without_ reading this, you can revert the image to `bbilly1/tubearchivist:v0.4.13`
- This ship’s the new React based frontend. Big shout out to [@MerlinScheurer](https://github.com/MerlinScheurer) for taking on the bulk of the work.
- Additionally this ships a major refactor of the backend code organization.
- Also shoutout to [@kralverde](https://github.com/kralverde) for helping in the backend refactor.
- This is the first iteration there might be bugs.
- The compose file is also updated, see all changes [here](https://github.com/tubearchivist/tubearchivist/commit/680279f6a2823470b3ed4ce903fc87ffdddcdf7f).

## Migration Guide

### Local db.sqlite3

Due to the backend refactor, there were changes introduced that made persiting your user accounts and schedules unfeasible. Fear not, there is a convenient migration script for export and import.

1. On [TA v0.4.13](https://github.com/tubearchivist/tubearchivist/releases/tag/v0.4.13) backup your configuration by executing `python manage.py ta_config_backup`, e.g. `docker compose exec -it tubearchivist python manage.py ta_config_backup` this will create a migration file at `/cache/backup/migration.json`.

2. Double check that file, you should see your user(s), API token and your schedules.

3. Then stop all containers

4. Delete the db file from `/cache/db.sqlite3`

5. Pull the new TA image and let the initial setup complete, wait until you can reach the login page
   - You might have to set `REDIS_CON` here already, see bellow.
   - EDIT: If you received the update message in the TA interface, that will be in the old Redis format. You'll see an error like `WRONGTYPE Operation against a key holding the wrong kind of value` when TA is trying to access that. You can clear the faulty key and your migration should continue. See [here](https://github.com/tubearchivist/tubearchivist/issues/883#issuecomment-2708978715).
6. Then restore the backup by executing `python manage.py ta_config_restore`, e.g. `docker compose exec -it tubearchivist python manage.py ta_config_restore`. This will restore your configurations from backup.

7. Login with your usual username/password and double check your API key and schedule config.

8. Delete `/cache/backup/migration.json` to avoid confusion.


Migrating the db.sqlite3 configuration is not strictly necessary. You can also just delete the file, and let it recreate at startup. You'll have to reconfigure:

- Any changes you made on your user like name/password
- The API key will have changed, you'll need to update that in e.g. the browser extension
- All schedules will be reset to default, you'll have to reconfigure them through the interface.

### Redis

The configuration to connect TA with redis has changed. There is now a single environment variable called `REDIS_CON` to tell TA where to reach redis. If you are using the defaults, set this to `redis://archivist-redis:6379`. This allows for more flexibility to connect to a wide range of Redis configurations.

Additionally this project no longer depends on RedisJSON, but just on plain Redis. There is a migration step that runs at first start, you'll see `✓ migrated appconfig to ES` confirming the migration. If there is nothing to migrate you'll see no `config values to migrate` meaning it's save to switch:

1. Stop all containers
2. From the Redis volume delete the `dump.rdb` file
3. Change the image from `redis/redis-stack-server` to just default `redis`.


Note:

- you **don't have** to change the redis image, you could use the stack image or any compatible alternative, but you **have** to reset the `dump.rdb` file.
- this will not migrate your cookie. If you have set that, you'll have to import that again.
- this will not migrate any videos in "Continue watching", these positions will be lost.

### TA\_HOST protocol

If you are accessing TA behind a SSL reverse proxy, specifying the protocol is now required for the `TA_HOST` environment variable, e.g. `https://`. For the sake of consistency, also specify the protocol if you access TA without SSL, e.g. `http://`.

And if you are using a port in the url to access TA, you can try to add the `port` to the `TA_HOST`.

Example: `TA_HOST=http://tubearchivist.local:8000`

### Backend port overwrite

If you previously used TA\_UWSGI\_PORT to modify the backend port, use the better named variable: TA\_BACKEND\_PORT.

### Cast and Static Auth

Previously the Cast intecration was enabled with the env var `ENABLE_CAST`. You can now configure that in the integrations section on the config page.

There is an additional environment variable called `DISABLE_STATIC_AUTH`, that disables authentication on static files, required for Cast to work.

### Appsettings

This is the last step for moving the redis config to ES. At startup the appsettings will get migrated from Redis to ES. That should be seamless, but depending on what values you might have set, this can create data types conflicts. At first startup, You'll see a message like:

- `document_parsing_exception` and `failed to parse field [...] of type [...] in document with id 'appsettings'`
- If you encounter that, you'll need to reset the appsettings index. From within the ES container run:

```
curl -XDELETE -u elastic:$ELASTIC_PASSWORD "localhost:9200/ta_config?pretty"
```

Then restart TA. A new blank config index will get created. You'll have to enter your config values again from the settings page.

## Added

- Added additional sleep statements, by @ Styloy
- Added PO Token for yt-dlp
- Added user config toggle to show/hide help text

## Changed

- Backend is now served with uvicorn, a slim and convenient asgi capable web server.
- Redis connection is now configured with the `REDIS_CON` environment variable for better flexibility.
- Sleep interval is not automatically randomized to +/-50% from the value set.
- There are additional sleep statements set to avoid hitting rate limits.
- The App settings page got a bit rewrite, config fields are now handled individually and not in a form.
- Similar to the channel config overwrites.
- This no longer depends on the redisJSON part of `redis-server-stack` but on just default `redis`. Simplifying things and making things less error prone for updates upstream.
- All incoming and outgoing API data and parameters are now serialized and validated.

## Fixed

- Fixed live URL parsing, by @ FunkeCoder23, [#805](https://github.com/tubearchivist/tubearchivist/issues/805)
- Fixed failing channel metadata extracting with faulty fallback implementation, [#795](https://github.com/tubearchivist/tubearchivist/issues/795)

## Dev setup

- The application can now easily be run outside of the container for development. See [CONTRIBUTING.md](https://github.com/tubearchivist/tubearchivist/blob/master/CONTRIBUTING.md) for more details.
- Linting is now done with `pre-commit` for better reproducible results over various systems and CI/CD.

## Docs

- All environment variables are now documented on a dedicated page [link](https://docs.tubearchivist.com/installation/env-vars/). As these apply for all installation instructions, we can avoid duplication.
- The API docs are now generated with Swagger, they are accessible on your TA instance directly at `/api/docs/`.
- Adding the swagger docs publically on the docs site, is pending...

## API Changes

Only applicable if you made any API integrations. This is a list of changes to API endpoints.

On a general note:

- All data, queries and return statements are now serialized
- The swagger docs are accessible directly on your TA instance
- The return format of some endpoints have changed:
  - List views with pagination return a "data" top level key with a list of objects. They also return a "paginate" top level key with the pagination object.
  - List views that do not implement pagination, return the content directly in an array without a top level "data" key.
  - Detail views return the object directly without a "data" key.
  - List views no longer also return the appconfig object, use the dedicated endpoint instead.

Video endpoints:

| from | to | comment |
| --- | --- | --- |
| /api/video/<video\_id>/progress/ |  | removed the GET method, part of video |

Task endpoints:

| from | to | comment |
| --- | --- | --- |
| /api/task-name/ | /api/task/by-name/ | get all task results |
| /api/task-name/<task-name>/ | /api/task/by-name/<task-name>/ | get task results by name |
| /api/task-id/<task-id>/ | /api/task/by-id/<task-id>/ | get single task by ID |
| /api/schedule/ | /api/task/schedule/<task-name>/ | task by name |
| /api/schedule/notification/ | /api/task/notification/ | handle apprise notifications |

Settings endpoints:

| from | to | comment |
| --- | --- | --- |
| /api/snapshot/ | /api/appsettings/snapshot/ | get all ES snapshots |
| /api/snapshot/<snapshot-id>/ | /api/appsettings/snapshot/<snapshot-id>/ | single snapshot |
| /api/backup/ | /api/appsettings/backup/ | all backup files |
| /api/backup/<filename>/ | /api/appsettings/backup/<filename>/ | single backup file |
| /api/cookie/ | /api/appsettings/cookie/ | interact with cookie |
| /api/token/ | /api/appsettings/token/ | interact with API token |

User endpoints:

| from | to | comment |
| --- | --- | --- |
| /api/config/user/ | /api/user/me/ | current user details |
| /api/login/ | /api/user/login/ | login user |

Converted to parameters:

| from | to | comment |
| --- | --- | --- |
| /api/playlist/<playlist\_id>/video | /api/video/?playlist=<playlist\_id> | playlist videos |
| /api/channel/<channel-id>/video | /api/video/?channel=<channel-id> | channel videos |

### Contributors

- [![@MerlinScheurer](https://avatars.githubusercontent.com/u/4706504?s=64&v=4)](https://github.com/MerlinScheurer)
- [![@kralverde](https://avatars.githubusercontent.com/u/80051564?s=64&v=4)](https://github.com/kralverde)

MerlinScheurer and kralverde


Assets2

Loading

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/tubearchivist/tubearchivist/releases/tag/v0.5.0).

🎉43dot-mike, unbraind, MerlinScheurer, Morethanevil, skynet-gh, drajabr, pairofcrocs, arevindh, kalwadi, Salvoxia, and 33 more reacted with hooray emoji❤️6tgxn, CORAAL, rhiannon-eldridge-lrn, NewbGoob, dado-prateek, and jinncoder reacted with heart emoji🚀3tgxn, CORAAL, and rhiannon-eldridge-lrn reacted with rocket emoji

All reactions

- 🎉43 reactions
- ❤️6 reactions
- 🚀3 reactions

44 people reacted

You can’t perform that action at this time.