//* -*-javascript-*- */

function PreferencesAssistant() {
    try {
	
    } catch (err) {
        Mojo.Log.error("PreferencesAssistant()", err);
        Mojo.Controller.errorDialog(err);
    }
}

PreferencesAssistant.prototype.setup = function() {

    this.hostModel = {
	value: "XYZ",
	disabled: false
    };

    this.hostselectorAttributes = {
	choices: [
	    {label: "JERSEY", value: "JERSEY"},
	    {label: "BSG2039", value: "BSG2039"},
	    {label: "XYZ", value: "XYZ"}
	]
    };
    
    this.controller.setupWidget("hostselectorId",
				this.hostselectorAttributes,
				this.hostModel
			       ); 
    
    Mojo.Event.listen(this.controller.get("hostselectorId"),
		      Mojo.Event.propertyChange, 
		      this.handleHostChange.bindAsEventListener(this));

    /* open the database and start the cascade to display it's value */
    /* db location: /var/palm/data/file_......bluetoothpresenter_0/000000000000001e.db */
    this.db = new Mojo.Depot(
	{ name:"com.henschkowski.app.bluetoothpresenter", version: 1, replace: false },
	this.FetchPrefValue.bind(this),
	this.dbError.bind(this)
    );
}

PreferencesAssistant.prototype.handleHostChange = function(event) {
    /* event triggerd by user: host value changed.
     * fetch it and store it to the db
     */
    try {
	Mojo.Log.error("Preferences handleChangeHost; value = ", this.hostModel.value);
	this.db.simpleAdd(
	    "host", this.hostModel.value, 
	    function() {
		Mojo.Log.error("Default host set to " + this.hostModel.value);
	    }, 
	    function(transaction,result) { 
		Mojo.Log.warn("Database save error (#", result.message, ") - can't save host item.");
		Mojo.Controller.errorDialog("Database save error (#" + result.message + ") - can't save host.");
	    }
	);
    }
    catch (err) {
	Mojo.Log.error("handleHostChange()", err);
        Mojo.Controller.errorDialog(err);
    }
}


PreferencesAssistant.prototype.fetchPrefValue = function() {
    /* db opened, fetch the value */
    try {
	Mojo.Log.error("FetchPrefValue()","Database opened OK"); 
	this.db.simpleGet("host", this.setHost.bind(this), this.setDefaultHost.bind(this));
    }
    catch (err) {
	Mojo.Log.error("FetchPrefValue()", err);
        Mojo.Controller.errorDialog(err);
    }
}

PreferencesAssistant.prototype.setHost = function(dbval) {
    /* value fetched, set the settings screen to it, if any */
    try {
	if (Object.toJSON(dbval) == "{}" || dbval === null) { 
            Mojo.Log.error("Retrieved empty or null value from DB"); 
            this.SetDefaultHost(); 
	}
	else {
            Mojo.Log.error("Retrieved value from DB: " + dbval);
	    this.hostModel.value = dbval;
	    this.controller.modelChanged(this.hostModel);
	} 
    }
    catch (err) {
	Mojo.Log.error("PreferencesAssistant()", err);
        Mojo.Controller.errorDialog(err);
    }
}


PreferencesAssistant.prototype.SetDefaultHost = function(dbval) {
    /* no db, no value, or error: use default value */
    try {
	this.hostModel.value = 1;
	this.controller.modelChanged(this.hostModel);
	this.db.simpleAdd(
	    "<Set remote host in Preferences dialog>", 1, 
            function() {
		Mojo.Log.error("Default host set.");
	    }, 
            function(transaction,result) { 
		Mojo.Log.warn("Database save error (#", result.message, ") - can't save default host item.")
		Mojo.Controller.errorDialog("Database save error (#" + result.message + ") - can't save default host.");
            }
	);
    }
    catch (err) {
	Mojo.Log.error("PreferencesAssistant()", err);
        Mojo.Controller.errorDialog(err);
    }
}


PreferencesAssistant.prototype.dbError = function() {
    Mojo.Log.error("Preferences(): failed to open Mojo.Depot!");
    Mojo.Controller.errorDialog("Preferences(): failed to open Mojo.Depot!");
}


PreferencesAssistant.prototype.activate = function(event) {
}


PreferencesAssistant.prototype.deactivate = function(event) {
}


PreferencesAssistant.prototype.cleanup = function(event) {
    this.controller.stopListening("hostselectorId", Mojo.Event.propertyChange, this.ChangeStartDayHandler);
}
