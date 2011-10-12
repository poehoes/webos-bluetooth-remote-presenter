function MainAssistant() {}

// Namespace
Main={debugEnable: false, 
      enableVolumekeys: true, 
      inhibitPowerOff: true, 
      useMouse: false,     
      specialKeys: { 8: "bkspc", 
		     32: "space", 
		     "volume_up": "pgup", 
		     "volume_down": "pgdn", 
		     "button_1_el": "pgup", 
		     "button_2_el": "pgdn",
		     "button_3_el": "alttab",
		     "button_4_el": "enter"}
};

MainAssistant.prototype.setup = function() {
    this.logOutputNum=0; //display log number increment
    this.logInfo("Starting App");  //log info method will print logs to device screen
    

    this.controller.setupWidget("refreshButton",
				this.attributes = {},
				this.model = {
				    label: "Refresh hosts",
				    buttonClass: "secondary",
				    disabled: false
				});

    this.startButtonModel = {
	label: "Start",
	buttonClass: "affirmative",
	disabled: true };

    this.controller.setupWidget("startButton",
				this.attributes = {},
				this.model = this.startButtonModel);

    this.selectorChoices = [];
    this.selectorChoices.push({label: "UNDEF", value: "UNDEF"});
    this.hostModel = {value: "UNDEF", choices: this.selectorChoices}; 
    this.selectorAttributes = {label: 'Pick a remote host', modelProperty:'value' };
    this.controller.setupWidget("hostSelector", this.selectorAttributes, this.hostModel);

    this.handleHostChange = this.handleHostChange.bindAsEventListener(this);
    this.handleRefreshTap = this.handleRefreshTap.bindAsEventListener(this);
    this.handleStartTap = this.handleStartTap.bindAsEventListener(this);

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


MainAssistant.prototype.handleCommand = function(event) {
    this.logInfo("Preferences event: " + event); 
    if (event.type === Mojo.Event.command) {
	switch (event.command) {
	case 'preferences':
	    this.controller.stageController.pushScene("preferences");
	    break;
	}
    }
}


/*
 * On activate get the list of trusted host devices and let the user choose one.
 */
MainAssistant.prototype.activate = function(event) {
    if (Main.debugEnable === false) {
	this.controller.get('log-output').innerHTML = "";
    }

    // activate listeners that are active in this scene
    this.controller.listen(this.controller.get("hostSelector"), Mojo.Event.propertyChange, this.handleHostChange);
    this.controller.listen(this.controller.get("refreshButton"), Mojo.Event.tap, this.handleRefreshTap);
    this.controller.listen(this.controller.get("startButton"), Mojo.Event.tap, this.handleStartTap);

    this.requestTrustedDevices();
    this.logInfo("Scene stack height: " +  Mojo.Controller.stageController.getScenes().length);
};


MainAssistant.prototype.requestTrustedDevices = function() {
    /* Get a list of all (paired? ever known?) bluetooth devices
     * (Windows remote hosts). They are not necessarily in range or
     * connected. */

    this.logInfo("Get Trusted Devices: ");
    this.getBTDevices = this.controller.serviceRequest('palm://com.palm.bluetooth/gap', {
        method: "gettrusteddevices",
        parameters: {},
        onSuccess: this.getDevicesSuccess.bind(this),
        onFailure: function(failData){
            this.logInfo("gettrusteddevices, errCode: " + failData.errorCode);
        }                                                            
    });
}


MainAssistant.prototype.handleStartTap = function(event) {
    /* 
     * Push the next scene with the chosen hostname as parameter
     */
    this.logInfo("pushing remotecontrol scene...");
    this.controller.stageController.pushScene("remotecontrol", this.hostModel.value);
}


MainAssistant.prototype.handleRefreshTap = function(event) {
    /* 
     * Refresh list of trusted hosts
     */
    this.requestTrustedDevices();
}


MainAssistant.prototype.handleHostChange = function(event) {
    /* Event triggered by user: host value changed - enable the "Start" button
     * The model is already updated by the widget.
     */
    this.logInfo("handleHostChange: HostModel.value = " + this.hostModel.value);                    
    this.startButtonModel.disabled = this.hostModel.value == "UNDEF" ? true : false;
    this.controller.modelChanged(this.startButtonModel);
}


/*
 * get trusted devices success callback: Look up the address of a device containing . 
 * Example of callback data:
 *     objData = {"returnValue":true,"trusteddevices":
 *          [{"address":"00:0d:b5:38:c0:3f",
 *            "name":"BT-GPS-38C03F",
 *            "cod":7936,
 *            "renamed":true,
 *            "status":"disconnected"}]} 
 */ 
MainAssistant.prototype.getDevicesSuccess = function(objData){
    this.logInfo("gettrusteddevices:"+objData.returnValue);

    if(objData.returnValue) {
	if(objData.trusteddevices) {  
	    this.logInfo("Starting to replace hosts...");
	    // Replace the original selector choices array
	    this.hostModel.choices = [];
	    this.logInfo("--> Number of devices: " + objData.trusteddevices.length);
            for (i = 0; i < objData.trusteddevices.length; i++) {
		this.logInfo("--> Pushing:" + objData.trusteddevices[i].name + " with address: " + objData.trusteddevices[i].address);
		this.hostModel.choices.push({label: objData.trusteddevices[i].name, value: objData.trusteddevices[i].address});
            }
	    this.controller.modelChanged(this.hostModel);
	}
    } else {  //there are no trusted devices - the end user will need to pair to the Windows host
        this.logInfo("gettrusteddevice call returned no trusted devices!");
	this.hostModel.value = "UNDEF";
	this.startButtonModel.disabled = true;
	this.controller.modelChanged(this.startButtonModel);
    }
};


MainAssistant.prototype.deactivate = function(event) {
    Mojo.Event.stopListening(this.controller.get("hostSelector"),Mojo.Event.propertyChange, this.handleHostChange);
    Mojo.Event.stopListening(this.controller.get("refreshButton"),Mojo.Event.tap, this.handleRefreshTap);
    Mojo.Event.stopListening(this.controller.get("startButton"),Mojo.Event.tap, this.handleStartTap);
};


/*
 * Simple screen logging - add mojo log here if logging to console.
 */
MainAssistant.prototype.logInfo = function(logText) {
    if(Main.debugEnable === true) {
	this.controller.get('log-output').innerHTML = "<strong>" +
	    this.logOutputNum++ + "</strong>: " + logText + 
	    "<br />" + 
	    this.controller.get('log-output').innerHTML + 
	    "<br /><br />";  
    }
}

