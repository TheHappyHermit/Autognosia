# Settings - Bazarr Wiki
URL: https://wiki.bazarr.media/Additional-Configuration/Settings
Author: TRaSH

Settings - Bazarr Wiki

Skip to content

# SettingsÂ¶

THIS SECTION IS OUTDATED AND STILL NEEDS TO GET UPDATED !!!

- Scheduler
- Notifications
- Providers
- Languages
- Subtitles
- Radarr
- Sonarr
- General

## GeneralÂ¶

### HostÂ¶

#### Bind AddressÂ¶

Valid IP4 address or '0.0.0.0' for all interfaces

Leave it as`0.0.0.0` if you want to listen on every available IP address (recommended). If you are running inside a docker container, that's the recommended value.

##### Port NumberÂ¶

Should be an available TCP port on the computer running Bazarr. Default is 6767 and it is the recommended value.

##### URL BaseÂ¶

This option gives you the opportunity to serve Bazarr in a sub-directory. Ex.:`http://127.0.0.1:6767/bazarr/` instead of the default`http://127.0.0.1:6767/`

Mainly used when you use a reverse proxy, if you don't use a reverse proxy or don't know what it is leave this empty!!!

#### SecurityÂ¶

##### AuthenticationÂ¶

Select the type of authentication process desired from basic (browser popup) or forms login. Be aware that basic auth is not secure if not used in conjunction with SSL (using a reverse proxy).

##### UsernameÂ¶

Enter here the username to access Bazarr.

##### PasswordÂ¶

Enter here the password to access Bazarr.

##### API KeyÂ¶

Your API Key.

#### ProxyÂ¶

##### TypeÂ¶

Select the desired proxy type from HTTP(S), Socks4 or Socks5.

##### HostnameÂ¶

Enter here the hostname of your proxy.

##### PortÂ¶

Enter here the TCP port of your proxy.

##### Username-Â¶

Enter here the username (if required) to authenticate to your proxy.

##### Password-Â¶

Enter here the password (if required) to authenticate to your proxy.

##### Ignored addressesÂ¶

Enter here (if required), a list of comma separated hostname or IPv4 addresses to be excluded from going through the proxy.

#### UIÂ¶

Self explanatory.

#### LoggingÂ¶

This option enables debug logging and should be enabled for a short period to facilitate debugging process.

#### AnalyticsÂ¶

Send anonymous usage information, nothing that can identify you. This includes information on which providers you use, what languages you search for, Bazarr, Python, Sonarr, Radarr and what OS version you are using. We will use this information to prioritize features and bug fixes. Please, keep this enabled as this is the only way we have to better understand how you use Bazarr.

---

### SonarrÂ¶

#### Host-Â¶

##### Hostname or IP addressÂ¶

Enter the hostname or the IP address of the computer running your Sonarr instance.

Be aware that when using Bazarr in docker, you cannot reach another container on the same Docker host using the loopback address (ex.: 127.0.0.1 or localhost). Loopback address refer to the Bazarr Docker container, not the Docker host.

##### Port Number-Â¶

Enter the TCP port of your Sonarr instance. Default is 8989.

##### URL Base-Â¶

Mainly used by those who expose Sonarr behind a reverse proxy (ex.: /sonarr). Don't forget the leading slash. In fact, it should look exactly the same as i