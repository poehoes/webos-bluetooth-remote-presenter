function PreferencesAssistant() {}

PreferencesAssistant.prototype.setup = function() {
    this.logOutputNum = 0;

    // Toggle for enabling debug messages, helpful when pairing devices
    this.controller.setupWidget("debugToggle",
				{},
				this.debugToggleModel = {
				    value: Main.debugEnable
				});
    // Toggle for enabling the volume keys sending page-up/page-down events
    this.controller.setupWidget("enableVolumekeys",
				{},
				this.enableVolumekeysModel = {
				    value: Main.enableVolumekeys
				});

    // Toggle for disabling power-saving for this app
    this.controller.setupWidget("inhibitPowerOff",
				{},
				this.inhibitPowerOffModel = {
				    value: Main.inhibitPowerOff
				});


    // Toggle sending Mouse events 
    this.controller.setupWidget("useMouse",
				{},
				this.useMouseModel = {
				    value: Main.useMouse
				});
    
    this.selectorChoices = [];
    this.selectorChoices.push({label: "<nothing>", value: ""});
    this.selectorChoices.push({label: "Enter", value: "enter"});
    this.selectorChoices.push({label: "Page Up", value: "pgup"});
    this.selectorChoices.push({label: "Page Down", value: "pgdn"});
    this.selectorChoices.push({label: "Alt-Tab", value: "alttab"});
    
    this.ForwardModel = {value: Main.forwardEvent, choices: this.selectorChoices}; 
    this.selectorAttributes = {label: 'Fwd swipe key', modelProperty:'value' };
    this.controller.setupWidget("forwardSelector", this.selectorAttributes, this.ForwardModel);


    this.changeDebugHandler = this.changeDebug.bindAsEventListener(this);
    this.changeEnableVolumekeysHandler = this.changeEnableVolumekeys.bindAsEventListener(this);
    this.changeInhibitPowerOffHandler = this.changeInhibitPowerOff.bindAsEventListener(this);
    this.useMouseHandler = this.changeUseMouse.bindAsEventListener(this);
    this.forwardActionHandler = this.changeForwardAction.bindAsEventListener(this);
}

PreferencesAssistant.prototype.changeForwardAction = function(event) {
    // event triggerd by user: value changed
    //Mojo.Log.info("Preferences changeForwardAction; value = ", this.ForwardModel.value);
    Main.forwardEvent = this.ForwardModel.value;
    //Mojo.Log.info("Main.ForwardAction = ", Main.forwardEvent);
}

PreferencesAssistant.prototype.changeDebug = function(event) {
    // event triggerd by user: value changed
    Mojo.Log.info("Preferences changeDebug; value = ", this.debugToggleModel.value);
    Main.debugEnable = this.debugToggleModel.value;
    Mojo.Log.info("Main.debugEnable = ", Main.debugEnable);
    if (Main.debugEnable === false) {
	this.controller.get('log-output').innerHTML = "";
    }
}


PreferencesAssistant.prototype.changeEnableVolumekeys = function(event) {
    // event triggerd by user: value changed
    this.logInfo("Preferences changEnableVolumekeys; value = ", this.enableVolumekeysModel.value);
    Main.enableVolumekeys = this.enableVolumekeysModel.value;
    this.logInfo("Main.enableVolumekeys = ", Main.enableVolumekeys);
}


PreferencesAssistant.prototype.changeUseMouse = function(event) {
    // event triggerd by user: value changed
    this.logInfo("Preferences changeUseMouse; value = ", this.useMouseModel.value);
    Main.useMouse = this.useMouseModel.value;
    this.logInfo("Main.useMouse = ", Main.useMouse);
}


PreferencesAssistant.prototype.changeInhibitPowerOff = function(event) {
    // event triggerd by user: value changed
    var that = this; // scoping of this
    this.logInfo("Preferences changeInhibitPowerOff; value = ", this.inhibitPowerOffModel.value);
    if (this.inhibitPowerOffModel.value === true) {
	this.controller.serviceRequest("palm://com.palm.power/com/palm/power", {
	    method: "activityStart",
	    parameters: {
		id: "com.henschkowski.app.bluetoothpresenter",
		duration_ms: 900000
	    },
	    onSuccess: function() { that.logInfo("power activate OK");},
	    onFailure: function() { that.logInfo("power activate NOK");}
	});
    } else {
	this.controller.serviceRequest("palm://com.palm.power/com/palm/power", {
	    method: "activityEnd",
	    parameters: {
		id: "com.henschkowski.app.bluetoothpresenter",
	    },
	    onSuccess: function() { that.logInfo("power deactivate OK");},
	    onFailure: function() { that.logInfo("power deactivate NOK");}
	});
    }
}


PreferencesAssistant.prototype.activate = function(event) {
    if (Main.debugEnable === false) {
	this.controller.get('log-output').innerHTML = "";
    }
    this.controller.listen("debugToggle", Mojo.Event.propertyChange, this.changeDebugHandler);
    this.controller.listen("forwardSelector", Mojo.Event.propertyChange, this.forwardActionHandler);
    this.controller.listen("enableVolumekeys", Mojo.Event.propertyChange, this.changeEnableVolumekeysHandler);
    this.controller.listen("inhibitPowerOff", Mojo.Event.propertyChange, this.changeInhibitPowerOffHandler);
    this.controller.listen("useMouse", Mojo.Event.propertyChange, this.useMouseHandler);
}


PreferencesAssistant.prototype.deactivate = function(event) {
}


PreferencesAssistant.prototype.cleanup = function(event) {
    this.controller.stopListening("debugToggle", Mojo.Event.propertyChange, 
				  this.changeDebugHandler);
    this.controller.stopListening("forwardSelector", Mojo.Event.propertyChange, 
			  this.changeForwardAction);
    this.controller.stopListening("enableVolumekeys", Mojo.Event.propertyChange, 
				  this.changeEnableVolumekeysHandler);
    this.controller.stopListening("inhibitPowerOff", Mojo.Event.propertyChange, 
				  this.changeInhibitPowerOffHandler);
    this.controller.stopListening("useMouse", Mojo.Event.propertyChange, 
				  this.useMouseHandler);
    
}


PreferencesAssistant.prototype.logInfo = function(logText) {
    if(Main.debugEnable === true) {
	this.controller.get('log-output').innerHTML = "<strong>" +
	    this.logOutputNum++ + "</strong>: " + logText + 
	    "<br />" + 
	    this.controller.get('log-output').innerHTML + 
	    "<br /><br />";  
    }
}

