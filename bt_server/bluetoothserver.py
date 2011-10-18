import app_controller
import bt_connections

app = app_controller.get_app_controller()
port = bt_connections.get_port()
while True:
    try:
        port.get_connection()
        while True:
            print "Waiting for data on client socket..."
            data = port.get_data()
            print "received [%s]" % data
            if len(data) == 0:
                break
            app.send_key(data)
            
    except IOError:
        pass
    print "disconnected"
    port.close()
port.destroy()
print "all done"

