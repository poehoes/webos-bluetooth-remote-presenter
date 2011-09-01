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

    // Bind handler's "this" to our "this"
    var that=this;

    // This number is prepended to the log entries
    this.logOutputNum = 0;

    // Input with special key codes
    this.specialKeys = { 8: "bkspc", 32: "space", "volume_up" : "pgup", "volume_down" : "pgdn" };

    // Store all inputElements (Buttons + Keypress stuff) in a list for later operations (disable, enable)
    this.inputElements = [];

    // Setup all buttons
    this.upButtonModel = {
	label : "Up",
	disabled: true
    };
    this.dnButtonModel = {
	label : "Down",
	disabled: true
    };
    this.alttabButtonModel = {
	label : "Alt-Tab",
	disabled: true
    };
    this.enterButtonModel = {
	label : "Enter",
	disabled: true
    };
    this.controller.setupWidget("upButton",
				this.attributes = {},
				this.model = this.upButtonModel
			       );
    this.controller.setupWidget("dnButton",
				this.attributes = {},
				this.model = this.dnButtonModel
			       );
    this.controller.setupWidget("alttabButton",
				this.attributes = {},
				this.model = this.alttabButtonModel
			       );
    this.controller.setupWidget("enterButton",
				this.attributes = {},
				this.model = this.enterButtonModel
			       );

    this.handleTap = this.handleTap.bindAsEventListener(this);
    this.handleKeypress = this.handleKeypress.bindAsEventListener(this);

    // Store input elements and their event, handlers for later use
    this.inputElements.push({ element: this.controller.get("upButton"), 
			      model: this.upButtonModel,
			      handler: this.handleTap,
			      event: Mojo.Event.tap});
    this.inputElements.push({ element: this.controller.get("dnButton"), 
			      model: this.dnButtonModel,
			      handler: this.handleTap,
			      event: Mojo.Event.tap});
    this.inputElements.push({ element: this.controller.get("alttabButton"), 
			      model: this.alttabButtonModel,
			      handler: this.handleTap,
			      event: Mojo.Event.tap});
    this.inputElements.push({ element: this.controller.get("enterButton"), 
			      model: this.enterButtonModel,
			      handler: this.handleTap,
			      event: Mojo.Event.tap});

    this.inputElements.push({ element: this.controller.sceneElement, 
			      model: {},
			      handler: this.handleKeypress,
			      event: Mojo.Event.keypress});

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

}


RemotecontrolAssistant.prototype.handleCommand = function(event) {
    this.logInfo("Preferences event: " + event); 
    if (event.type === Mojo.Event.command) {
	switch (event.command) {
	case 'preferences':
	    this.controller.stageController.pushScene("preferences");
	    break;
	}
    }
}


RemotecontrolAssistant.prototype.activate = function(event) {
    /* Connect to Palm SPP notification service - this must be running
       to accept SPP communications events. */
    
    if (Main.debugEnable === false) {
	this.controller.get('log-output').innerHTML = "";
    }

    this.logInfo("Subscribe to notifications");
    this.sppNotificationService = this.controller.serviceRequest('palm://com.palm.bluetooth/spp', {
        method: "subscribenotifications",
        parameters: {"subscribe":true},
        onSuccess: this.sppNotify.bind(this),
        onFailure: function(failData){
            this.logInfo("notifnserverenabled, errCode: " + failData.errorCode);
        }                                                            
    });
    
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

    this.logInfo("handleTap: " + event);
    // check if the source element name matches one of our button names
    if (event.srcElement.id.indexOf("up") != -1) {
	this.writePort("pgup");
    } else if (event.srcElement.id.indexOf("dn") != -1) {
	this.writePort("pgdn");
    } else if (event.srcElement.id.indexOf("alttab") != -1) {
	this.writePort("alttab");
    } else if (event.srcElement.id.indexOf("enter") != -1) {
	this.writePort("enter");
    }
};


RemotecontrolAssistant.prototype.handleKeypress = function(event) {
    /* Called if a key on the keyboard got pressed. Send the keycode
     * as a string to the remote host */

    this.logInfo("handleKeypress: " + event.originalEvent.which + " --> " + 
		 String.fromCharCode(event.originalEvent.which));
    var which = event.originalEvent.which;
    var charval = this.specialKeys[which] || String.fromCharCode(which);
    this.writePort(charval);
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

RemotecontrolAssistant.prototype.disconnectSPP = function(){
    /* Disconnect SPP Device
     * !!!!Very Important!!!!
     * Disconnect from the SPP device when exiting the application!
     */

    var that=this; //used to scope this here.
    
    //  Close serial and spp connection
    if (this.targetAddress !== "" && this.instanceId !== undefined) {
        // Close comm port
        this.controller.serviceRequest('palm://com.palm.service.bluetooth.spp', {
            method: "close",
            parameters: {"instanceId":this.instanceId},
            onSuccess: function(objData){return;},
            onFailure: function(failData) {
                that.logInfo("Unable to close SPP Port, errCode: " + 
			     failData.errorCode + "<br/>"+ failData.errorText);
            }                                                            
        });
        
        // Disconnect from SPP
        this.connectBTDevice = this.controller.serviceRequest('palm://com.palm.bluetooth/spp', {
            method: "disconnect",
            parameters: {
                "address": this.targetAddress,
                "instanceId":this.instanceId
            },
            onSuccess: function(objData){
                that.logInfo("Disconnected from SPP");
                return;
            },
            onFailure: function(failData){
                that.logInfo("Disconnect, errCode: " + failData.errorCode);
            }
        });
    } 
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

    if (val === false) {
	// Listen for special keys "Volume up" and "Volume down"
	this.controller.serviceRequest('palm://com.palm.keys/audio', {
	    method:'status',
	    parameters:{"subscribe": !val},
	    onSuccess : function (r){ that.logInfo("Audio keys subscribe(" + 
						   !val + "): Success, results=" + 
						   JSON.stringify(r)); 
				      if (r.state == "down") {
					  var charval = that.specialKeys[r.key];
					  that.writePort(charval);
				      }
				    },
	    onFailure : function (r){ that.logInfo("Audio keys subscribe(" + 
						   !val + "): Failure, results=" + 
						   JSON.stringify(r)); }   
	});
    } else {
	// disable events
	this.controller.serviceRequest('palm://com.palm.keys/audio', {
	    method:'status',
	    parameters:{"subscribe": !val},
	    onSuccess : function (r){ that.logInfo("Audio keys subscribe(" + 
						   !val + "): Success, results=" + 
						   JSON.stringify(r)); 
				    },
	    onFailure : function (r){ that.logInfo("Audio keys subscribe(" + 
						   !val + "): Failure, results=" + 
						   JSON.stringify(r)); }   
	});
    }
}


    RemotecontrolAssistant.prototype.deactivate = function(event) {
	this.disableAllInput(true);
	this.disconnectSPP();  
    }


    RemotecontrolAssistant.prototype.cleanup = function(event) {
	this.disconnectSPP();  
    } 


    RemotecontrolAssistant.prototype.sppNotify = function(objData){
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
