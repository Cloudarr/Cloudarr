# Cloudarr
Cloudarr is a curated collection of docker-compose containers with the goal of creating a self-hosted home media "Cloud" with site-wide password protection. 

Designed with Cloudflare ddns and ExpressVPN built in.

Features include a customizable homepage with links to available services. You can add more services by creating a `config.json` file or editing `config.py`

## Setup:
Download this repository, extract it, and navigate to it in terminal.
Run `sudo bash./prepare_guac.bash` to set everything up for guacamole

***Install Python 3***

> Python is used to generate a number of config files in this tech stack.
```
sudo apt update
sudo apt install python3 -y
```

## Config:
- Set up cloudflare certs in `./cloudflare_certs`
- Configure `./.env` file
- Configure `./config.py` or make `./config.json`
- Configure `./config/traefik/traefik.yml`
- Optional: Edit `./config/authelia/access_control.yml` to set per-route acl rules
- Optional: After first run edit `./config/authelia/users_database.yml` to add more users (By default one admin and one user are created)

## Logins:

> ### Guacamole
> **First Time Login**
>  - Username: guacadmin
> - Password: guacadmin


## Technologies:
> ### AdGuardHome
> **Home Ad-Blocking DNS**
> 
> If you want to use adguard's dns and you're deploying on a modern version of ubuntu or raspbian run the below commands to free up port 53, this might break your local dns though. You will need to modify ADGUARD_DNS_PORT in `./.ENV` and uncomment port > 53 in ./docker-compose-network.yml in order to enable DNS.
>
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

> ### AudioBookShelf
> **AudiBook Player / Server**
> Web-based playback of audiobooks.

> ### Authelia
> **Access Management**
>
> Authelia (and Traefik) are configured with `.env` and `config.py` or `config.json`. You can add more users by editing ./config/authelia/users_database.yml. With some > elbow grease you can connect Authelia to AD / LDAP / OpenAuth etc. 

> ### Bazarr
> **Subtitle Downloader**
> 
> VPN-Protected. Integrates with Sonarr and Radarr.

> ### Cloudflare DDNS
> **Cloudflare Dynamic DNS Drone**
> 
> Keeps your IP up-to-date with Cloudflare DDNS

> ### ExpressVPN
> **Docker VPN Network Client**
> 
> Obscures sensitive Docker container communications

> ### FileBot
> **Video File Metadata Download / Renamer**
> 
> Download and applies metadata to shows and movies. Allows easy renaming and sorting.

> ### FileBrowser
> **Consolidated Media File Browser**
> 
> Collects the various media and download folders specified in `./env` into a singe web-based file viewer and manager. Simplifies browsing collections stored across multiple folders / drives / NASs.

> ### Flaresolverr
> **Cloudflare Captcha Solver**
>
> VPN Protected. Integrates with Sonarr, Radarr, Readarr, Lidarr, and Bazarr.

> ### Guacamole+Guacd
> **Web-Based RDP & VNC Client**
>
> In order to prepare on Ubuntu / Raspbian see `./prepare.sh`
This sets up the database and sets the write executable > permissions.
> You will need to modify this script if you
> set CONFIGDIR to any directory but `./config`
> 
> ```bash
> # Sets up guacamole
> if ! (docker ps >/dev/null 2>&1)
> then
>   echo "docker daemon not running, exiting!"
>   exit
> fi
> echo "Preparing folder init and creating ./config/guacamole/postgress/init/> initdb.sql"
> mkdir  -p ./config/guacamole/postgress/init/ >/dev/null 2>&1
> chmod -R +x ./config/guacamole/postgress/init/
> docker run --rm guacamole/guacamole /opt/guacamole/bin/initdb.sh > --postgresql > ./config/guacamole/postgress/init/initdb.sql
> echo "done"
> ```

> ### Homeassistant
> **Home Automation Tool**
>
> Automate your house and add functionality with plugins / apps.

> ### Homepage
> **Customizable Homepage**
>
>  Homepage is generated from `config.py` or `config.json`. The homepage layout is regenerated any time `apply_config.py` is run. `apply_config.py` is run as part of `compose-up.sh` 

> ### IT-Tools
> **Collection of Useful IT-Professional Tools**
>
> Includes a ton of useful IT tools including caclulators, generators, and lookups.

> ### Jackett
> **Torrent Indexer**
> 
> Integrates with Sonarr, Radarr, Readarr, Lidarr, and Bazarr.
>
> You should use this to build an indexer list using it's "public servers" tool then export them to NZBHydra

> ### Jellyfin
> **Media Player**
>
> Integrates with Sonarr, Radarr, Lidarr, and Jellyseerr

> ### Jellyseerr
> **Jellyfin Torrent Manager**
>
> Integrates with Sonarr, Radarr, and Jellyfin

> ### Kavita (Beta)
> **Web-Based eBook Library / Reader / Server**
>
> Friendly web-based eBook libary / reader

> ### Lidarr
> **Music Torrent Downloader**
>
> VPN Protected. Integrates with qBittorrent

> ### Navidrome
> **Web-Based Music Library / Player / Server**
>
> Works with DSUB App on Apple / Android

> ### NZBHydra (Beta)
> **Torrent Indexer**
> VPN Protected. Integrates with Sonarr, Radarr, Readarr, Lidarr, and Bazarr. You should use this as the primary indexer. Use Jackett to create configs from  public trackers, export the configs and import them here.
> 
> ### Picard
> **Music Metadata Downloader / Renamer**
>
> Downloads music and audiobook metadata and renames files.

> ### Portainer
> **Docker Container Manager**
>
> Manages containers and allow easy access to logs.

> ### qBittorrent
> **Bittorrent Download Client**
> VPN Protected. Integrates with Sonarr, Radarr, Readarr, Lidarr, and Bazarr Downloads requested torrent files.

> ### Radarr
> **Movie Torrent Downloader**
>
> VPN Protected. Integrates with Jellyseerr and qBittorrent

> ### Readarr (Beta)
> **Book Torrent Downloader**
>
> VPN Protected. Integrates with Jellyseerr and qBittorrent

> ### Traefik
> **Network Proxy**
>
> Handles proxy / routing. enables secure routing so ports don't have to be exposed.

> ### Unpackerr
> **Compresed File Download Handler**
>
> Handles downloaded file decompression. Integrates with Sonarr, Radarr, Readarr,Lidarr, and Bazarr. 

> ### VaultWarden
> **Password Manager**
>
> Securely configured password manager. Set `VW_SIGNUPS_ALLOWED` to `false` after first time login/setup. 

> ### WhatsUpDocker
> **Docker Container Update Manager**
>
> Monitors Docker containers for update availability.
> Program triggers and upate schedules.  

> ### YouTubeDL
> **YouTube Video Downloader**
>
> Downloads videos from YouTube in both audio and video format.

