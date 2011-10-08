import string
from bluetooth import BluetoothSocket, RFCOMM, PORT_ANY, advertise_service, SERIAL_PORT_CLASS, SERIAL_PORT_PROFILE

raise Exception("not implrtmented")

class BluetoothRfcomm:
    def __init__(self):
        self.server_sock = BluetoothSocket( RFCOMM )
        self.server_sock.bind(("",PORT_ANY))
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



