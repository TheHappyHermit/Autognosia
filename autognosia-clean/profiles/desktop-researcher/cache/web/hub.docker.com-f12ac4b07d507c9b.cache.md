# kasmweb/centos-7-desktop - Docker Image
URL: https://hub.docker.com/r/kasmweb/centos-7-desktop

kasmweb/centos-7-desktop - Docker Image

Back

Back

## kasmweb/centos-7-desktop

Verified Publisher

â¢Updated 11 months ago

CentOS 7 desktop for Kasm Workspaces

Image

Networking

Integration & delivery

Operating systems

49

1M+

# kasmweb/centos-7-desktop repository overview

Kasm Workspaces is a docker container streaming platform for delivering browser-based access to desktops, applications, and web services.

### â Live Demo

Launch a real-time demo in a new browser window:

âNote: Demo is limited to 3 minutes and has upload/downloads restricted for security purposes.

### â Get Started

Try out our no-cost Community Edition:

Our Kasm Workspaces team has open-sourced our library of images (

The web-native rendering is powered by our open-source project:

### â About This Image

This Image contains a browser-accessible CentOS 7 XFCE Desktop with Chrome and Firefox installed..

### â Stand-alone Deployment

This image was designed to run natively within Kasm Workspaces, but it can also be deployed stand-alone and accessed through a web browser.

```
sudo docker run --rm -it --shm-size=512m -p 6901:6901 -e VNC_PW=password kasmweb/centos-7-desktop:1.14.0

```

Copy

The container is now accessible via a browser : https://IP_OF_SERVER:6901

- User : kasm_user
- Password: password

Please note that some functionality, such as audio, uploads, downloads, and microphone pass-through, is only available when using Kasm Workspaces for orchestration.

### â Tags

1.14.0

1.14.0-rolling

develop

- - Images are built and tagged with the Kasm Workspaces release version.
- - Rolling tags are images that are updated and built nightly to ensure your images are running the latest version.
- - The develop tag is for testing and provides no expectation of compatibility.

### â Additional Info

Source Code

Workspaces Documentation

Reporting Issues

- - KasmVNC GitHubâ : Open-Source VNC server: web-native, secure, high-performance.
- Images GitHubâ : Library of Workspaces Docker images.
- Core Images GitHubâ : Library of core OS baselines for custom images.
- - Developer APIâ : Integrate with your applications and workflows.
- Workspacesâ : Instructions for installing and configuring Kasm Workspaces.
- Custom Imagesâ : Info on configuring custom images and installing software.
- - Issue Tracker GitHubâ : Community issue reporting.

### Tag summary

Recent tags

1.15.0-rolling-weekly

Content type

Image

Digest

sha256:6099caad1â¦

Size

1.3 GB

Last updated

11 months ago

```
docker pull kasmweb/centos-7-desktop:1.15.0-rolling-weekly
```

Copy

### This week's pulls

Pulls:

290

Last week