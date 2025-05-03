# ic-designstudy-groupproj DEPLOYMENT STEPS
# Flash klipper firmware to Mainboard.
Unplug everything from mainboard and apply 2 jumpers as shown:
Attach two jumpers as shown:
![photo_2025-03-25_00-12-57](https://github.com/user-attachments/assets/2ff443e4-999e-4d36-a958-6f5ada28cfc0)

Plug Mainboard into a PC via usb-c cable. a removable USB drive should appear. 
Copy Klipper-UART.uf2 into the drive. It should disappear and re-appear. This means that the firmware flash has been successful.
![image](https://github.com/user-attachments/assets/6ae23c41-8e7d-4d5a-9021-7d8faf67aaa8)




# PI OS installation
Install Bonjour Print Services for Windows: needed to resolve the .local host adress of the Raspberry Pi. The program can be downloaded from:
 https://support.apple.com/en-us/106380
Install MobaXTerm, or your preferred SSH client.
 https://mobaxterm.mobatek.net/
Install Raspberry PI OS 32bit lite on an SD card using the raspberry pi imager:
 - https://www.raspberrypi.com/software/
 - ensure that hostname is raspberrypi
 - ensure that username is "pi", and that SSH is enabled.
 - For the preliminary set-up, configure the OS to connect to a hotspot/local wifi, this will enable us to SSH into the Pi before USB SSH is configured.

# SSH into the Pi using the hostname raspberrypi.local
1. 
`sudo nano /boot/firmware/config.txt` and add these lines to the end of the file
```
[all]
dtoverlay=dwc2,dr_mode=peripheral
dtoverlay=pi3-miniuart-bt
dtoverlay=disable-bt

```
delete everthing under, and including these two headers
```
[CM5]
[CM4]
```
these contain conflicting `dtoverlay` and `otg_mode` configurations that will cause SSH over USB to FAIL.

2.
`sudo nano /boot/firmware/cmdline.txt` and edit the file.

after `rootwait` add a space and insert:
```modules-load=dwc2,g_ether g_ether.dev_addr=12:22:33:44:55:6 g_ether.host_addr=16:22:33:44:55:66```
Replace the MAC addresses as required.
Delete `console=serial0,115200` so that the file starts with `console=tty1`
The contents of /boot/firmware/cmdline.txt must be one a single line.
On next boot your OS will use the dwc2 driver in the correct mode to support operation as a USB 
gadget.

4.
Use udev rules to enable the usb-ethernet connection when the cable is connected to a computer.
```bash
sudo nano /etc/udev/rules.d/80-usb0-up.rules
```
Add this line:
```
ACTION=="add", SUBSYSTEM=="net", KERNEL=="usb0", RUN+="/sbin/ifconfig usb0 up"
```
Reload udev rules:
```bash
sudo udevadm control --reload-rules
```
This udev solution brings the USB interface up whenever it's detected, not just at boot time.

# On your host computer:
Windows:
Plug in the Pi and check device manager, you should see a new device that looks like this
![image](https://github.com/user-attachments/assets/1822bc8d-3cd3-4526-bbf3-036f8a1e7b1c)

Install Windows RNDIS Driver:
This step is required, if your Pi only shows up as a COM Port in device manager. Driver and shortened instructions are included here for convenience.
Credit and detailed help: https://github.com/dukelec/mbrush/tree/master/doc/win_driver
![image](https://github.com/user-attachments/assets/48397843-d4da-45f0-aba6-2e0a60246fcd)
Right click the USB Serial Device at COM port under the PORTS & LPT and select “Update Driver Software”.
![image](https://github.com/user-attachments/assets/f690b545-ad89-47e0-8bf8-87f4cbbb9af0)
Select ‘Browse my computer for driver software’.
![image](https://github.com/user-attachments/assets/4db28088-5be7-44a5-a081-32b19e826edc)
Choose the location where you extracted the driver files on your PC.

Optional: share network
You can share your network connection from the Windows Host to the Raspberry Pi by going to Control Panel\Network and Internet\Network Connections. First, you need to identify the Rasbperry Pi Network Adapter by searching for USB Ethernet/RNDIS Gadget and remember the name of the adapter (you can also change it). Next, right click on the network you want to share, go to properties and then sharing.
![image](https://github.com/user-attachments/assets/3ea4b962-870d-441b-8152-6e88689f6c18)

LINUX (currently work in progress)
plug in the RPI
to validate the USB connection:
```
sudo dmesg | grep -i usb
```

```
ifconfig -a
```
This will show all the connections, usb ethernet gadgets included.
```
enx162233445566: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        ether 16:22:33:44:55:66  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```
You can see that there is a missing `inet <ip-address>` field, so connections will not work.
let's overwrite this.

use these 2 commands to change the network configuration.
```
sudo nmcli device set enx162233445566 managed yes

sudo nmcli con add con-name usb-gadget type ethernet ifname enx162233445566 ipv4.method manual ipv4.address 10.0.0.2/24

sudo nmcli connection modify usb-gadget connection.autoconnect yes
```
or
'''
sudo nmcli con up usb-gadget
'''
you'll need to do this everyime you dis/connect

running ifconfig -a should show that our device now has an ip address
```
enx162233445566: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        inet 10.0.0.2  netmask 255.255.255.0  broadcast 10.0.0.255
        inet6 fe80::db6c:355a:a2bc:e88e  prefixlen 64  scopeid 0x20<link>
        ether 16:22:33:44:55:66  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 16 overruns 0  carrier 0  collisions 0
```
You should now be able to use the command ssh to connect to the pi over USB

# Pi environment setup
You can use `sudo raspi-config` to access frequently used settings. wifi etc.
Some other handy resources:
1) We're essentially following the steps outlined in https://docs.mainsail.xyz/setup/getting-started/manual-setup, with some key customisations.
2) You can test the connection using http://localhost:7125/printer/status to ensure that Klipper and Moonraker are interfacing correctly.
3) Helpful videos for installing Klipper: https://youtu.be/nI8o6yQRxpY?si=SBUc8BNKDtQh0sdx
   https://www.youtube.com/watch?v=yINdrywvaEU&t=679s
4) Helpful video for configuring GPIO for Klipper on the RPI: https://www.youtube.com/watch?v=ZOL-motmkos
5) Good starting point for klipper config https://klipper.discourse.group/t/delta-printer-w-btt-skr-pico-v1-0-board/18798

install dependancies
```
sudo apt update
sudo apt install git
sudo apt install gh
```

log in to github and authenticate using:
github.com, HTTPS, and a authentication token- provide the token with read-only access to this repo.
`gh auth login`
![image](https://github.com/user-attachments/assets/fd094db5-7385-4697-86a0-9c70bdbc96dd)


clone klipper
```
cd ~
git clone https://github.com/KevinOConnor/klipper
sudo apt install python3-virtualenv python3-dev python3-dev libffi-dev build-essential libncurses-dev avrdude gcc-avr binutils-avr avr-libc stm32flash dfu-util libnewlib-arm-none-eabi gcc-arm-none-eabi binutils-arm-none-eabi libusb-1.0-0 libusb-1.0-0-dev
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
touch ~/printer_data/config/mainsail.cfg
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

Apply klipper configuration
Objective: connect actuonix linear actuator to BTT Pico running Klipper,
Be able to control forward and reverse, set limits, power up and down the actuator, and read limits through the Moonraker API.
Method:
1) Reassign Hotend 24V GPIO23 to provide 24v out for Linear Actutator.
2) Step 24v down to 12v efficiently via buck converter
3) Reassign 5v GPIO 24 and GPIO16 to the forward and reverse commands. 10,01 and 00 for off
4) Reassign the Bed Therrmistor ADC input GPIO26 to provide constant 3.3v output (reference voltage)
5) Reassign the Hotend Termistor ADC input GPIO27 to read the Potentiometer wiper   
6) Close the circuit by connecting the potentiometer to ground on one of the thermstor inputs
7) Translate the resistance reading to an Actuator extension % using resistance -> temperature map in the Klipper config. number will be reported in degrees celcius from 0-100. actually, it's a map to reporting the extension 0% to 100%. 
8) We can set the limits of the plunger's motion by setting the min_temp and max_temp in the config file. This will be done by pulling the file, looking for min_temp and max_temp using a regex, editing the values as a string and reuploading the file. By querying the config file via moonraker, we then know the limits of the syringe in terms of % extension.
9) By writing the syringe capacity to a new file, and knowing the relative positions of the syringe plunger to a new file queryable by moonraker, we'll then know how much extrusion liquid, in ml, there is left in the syringe.

L16 Spec: Option P
24v PSU, 12v Buck converter
RP2040:

ADC Inputs:
GPIO29/ADC3 - USED FOR Steppers
GPIO28/ADC2 - Servos (available)
GPIO27/ADC1 -THB Heat Bed Thermistor (available)
GPIO26/ADC0 -TH0 Hotend Thermistor (available)
`sudo nano /printer_data/config/printer.cfg`
PASTE
```
# This file contains common pin mappings for the BIGTREETECH SKR Pico V1.0
# To use this config, the firmware should be compiled for the RP2040 with
# USB communication.

# The "make flash" command does not work on the SKR Pico V1.0. Instead,
# after running "make", copy the generated "out/klipper.uf2" file
# to the mass storage device in RP2040 boot mode

# See docs/Config_Reference.md for a description of parameters.

[mcu]
serial: /dev/ttyAMA0
restart_method: command

[virtual_sdcard]
path: /home/pi/printer_data/gcodes
on_error_gcode: CANCEL_PRINT

[exclude_object]

[endstop_phase]

[include mainsail.cfg]

[printer]
kinematics: delta
max_velocity: 300
max_accel: 6000
max_z_velocity: 300
delta_radius: 146.83
print_radius: 80.0
minimum_z_position: -5.0
square_corner_velocity: 5.0

[delta_calibrate]
radius: 75
speed: 20
horizontal_move_z: 5

[stepper_a]
step_pin: gpio11
dir_pin: gpio10
enable_pin: !gpio12
microsteps: 256
rotation_distance: 32
endstop_pin: ^gpio4
position_endstop: 259.428422
homing_speed: 5
arm_length: 241.713985

[tmc2209 stepper_a]
uart_pin: gpio9
tx_pin: gpio8
uart_address: 0
run_current: 0.650
stealthchop_threshold: 999999

[stepper_b]
step_pin: gpio6
dir_pin: gpio5
enable_pin: !gpio7
microsteps: 256
rotation_distance: 32
endstop_pin: ^gpio3
position_endstop: 258.604547
homing_speed: 5
arm_length: 241.713985

[tmc2209 stepper_b]
uart_pin: gpio9
tx_pin: gpio8
uart_address: 2
run_current: 0.650
stealthchop_threshold: 999999

[stepper_c]
step_pin: gpio14
dir_pin: !gpio13
enable_pin: !gpio15
microsteps: 256
rotation_distance: 32
endstop_pin: ^gpio25
position_endstop: 259.336938
homing_speed: 5
arm_length: 241.713985

[tmc2209 stepper_c]
uart_pin: gpio9
tx_pin: gpio8
uart_address: 3
run_current: 0.650
stealthchop_threshold: 999999

[extruder]
step_pin: gpio19
dir_pin: gpio28
enable_pin: !gpio2
microsteps: 1
rotation_distance: 8
nozzle_diameter: 0.4
filament_diameter: 1.75
heater_pin: gpio23
sensor_type: CUSTOM_SENS
sensor_pin: gpio27
control: pid
pid_Kp: 22.2
pid_Ki: 1.08
pid_Kd: 114
min_temp: -273
max_temp: 999
min_extrude_temp: -273
max_extrude_cross_section:2

[tmc2209 extruder]
uart_pin: gpio9
tx_pin: gpio8
uart_address: 1
run_current: 0.2
hold_current: 0.00001
#stealthchop_threshold: 999999

[adc_temperature CUSTOM_SENS]
temperature1:-273
resistance1:0
temperature2:100
resistance2:99999999999

[delayed_gcode bed_mesh_init]
initial_duration: .01
gcode: BED_MESH_PROFILE LOAD=default
  
[bed_mesh]
speed: 20
horizontal_move_z: 5
mesh_radius: 80
mesh_origin: 0, 0
round_probe_count: 5
mesh_pps: 2, 2
algorithm: lagrange
move_check_distance: 5
split_delta_z: .025
fade_start: 1
fade_end: 10
fade_target: 0


[firmware_retraction]
retract_length: 2.5
#   The length of filament (in mm) to retract when G10 is activated,
#   and to unretract when G11 is activated (but see
#   unretract_extra_length below). The default is 0 mm.
retract_speed: 40
#   The speed of retraction, in mm/s. The default is 20 mm/s.
unretract_extra_length: 0
#   The length (in mm) of *additional* filament to add when
#   unretracting.
unretract_speed: 40
#   The speed of unretraction, in mm/s. The default is 10 mm/s.

```

Apply mainsail configuration
`sudo nano /printer_data/config/mainsail.cfg`
PASTE
```
## Client klipper macro definitions
##
## Copyright (C) 2022 Alex Zellner <alexander.zellner@googlemail.com>
##
## This file may be distributed under the terms of the GNU GPLv3 license
##
## !!! This file is read-only. Maybe the used editor indicates that. !!!
##
## Customization:
##   1) copy the gcode_macro _CLIENT_VARIABLE (see below) to your printer.cfg
##   2) remove the comment mark (#) from all lines
##   3) change any value in there to your needs
##
## Use the PAUSE macro direct in your M600:
##  e.g. with a different park position front left and a minimal height of 50 
##    [gcode_macro M600]
##    description: Filament change
##    gcode: PAUSE X=10 Y=10 Z_MIN=50
##  Z_MIN will park the toolhead at a minimum of 50 mm above to bed to make it easier for you to swap filament.
##
## Client variable macro for your printer.cfg
#[gcode_macro _CLIENT_VARIABLE]
#variable_use_custom_pos   : False ; use custom park coordinates for x,y [True/False]
#variable_custom_park_x    : 0.0   ; custom x position; value must be within your defined min and max of X
#variable_custom_park_y    : 0.0   ; custom y position; value must be within your defined min and max of Y
#variable_custom_park_dz   : 2.0   ; custom dz value; the value in mm to lift the nozzle when move to park position
#variable_retract          : 1.0   ; the value to retract while PAUSE
#variable_cancel_retract   : 5.0   ; the value to retract while CANCEL_PRINT
#variable_speed_retract    : 35.0  ; retract speed in mm/s
#variable_unretract        : 1.0   ; the value to unretract while RESUME
#variable_speed_unretract  : 35.0  ; unretract speed in mm/s
#variable_speed_hop        : 15.0  ; z move speed in mm/s
#variable_speed_move       : 100.0 ; move speed in mm/s
#variable_park_at_cancel   : False ; allow to move the toolhead to park while execute CANCEL_PRINT [True/False]
#variable_park_at_cancel_x : None  ; different park position during CANCEL_PRINT [None/Position as Float]; park_at_cancel must be True
#variable_park_at_cancel_y : None  ; different park position during CANCEL_PRINT [None/Position as Float]; park_at_cancel must be True
## !!! Caution [firmware_retraction] must be defined in the printer.cfg if you set use_fw_retract: True !!!
#variable_use_fw_retract   : False ; use fw_retraction instead of the manual version [True/False]
#variable_idle_timeout     : 0     ; time in sec until idle_timeout kicks in. Value 0 means that no value will be set or restored
#variable_runout_sensor    : ""    ; If a sensor is defined, it will be used to cancel the execution of RESUME in case no filament is detected.
##                                   Specify the config name of the runout sensor e.g "filament_switch_sensor runout". Hint use the same as in your printer.cfg
## !!! Custom macros, please use with care and review the section of the corresponding macro.
## These macros are for simple operations like setting a status LED. Please make sure your macro does not interfere with the basic macro functions.
## Only  single line commands are supported, please create a macro if you need more than one command.
#variable_user_pause_macro : ""    ; Everything inside the "" will be executed after the klipper base pause (PAUSE_BASE) function
#variable_user_resume_macro: ""    ; Everything inside the "" will be executed before the klipper base resume (RESUME_BASE) function
#variable_user_cancel_macro: ""    ; Everything inside the "" will be executed before the klipper base cancel (CANCEL_PRINT_BASE) function
#gcode:

[virtual_sdcard]
path: ~/printer_data/gcodes
on_error_gcode: CANCEL_PRINT

[pause_resume]
#recover_velocity: 50.
#   When capture/restore is enabled, the speed at which to return to
#   the captured position (in mm/s). Default is 50.0 mm/s.

[display_status]

[respond]

[gcode_macro CANCEL_PRINT]
description: Cancel the actual running print
rename_existing: CANCEL_PRINT_BASE
gcode:
  ##### get user parameters or use default #####
  {% set client = printer['gcode_macro _CLIENT_VARIABLE']|default({}) %}
  {% set allow_park = client.park_at_cancel|default(false)|lower == 'true' %}
  {% set retract = client.cancel_retract|default(5.0)|abs %}
  ##### define park position #####
  {% set park_x = "" if (client.park_at_cancel_x|default(none) is none)
            else "X=" ~ client.park_at_cancel_x %}
  {% set park_y = "" if (client.park_at_cancel_y|default(none) is none)
            else "Y=" ~ client.park_at_cancel_y %}
  {% set custom_park = park_x|length > 0 or park_y|length > 0 %}
  ##### end of definitions #####
  # restore idle_timeout time if needed
  {% if printer['gcode_macro RESUME'].restore_idle_timeout > 0 %}
    SET_IDLE_TIMEOUT TIMEOUT={printer['gcode_macro RESUME'].restore_idle_timeout}
  {% endif %}
  {% if (custom_park or not printer.pause_resume.is_paused) and allow_park %} _TOOLHEAD_PARK_PAUSE_CANCEL {park_x} {park_y} {% endif %}
  _CLIENT_RETRACT LENGTH={retract}
  TURN_OFF_HEATERS
  M106 S0
  {client.user_cancel_macro|default("")}
  SET_GCODE_VARIABLE MACRO=RESUME VARIABLE=idle_state VALUE=False
  # clear pause_next_layer and pause_at_layer as preparation for next print
  SET_PAUSE_NEXT_LAYER ENABLE=0
  SET_PAUSE_AT_LAYER ENABLE=0 LAYER=0
  CANCEL_PRINT_BASE

[gcode_macro PAUSE]
description: Pause the actual running print
rename_existing: PAUSE_BASE
gcode:
  ##### get user parameters or use default ##### 
  {% set client = printer['gcode_macro _CLIENT_VARIABLE']|default({}) %}
  {% set idle_timeout = client.idle_timeout|default(0) %}
  {% set temp = printer[printer.toolhead.extruder].target if printer.toolhead.extruder != '' else 0 %}
  {% set restore = False if printer.toolhead.extruder == ''
              else True  if params.RESTORE|default(1)|int == 1 else False %}
  ##### end of definitions #####
  SET_GCODE_VARIABLE MACRO=RESUME VARIABLE=last_extruder_temp VALUE="{{'restore': restore, 'temp': temp}}"
  # set a new idle_timeout value
  {% if idle_timeout > 0 %}
    SET_GCODE_VARIABLE MACRO=RESUME VARIABLE=restore_idle_timeout VALUE={printer.configfile.settings.idle_timeout.timeout}
    SET_IDLE_TIMEOUT TIMEOUT={idle_timeout}
  {% endif %}
  PAUSE_BASE
  {client.user_pause_macro|default("")}
  _TOOLHEAD_PARK_PAUSE_CANCEL {rawparams}

[gcode_macro RESUME]
description: Resume the actual running print
rename_existing: RESUME_BASE
variable_last_extruder_temp: {'restore': False, 'temp': 0}
variable_restore_idle_timeout: 0
variable_idle_state: False
gcode:
  ##### get user parameters or use default #####
  {% set client = printer['gcode_macro _CLIENT_VARIABLE']|default({}) %}
  {% set velocity = printer.configfile.settings.pause_resume.recover_velocity %}
  {% set sp_move = client.speed_move|default(velocity) %}
  {% set runout_resume = True if client.runout_sensor|default("") == ""     # no runout
                    else True if not printer[client.runout_sensor].enabled  # sensor is disabled
                    else printer[client.runout_sensor].filament_detected %} # sensor status
  {% set can_extrude = True if printer.toolhead.extruder == ''           # no extruder defined in config
                  else printer[printer.toolhead.extruder].can_extrude %} # status of active extruder
  {% set do_resume = False %}
  {% set prompt_txt = [] %}
  ##### end of definitions #####
  #### Printer comming from timeout idle state ####
  {% if printer.idle_timeout.state|upper == "IDLE" or idle_state %}
    SET_GCODE_VARIABLE MACRO=RESUME VARIABLE=idle_state VALUE=False
    {% if last_extruder_temp.restore %}
      # we need to use the unicode (\u00B0) for the ° as py2 env's would throw an error otherwise 
      RESPOND TYPE=echo MSG='{"Restoring \"%s\" temperature to %3.1f\u00B0C, this may take some time" % (printer.toolhead.extruder, last_extruder_temp.temp) }'
      M109 S{last_extruder_temp.temp}
      {% set do_resume = True %}
    {% elif can_extrude %}
      {% set do_resume = True %}
    {% else %} 
      RESPOND TYPE=error MSG='{"Resume aborted !!! \"%s\" not hot enough, please heat up again and press RESUME" % printer.toolhead.extruder}'
      {% set _d = prompt_txt.append("\"%s\" not hot enough, please heat up again and press RESUME" % printer.toolhead.extruder) %}
    {% endif %}
  #### Printer comming out of regular PAUSE state ####
  {% elif can_extrude %}
    {% set do_resume = True %}
  {% else %}
    RESPOND TYPE=error MSG='{"Resume aborted !!! \"%s\" not hot enough, please heat up again and press RESUME" % printer.toolhead.extruder}'
    {% set _d = prompt_txt.append("\"%s\" not hot enough, please heat up again and press RESUME" % printer.toolhead.extruder) %}
  {% endif %}
  {% if runout_resume %}
    {% if do_resume %}
      {% if restore_idle_timeout > 0 %} SET_IDLE_TIMEOUT TIMEOUT={restore_idle_timeout} {% endif %} # restore idle_timeout time
      {client.user_resume_macro|default("")}
      _CLIENT_EXTRUDE
      RESUME_BASE VELOCITY={params.VELOCITY|default(sp_move)}
    {% endif %}
  {% else %}
    RESPOND TYPE=error MSG='{"Resume aborted !!! \"%s\" detects no filament, please load filament and press RESUME" % (client.runout_sensor.split(" "))[1]}'
    {% set _d = prompt_txt.append("\"%s\" detects no filament, please load filament and press RESUME" % (client.runout_sensor.split(" "))[1]) %}
  {% endif %}
  ##### Generate User Information box in case of abort #####
  {% if not (runout_resume and do_resume) %} 
    RESPOND TYPE=command MSG="action:prompt_begin RESUME aborted !!!"
    {% for element in prompt_txt %}
      RESPOND TYPE=command MSG='{"action:prompt_text %s" % element}' 
    {% endfor %}
    RESPOND TYPE=command MSG="action:prompt_footer_button Ok|RESPOND TYPE=command MSG=action:prompt_end|info"
    RESPOND TYPE=command MSG="action:prompt_show"
  {% endif %}
  
# Usage: SET_PAUSE_NEXT_LAYER [ENABLE=[0|1]] [MACRO=<name>]
[gcode_macro SET_PAUSE_NEXT_LAYER]
description: Enable a pause if the next layer is reached
gcode:
  {% set pause_next_layer = printer['gcode_macro SET_PRINT_STATS_INFO'].pause_next_layer %}
  {% set ENABLE = params.ENABLE|default(1)|int != 0 %}
  {% set MACRO = params.MACRO|default(pause_next_layer.call, True) %}
  SET_GCODE_VARIABLE MACRO=SET_PRINT_STATS_INFO VARIABLE=pause_next_layer VALUE="{{ 'enable': ENABLE, 'call': MACRO }}"

# Usage: SET_PAUSE_AT_LAYER [ENABLE=[0|1]] [LAYER=<number>] [MACRO=<name>]
[gcode_macro SET_PAUSE_AT_LAYER]
description: Enable/disable a pause if a given layer number is reached
gcode:
  {% set pause_at_layer = printer['gcode_macro SET_PRINT_STATS_INFO'].pause_at_layer %}
  {% set ENABLE = params.ENABLE|int != 0 if params.ENABLE is defined
             else params.LAYER is defined %}
  {% set LAYER = params.LAYER|default(pause_at_layer.layer)|int %}
  {% set MACRO = params.MACRO|default(pause_at_layer.call, True) %}
  SET_GCODE_VARIABLE MACRO=SET_PRINT_STATS_INFO VARIABLE=pause_at_layer VALUE="{{ 'enable': ENABLE, 'layer': LAYER, 'call': MACRO }}"

# Usage: SET_PRINT_STATS_INFO [TOTAL_LAYER=<total_layer_count>] [CURRENT_LAYER= <current_layer>]
[gcode_macro SET_PRINT_STATS_INFO]
rename_existing: SET_PRINT_STATS_INFO_BASE
description: Overwrite, to get pause_next_layer and pause_at_layer feature
variable_pause_next_layer: { 'enable': False, 'call': "PAUSE" }
variable_pause_at_layer  : { 'enable': False, 'layer': 0, 'call': "PAUSE" }
gcode:
  {% if pause_next_layer.enable %}
    RESPOND TYPE=echo MSG='{"%s, forced by pause_next_layer" % pause_next_layer.call}'
    {pause_next_layer.call} ; execute the given gcode to pause, should be either M600 or PAUSE
    SET_PAUSE_NEXT_LAYER ENABLE=0
  {% elif pause_at_layer.enable and params.CURRENT_LAYER is defined and params.CURRENT_LAYER|int == pause_at_layer.layer %}
    RESPOND TYPE=echo MSG='{"%s, forced by pause_at_layer [%d]" % (pause_at_layer.call, pause_at_layer.layer)}'
    {pause_at_layer.call} ; execute the given gcode to pause, should be either M600 or PAUSE
    SET_PAUSE_AT_LAYER ENABLE=0
  {% endif %}
  SET_PRINT_STATS_INFO_BASE {rawparams}
  
##### internal use #####
[gcode_macro _TOOLHEAD_PARK_PAUSE_CANCEL]
description: Helper: park toolhead used in PAUSE and CANCEL_PRINT
gcode:
  ##### get user parameters or use default #####
  {% set client = printer['gcode_macro _CLIENT_VARIABLE']|default({}) %}
  {% set velocity = printer.configfile.settings.pause_resume.recover_velocity %}
  {% set use_custom     = client.use_custom_pos|default(false)|lower == 'true' %}
  {% set custom_park_x  = client.custom_park_x|default(0.0) %}
  {% set custom_park_y  = client.custom_park_y|default(0.0) %}
  {% set park_dz        = client.custom_park_dz|default(2.0)|abs %}
  {% set sp_hop         = client.speed_hop|default(15) * 60 %}
  {% set sp_move        = client.speed_move|default(velocity) * 60 %}
  ##### get config and toolhead values #####
  {% set origin    = printer.gcode_move.homing_origin %}
  {% set act       = printer.gcode_move.gcode_position %}
  {% set max       = printer.toolhead.axis_maximum %}
  {% set cone      = printer.toolhead.cone_start_z|default(max.z) %} ; height as long the toolhead can reach max and min of an delta
  {% set round_bed = True if printer.configfile.settings.printer.kinematics is in ['delta','polar','rotary_delta','winch']
                else False %}
  ##### define park position #####
  {% set z_min = params.Z_MIN|default(0)|float %}
  {% set z_park = [[(act.z + park_dz), z_min]|max, (max.z - origin.z)]|min %}
  {% set x_park = params.X       if params.X is defined
             else custom_park_x  if use_custom
             else 0.0            if round_bed
             else (max.x - 5.0) %}
  {% set y_park = params.Y       if params.Y is defined
             else custom_park_y  if use_custom
             else (max.y - 5.0)  if round_bed and z_park < cone
             else 0.0            if round_bed
             else (max.y - 5.0) %}
  ##### end of definitions #####
  _CLIENT_RETRACT
  {% if "xyz" in printer.toolhead.homed_axes %}
    G90
    G1 Z{z_park} F{sp_hop}
    G1 X{x_park} Y{y_park} F{sp_move}
    {% if not printer.gcode_move.absolute_coordinates %} G91 {% endif %}
  {% else %}
    RESPOND TYPE=echo MSG='Printer not homed'
  {% endif %}
  
[gcode_macro _CLIENT_EXTRUDE]
description: Extrudes, if the extruder is hot enough
gcode:
  ##### get user parameters or use default #####
  {% set client = printer['gcode_macro _CLIENT_VARIABLE']|default({}) %}
  {% set use_fw_retract = (client.use_fw_retract|default(false)|lower == 'true') and (printer.firmware_retraction is defined) %}
  {% set length = params.LENGTH|default(client.unretract)|default(1.0)|float %}
  {% set speed = params.SPEED|default(client.speed_unretract)|default(35) %}
  {% set absolute_extrude = printer.gcode_move.absolute_extrude %}
  ##### end of definitions #####
  {% if printer.toolhead.extruder != '' %}
    {% if printer[printer.toolhead.extruder].can_extrude %}
      {% if use_fw_retract %}
        {% if length < 0 %}
          G10
        {% else %}
          G11
        {% endif %}
      {% else %}
        M83
        G1 E{length} F{(speed|float|abs) * 60}
        {% if absolute_extrude %}
          M82
        {% endif %}
      {% endif %}
    {% else %}
      RESPOND TYPE=echo MSG='{"\"%s\" not hot enough" % printer.toolhead.extruder}'
    {% endif %}
  {% endif %}

[gcode_macro _CLIENT_RETRACT]
description: Retracts, if the extruder is hot enough
gcode:
  {% set client = printer['gcode_macro _CLIENT_VARIABLE']|default({}) %}
  {% set length = params.LENGTH|default(client.retract)|default(1.0)|float %}
  {% set speed = params.SPEED|default(client.speed_retract)|default(35) %}

  _CLIENT_EXTRUDE LENGTH=-{length|float|abs} SPEED={speed|float|abs}

[gcode_macro _CLIENT_LINEAR_MOVE]
description: Linear move with save and restore of the gcode state
gcode:
  {% set x_move = "X" ~ params.X if params.X is defined else "" %}
  {% set y_move = "Y" ~ params.Y if params.Y is defined else "" %}
  {% set z_move = "Z" ~ params.Z if params.Z is defined else "" %}
  {% set e_move = "E" ~ params.E if params.E is defined else "" %}
  {% set rate = "F" ~ params.F if params.F is defined else "" %}
  {% set ABSOLUTE = params.ABSOLUTE | default(0) | int != 0 %}
  {% set ABSOLUTE_E = params.ABSOLUTE_E | default(0) | int != 0 %}
  SAVE_GCODE_STATE NAME=_client_movement
  {% if x_move or y_move or z_move %}
    G9{ 0 if ABSOLUTE else 1 }
  {% endif %}
  {% if e_move %}
    M8{ 2 if ABSOLUTE_E else 3 }
  {% endif %}
  G1 { x_move } { y_move } { z_move } { e_move } { rate }
  RESTORE_GCODE_STATE NAME=_client_movement
```

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

[notifier telegram]
url: tgram://{TELEGRAM_BOT_TOKEN}
events: *
body: {event_args[1].filename} {event_name}
body_format: text
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
        auth_basic "Restricted Content";
        auth_basic_user_file /etc/nginx/.htpasswd;
    }

    # Proxy for Moonraker API calls
    location /server {
        proxy_pass http://127.0.0.1:7125/server;
        proxy_set_header Host $http_host;  # Keep the original Host header
        proxy_set_header X-Real-IP 127.0.0.1;  # Mask the client IP
        proxy_set_header X-Forwarded-For 127.0.0.1;  # Mask the X-Forwarded-For header
        proxy_set_header X-Forwarded-Proto $scheme;  # Keep the original protocol (HTTP or HTTPS)
        auth_basic "Restricted Content";
        auth_basic_user_file /etc/nginx/.htpasswd;
    }

    location /printer {
        proxy_pass http://127.0.0.1:7125/printer;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP 127.0.0.1;
        proxy_set_header X-Forwarded-For 127.0.0.1;
        proxy_set_header X-Forwarded-Proto $scheme;
        auth_basic "Restricted Content";
        auth_basic_user_file /etc/nginx/.htpasswd;
    }

    location /api {
        proxy_pass http://127.0.0.1:7125/api;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP 127.0.0.1;
        proxy_set_header X-Forwarded-For 127.0.0.1;
        proxy_set_header X-Forwarded-Proto $scheme;
        auth_basic "Restricted Content";
        auth_basic_user_file /etc/nginx/.htpasswd;
    }

    location /debug {
        proxy_pass http://127.0.0.1:7125/debug;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP 127.0.0.1;
        proxy_set_header X-Forwarded-For 127.0.0.1;
        proxy_set_header X-Forwarded-Proto $scheme;
        auth_basic "Restricted Content";
        auth_basic_user_file /etc/nginx/.htpasswd;
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
        auth_basic "Restricted Content";
        auth_basic_user_file /etc/nginx/.htpasswd;
    }

    location /machine {
        proxy_pass http://127.0.0.1:7125/machine;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP 127.0.0.1;
        proxy_set_header X-Forwarded-For 127.0.0.1;
        proxy_set_header X-Forwarded-Proto $scheme;
        auth_basic "Restricted Content";
        auth_basic_user_file /etc/nginx/.htpasswd;
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
        auth_basic "Restricted Content";
        auth_basic_user_file /etc/nginx/.htpasswd;
        }

    # Proxy for Moonraker API calls
    location /server {
        proxy_pass http://127.0.0.1:7125/server;
        proxy_set_header Host $http_host;  # Keep the original Host header
        proxy_set_header X-Real-IP 127.0.0.1;  # Mask the client IP
        proxy_set_header X-Forwarded-For 127.0.0.1;  # Mask the X-Forwarded-For header
        proxy_set_header X-Forwarded-Proto $scheme;  # Keep the original protocol (HTTP or HTTPS)
        auth_basic "Restricted Content";
        auth_basic_user_file /etc/nginx/.htpasswd;
    }

    location /printer {
        proxy_pass http://127.0.0.1:7125/printer;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP 127.0.0.1;
        proxy_set_header X-Forwarded-For 127.0.0.1;
        proxy_set_header X-Forwarded-Proto $scheme;
        auth_basic "Restricted Content";
        auth_basic_user_file /etc/nginx/.htpasswd;
    }

    location /api {
        proxy_pass http://127.0.0.1:7125/api;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP 127.0.0.1;
        proxy_set_header X-Forwarded-For 127.0.0.1;
        proxy_set_header X-Forwarded-Proto $scheme;
        auth_basic "Restricted Content";
        auth_basic_user_file /etc/nginx/.htpasswd;
    }

    location /debug {
        proxy_pass http://127.0.0.1:7125/debug;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP 127.0.0.1;
        proxy_set_header X-Forwarded-For 127.0.0.1;
        proxy_set_header X-Forwarded-Proto $scheme;
        auth_basic "Restricted Content";
        auth_basic_user_file /etc/nginx/.htpasswd;
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
        auth_basic "Restricted Content";
        auth_basic_user_file /etc/nginx/.htpasswd;
    }

    location /machine {
        proxy_pass http://127.0.0.1:7125/machine;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP 127.0.0.1;
        proxy_set_header X-Forwarded-For 127.0.0.1;
        proxy_set_header X-Forwarded-Proto $scheme;
        auth_basic "Restricted Content";
        auth_basic_user_file /etc/nginx/.htpasswd;
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

# Ensure parent directories have execute permission
sudo chmod 755 /home/pi
```

8) Enable the site
add printer user credentials
```
sudo sh -c "echo -n '{USERNAME}:' >> /etc/nginx/.htpasswd"
sudo sh -c "openssl passwd -apr1 >> /etc/nginx/.htpasswd"
```
enter the password when prompted.
to view registered users:
`cat /etc/nginx/.htpasswd` note- passwords here are displayed as hashes, not plaintext


```
sudo ln -s /etc/nginx/sites-available/printer /etc/nginx/sites-enabled/
sudo nginx -t # Test configuration
sudo systemctl restart nginx
```

9) Enabling Telegram Notifs:
install Appraise notification manager
```sudo apt install apprise```
access https://telegram.me/BotFather, start a conversation and follow the steps to create a new bot.
Note down the details in the message
```
Use this token to access the HTTP API:
<CHATID:KEY>
Keep your token secure and store it safely, it can be used by anyone to control your bot.
```
set the API key.
`nano ~/printer_data/config/moonraker.conf`
replace `{TELEGRAM_BOT_TOKEN}` with the <CHATID:KEY> copied from BotFather

10) we'll need to install crowsnest to handle webcam streaming,
follow instructions in https://crowsnest.mainsail.xyz/setup/installation

11) Securely expose the server to the internet using Cloudflare tunnels.
Purchase a domain on namecheap- most cost effective.
Create a cloudflare account.
https://www.cloudflare.com/en-gb/
Transfer the nameserver to cloudflare
https://www.namecheap.com/support/knowledgebase/article.aspx/9607/2210/how-to-set-up-dns-records-for-your-domain-in-a-cloudflare-account/
install cloudflared:
```
curl -L https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-archive-keyring.gpg >/dev/null
echo "deb [signed-by=/usr/share/keyrings/cloudflare-archive-keyring.gpg] https://pkg.cloudflare.com/cloudflared $(lsb_release -cs) main" | sudo tee  /etc/apt/sources.list.d/cloudflared.list\
sudo apt update
sudo apt install cloudflared
```
Authenticate Cloudflared:
`cloudflared tunnel login`, and click the link
Create a cloudflare tunnel for both websites:
```
cloudflared tunnel create mobile
cloudflared tunnel create pro
cloudflared tunnel route dns mobile mobile.mosprinting.xyz
cloudflared tunnel route dns pro pro.mosprinting.xyz
```
To test the tunnels
```
cloudflared tunnel run --url localhost:80 mobile
cloudflared tunnel run --url localhost:8443 pro
```
To enable the tunnels on startup, we need to create a service for cloudflare
`sudo nano ~/.cloudflared/mobile_config.yml`
Configure the file like this, replacing the UUID with the cloudflare tunnel ID. (you can find this on the cloudflare console)
```
tunnel: mobile
credentials-file: /home/pi/.cloudflared/[UUID].json

ingress:
    - hostname: mobile.mosprinting.xyz
      service: http://localhost:80
    - service: http_status:404
```
`sudo nano ~/.cloudflared/pro_config.yml`
```
tunnel:  Mainsail
credentials-file: /home/pi/.cloudflared/[UUID].json

ingress:
    - hostname: pro.mosprinting.xyz
      service: http://localhost:443
    - service: http_status:404
```
Create systemd files for the tunnels
`sudo nano /etc/systemd/system/cloudflared_mobile.service`
```
[Unit]
Description=Cloudflare Tunnel for MosUI
After=network.target

[Service]
Type=simple
User=pi
ExecStart=/usr/local/bin/cloudflared tunnel --config /home/pi/.cloudflared/mobile_config.yml run
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```
`sudo nano /etc/systemd/system/cloudflared_pro.service`
```
[Unit]
Description=Cloudflare Tunnel for Mainsail
After=network.target

[Service]
Type=simple
User=pi
ExecStart=/usr/local/bin/cloudflared tunnel --config /home/pi/.cloudflared/pro_config.yml run
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```
Reload the systemd daemon to recognize the new service files:
`sudo systemctl daemon-reload`
enable both services to start at boot
```
sudo systemctl enable cloudflared-mobile.service
sudo systemctl enable cloudflared-pro.service
```
reboot and check their statuses using
```
sudo systemctl status cloudflared-mobile.service
sudo systemctl status cloudflared-pro.service
```

