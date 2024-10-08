+++
title = "Air Quality Meter - Step 2: the Pi"
description = "A guide to setting up a Pi, where I documented all the steps"
date = 2020-09-14
[taxonomies]
tags = [
    "air quality",
    "project",
    "Raspberry Pi",
    "Raspberry Pi Zero",
    "Raspberry Pi Zero W",
    "Hardware",
    "setup",
    "headers",
  ]
+++

# Air Quality Meter - Step 2: the Pi

There are a lot of guides and some top notch documentation on getting start with a Raspberry Pi. Here are the parts I used to get the Pi set up, and the steps that I followed.

All of the links I provided are important and really thorough. Follow them carefully!

requirements:

- Pi Zero W
- Micro SD card (8gb)
- SD Card reader
- Set of headers
- soldering iron
- solder
- mini hdmi adapter
- micro usb to usb adapter
- keyboard
- display
- hdmi cable

Steps:

- Solder the headers on
- Download OS https://www.raspberrypi.org/downloads/raspberry-pi-os/ (noobs)
- Follow directions to flash https://www.raspberrypi.org/documentation/installation/installing-images/README.md
- Boot and login (user is pi, password is raspberry)
- Change password for pi user
- add new user (https://www.raspberrypi.org/documentation/linux/usage/users.md)
  - give yourself sudo permissions
  - add file to sudoers.d
- run `sudo raspi-config`
  - Set up network options
  - (optional) set up boot options to boot to desktop
  - Interfacing Options
    - Enable SSH, SPI, I2C
- reboot and login as your new user
- run `sudo apt-get update` and `sudo apt-get upgrade`
- SSH in from your computer
- `sudo apt-get install python3-pip`
- `sudo apt-get install -y python-smbus` `sudo apt-get install -y i2c-tools` https://learn.adafruit.com/adafruits-raspberry-pi-lesson-4-gpio-setup/configuring-i2c

This final step on the Adafruit documentation for the ic2 setup is necessary for the next step, which is setting up the actual sensor.
