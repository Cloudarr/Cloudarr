# Cloudarr
Cloudarr is a curated collection of Docker Compose containers with the goal of creating a self-hosted home media "Cloud" with site-wide password protection. The stack is still in the early stage of development and some containers may be added or removed depending on what new applications, tools, or recommendations are brought to my attention.

Designed with Authelia, Cloudflare DDNS, and ExpressVPN built in.
While this configuration won't suit everyone, this is a good starting point that can be built on and changed to suit your needs.
Features include a customizable homepage with links to available services for both Docker containers and machines on the network.

Cloudarr uses two files for configuration:
`./.env` and `./cloudarr-config.yml`
`./.env` is used to set environment variables.
`./cloudarr-config.yml`is used to generate and patch a number of different config files.

This project assumes a few things:
- You are using a modern version of Docker and Docker Compose
- You are using a modern version of Ubuntu (Might work on WSL but not officially supported).
- You want a single domain self-hosted cloud setup. Support for multiple domains is not planned.

This project needs a few things in the long term:
- Authelia OIDC Setup
- Better integration with ldap, user-forwarding by the proxy
- More documentation on how to configure services for ldap etc
- Contributions, ideas, and bug reports on the GitHub Cloudarr/Cloudarr repository from users like you!
- Possibly a custom Flask app to handle some Cloudarr ecosystem configuration, better Authelia and Traefik config, etc?

> ### Helpful Links
>
> Traefik Documentation: https://doc.traefik.io/traefik/
>
> Authelia Documentation: https://www.authelia.com/configuration/prologue/introduction/
> 
> The it-tools website has a number of great tools that can make setting this project up easier. 
> https://it-tools.tech/

<hr>
<hr>

## Setup:

> ***Install Python 3 and pip***
>
> Python is used to generate a number of config files in this tech stack.
> ```
> sudo apt update
> sudo apt install python3 -y
> sudo apt install python3-pip -y
> ```
> 
> Pip always installs out-of-date, update pip
> Install pyyaml for parsing purposes
> ```
> sudo pip3 install --upgrade pip
> sudo pip3 install pyyaml
> ```

> ***Directories / Config Files***
>
> Avoid creating the config file directory in your home directory as you are more likely to run into permissions issues. Something like `/cloudarr/config` is generally a good choice.
> Download the Cloudarr/Cloudarr repository from GitHub, extract it, and navigate to it in terminal. Be default Cloudarr assumes you will be using the supplied `./config/` folder as your config / appdata directory. If you modify the `$CONFIG` environment variable in `./.env` you will need to move the supplied folders in `./config/` folder to the path you specified for Cloudarr to function properly.

<hr>
<hr>

## Config:
- Create a `.env` file from template.env in the same folder as the compose files. This is where 90% of your configuration will be. Cloudarr comes with a self-contained browser-based editor. Simply open `./env_editor.html` and use it to open the env file and it will be formatted for a pleasant editing experience. **You need to do this *BEFORE* running the** `APPLY_CONFIG.PY` **or** `./prepare.sh` **scripts as they pull from `./.env`.** 
- Run `sudo bash ./prepare.sh` to set up the database init script for Guacamole. **You need to do this *BEFORE* runnning** `./apply_config.py` **for the first time. You should only need to do this once.**
- Set up cloudflare origin certificates in `./cloudflare_certs`
- Configure `./cloudarr-config.yml` This file configures Authelia, Traefik, and GetHomepage. A configuration guide is being developed, but the config file is well commented.

> Cloudar's cloudarr-config.yml system is a simplified combination of Traefik's dynamic-config.yml, Authelia's configuration.yml and Homepage's services.yml and settings.yml.
> Some changes, like those affecting Homepage or Traefik's dynamic-config.yml will take effect immediately. Changes that affect traefik.yml or Authelia's configuration.yml will not take effect until their respective container is restarted
> Cloudarr's Traefik/Authelia containers have been pre-configured to route http and https addresses automatically. Pre-defined TLS and transport layer configurations have been created to support both new and old local machines.
> Certain considerations have been taken to configure securely while still exposing important endpoints such as the Waultwarden api. See the "authelia:access_control" section of `cloudarr-config.yml` for details.

- Run `sudo python3 ./apply_config.py` - this script does a number of things, notably it reads the contents of `./.env` & `./cloudarr-config.yml` and generates several configuration files. Some environment variable or template changes require container restarts to take effect, others are immediate. Here's a breakdown of what it does:
  - Recreates the following files:
    - Creates `$CONFIGDIR/traefik/traefik.yml` *These changes require a restart of Traefik*
    - Creates `$CONFIGDIR/traefik/dynamic-config.yml` *These changes take effect immediately*
    - Creates `$CONFIGDIR/authelia/configuration.yml` *These changes require a restart of Authelia*
    - Creates `$CONFIGDIR/homepage/services.yaml` *These changes take effect immediately*
    - Creates `$CONFIGDIR/homepage/settings.yaml` *These changes take effect immediately*
    - Patches `$CONFIGDIR/guacamole/postgress/init/initdb.sql` to use the built-in Cloudarr ldap admin rather than guacadmin. If you need to specify a different user you can edit the script fairly easily for a different admin user at the bottom of `./apply_config.py`. *For changes to the init script to take effect you must remove the guac_guacd, guac_postgres, and guacamole containers and volumes and recreate them by running the compose-up script again. This process will delete existing users.*

- Finally run `sudo bash ./compose-up.sh` to start the stack
- Wait a few moments and then open your domain, if everything worked right you should see the home page.


***Configure Homeassistant to trust Traefik proxy***
> You will need to add Traefik as a trusted proxy to Homeassistant otherwise you will get a 400 error when trying to access it from outside the local network.

<hr>
<hr>

## Logins:

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
> 
> Would like to get OpenID working - PR appreciated! I've got a lot of the config done but commented out in Authelia, I haven't been able to get it working though. It gets stuck after asking for permission to use the OpenID account info.

### Authelia / Single-Factor
>
> Uses ldap!

### Portainer
> **First Time Login**
> 
> You must do first-time login within the first 5 minutes of spinning up the container.
> If you fail to do so you will need to restart the container to set up the admin account.
> Follow the instructions at this link to integrate with LDAP
>
> https://docs.portainer.io/admin/settings/authentication/ldap
>
> If somebody can show how to get portainer OpenID working I'll add it

<hr>
<hr>

## Technologies:
### AdGuardHome
> **Home Ad-Blocking DNS**
> 
> If you want to use adguard's dns and you're deploying on a modern version of ubuntu or raspbian run the below commands to free up port 53, this might break your local dns though. You will need to modify ADGUARD_DNS_PORT in `.env` and uncomment port > 53 in `./docker-compose-network.yml` in order to enable DNS.
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

### AudioBookShelf
> **AudiBook Player / Server**
> Web-based playback of audiobooks.

### Authelia
> **Access Management**
>
> Authelia (and Traefik) are configured with `.env` and `config.py` or `config.json`. You can add more users by accessing the ldap User Manager at admin.domain.com
> elbow grease you can connect Authelia to OpenAuth etc. 

### Bazarr
> **Subtitle Downloader**
> 
> VPN-Protected. Integrates with Sonarr and Radarr.

### Cloudflare DDNS
> **Cloudflare Dynamic DNS Drone**
> 
> Keeps your IP up-to-date with Cloudflare DDNS

### ExpressVPN
> **Docker VPN Network Client**
> 
> Obscures sensitive Docker container communications

### FileBot
> **Video File Metadata Download / Renamer**
> 
> Download and applies metadata to shows and movies. Allows easy renaming and sorting.

### FileBrowser
> **Consolidated Media File Browser**
> 
> Collects the various media and download folders specified in `.env` file into a singe web-based file viewer and manager. Simplifies browsing collections stored across multiple folders / drives / NASs.

### Flaresolverr
> **Cloudflare Captcha Solver**
>
> VPN Protected. Integrates with Sonarr, Radarr, Readarr, Lidarr, and Bazarr.

### Guacamole+Guacd
> **Web-Based RDP & VNC Client**
>
> In order to prepare on Ubuntu / Raspbian see `./prepare_guac.sh`
This sets up the database and sets the write executable > permissions.
> You will need to modify this if you
> set CONFIGDIR in `.env` to any directory but `./config`
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

### Homeassistant
> **Home Automation Tool**
>
> Automate your house and add functionality with plugins / apps.

### Homepage
> **Customizable Homepage**
>
>  Homepage is generated from `config.py` or `config.json`. The homepage layout is regenerated any time `apply_config.py` is run. `apply_config.py` is run as part of `compose-up.sh` 

### IT-Tools
> **Collection of Useful IT-Professional Tools**
>
> Includes a ton of useful IT tools including caclulators, generators, and lookups.

### Jackett
> **Torrent Indexer**
> 
> Integrates with Sonarr, Radarr, Readarr, Lidarr, and Bazarr.
>
> You should use this to build an indexer list using it's "public servers" tool then export them to NZBHydra

### Jellyfin
> **Media Player**
>
> Integrates with Sonarr, Radarr, Lidarr, and Jellyseerr
>
> 
> LDAP:
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


### Jellyseerr
> **Jellyfin Torrent Manager**
>
> Integrates with Sonarr, Radarr, and Jellyfin

### Kavita (Beta)
> **Web-Based eBook Library / Reader / Server**
>
> Friendly web-based eBook libary / reader
>
> Stream with Substreamer, DSub, or other mobile apps and media players.

### Lidarr
> **Music Torrent Downloader**
>
> VPN Protected. Integrates with qBittorrent, NZBHydra, and Homepage

### Navidrome
> **Web-Based Music Library / Player / Server**
>
> Works with DSUB App on Apple / Android

### NZBHydra (Beta)
> **Torrent Indexer**
>
> VPN Protected. Integrates with Sonarr, Radarr, Readarr, Lidarr, and Bazarr. You should use this as the primary indexer. Use Jackett to create configs from  public trackers, export the configs and import them here.
> 
### Picard
> **Music Metadata Downloader / Renamer**
>
> Downloads music and audiobook metadata and renames files.

### Portainer
> **Docker Container Manager**
>
> Manages containers and allow easy access to logs.

### qBittorrent
> **Bittorrent Download Client**
>
> VPN Protected. Integrates with Sonarr, Radarr, Readarr, Lidarr, and Bazarr Downloads requested torrent files.
> Check $CONFIG/qbit/qBittorrent/logs/qbittorrent.log for a notice of an ip being banned for too many failed login attempts
> You might have to whitelist / bypass auth on this ip for the widget to work 

### Radarr
> **Movie Torrent Downloader**
>
> VPN Protected. Integrates with Jellyseerr and qBittorrent

### Readarr (Beta)
> **Book Torrent Downloader**
>
> VPN Protected. Integrates with Jellyseerr and qBittorrent

### Traefik
> **Network Proxy**
>
> Handles proxy / routing and enables secure routing through Cloudflare so your IP / ports don't have to be exposed to the internet.

### Unpackerr
> **Compresed File Download Handler**
>
> Handles downloaded file decompression. Integrates with Sonarr, Radarr, Readarr, Lidarr, and Bazarr. 

### VaultWarden
> **Password Manager**
>
> Securely configured password manager. Set `VW_SIGNUPS_ALLOWED` to `false` in `./.env` after first time login/setup. 

### WhatsUpDocker
> **Docker Container Update Manager**
>
> Monitors Docker containers for update availability.
> Program triggers and upate schedules.  

### YouTubeDL
> **YouTube Video Downloader**
>
> Downloads videos from YouTube in both audio and video format.

<hr>
<hr>

# Credits:
 - Wizards, Sorcerers, and other friends of mine.