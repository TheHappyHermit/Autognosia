# SABnzbd API
URL: https://thezoggy.github.io/sabnzbd/api/

SABnzbd API

| Output Formats | Description |
| --- | --- |
| json | Return the output in the JSON format. |
| xml | Return the output in the XML format. |
| text | Return the output in the plain text format. |
| Commands | Description |
| addlocalfile | Add local .nzb to the queue. |
| browse | API function for the path browser dialog. |
| disconnect | Force disconnect server connections in SABnzbd. |
| get_cats | Displays the categories in SABnzbd. |
| get_config | Displays the current sabnzbd.ini config. |
| get_files | Displays the files for an item in the queue. |
| get_scripts | Displays the scripts in SABnzbd. |
| history | Displays the SABnzbd history. |
| options | Displays the SABnzbd tools options. |
| osx_icon | Set the SABnzbd config value of the OS X SABnzbd menu icon. |
| pause | Pause the SABnzbd queue (global). |
| qstatus | A barebones output of the SABnzbd queue. |
| queue | Display the SABnzbd queue. |
| queue.delete | Delete an item from the SABnzbd queue. |
| restart | Restart SABnzbd. |
| resume | Resume the SABnzbd queue (global). |
| rss_now | Obtain RSS feed items in SABnzbd. |
| shutdown | Shut down SABnzbd. |
| test_email | Send a test e-mail notification using the settings defined in SABnzbd. |
| test_notif | Send a test Growl notification using the settings defined in SABnzbd. |
| version | Display the version of SABnzbd currently running. |
| warnings | Display the current warnings in SABnzbd. |
| Miscellaneous | Description |
| advanced api | Advanced usage of the API. |
| disclaimer | Disclaimer about the API. |

 

 

 

---

# Output Formats

There is a global option called 'output' that may be set to change the formatting of the returned API response. XML does not allow for children elements if the root does not have a keyword. For this reason the root (outer most) XML keyword will be 'result' when needed, as shown below.

json, xml, [text]

| Parameter | Description |
| --- | --- |
| output optional |

### Example Request

- JSON
- XML
- Plain Text

```

/sabnzbd/api?apikey=1234&mode=addlocalfile&name=D:\file.ext&output=json
{
    "status": 0,
    "nzo_ids": [
        "SABnzbd_nzo_ocz8vt"
    ]
}

```

 

```

/sabnzbd/api?apikey=1234&mode=addlocalfile&name=D:\file.ext&output=xml
<?xml version="1.0" encoding="UTF-8" ?>
<result>
  <status>0</status>
  <nzo_ids>
    <item>SABnzbd_nzo_ocz8vt</item>
  </nzo_ids>
</result>

```

 

```

/sabnzbd/api?apikey=1234&mode=addlocalfile&name=D:\file.ext&output=text
{'status': 0, 'nzo_ids': ['SABnzbd_nzo_ocz8vt']}

```

 

 

 

 

---

Add a local file containing a .nzb to be processed and added to the SABnzbd queue. Default post-processing options are used unless specififed. Returns a status code when processed, see below for the breakdown.

valid location to a single nzb to process (accepts .zip, .rar, .gz. or .nzb)

override default pp option

override default script

override default category

override default priority

only used for non archived files ( .nzb / .gz )