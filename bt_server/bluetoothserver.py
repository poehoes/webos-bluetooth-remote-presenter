import app_controller
import bt_connections
import sys

com_port_num=None
if len(sys.argv) > 1:
    try:
        com_port_num = int(sys.argv[1])
    except ValueError:
        print "Usage: %s <portnumber>" % (sys.argv[0],)
        sys.exit(1)

    
app = app_controller.get_app_controller()
port = bt_connections.get_port(portnum=com_port_num)
while True:
    try:
        port.get_connection()
        while True:
            print "Waiting for data on client socket..."
            data = port.get_data()
            print "received [%s]" % data
            if data.startswith("keepalive"):
                continue
            if len(data) == 0:
                break
            app.send_key(data)
            
    except IOError:
        pass
    print "disconnected"
    port.close()
port.destroy()
print "all done"

