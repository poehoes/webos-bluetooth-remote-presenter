import string
from bluetooth import BluetoothSocket, RFCOMM, PORT_ANY, advertise_service, SERIAL_PORT_CLASS, SERIAL_PORT_PROFILE
import win32com.client

class WinappController(object):
    def __init__(self, app=None):
        self.app = app
        self.shell = win32com.client.Dispatch("WScript.Shell")
        
    def send_key(self, key):
        print "App: ", self.app
        if self.app:
            # To set the focus on "app"
            self.shell.AppActivate(self.app)
        self.shell.SendKeys(key)


server_sock=BluetoothSocket( RFCOMM )
server_sock.bind(("",PORT_ANY))
server_sock.listen(1)

port = server_sock.getsockname()[1]

# handle special keys
keys = { 'pgdn': '{PGDN}', 
         'pgup': '{PGUP}', 
         'alttab': '%{TAB}', 
         'bkspc': '{BS}', 
         'space': ' ',
         '@': '@',
         'enter': '{ENTER}'}

# handle ordinary ascii/numbers
for k,v in zip(string.lowercase + string.digits, string.lowercase + string.digits):
    keys[k] = v

# make the Bluetooth service know for this device
advertise_service( server_sock, "RemoteControlService",
                   service_classes = [ SERIAL_PORT_CLASS ],
                   profiles = [ SERIAL_PORT_PROFILE ], 
                   )

app = WinappController()
print "Waiting for connection on RFCOMM channel %d" % port
while True:
    client_sock, client_info = server_sock.accept()
    print "Accepted connection from ", client_info, ", on socket ", client_sock

    try:
        while True:
            print "Waiting for data on client socket..."
            data = client_sock.recv(1024)
            print "received [%s]" % data
            if len(data) == 0: break
            if keys.has_key(data):
                print "Sending '%s' to application" % (keys[data],)
                app.send_key(keys[data])
            else:
                print "No key mapping found for '%s'" % (data,)
            
    except IOError:
        pass
    print "disconnected"
    client_sock.close()

server_sock.close()
print "all done"

