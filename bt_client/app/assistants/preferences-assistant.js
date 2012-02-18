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

    // Mapping values to display text for custom buttons
    this.displayMapping = {
	"": "<nothing>",
	"enter": "Enter",
	"pgup": "Page Up",
	"pgdn": "Page Down",
	"crup": "Cursor Up",
	"crdn": "Cursor Down",
	"crlt": "Cursor Left",
	"crrt": "Cursor Right",
	"alttab": "Alt-Tab"
    };


    // Customize "forward swipe" and the four on-screen buttons
    this.selectorChoices = [];
    this.selectorChoices.push({label: this.displayMapping[""], value: ""});
    this.selectorChoices.push({label: this.displayMapping["enter"], value: "enter"});
    this.selectorChoices.push({label: this.displayMapping["pgup"], value: "pgup"});
    this.selectorChoices.push({label: this.displayMapping["pgdn"], value: "pgdn"});
    this.selectorChoices.push({label: this.displayMapping["crup"], value: "crup"});
    this.selectorChoices.push({label: this.displayMapping["crdn"], value: "crdn"});
    this.selectorChoices.push({label: this.displayMapping["crlt"], value: "crlt"});
    this.selectorChoices.push({label: this.displayMapping["crrt"], value: "crrt"});
    this.selectorChoices.push({label: this.displayMapping["alttab"], value: "alttab"});
    
    // Setup "forward-swipe" action
    this.ForwardModel = {value: Main.specialKeys["forwardEvent"].code, choices: this.selectorChoices}; 
    this.forwardswipeSelectorAttributes = {label: 'Fwd swipe key', modelProperty:'value' };
    this.controller.setupWidget("forwardSelector", this.forwardswipeSelectorAttributes, this.ForwardModel);

    // Setup the preferences for the four on-screen buttons
    this.button1Model = {value: Main.specialKeys["button_1_el"].code, 
			 choices: this.selectorChoices}; 
    this.button2Model = {value: Main.specialKeys["button_2_el"].code, 
			 choices: this.selectorChoices}; 
    this.button3Model = {value: Main.specialKeys["button_3_el"].code, 
			 choices: this.selectorChoices}; 
    this.button4Model = {value: Main.specialKeys["button_4_el"].code, 
			 choices: this.selectorChoices}; 

    this.button1SelectorAttributes = {label: '1st onscr btn', modelProperty:'value' };
    this.button2SelectorAttributes = {label: '2nd onscr btn', modelProperty:'value' };
    this.button3SelectorAttributes = {label: '3rd onscr btn', modelProperty:'value' };
    this.button4SelectorAttributes = {label: '4th onscr btn', modelProperty:'value' };

    this.controller.setupWidget("button1Selector",
				this.button1SelectorAttributes,
				this.button1Model);
    this.controller.setupWidget("button2Selector",
				this.button2SelectorAttributes,
				this.button2Model);
    this.controller.setupWidget("button3Selector",
				this.button3SelectorAttributes,
				this.button3Model);
    this.controller.setupWidget("button4Selector",
				this.button4SelectorAttributes,
				this.button4Model);

    // Setup volume keys
    this.volumeUpModel = {value: Main.specialKeys["volume_up"].code, choices: this.selectorChoices}; 
    this.volumeDnModel = {value: Main.specialKeys["volume_down"].code, choices: this.selectorChoices}; 
    this.volumeUpSelectorAttributes = {label: 'Volume up', modelProperty:'value' };
    this.volumeDnSelectorAttributes = {label: 'Volume dn', modelProperty:'value' };
    this.controller.setupWidget("volumeUpSelector",
				this.volumeUpSelectorAttributes,
				this.volumeUpModel);
    this.controller.setupWidget("volumeDnSelector",
				this.volumeDnSelectorAttributes,
				this.volumeDnModel);
    

    this.changeDebugHandler = this.changeDebug.bindAsEventListener(this);
    this.changeEnableVolumekeysHandler = this.changeEnableVolumekeys.bindAsEventListener(this);
    this.changeInhibitPowerOffHandler = this.changeInhibitPowerOff.bindAsEventListener(this);
    this.useMouseHandler = this.changeUseMouse.bindAsEventListener(this);
    this.forwardActionHandler = this.changeForwardAction.bindAsEventListener(this);
    this.button1ActionHandler = this.changeButton1Action.bindAsEventListener(this);
    this.button2ActionHandler = this.changeButton2Action.bindAsEventListener(this);
    this.button3ActionHandler = this.changeButton3Action.bindAsEventListener(this);
    this.button4ActionHandler = this.changeButton4Action.bindAsEventListener(this);
    this.volumeUpActionHandler = this.changeVolumeUpAction.bindAsEventListener(this);
    this.volumeDnActionHandler = this.changeVolumeDnAction.bindAsEventListener(this);
}

PreferencesAssistant.prototype.changeForwardAction = function(event) {
    // event triggerd by user: value changed
    Main.specialKeys["forwardEvent"].code = this.ForwardModel.value;
    Main.specialKeys["forwardEvent"].label = this.displayMapping[this.ForwardModel.value];
}

PreferencesAssistant.prototype.changeButton1Action = function(event) {
    Main.specialKeys["button_1_el"].code = this.button1Model.value;
    Main.specialKeys["button_1_el"].label = this.displayMapping[this.button1Model.value];
}

PreferencesAssistant.prototype.changeButton2Action = function(event) {
    Main.specialKeys["button_2_el"].code = this.button2Model.value;
    Main.specialKeys["button_2_el"].label = this.displayMapping[this.button2Model.value];
}

PreferencesAssistant.prototype.changeButton3Action = function(event) {
    Main.specialKeys["button_3_el"].code = this.button3Model.value;
    Main.specialKeys["button_3_el"].label = this.displayMapping[this.button3Model.value];
}

PreferencesAssistant.prototype.changeButton4Action = function(event) {
    Main.specialKeys["button_4_el"].code = this.button4Model.value;
    Main.specialKeys["button_4_el"].label = this.displayMapping[this.button4Model.value];
}

PreferencesAssistant.prototype.changeVolumeUpAction = function(event) {
    Main.specialKeys["volume_up"].code = this.volumeUpModel.value;
    Main.specialKeys["volume_up"].label = this.displayMapping[this.volumeUpModel.value];
}

PreferencesAssistant.prototype.changeVolumeDnAction = function(event) {
    Main.specialKeys["volume_down"].code = this.volumeDnModel.value;
    Main.specialKeys["volume_down"].label = this.displayMapping[this.volumeDnModel.value];
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
    this.controller.listen("button1Selector", Mojo.Event.propertyChange, this.button1ActionHandler);
    this.controller.listen("button2Selector", Mojo.Event.propertyChange, this.button2ActionHandler);
    this.controller.listen("button3Selector", Mojo.Event.propertyChange, this.button3ActionHandler);
    this.controller.listen("button4Selector", Mojo.Event.propertyChange, this.button4ActionHandler);
    this.controller.listen("volumeUpSelector", Mojo.Event.propertyChange, this.volumeUpActionHandler);
    this.controller.listen("volumeDnSelector", Mojo.Event.propertyChange, this.volumeDnActionHandler);
    this.controller.listen("enableVolumekeys", Mojo.Event.propertyChange, this.changeEnableVolumekeysHandler);
    this.controller.listen("inhibitPowerOff", Mojo.Event.propertyChange, this.changeInhibitPowerOffHandler);
    this.controller.listen("useMouse", Mojo.Event.propertyChange, this.useMouseHandler);
}


PreferencesAssistant.prototype.deactivate = function(event) {
    // save preferences to cookie
    var specialKeysCookie = new Mojo.Model.Cookie('specialkeys');
    specialKeysCookie.put(Main.specialKeys);
}


PreferencesAssistant.prototype.cleanup = function(event) {
    this.controller.stopListening("debugToggle", Mojo.Event.propertyChange, 
				  this.changeDebugHandler);
    this.controller.stopListening("forwardSelector", Mojo.Event.propertyChange, 
				  this.changeForwardAction);
    this.controller.stopListening("button1Selector", Mojo.Event.propertyChange, 
    				  this.changeButton1Action);
    this.controller.stopListening("button2Selector", Mojo.Event.propertyChange, 
    				  this.changeButton2Action);
    this.controller.stopListening("button3Selector", Mojo.Event.propertyChange, 
    				  this.changeButton3Action);
    this.controller.stopListening("button4Selector", Mojo.Event.propertyChange, 
    				  this.changeButton4Action);
    this.controller.stopListening("volumeUpSelector", Mojo.Event.propertyChange, 
    				  this.volumeUpActionHandler);
    this.controller.stopListening("volumeDnSelector", Mojo.Event.propertyChange, 
    				  this.volumeDnActionHandler);
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

