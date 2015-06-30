# WebOS Bluetooth Remote Presenter #

## Overview ##

With this tool, you can use your WebOS device as a remote control for presentation software - actually, all applications that accept keyboard events to do something meaningful.

I tested with

  * Windows 7 (Microsoft Bluetooth driver + RFCOMM or virtual COM port interface)
  * Windows XP (Toshiba Bluetooth driver + virtual COM port interface)
  * Mac OS X (10.6 on a MacBook).
  * Linux kubuntu 10.10, kernel 2.6.35-31-generic (thanks to Daniel Franzen for the Linux version!)

This software has a client and a server part:

  * The client software is installed on a WebOS device (I tested with a Veer). This is a Palm SDK application, using JavaScript.

  * The server software runs on the PC and receives commands like page-down, page-up from from the device via Bluetooth. The key presses are sent to the application that has the focus. This software is implemented as a small Python script.

## Client installation ##

### Install from an app catalog ###

The package can be installed from Preware / [webosnation.com](http://www.webosnation.com/bluetooth-presenter).

### Using Quick Install ###

  1. Download [Quick\_Install](http://forums.precentral.net/canuck-coding/274461-webos-quick-install-v4-0-a.html) and install according to the instructions on that page.
  1. Fetch the [package](http://webos-bluetooth-remote-presenter.googlecode.com/files/com.henschkowski.app.bluetoothpresenter_1.0.2_all.ipk) from the Download page
  1. Start Quick Install and upload the IPK package to your device

### Install using the SDK tools ###

  1. Install the WebOS SDK from [HP/Palm's developer site](https://developer.palm.com/content/resources/develop/sdk_pdk_download.html)
  1. Check-out/download the code from the [Source](http://code.google.com/p/webos-bluetooth-remote-presenter/source/checkout) page to a folder (hereafter known as `<checkout-root>`)
  1. Change directory to  `<checkout-root>` and do a `palm-package bt_client`. This builds the package file in the same directory.
  1. Connect the WebOS device via USB to your PC
  1. Do a `palm-install *.ipk`


## Server installation ##

### Easy way ###

  1. Download the [Windows ZIP](http://webos-bluetooth-remote-presenter.googlecode.com/files/bluetoothserver_win32_bin_1.0.2.zip) or [Mac OS X ZIP](http://webos-bluetooth-remote-presenter.googlecode.com/files/bluetoothserver_osx_1.0.2.zip) or [Linux TAR](http://webos-bluetooth-remote-presenter.googlecode.com/files/bluetoothserver_source_1.0.4.tar.gz) from the Download section.
  1. Unzip to any (new) folder
  1. _Windows_: The server program ist started with double-click on `bluetoothserver.exe`
  1. _Mac_: Start a **Terminal.app**. Type:  `./<path-to-unzipped-archive>/bluetoothserver.app/Contents/MacOS/bluetoothserver `
  1. _Linux_ (for Ubuntu and similar distros; for others, see "DIY Install" below):
    1. Install the PyBluez module: ` apt-get install python-bluez `
    1. Install the virtkey module for Python: ` apt-get install python-virtkey`
    1. In a shell, type `python <path-to-untarred-archive>/bt_server/bluetoothserver.py `

### DIY way ###
#### Windows ####

  1. Download and install Python 2.6.6 **32bit version**, even if you're running 64bit Windows. It's hidden on python.org, but you can find it [here](http://www.python.org/ftp/python/2.6.6/python-2.6.6.msi).
  1. Download and install _Python Extensions for Windows_ for Python 2.6.6, **32bit version**, from [sourceforge](http://sourceforge.net/projects/pywin32/files/pywin32/Build216/pywin32-216.win32-py2.6.exe/download).
  1. Download and install _PyBluez_ bluetooth drivers for Python from [here](http://code.google.com/p/pybluez/downloads/detail?name=PyBluez-0.18.win32-py2.6.exe).
  1. Download and install the _PySerial_ serial port module for Python from [here](http://pypi.python.org/packages/any/p/pyserial/pyserial-2.5.win32.exe#md5=ea4579b9ad39a4f0171c3ec3da0a8212). There is only a **32bit version**.

  1. If not already done during the client installation, check-out/download the code from the [Source](http://code.google.com/p/webos-bluetooth-remote-presenter/source/checkout) page to `<checkout-root>`.
  1. The server program is started by running `<checkout-root>/bt_server/runserver.bat` in a cmd shell

#### Mac OS X ####
  1. Download and install Python 2.6.6 **32bit version**, even if you're running a 64bit Mac OS X.
  1. Download and install the _PySerial_ serial port module for Python from [here](http://pypi.python.org/pypi/pyserial/)
  1. If not already done during the client installation, check-out/download the code from the [Source](http://code.google.com/p/webos-bluetooth-remote-presenter/source/checkout) page to `<checkout-root>`.
  1. The server program is started by running `<path-to-your-newly-installed-python>/python <checkout-root>/bt_server/bluetoothserver.py` in a **Terminal.app** window.

#### Linux ####
  1. If there is no Python 2.6 or newer on your system, download and install it from [here](http://python.org/download/).
  1. Download and install the [PyBluez](http://code.google.com/p/pybluez/) bluetooth driver.
  1. Download and install the virtkey module from [here](https://launchpad.net/python-virtkey)
  1. If not already done during the client installation, check-out/download the code from the [Source](http://code.google.com/p/webos-bluetooth-remote-presenter/source/checkout) page to `<checkout-root>`.
  1. The server program is started by running `<path-to-your-newly-installed-python>/python <checkout-root>/bt_server/bluetoothserver.py` at a shell prompt.


## Usage ##

  1. Bluetooth-pair the WebOS device and your PC (using the respective menu items in WebOS and Windows/OS X). In the Preferences menu of the presenter app you can enable or disable debug output.
  1. Start the server program (depending on your installation method, see above). **_Note_**: The server program uses the [PyBluez](http://code.google.com/p/pybluez/) bluetooth stack, which works only with the [bluez](http://www.bluez.org) driver, the standard Windows bluetooth drivers and the Widcomm bluetooth stack. If the server program cannot load the PyBluez package, it will fall back to using a virtual serial port (COMx) that you have to configure using Windows' Bluetooth settings panel. The server program will ask for the COM number (this must be a "server" port. Alternatively, you can pass the port number as a parameter to the start script). The Mac port works with the serial port only - you need to know the Bluetooth serial device path. The Linux port uses the PyBluez driver.
  1. Start the WebOS app. Select the right Bluetooth host in the list selection box.
  1. Click on the "Start" Button
  1. Bring the application on your PC/Mac to the foreground, this application will be controled by the app on the device.
  1. Use the on-screen buttons, the keyboard and the volume rocker buttons to control the remote application.
  1. In the Preferences menu, you can disable that the device goes asleep. Even if the screen goes black, you can still use the volume keys. If the Bluetooth connection drops frequently, you might enable the keepalive feature - this sends a message from device to PC every 10 seconds.
  1. Also in the Preferences menu, you could turn on on-screen debug messages.
  1. The on-screen buttons can be mapped to some keys events in the preferences menu. These mappings are saved.


