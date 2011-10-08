import serial
import string

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

