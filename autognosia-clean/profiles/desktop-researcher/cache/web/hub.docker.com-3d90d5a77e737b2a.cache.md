# qmcgaw/gluetun - Docker Image
URL: https://hub.docker.com/r/qmcgaw/gluetun

qmcgaw/gluetun - Docker Image

## qmcgaw/gluetun

â¢Updated 3 days ago

Lightweight Swiss-knife VPN client to connect to several VPN providers

Image

339

50M+

# qmcgaw/gluetun repository overview

### â Gluetun VPN client

Lightweight swiss-army-knife-like VPN client to multiple VPN service providers

â ï¸ This and

gluetun-wikiâ  are the only websites for Gluetun, other websites claiming to be official are scams â ï¸

ð¯ï¸ this repository will be migrated to

github.com/passteque/gluetunâ  on 2026-05-21, which is a Github organization under my sole control, so don't get alarmed if you get redirected in the coming days ð Reason being migrating Github sponsors to the Open source collective due to my personal situation, basically annoying paperwork. On the plus side, it will be more transparent and funds donated will only be used for the project. The Docker image names will remain the same.

#### â Quick links

Setupâ 

Featuresâ 

Problem?

Check the Wiki

Suggestion?

Happy?

Sponsor me on

Donate to

Drop me

Want to add a VPN provider? check

the development pageâ  and

add a provider pageâ 

Video:

#### â Features

For Cyberghost, Private Internet Access, PrivateVPN, PureVPN, Torguard, VPN Unlimited and VyprVPN using

For custom Wireguard configurations using

More in progress, see

Custom VPN server side port forwarding for

Private Internet Accessâ ,

- Based on Alpine 3.23 for a small Docker image of 43.1MB
- Supports: AirVPN, Cyberghost, ExpressVPN, FastestVPN, Giganews, HideMyAss, IPVanish, IVPN, Mullvad (Wireguard only), NordVPN, Privado, Private Internet Access, PrivateVPN, ProtonVPN, PureVPN, SlickVPN, Surfshark, TorGuard, VPNSecure.me, VPNUnlimited, Vyprvpn, Windscribe servers
- Supports OpenVPN for all providers listed
- Supports Wireguard both kernelspace and userspace
- - For AirVPN, FastestVPN, Ivpn, Mullvad, NordVPN, ProtonVPN, Surfshark and Windscribe
- the custom providerâ 
- the custom providerâ 
- #134â 
- Supports AmneziaWG only with the custom provider for now
- DNS over TLS baked in with service provider(s) of your choice
- DNS fine blocking of malicious/ads hostnames and IP addresses, with live update every 24 hours
- Choose the vpn network protocol,`udp` or`tcp`
- Built in firewall kill switch to allow traffic only with needed the VPN servers and LAN devices
- Built in Shadowsocks proxy server (protocol based on SOCKS5 with an encryption layer, tunnels TCP+UDP)
- Built in Socks5 proxy server (tunnels TCP+UDP) - partial credits to @angelakis and @adjscent
- Built in HTTP proxy (tunnels HTTP and HTTPS through TCP)
- Connect other containers to itâ 
- Connect LAN devices to itâ 
- Compatible with amd64, i686 (32 bit), ARM 64 bit, ARM 32 bit v6 and v7, and even ppc64le ð
- ProtonVPNâ 
- Possibility of split horizon DNS by selecting multiple DNS over TLS providers
- Can work as a Kubernetes sidecar container, thanks @rorph

#### â Setup

ð There are now instructions specific to each VPN provider with examples to help you get started as quick