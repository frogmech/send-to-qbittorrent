# Send to qBittorrent

This extension integrates with your qBittorrent client via the WebUI API, allowing you to quickly add torrent and magnet links. It features a user-friendly interface to configure your API credentials.

## Usage:

Click on the extension's icon to open the config menu and enter your API credentials. Be sure to select the correct scheme **(HTTP/HTTPS)** and then click **"Save Credentials"**. Now you can right click any magnet/torrent link, press **"Send to qBittorrent"**, and the torrent will automatically start downloading. If the link is not a magnet link, it must be a direct link to the torrent file (URL should end in .torrent).

### IMPORTANT:
You **must** disable Cross-Site Request Forgery (CSRF) protection in qBittorrent for the API calls to work properly. You can either disable it manually in your qBittorrent settings or use the **"Disable CSRF"** button in the extension's UI after entering your API credentials.

# [Click to install](https://addons.mozilla.org/firefox/downloads/file/4435537/send_to_qbittorrent-1.0.xpi)

# [Download from addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/send-to-qbittorrent/)
