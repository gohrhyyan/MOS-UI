![image](https://github.com/user-attachments/assets/96bd17d9-3039-4a38-a935-41a04bb27e19)

# ic-designstudy-groupproj

DEPLOYMENT STEPS
Install Raspberry PI OS 64bit lite, ensure that username is "pi"

1) Follow the steps outlined in https://docs.mainsail.xyz/setup/getting-started/manual-setup, install and set up Klipper, then Moonraker, but not Mainsail. Test the connection using http://localhost:7125/printer/status to ensure that Klipper and Moonraker are interfacing correctly.

install dependancies
```
sudo apt install python3-virtualenv python3-dev python3-dev libffi-dev build-essential libncurses-dev avrdude gcc-avr binutils-avr avr-libc stm32flash dfu-util libnewlib-arm-none-eabi gcc-arm-none-eabi binutils-arm-none-eabi libusb-1.0-0 libusb-1.0-0-dev
```

clone klipper
```
cd ~
git clone https://github.com/KevinOConnor/klipper
```

initialize the python venv and install python dependancies
```
cd ~
virtualenv -p python3 ./klippy-env
./klippy-env/bin/pip install -r ./klipper/scripts/klippy-requirements.txt
```

exit the python venv
```
deactivate
```

configure the startup services
```
mkdir ~/printer_data/
mkdir ~/printer_data/config
mkdir ~/printer_data/logs
mkdir ~/printer_data/gcodes
mkdir ~/printer_data/systemd
mkdir ~/printer_data/comms
touch ~/printer_data/config/printer.cfg
```

create a service for klipper
```
sudo nano /etc/systemd/system/klipper.service
```

Fill in this config 
```
[Unit]
Description=Klipper 3D Printer Firmware SV1
Documentation=https://www.klipper3d.org/
After=network-online.target
Wants=udev.target

[Install]
WantedBy=multi-user.target

[Service]
Type=simple
User=pi
RemainAfterExit=yes
WorkingDirectory=/home/pi/klipper
EnvironmentFile=/home/pi/printer_data/systemd/klipper.env
ExecStart=/home/pi/klippy-env/bin/python $KLIPPER_ARGS
Restart=always
RestartSec=10
```
Save the file with CTRL+O and close the editor with CTRL+X.

create an Klipper environment file in printer_data:
```
nano ~/printer_data/systemd/klipper.env
```
fill in these lines
```
KLIPPER_ARGS="/home/pi/klipper/klippy/klippy.py /home/pi/printer_data/config/printer.cfg -l /home/pi/printer_data/logs/klippy.log -I /home/pi/printer_data/comms/klippy.serial -a /home/pi/printer_data/comms/klippy.sock"
```
Save the file with CTRL+O and close the editor with CTRL+X.

start klipper 
```
sudo systemctl enable klipper.service
```

install Moonraker dependencies
```
sudo apt install python3-virtualenv python3-dev libopenjp2-7 python3-libgpiod curl libcurl4-openssl-dev libssl-dev liblmdb-dev libsodium-dev zlib1g-dev libjpeg-dev packagekit wireless-tools
```

clone Moonraker
```
cd ~
git clone https://github.com/Arksine/moonraker.git
```

initialize the python virtual environment and install the python dependencies:
```
cd ~
virtualenv -p python3 ./moonraker-env
./moonraker-env/bin/pip install -r ./moonraker/scripts/moonraker-requirements.txt
```

configure moonraker
```
nano ~/printer_data/config/moonraker.conf
```
use this for moonraker configuration:
```
[server]
host: 0.0.0.0
port: 7125
# The maximum size allowed for a file upload (in MiB).  Default 1024 MiB
max_upload_size: 1024
# Path to klippy Unix Domain Socket
klippy_uds_address: ~/printer_data/comms/klippy.sock

[file_manager]
# post processing for object cancel. Not recommended for low resource SBCs such as a Pi Zero. Default False
enable_object_processing: False
queue_gcode_uploads: True

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

```
Create the Moonraker startup service
```
sudo nano /etc/systemd/system/moonraker.service
```
Fill in:
```
#Systemd moonraker Service

[Unit]
Description=API Server for Klipper SV1
Requires=network-online.target
After=network-online.target

[Install]
WantedBy=multi-user.target

[Service]
Type=simple
User=pi
SupplementaryGroups=moonraker-admin
RemainAfterExit=yes
WorkingDirectory=/home/pi/moonraker
EnvironmentFile=/home/pi/printer_data/systemd/moonraker.env
ExecStart=/home/pi/moonraker-env/bin/python $MOONRAKER_ARGS
Restart=always
RestartSec=10
```
Save the file with CTRL+O and close the editor with CTRL+X.

Create a Moonraker Env File:
```
nano ~/printer_data/systemd/moonraker.env
```
Fill in 
```
MOONRAKER_ARGS="/home/pi/moonraker/moonraker/moonraker.py -d /home/pi/printer_data"
```

Enable Moonraker Service:
```
sudo systemctl enable moonraker.service
```

Add Moonraker Policy Rules:
```
./moonraker/scripts/set-policykit-rules.sh
```


2) PULL OUR REPO
```
cd ~
git clone https://github.com/gohrhyyan/ic-designstudy-groupproj
```

3) PULL Mainsail
```
cd
mkdir mainsail
cd mainsail
wget -q -O mainsail.zip https://github.com/mainsail-crew/mainsail/releases/latest/download/mainsail.zip && unzip mainsail.zip && rm mainsail.zip
```

5) INSTALL NGINX
```
cd ~
sudo apt update
sudo apt install nginx
```

6) Insert an NGINX configuration file for web UI:
ENTER THESE COMMMANDS


```
sudo touch /etc/nginx/conf.d/upstreams.conf
```

```
sudo nano /etc/nginx/conf.d/upstreams.conf
```

```
# /etc/nginx/conf.d/upstreams.conf

upstream apiserver {
    ip_hash;
    server 127.0.0.1:7125;
}

upstream mjpgstreamer1 {
    ip_hash;
    server 127.0.0.1:8080;
}

upstream mjpgstreamer2 {
    ip_hash;
    server 127.0.0.1:8081;
}

upstream mjpgstreamer3 {
    ip_hash;
    server 127.0.0.1:8082;
}

upstream mjpgstreamer4 {
    ip_hash;
    server 127.0.0.1:8083;
}
```

```
sudo touch /etc/nginx/conf.d/common_vars.conf
```


```
sudo nano /etc/nginx/conf.d/common_vars.conf
```
PASTE:

```
# /etc/nginx/conf.d/common_vars.conf

map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}
```

```
sudo touch /etc/nginx/sites-available/printer
```

```
sudo nano /etc/nginx/sites-available/printer                           
```
PASTE:
```
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;   # Catch-all
    client_max_body_size 100M;

    location / {
        root /home/pi/ic-designstudy-groupproj/web-ui/dist;
        try_files $uri $uri/ /index.html;
        allow all;
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

server {
    listen 8443 default_server;
    listen [::]:8443 default_server;
    server_name _;   # Catch-all
    client_max_body_size 100M;

    # Mainsail UI path
    location / {
        root /home/pi/mainsail;
        index index.html;
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
```


```
sudo rm /etc/nginx/sites-enabled/default                           
```


7) give NGINX perms
```
# Add www-data to pi group (allows read access)
sudo usermod -a -G pi www-data

# Set group ownership
sudo chown -R pi:www-data /home/pi/ic-designstudy-groupproj

# Set directory permissions (755 for directories)
sudo find /home/pi/ic-designstudy-groupproj -type d -exec chmod 755 {} \;

# Set file permissions (644 for files)
sudo find /home/pi/ic-designstudy-groupproj -type f -exec chmod 644 {} \;

# Set permissions for Mainsail directory
sudo chown -R pi:www-data /home/pi/mainsail
sudo find /home/pi/mainsail -type d -exec chmod 755 {} \;
sudo find /home/pi/mainsail -type f -exec chmod 644 {} \;
```

8) Enable the site
```
sudo ln -s /etc/nginx/sites-available/printer /etc/nginx/sites-enabled/
sudo nginx -t # Test configuration
sudo systemctl restart nginx
```
