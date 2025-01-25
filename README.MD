# Cloudarr
Cloudarr is a curated collection of Docker Compose containers with the goal of creating a self-hosted home media "Cloud" with site-wide password protection. The stack is still in the early stage of development and some containers may be added or removed depending on future applications, tools, or recommendations.

![Example Dashboards](https://raw.githubusercontent.com/Cloudarr/Cloudarr/main/docu/example.png)

<p align="center"><b>
A sample dashboard made with Cloudarr, Cloudarr's dashboard comes preconfigured with the built-in routes but proxying local services with Cloudarr is easy.
</b></p>

Designed with Cloudflare DDNS, and ExpressVPN built in.
While this configuration won't suit everyone, this is a good starting point that can be built on and changed to suit your needs.
Features include a customizable homepage with links to available services for both Docker containers and machines on the network.

Cloudarr, leveraging the Homepage container, can be used to make powerful dashboards to monitor and manage your home network and services.

Cloudarr uses two files for configuration, `./.env` and `./cloudarr-config.yml`:
- `./.env` is used to set environment variables.
- `./cloudarr-config.yml`is used to generate and patch a number of different config files.

This project assumes a few things:
- You are using a modern version of Docker and Docker Compose
- You are using a modern version of Ubuntu (Might work on WSL but not officially supported).
- You want a single domain self-hosted cloud setup. Support for multiple domains is not planned.
- You are using Cloudflare for your DNS records. Other providers will work, but some of the containers to update your records only work with Cloudflare

This project needs a few things in the long term:
- Authelia OIDC Setup
- Better integration with ldap, proxy-auth
- More documentation on how to configure services for ldap,  etc
- Possibly a custom Flask app to handle some Cloudarr ecosystem configuration, better Authelia and Traefik config, etc?
- More Stars! :) Give this repo a star if you think it's cool
- Contributions, ideas, and bug reports on the GitHub.com/Cloudarr/Cloudarr repository from users like you! See the bottom of the README for the current needs / goals / todo.

### Helpful Links
- Traefik Documentation: https://doc.traefik.io/traefik/
- Authelia Documentation: https://www.authelia.com/configuration/prologue/introduction/
- Jellyfin Backup/Recovery Documentation: https://jellyfin.org/docs/general/administration/backup-and-restore
- The it-tools website has a number of great tools that can make setting this project up easier: https://it-tools.tech/

***

### Table Of Contents
  - [Setup](#setup)
  - [Containers](#compose-files)
    - [Core](#core)
      - [AdGuard Home](#adguard-home)
      - [Authelia](#authelia)
      - [Authelia Group Check](#authelia-group-check)
      - [Cloudflare DDNS](#cloudflare-ddns)
      - [Glances](#glances)
      - [Grafana](#grafana)
      - [Homepage](#homepage)
      - [LDAP User Manager](#ldap-user-manager)
      - [Loki](#loki)
      - [OpenLDAP](#openldap)
      - [Portainer](#portainer)
      - [Traeik](#traefik)
      - [Uptime Kuma](#uptime-kuma)
      - [WhatsUpDocker](#whatsupdocker)
    - [Services](#services):
      - [AudioBookshelf](#audiobookshelf)
      - [Code Server](#code-server)
      - [FDM Monster](#fdm-monster)
      - [Filebot](#filebot)
      - [Filebrowser](#filebrowser)
      - [Gitea](#gitea)
      - [Guacamole](#guacamole)
      - [Home Assistant](#home-assistant)
      - [IT-Tools](#it-tools)
      - [Jellyfin](#jellyfin)
      - [Jupyter](#jupyter)
      - [Kavita](#kavita)
      - [Miniflux](#miniflux)
      - [Navidrome](#navidrome)
      - [Picard](#picard)
      - [Prusa Slicer](#prusa-slicer)
      - [Redlib](#redlib)
      - [Vaultwarden](#vaultwarden)
    - [VPN](#vpn):
      - [Bazarr](#bazarr)
      - [ExpressVPN](#expressvpn)
      - [FlareSolverr](#flaresolverr)
      - [Jackett](#jackett)
      - [JellySeerr](#jellyseerr)
      - [Lidarr](#lidarr)
      - [NZBHydra 2](#nzbhydra-2)
      - [Qbittorrent](#qbittorrent)
      - [Radarr](#radarr)
      - [Readarr](#readarr)
      - [Sonarr](#sonarr)
      - [Unpackerr](#unpackerr)
      - [YouTubeDL](#youtubedl)
  - [Access Control](#access-control)
***
***

## Setup:

***Install Python 3 and pip***

*Python is used by Cloudarr to parse and generate a number of config files*
```
sudo apt update
sudo apt install python3 python3-pip -y
sudo pip3 install --upgrade pip
sudo apt install pyyaml -y
```

***Install Loki Driver***

*This enables logging though loki*
```
docker plugin install grafana/loki-docker-driver:2.9.2 --alias loki --grant-all-permissions
```


***Directories / Config Files***

Avoid creating the config file directory in your home directory as you are more likely to run into permissions issues. Something like `/cloudarr/config` is generally a good choice.

Download the Cloudarr/Cloudarr repository from GitHub, extract it, and navigate to it in terminal. By default Cloudarr assumes you will be using the supplied `./config/` folder as your config / appdata directory. If you modify the `$CONFIG` environment variable in `./.env` you will need to move the supplied folders in `./config/` folder to the path you specified for Cloudarr to function properly.

***
***

## Config:
- Create a `./.env` file from template.env in the same folder as the compose files. This is where 90% of your configuration will be. Cloudarr comes with a self-contained browser-based editor. Simply open `./env_editor.html` and use it to open the env file and it will be formatted for a pleasant editing experience. **You need to do this *BEFORE* running the** `APPLY_CONFIG.PY` **or** `./prepare.sh` **scripts as they pull from `./.env`.** 
- Run `sudo bash ./prepare.sh` to set up the database init script for Guacamole. **You need to do this *BEFORE* runnning** `./apply_config.py` **for the first time. You should only need to do this once.**
- Set up cloudflare origin certificates in `./cloudflare_certs`
- Configure `./cloudarr-config.yml` This file configures Authelia, Traefik, and GetHomepage. A configuration guide is being developed, but the config file is well commented.

Cloudar's cloudarr-config.yml system is a simplified combination of Traefik's dynamic-config.yml, Authelia's configuration.yml and Homepage's services.yml and settings.yml.

Some changes, like those affecting Homepage or Traefik's dynamic-config.yml will take effect immediately. Changes that affect traefik.yml or Authelia's configuration.yml will not take effect until their respective container is restarted

Cloudarr's Traefik/Authelia containers have been pre-configured to route http and https addresses automatically. Pre-defined TLS and transport layer configurations have been created to support both new and old local machines.

Certain considerations have been taken to configure Cloudarr to be secure while still exposing important endpoints such as the Waultwarden and Navidrome api for application compatibility. See the "authelia:access_control" section of `cloudarr-config.yml` for details.

- Run `sudo python3 ./apply_config.py` - this script does a number of things, notably it reads the contents of `./.env` & `./cloudarr-config.yml` and generates several configuration files. Some environment variable or template changes require container restarts to take effect, others are immediate. Here's a breakdown of what it does:
  - **Recreates the following files:**
  - Creates `$CONFIGDIR/traefik/traefik.yml` *These changes require a restart of Traefik*
  - Creates `$CONFIGDIR/traefik/dynamic-config.yml` *These changes take effect immediately*
  - Creates `$CONFIGDIR/authelia/configuration.yml` *These changes require a restart of Authelia*
  - Creates `$CONFIGDIR/homepage/services.yaml` *These changes take effect immediately*
  - Creates `$CONFIGDIR/homepage/settings.yaml` *These changes take effect immediately*
  - Patches `$CONFIGDIR/guacamole/postgress/init/initdb.sql` to use the built-in Cloudarr ldap admin rather than guacadmin. If you need to specify a different user you can edit the script fairly easily for a different admin user at the bottom of `./apply_config.py`. *For changes to the init script to take effect you must remove the guac_guacd, guac_postgres, and guacamole containers and volumes and recreate them by running the compose-up script again.*

- Finally run `sudo bash ./compose-up.sh` to start the stack
- Wait a few moments and then open your domain, if everything worked right you should see the home page.

***
***

## Logins:
> The only thing you will want to do before setting up LDAP is set up the Portainer login since you only have 10 minutes to log in for first time configuration or you must restart the container.

### LDAP
> **THIS IS A VERY IMPORTANT STEP. THE PROXY WILL NOT FUNCTION UNTIL THIS IS DONE**
>
> In order to enable proxy login you will need to to ldap first time setup
> Navigate to http://localhost:8785/setup (or whatever you set the port to)
> Walk through the setup process, create anything ldap-user-manager says is missing.
> After this you can add users and they will be able to log into the the ecosystem.
> You will need to create certain groups 


### Radarr, Readarr, Lidarr, Sonarr, Bazarr, Jackett, NZBHydra
> **First Time Login**
>
> These all have authentication turned off by default
> You should probably enable authentication if you aren't using Traefik/Authelia to provide an auth screen. By default Traefik/Authelia is configured to require authentication to access these sites, however they are still locally exposed.
> If you want to disable local access you can limit them to just the Traefik network by commenting out their ports in their respective compose files.

### Jellyfin
> **First Time Login**
>
> See the entry for Jellyfin below in the Technologies section for ldap setup.

### qBittorrent
> **First Time Login**
>
> qBittorrent supplies the first time password via logs/stdout. You can either check the container logs in Portainer or use a docker command to access them.
>
> Using docker command:
```bash
#If container is already running, shut it down
sudo docker compose -f ./docker-compose-requesters.yml down qbittorrent
#Re-up container with direct access to stdout
sudo docker compose -f ./docker-compose-requesters.yml up qbittorrent
# You should see the temporary password in the container output
# Log in to qBittorrent with the temporary password and set a permanent one
# Exit the container (Ctrl+C)
# Rerun the container in detached mode
sudo docker compose -f ./docker-compose-requesters.yml up qbittorrent -d
```

### Guacamole
>
> Uses ldap!
> Access limited to members of guacamole_users

### Authelia / Single-Factor
>
> Uses ldap!

### Portainer
> **First Time Login**
> 
> You must do first-time login within the first 10 minutes of spinning up the container.
> If you fail to do so you will need to restart the container to set up the admin account.
> Follow the instructions at this link to integrate with LDAP
>
> https://docs.portainer.io/admin/settings/authentication/ldap
>
> If somebody can show how to get portainer OpenID working I'll add it


### Code Server
> Code server is only available to mebmbers of the ldap "admins" group
> It is routed only through the proxy, without local ports exposed

***
***



# Containers



## Core


#### AdGuard Home
> *Home Ad-Blocking DNS*

You will need to visit adguard-setup.domain.com for initial setup.
After first setup the adguard-setup endpoint will no longer function.

> If you want to use adguard's dns and you're deploying on a modern version of ubuntu or raspbian run the below commands to free up port 53, this might break your local dns though. You will need to modify ADGUARD_DNS_PORT variable in `.env` and uncomment port > 53 in `./docker-compose-network.yml` in order  enable DNS.
> ***Disable resolved.service***
> ```bash
> sudo systemctl disable systemd-resolved.service #
> sudo systemctl stop systemd-resolved
> ```
> ***Enable resolved.service***
> ```bash
> sudo systemctl enable systemd-resolved.service #
> sudo systemctl start systemd-resolved
> ```

***

#### Authelia
> *Access Control and Authentication*

Authelia (and Traefik) are configured with `.env` and `config.py` or `config.json`. You can add more users by accessing LDAP User Manager at admin.domain.com

***

#### Authelia Group Check
> *Custom Authelia+Ldap Group-Check Plugin*

This is a custom container written to allow javascript on internal sites to check the user's groups.

***

#### Cloudflare DDNS
> *Cloudflare Dynamic DNS Drone*

Keeps your homelab's public IP up-to-date with Cloudflare DDNS

***

#### Glances
> *Open-Source Monitoring System w/ API*

Create pretty graphs from a variety of sources

***

#### Grafana
> *Graphing and Metrics Platform*

Consolidates logs through Loki for alerts and monitoring.

***

#### Homepage
> *Customizable Homepage for Your Homelab*

Homepage is generated from `config.py` or `config.json`. The homepage layout is regenerated any time `apply_config.py` is run. `apply_config.py` is run as part of `compose-up.sh` 

***

#### LDAP User Manager
> *LDAP User Management Web UI*

- admins
- mediaadmins
- jellyfinusers
- advancedrequesterusers
- requesterusers
- guacamoleusers
- printerusers
- camerausers

***

#### Loki
> *Log Aggregation*

Collects logs from all containers and funnels them into Grafana as a data source
Requires Loki driver to be installed, see [Setup](#setup) for more info.

***

#### OpenLDAP
> *User and Group Management*

User and Group Management Database

***

#### Portainer
> *Docker Container Manager*

Manages containers and allow easy access to logs.

***

#### Traeik
> *Network Proxy*

Handles proxy / routing and enables secure routing through Cloudflare so your IP / ports don't have to be exposed to the internet.

***

#### Uptime Kuma
> *Monitoring Tool*

Host status monitor with Grafana integration

***

#### WhatsUpDocker
> *Docker Container Update Manager*

Monitors Docker containers for update availability.
Program triggers and update schedules.  

***

## Services

***

#### AudioBookshelf
> *AudioBook Player / Server*

Web-based playback of audiobooks.

***

#### Code Server
> *Web-Based Text Editor*

Edit your docker configs with VS code in a browser.

***

#### FDM Monster
> *3D Print Farm Manager*

Manage Multiple 3D Printers (with Octoprint integration)

***

#### Filebot
> *Video File Metadata Download / Renamer*
 
Downloads and applies metadata to shows and movies. Allows easy renaming and sorting.

***

#### Filebrowser
> *Consolidated Media File Browser*

Collects the various media and download folders specified in `.env` file into a singe web-based file viewer and manager. Simplifies browsing collections stored across multiple folders / drives / NASs.

***

#### Gitea
> *Super Simple Self-Hosted Git Server*

***

#### Guacamole
> *Web-Based RDP & VNC Client*

Cloudarr handles the configuration of Guacamole to authenticate with LDAP.

***

#### Home Assistant
> *Home Automation Tool*

Automate your house and add functionality with plugins / apps.
 
You will need to add the Traefik IP as a trusted proxy to Homeassistant otherwise you will get a 400 error when trying to access it from outside the local network.

Authelia can be enabled by following the instruction here https://github.com/BeryJu/hass-auth-header

Add/update these sections to your HA configuration.
```yml
http:
    use_x_forwarded_for: true
    trusted_proxies:
        - 1.2.3.4/32 # This needs to be set to the IP of your reverse proxy
auth_header:
    username_header: Remote-User # Authelia SSO header, don't change this
logger:
    default: info
    logs:
        custom_components.auth_header: debug
```
***

#### IT-Tools
> *Collection of Useful IT-Professional Tools*

Includes a ton of useful IT tools including caclulators, generators, and lookups.

***

#### Jellyfin
> *Media Player*

Integrates with Sonarr, Radarr, Lidarr, and Jellyseerr

**LDAP**
>  - Create two groups in ldap user manager; jellyfinusers and jellyfinadmins (Case Sensitive)
>  - Open Jellyfin Server
>  - Go to `Dashboard > Plugins`
>  - Click `Catalog` and install the `LDAP` plugin
>  - Restart Jellyfin
>  - Go to `Dashboard > Plugins > LDAP`
>    - LDAP Server: `openldap`
>    - LDAP Port: `389`
>    - Skip SSL/TLS Verification: `Checked`
>    - LDAP Bind User: `admin`
>    - LDAP Bind Password: `Your LDAP admin Password`
>    - LDAP Base DN for searches: `ou=people,dc=example,dc=com`
>    - *Test Ldap Server Settings*
>    - LDAP Search Filter: blank
>    - LDAP Search Attributes: `uid`
>    - LDAP Uid Attribute: `uid`
>    - LDAP Username Attribute: `cn`
>    - LDAP Admin Base DN: blank
>    - LDAP Admin Filter: `(memberOf=CN=jellyfinadmins,OU=groups,DC=example,DC=com)`
>    - *Save and Test Ldap Filter Settings*
>    - *Test login names*

***

#### Jupyter
> *Web-Based Python Execution Environment*

Run and visualize Python scripts on your local envrionment 

***

#### Kavita
> *Web-Based eBook Library / Reader / Server*

Friendly web-based eBook libary / reader

Stream with Substreamer, DSub, or other mobile apps and media players.

***

#### Miniflux
> *Sleek Feed Reader*

Sleek RSS / New Reader with multi-user support

***

#### Navidrome
> *Web-Based Music Library / Player / Server*

Works with DSUB App on Apple / Android

***

#### Picard
> *Music Metadata Downloader / Renamer*

Downloads music and audiobook metadata and renames files.

***

#### Prusa Slicer
> *3D Printer Model Slicer*

Edit the prusa-slicer portion of docker-compose-services.yml to enable GPU support

***

#### Redlib
> *Anonymous Reddit Browser*

***

#### Vaultwarden
> *Password Manager*

Securely configured password manager. Set `VW_SIGNUPS_ALLOWED` to `false` in `./.env` after first time login/setup.

***

## VPN

Cloudarr is configured with ExpressVPN to protect requester and torrent traffic from ISP spying. 

It should be fairly easy to use a different cpn provider by replacing the ExpressVPN container with one of the many alternatives. Just make sure to maintain the exposed ports and Traefik labels when doing so.

***

#### Bazarr
> *Subtitle Downloader*

VPN-Protected. Integrates with Sonarr and Radarr.

***

#### ExpressVPN
> *Docker VPN Network Client*

Obscures sensitive Docker container communications

#### FlareSolverr
> *Cloudflare Captcha Solver*

VPN Protected. Integrates with Sonarr, Radarr, Readarr, Lidarr, and Bazarr.

***

#### Jackett
> *Torrent Indexer*

Integrates with Sonarr, Radarr, Readarr, Lidarr, and Bazarr.

You should use this to build an indexer list using it's "public servers" tool then export them to NZBHydra

***

#### JellySeerr
> *Jellyfin Torrent Manager*

Integrates with Sonarr, Radarr, and Jellyfin

***

#### Lidarr
> *Music Torrent Downloader*

VPN Protected. Integrates with qBittorrent, NZBHydra, and Homepage

***

#### NZBHydra 2
> *Torrent Indexer*

VPN Protected. Integrates with Sonarr, Radarr, Readarr, Lidarr, and Bazarr. You should use this as the primary indexer. Use Jackett to create configs from  public trackers, export the configs and import them here.
 
You can set enable sso through Authelia by turning on advanced settings in Config -> Authorization
 - Set `Auth type = Http Basic Auth`
 - Set `Auth header = Remote-User`
 - Set `Secure IP ranges` to the ip / range of traefik to accept the headers from.

***

#### Qbittorrent
> *Bittorrent Download Client*

VPN Protected. Integrates with Sonarr, Radarr, Readarr, Lidarr, Bazarr and Homepage. Downloads requested torrent files.
Check $CONFIG/qbit/qBittorrent/logs/qbittorrent.log for a notice of an ip being banned for too many failed login attempts
You might have to whitelist / bypass auth for this ip for the gethomepage widget to work 
***

#### Radarr
> *Movie Torrent Downloader*

VPN Protected. Integrates with Jellyseerr and qBittorrent

***

#### Readarr
> *Book Torrent Downloader*

VPN Protected. Integrates with Jellyseerr and qBittorrent

***

#### Sonarr

***

#### Unpackerr
> *Compresed File Download Handler*

Handles downloaded file decompression. Integrates with Sonarr, Radarr, Readarr, Lidarr, and Bazarr. 

***

#### YouTubeDL
> *YouTube Video Downloader*

Downloads videos from YouTube in both audio and video format.

***

# Access Control:
Access control is done using Authelia access_control rules and ldap groups
Admins have access to all routes

**Built-in**
- admins
  - portainer (admin login needed after)
  - code-server 
  - homeassistant (admin login needed after)
  - adguard (admin login needed after)
  - ldap-user-manager w/ admin (sso login bypass)
  - guacamole w/ admin (sso login bypass)
  - jellyfin w/ admin
  - grafana w/admin (sso login bypass)
- mediaadmins
  - jackett
  - nzbhdyra
  - musicbrainz picard
  - filebot
  - qbittorrent
  - filebrowser
- jellyfinusers
  - jellyfin
- mediausers
  - navidrome
  - kavita
  - audiobookshelf
- requesters
  - jellyseerr
  - youtubedl
- advancedrequesters
  - Readarr
  - Radarr
  - Lidarr
  - Sonarr
  - Bazarr
- jupyterusers
  - Jupyter
- guacamoleusers
  - guacamole (sso login bypass)
- jellyfinusers
  - jellyfin (repeat ldap login)
- serviceusers
  - IT-Tools
  - VaultWarden
  - Redlib
  - Miniflux
- printerusers
  - Prusa Slicer
  - FDM Monster
See the access_control section of `./cloudarr-config.yml` for more details

# Credits:
 - Wizards, Sorcerers, and other friends of mine.
