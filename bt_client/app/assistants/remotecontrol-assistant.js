function RemotecontrolAssistant(remotehost) {
    /* this is the creator function for your scene assistant object. It will be passed all the 
       additional parameters (after the scene name) that were passed to pushScene. The reference
       to the scene controller (this.controller) has not be established yet, so any initialization
       that needs the scene controller should be done in the setup function below. */

    // remote host Bluetooth address is passed down from the main
    // scene
    this.remotehost = remotehost

    //SPP instance object
    this.instanceId=-1;
}


RemotecontrolAssistant.prototype.setup = function() {
    /* Constructor */
    if (Main.debugEnable === false) {
	this.controller.get('log-output').innerHTML = "";
    }

    this.logInfo("Remote host address is: " + this.remotehost);

    // Bind handler's "this" to our "that"
    var that=this;

    // This number is prepended to the log entries
    this.logOutputNum = 0;

    // Store all inputElements (Buttons + Keypress stuff) in a list for later operations (disable, enable)
    this.inputElements = [];

    // Setup all buttons
    this.button_1_Model = {
	label : "Page-Up",
	disabled: true
    };
    this.button_2_Model = {
	label : "Page-Down",
	disabled: true
    };
    this.button_3_Model = {
	label : "Alt-Tab",
	disabled: true
    };
    this.button_4_Model = {
	label : "Enter",
	disabled: true
    };
    this.controller.setupWidget("button_1_el",
				this.attributes = {},
				this.model = this.button_1_Model
			       );
    this.controller.setupWidget("button_2_el",
				this.attributes = {},
				this.model = this.button_2_Model
			       );
    this.controller.setupWidget("button_3_el",
				this.attributes = {},
				this.model = this.button_3_Model
			       );
    this.controller.setupWidget("button_4_el",
				this.attributes = {},
				this.model = this.button_4_Model
			       );

    this.handleTap = this.handleTap.bindAsEventListener(this);
    this.handleKeypress = this.handleKeypress.bindAsEventListener(this);

    // Store input elements and their event, handlers for later use
    this.inputElements.push({ element: this.controller.get("button_1_el"), 
			      model: this.button_1_Model,
			      handler: this.handleTap,
			      event: Mojo.Event.tap});
    this.inputElements.push({ element: this.controller.get("button_2_el"), 
			      model: this.button_2_Model,
			      handler: this.handleTap,
			      event: Mojo.Event.tap});
    this.inputElements.push({ element: this.controller.get("button_3_el"), 
			      model: this.button_3_Model,
			      handler: this.handleTap,
			      event: Mojo.Event.tap});
    this.inputElements.push({ element: this.controller.get("button_4_el"), 
			      model: this.button_4_Model,
			      handler: this.handleTap,
			      event: Mojo.Event.tap});

    this.inputElements.push({ element: this.controller.sceneElement, 
			      model: {},
			      handler: this.handleKeypress,
			      event: Mojo.Event.keypress});

    boundHandleKeydown = this.handleKeydown.bindAsEventListener(this);
    this.controller.document.addEventListener("keydown", boundHandleKeydown, true);
    
    this.logInfo("InputElements length: " + this.inputElements.length);
    this.logInfo("InputElements: " + this.inputElements);
    this.controller.setupWidget(Mojo.Menu.appMenu,
				this.attributes = {
				    omitDefaultItems: true
				},
				this.model = {
				    visible: true,
				    items: [
					{ label: "Preferences...", command: 'preferences' },
				    ]
				}); 
    this.logInfo("Subscribe to bluetooth notifications");
    this.sppNotificationService = this.controller.serviceRequest('palm://com.palm.bluetooth/spp', {
        method: "subscribenotifications",
        parameters: {"subscribe":true},
        onSuccess: this.sppNotify.bind(this),
        onFailure: function(failData){
            this.logInfo("notifnserverenabled, errCode: " + failData.errorCode);
        }                                                            
    });

    this.logInfo("Subscribe to audio key events");
    this.controller.serviceRequest('palm://com.palm.keys/audio', {
	method:'status',
	parameters:{"subscribe": true},
	onSuccess : function (r){ that.logInfo("Audio keys: results=" + 
					       JSON.stringify(r)); 
				  if ((r.state == "down") && (Main.enableVolumekeys === true)) {
				      var charval = Main.specialKeys[r.key] + "\n";
				      that.writePort(charval);
				  }
				},
	onFailure : function (r){ that.logInfo("Audio keys subscribe(true): Failure, results=" + 
					       JSON.stringify(r)); }   
    });
}


RemotecontrolAssistant.prototype.handleCommand = function(event) {
    this.logInfo("Command event: " + event); 
    switch (event.type) {
    case Mojo.Event.command:
    	switch (event.command) {
    	case 'preferences':
    	    this.logInfo("Tap on Preferences");
    	    this.controller.stageController.pushScene("preferences");
    	    break;
    	}
    	break;
    case Mojo.Event.forward:
    	this.logInfo("Forward gesture");
    	if (Main.forwardEvent == "") {
    	    
    	} else {
    	    this.writePort(Main.forwardEvent + "\n");
    	}
    	break;
    case Mojo.Event.back:
    	this.logInfo("back gesture");
    	//event.preventdefault();
    	break;
    	
    }
}


RemotecontrolAssistant.prototype.activate = function(event) {
    /* Connect to Palm SPP notification service - this must be running
       to accept SPP communications events. */
    
    // clear debug area if the debug setting changed.
    if (Main.debugEnable === false) {
	this.controller.get('log-output').innerHTML = "";
    }

    // Connect to a paired device - this sets up a new event channel
    // (see sppNotificationService)
    if(this.remotehost !== "") {
	this.connectBTDevice = this.controller.serviceRequest('palm://com.palm.bluetooth/spp', {
	    method: "connect",
	    parameters: {"address" : this.remotehost},
	});                                                           
    }
};


RemotecontrolAssistant.prototype.handleTap = function(event) {
    /* The user tapped on one of the buttons -> send an artificial
     * code to the remote host */

    this.logInfo("handleTap: " + event.srcElement.id);
    var button_start = event.srcElement.id.indexOf("button");
    if (button_start != -1) {
	// Let's assume there are not more than 10 of these buttons ..
	var elementId = event.srcElement.id.slice(button_start, button_start + 11);
	this.logInfo("elementId: " + elementId);
	this.writePort(Main.specialKeys[elementId] + "\n");
    } else {
	this.logInfo("Unknown element: " + event.srcElement.id);
    };
}

RemotecontrolAssistant.prototype.handleKeydown = function(event) {
    /* Called when a keydown-event is send */

    this.logInfo("handleKeydown: " + event.which);
    if (event.which == 13)
	this.writePort("enter"+ "\n");
};

RemotecontrolAssistant.prototype.handleKeypress = function(event) {
    /* Called if a key on the keyboard got pressed. Send the keycode
     * as a string to the remote host */

    this.logInfo("handleKeypress: " + event.originalEvent.which + " --> " + 
		 String.fromCharCode(event.originalEvent.which));
    var which = event.originalEvent.which;
    var charval = Main.specialKeys[which] || String.fromCharCode(which);
    this.writePort(charval + "\n");
};


RemotecontrolAssistant.prototype.openWriteReady = function(objData){
    /*
     * Called from open success 
     */

    this.logInfo("openSuccess: " + JSON.stringify(objData));

    // Enable all inputElements
    this.disableAllInput(false);
}


RemotecontrolAssistant.prototype.writePort = function(msg){
    /*
     * Write to the serial port.
     */

    this.logInfo("SPP Write Port: "+msg);
    this.controller.serviceRequest('palm://com.palm.service.bluetooth.spp', {
        method: "write",
        parameters: {"instanceId": this.instanceId,
		     "dataLength": msg.length, 
		     "data": msg},
        onSuccess: function(objData) {
	    this.logInfo("Write Success: "+objData.returnValue);
	},
        onFailure: function(failData) {
            this.logInfo("Unable to write to SPP Port, errCode: " + 
			 failData.errorCode + "<br/>"+ failData.errorText);
        }                                                            
    });
}

RemotecontrolAssistant.prototype.disconnectAll = function() {
    /* Disconnect SPP Device
     * !!!!Very Important!!!!
     * Disconnect from the SPP device when exiting the application!
     */

    var that=this; //used to scope this here.
    this.logInfo("disconnectAll()");
    this.closeSPP();
}


RemotecontrolAssistant.prototype.closeSPP = function() {
    this.logInfo("Close connection");
    //  Close serial and spp connection
    if (this.targetAddress !== "" && this.instanceId !== undefined) {
        // Close comm port
        this.controller.serviceRequest('palm://com.palm.service.bluetooth.spp', {
            method: "close",
            parameters: {"instanceId":this.instanceId},
            onSuccess: function(objData){
		that.logInfo("Success: close");
		that.disconnectSPP();},
            onFailure: function(failData) {
                that.logInfo("Fail: close SPP Port, errCode: " + 
			     failData.errorCode + "<br/>"+ failData.errorText);
		that.disconnectSPP();},
        });
    }
}


RemotecontrolAssistant.prototype.disconnectSPP = function() {
    var that = this;
    this.logInfo("Disconnect from SPP");
    this.connectBTDevice = this.controller.serviceRequest('palm://com.palm.bluetooth/spp', {
        method: "disconnect",
        parameters: {
            "address": this.targetAddress,
            "instanceId":this.instanceId
        },
        onSuccess: function(objData) {
            that.logInfo("Success: Disconnected from SPP");
        },
        onFailure: function(failData) {
            that.logInfo("Fail: Disconnect from SSP, errCode: " + failData.errorCode);
        }
    });
}


RemotecontrolAssistant.prototype.disableAllInput = function(val) {
    this.logInfo("in disableAllInput(" + val + ")");
    var that = this; // scope this
    
    for (var i = 0; i < this.inputElements.length; i++) {
	var current = this.inputElements[i];

	// Disable the UI
	current.model.disabled = val;
	this.controller.modelChanged(current.model);
	
	// Start /stop listening for events
	if (val == true) {
	    this.controller.stopListening(current.element, current.event, current.handler);
	} else {
	    this.controller.listen(current.element, current.event, current.handler);
	}
    }
    
    boundHandleKeydown = this.handleKeydown.bindAsEventListener(this);
    this.controller.document.removeEventListener("keydown", boundHandleKeydown, true);
}


RemotecontrolAssistant.prototype.deactivate = function(event) {
    this.disableAllInput(true);
    this.disconnectAll();  
}


RemotecontrolAssistant.prototype.cleanup = function(event) {
    this.disconnectAll();  
} 


RemotecontrolAssistant.prototype.sppNotify = function(objData) {
    /*
     * Notification handler for SPP events.  
     *
     * General sequence that events are expected to arrive: 
     * - notifnservicenames -> The BT stack gives us the services that
     *                         are available on the remote device 
     * - notifnconnected    -> We are connected to the remote service,
     *                         Now we need to open a port to the service
     */

    var that = this; //used to scope this here.
    
    this.logInfo("SPP notification: "+JSON.stringify(objData));
    this.instanceId = objData.instanceId;

    for(var key in objData) {
        if (key === "notification") {
	    switch(objData.notification){
	    case "notifnservicenames":
                this.logInfo("SPP service name: " + objData.services[0] + 
			     ", instanceId: " + objData.instanceId);                
		// TODO: select only "RemoteControlService"
                /* Send select service response */
                this.controller.serviceRequest('palm://com.palm.bluetooth/spp', 
					       {method: "selectservice", 
						parameters: {"instanceId" : objData.instanceId,
							     "servicename":objData.services[0]}
						,
						onSuccess : function (e){ 
						    that.logInfo("selectservice success, results="+
								 JSON.stringify(e)); },
						onFailure : function (e){ 
						    that.logInfo("selectservice failure, results="+
								 JSON.stringify(e)); } 
					       });
                return;                                                           
                break;

	    case "notifnconnected":
                this.logInfo("SPP Connected");  
                //for some reason two different keys are used for instanceId are passed
                if(objData.error === 0){
		    this.logInfo("Opening port ...");
		    this.controller.serviceRequest('palm://com.palm.service.bluetooth.spp', {
                        method: "open",
                        parameters: {"instanceId":objData.instanceId},
                        onSuccess: this.openWriteReady.bind(this),
                        onFailure: function(failData) {
			    that.logInfo("Unable to Open SPP Port, errCode: " + 
					 failData.errorCode + "<br/>"+ failData.errorText);
                        }                                                            
		    });
                } else {
		    this.logInfo(", but there is an error code:" + objData.error);
		}
                return;    
                break;

	    case "notifndisconnected":
                this.logInfo("Device has terminated the connection or is out of range...");
		
		// Deactivate all input (buttons + keyboard)
		this.disableAllInput(true);
                break;

	    default:
                break;
	    }
        } 
    }
}


RemotecontrolAssistant.prototype.logInfo = function(logText) {
    if(Main.debugEnable === true) {
	this.controller.get('log-output').innerHTML = "<strong>" +
	    this.logOutputNum++ + "</strong>: " + logText + 
	    "<br />" + 
	    this.controller.get('log-output').innerHTML + 
	    "<br /><br />";  
    }
}
