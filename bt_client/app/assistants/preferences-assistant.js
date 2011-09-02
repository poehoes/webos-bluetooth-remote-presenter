function PreferencesAssistant() {}

PreferencesAssistant.prototype.setup = function() {

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


    this.changeDebugHandler = this.changeDebug.bindAsEventListener(this);
    this.changeEnableVolumekeysHandler = this.changeEnableVolumekeys.bindAsEventListener(this);
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


PreferencesAssistant.prototype.activate = function(event) {
    if (Main.debugEnable === false) {
	this.controller.get('log-output').innerHTML = "";
    }
    this.controller.listen("debugToggle", Mojo.Event.propertyChange, this.changeDebugHandler);
    this.controller.listen("enableVolumekeys", Mojo.Event.propertyChange, this.changeEnableVolumekeysHandler);
}


PreferencesAssistant.prototype.deactivate = function(event) {
}


PreferencesAssistant.prototype.cleanup = function(event) {
    this.controller.stopListening("debugToggle", Mojo.Event.propertyChange, this.changeDebugHandler);
    this.controller.stopListening("enableVolumekeys", Mojo.Event.propertyChange, 
				  this.changeEnableVolumekeysHandler);
}
