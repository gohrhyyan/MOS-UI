1) Follow the steps outlined in https://docs.mainsail.xyz/setup/getting-started/manual-setup, install and set up Klipper, then Moonraker, but not Mainsail. Test the connection using http://localhost:7125/printer/status to ensure that Klipper and Moonraker are interfacing correctly.

use this for moonraker configuration:
cd printer_data
cd config
sudo nano moonraker.conf

[server]
host: 127.0.0.1
port: 7125
# The maximum size allowed for a file upload (in MiB).  Default 1024 MiB
max_upload_size: 1024
# Path to klippy Unix Domain Socket
klippy_uds_address: /tmp/klippy_uds

[file_manager]
# post processing for object cancel. Not recommended for low resource SBCs such as a Pi Zero. Default False
enable_object_processing: False
queue_gcode_uploads: True
start_print_on_upload: False

[authorization]
cors_domains:
    *://localhost
    *://localhost:*
    *://127.0.0.1
    *://127.0.0.1:*
    
trusted_clients:
    127.0.0.1

# enables partial support of Octoprint API
[octoprint_compat]

# enables moonraker to track and store print history.
[history]

# this enables moonraker announcements for mainsail
[announcements]
subscriptions:
    mainsail

# this enables moonraker's update manager
[update_manager]
refresh_interval: 168
enable_auto_refresh: True

[update_manager mainsail]
type: web
channel: stable
repo: mainsail-crew/mainsail
path: ~/mainsail

[machine]
provider: none
validate_service: False

2) CD into /home/gohrhyyan/repos Clone https://github.com/gohrhyyan/ic-designstudy-groupproj

3) sudo apt update, sudo apt install nginx

4) Insert an NGINX configuration file for web UI:

sudo nano /etc/nginx/sites-available/printer                                      
  GNU nano 7.2                                  /etc/nginx/sites-available/printer                                            

server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;   # Catch-all
    client_max_body_size 100M;

    # Serve the static UI for all requests
    location / {
        root /home/gohrhyyan/repos/ic-designstudy-groupproj/web-ui/dist;
        try_files $uri $uri/ /index.html;
    }

    # Proxy for Moonraker API calls
    location /server {
        proxy_pass http://127.0.0.1:7125/server;
        proxy_set_header Host $http_host;  # Keep the original Host header
        proxy_set_header X-Real-IP 127.0.0.1;  # Mask the client IP
        proxy_set_header X-Forwarded-For 127.0.0.1;  # Mask the X-Forwarded-For header
        proxy_set_header X-Forwarded-Proto $scheme;  # Keep the original protocol (HTTP or HTTPS)
    }

    location /printer {
        proxy_pass http://127.0.0.1:7125/printer;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP 127.0.0.1;
        proxy_set_header X-Forwarded-For 127.0.0.1;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://127.0.0.1:7125/api;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP 127.0.0.1;
        proxy_set_header X-Forwarded-For 127.0.0.1;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /debug {
        proxy_pass http://127.0.0.1:7125/debug;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP 127.0.0.1;
        proxy_set_header X-Forwarded-For 127.0.0.1;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /websocket {
        proxy_pass http://127.0.0.1:7125/websocket;
        proxy_http_version 1.1;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP 127.0.0.1;
        proxy_set_header X-Forwarded-For 127.0.0.1;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }

    location /machine {
        proxy_pass http://127.0.0.1:7125/machine;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP 127.0.0.1;
        proxy_set_header X-Forwarded-For 127.0.0.1;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}


5) give NGINX perms
sudo usermod -a -G gohrhyyan www-data

# Set group ownership
sudo chown -R gohrhyyan:gohrhyyan /home/gohrhyyan/repos/ic-designstudy-groupproj

# Set directory permissions (755 for directories)
sudo find /home/gohrhyyan/repos/ic-designstudy-groupproj -type d -exec chmod 755 {} \;

# Set file permissions (644 for files)
sudo find /home/gohrhyyan/repos/ic-designstudy-groupproj -type f -exec chmod 644 {} \;


6) Enable the site
sudo ln -s /etc/nginx/sites-available/printer /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default # Remove default site
sudo nginx -t # Test configuration
sudo systemctl restart nginx