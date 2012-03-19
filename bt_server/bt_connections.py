import string
import sys

try:
    # On Mac and older WIndows machines RFCOMM might not be supported
    from bluetooth import BluetoothSocket, RFCOMM, PORT_ANY, advertise_service, SERIAL_PORT_CLASS, SERIAL_PORT_PROFILE
except:
    pass

try:
    # On Windows machines with RFCOMM support there might be no serial module
    import serial
except:
    pass

class BluetoothRfcomm:
    def __init__(self):
        self.server_sock = BluetoothSocket( RFCOMM )
        self.server_sock.bind(("", PORT_ANY))
        self.server_sock.listen(1)
        port = self.server_sock.getsockname()[1]

        # make the Bluetooth service known for this device
        advertise_service( self.server_sock, "RemoteControlService",
                           service_classes = [ SERIAL_PORT_CLASS ],
                           profiles = [ SERIAL_PORT_PROFILE ], 
                           )
        print "Waiting for connection on RFCOMM channel %d" % port

    def get_connection(self):
        self.client_sock, client_info = self.server_sock.accept()
        print "Accepted connection from ", client_info, ", on socket ", self.client_sock
        
    def get_data(self):
        return string.strip(self.client_sock.recv(1024))

    def close(self):
        self.client_sock.close()

    def destroy(self):
        self.client_sock.close()
        self.server_sock.close()


class BluetoothSerialport:
    def __init__(self, portnum, timeout=5):
        self.port = serial.Serial(portnum, timeout)

    def get_connection(self):
        # not needed for serial port connections
        pass

    def get_data(self):
        return string.strip(self.port.readline())

    def close(self):
        self.port.close()

    def destroy(self):
        self.port.close()


def get_port(portnum=None):
    port = None
    
    # Select a connection method based on OS and OS version / driver availability
    
    if sys.platform == "darwin":
        # MacOS X uses always the serial port
        bluetooth_device = raw_input("Enter the  Bluetooth device: [/dev/tty.Bluetooth-PDA-Sync] ")
        if not bluetooth_device or bluetooth_device == "": bluetooth_device = "/dev/tty.Bluetooth-PDA-Sync"
        port = BluetoothSerialport(bluetooth_device)
        
    else:
        # For Windows (Linux?)
        # First, try RFCOMM using the PyBluez module. This seems to work on Windows 7 (and up) only.
        try:
            if portnum: raise Exception("User wants serial port connection")
            port = BluetoothRfcomm()
        except:
            # Fallback is "Bluetooth over virtual serial port", as it is more difficult to setup
            # (need for a virtual COM port, and user needs to know that
            # port number). This needs the PySerial module.

            # Ask the user for COM port number if not given on the
            # command line. PySerial counts them zero-based, so
            # subtract one (1) from that.
            if not portnum:
                portnum = int(raw_input("Enter the virtual COM port number for your Bluetooth device: ")) - 1
            else:
                portnum -= 1
            port = BluetoothSerialport(portnum)

    return port

