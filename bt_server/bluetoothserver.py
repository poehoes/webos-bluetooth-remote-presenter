import string
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


def get_port():
    port = None
    # First, try RFCOMM using the PyBluez module. This seems to work on Windows 7 (and up) only.
    try:
        import connection_rfcomm
        port = connection_rfcomm.BluetoothRfcomm()
    except:
        # Fallback is "Bluetooth over virtual serial port", as it is more difficult to setup
        # (need for a virtual COM port, and user needs to know that
        # port number). This needs the PySerial module.

        # Ask the user for COM port number. PySerial counts them zero-based, so
        # subtract one (1) from that.
        portnum = int(input("Enter the virtual COM port number for your Bluetooth device: ")) - 1
        import connection_serialport
        port = connection_serialport.BluetoothSerialport(portnum)

    return port

    
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

app = WinappController()
port = get_port()
while True:
    try:
        port.get_connection()
        while True:
            print "Waiting for data on client socket..."
            data = port.get_data()
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
    port.close()
port.destroy()
print "all done"

