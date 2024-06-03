### CONFIGURE TRAEFIK ROUTES AND HOMEPAGE DASHBOARD HERE
### ALTERNATIVELY CREATE A JSON FILE OF THE SAME LAYOUT
### JSON FILE IS LOADED WITH PRIORITY

# Edit this to add custom routes to traefik
routes = [
    # (
    #     prefix,
    #     local_address,
    #     insecure[True/False],
    #     tls_config["modern"/"intermediate"]
    # ),
    # Example
    # ("homepage", "192.168.1.2", False, "modern"), # This config covers most web UIs
]

descriptions = {
    # "prefix":"Button Flavor Text"
}

layout = {
    # "category": {
    #     "Button Label" : "prefix",
    # },
    "Players": {
        "Jellyfin" : "jellyfin",
        "Kavita" : "kavita",
        "Navidrome" : "navidrome"
    },
    "Requesters": {
        "Jellyseerr" : "jellyseerr",
        "Sonarr" : "sonarr",
        "Radarr" : "radarr",
        "Readarr" : "readarr",
        "Lidarr" : "lidarr",
        "Bazarr" : "bazarr",
        "YouTube-DL":"youtubedl"
    },
    "Torrents": {
        "Qbittorrent" : "qbittorrent",
        "Jackett" : "jackett",
        "Nzbhydra" : "nzbhydra",
    },
    "File Management": {
        "File Browser" : "filebrowser",
        "FileBot": "filebot",
        "MusicBrainz Picard": "picard",
    },
    "Services": {
        "HomeAssistant": "homeassistant",
        "AdGuard": "adguard",
        "IT-Tools": "it-tools",
    },
    "Admin": {
        "Traefik Dashboard": "traefik",
        "Portainer": "portainer",
        "WhatsUp":"whatsup",
    }
}