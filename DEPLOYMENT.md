1) Follow the steps outlined in https://docs.mainsail.xyz/setup/getting-started/manual-setup, install and set up Klipper, then Moonraker, but not Mainsail. Test the connection using http://localhost:7125/printer/status to ensure that Klipper and Moonraker are interfacing correctly.

2) CD into /home/gohrhyyan/repos Clone https://github.com/gohrhyyan/ic-designstudy-groupproj

3) sudo apt update, sudo apt install nginx

4) Insert an NGINX configuration file for web UI:

sudo nano /etc/nginx/sites-available/printer                                      
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;   # Catch-all

    location / {
    root /home/gohrhyyan/repos/ic-designstudy-groupproj/web-ui/dist;
    try_files $uri $uri/ /index.html;
    allow all;
    }

# Moonraker API proxy - accepting localhost & LAN IPs
    location /api {
        allow 127.0.0.1;
        allow 192.168.0.0/16;  # Common LAN IP range
        allow 10.0.0.0/8;      # Another common LAN IP range
        deny all;              # Deny all other IPs

        proxy_pass http://127.0.0.1:7125/api;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /websocket {
        allow 127.0.0.1;
        allow 192.168.0.0/16;
        allow 10.0.0.0/8;
        deny all;

        proxy_pass http://127.0.0.1:7125/websocket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
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