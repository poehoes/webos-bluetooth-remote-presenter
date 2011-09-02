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


    this.changeDebugHandler = this.changeDebug.bindAsEventListener(this);
    this.changeEnableVolumekeysHandler = this.changeEnableVolumekeys.bindAsEventListener(this);
    this.changeInhibitPowerOffHandler = this.changeInhibitPowerOff.bindAsEventListener(this);
}


PreferencesAssistant.prototype.changeDebug = function(event) {
    // event triggerd by user: value changed
    Mojo.Log.error("Preferences changeDebug; value = ", this.debugToggleModel.value);
    Main.debugEnable = this.debugToggleModel.value;
    Mojo.Log.error("Main.debugEnable = ", Main.debugEnable);
    if (Main.debugEnable === false) {
	this.controller.get('log-output').innerHTML = "";
    }
}


PreferencesAssistant.prototype.changeEnableVolumekeys = function(event) {
    // event triggerd by user: value changed
    Mojo.Log.error("Preferences changEnableVolumekeys; value = ", this.enableVolumekeysModel.value);
    Main.enableVolumekeys = this.enableVolumekeysModel.value;
    Mojo.Log.error("Main.enableVolumekeys = ", Main.enableVolumekeys);
}


PreferencesAssistant.prototype.changeInhibitPowerOff = function(event) {
    // event triggerd by user: value changed
    var that = this; // scoping of this
    Mojo.Log.error("Preferences changeInhibitPowerOff; value = ", this.inhibitPowerOffModel.value);
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
    this.controller.listen("enableVolumekeys", Mojo.Event.propertyChange, this.changeEnableVolumekeysHandler);
    this.controller.listen("inhibitPowerOff", Mojo.Event.propertyChange, this.changeInhibitPowerOffHandler);
}


PreferencesAssistant.prototype.deactivate = function(event) {
}


PreferencesAssistant.prototype.cleanup = function(event) {
    this.controller.stopListening("debugToggle", Mojo.Event.propertyChange, 
				  this.changeDebugHandler);
    this.controller.stopListening("enableVolumekeys", Mojo.Event.propertyChange, 
				  this.changeEnableVolumekeysHandler);
    this.controller.stopListening("inhibitPowerOff", Mojo.Event.propertyChange, 
				  this.changeInhibitPowerOffHandler);
    
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

