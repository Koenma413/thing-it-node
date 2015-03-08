module.exports = {
	metadata : {
		plugin : "led",
		label : "LED",
		role : "actor",
		family : "light",
		deviceTypes : [ "microcontroller/microcontroller" ],
		services : [ {
			id : "on",
			label : "On"
		}, {
			id : "off",
			label : "Off"
		}, {
			id : "blink",
			label : "Blink"
		} ],
		state : [ {
			id : "light",
			label : "Light",
			type : {
				id : "string"
			}
		} ],
		configuration : [ {
			label : "Pin",
			id : "pin",
			type : {
				family : "reference",
				id : "digitalInOutPin"
			},
			defaultValue : "12"
		} ]
	},
	create : function() {
		return new Led();
	}
};

var q = require('q');

/**
 * 
 */
function Led() {
	/**
	 * 
	 */
	Led.prototype.start = function() {
		var deferred = q.defer();

		this.state = {
			light : "off"
		};

		var self = this;

		this.startActor().then(
				function() {
					if (!self.isSimulated()) {
						try {
							var five = require("johnny-five");

							self.led = new five.Led(self.configuration.pin);
						} catch (x) {
							self.device.node
									.publishMessage("Cannot initialize "
											+ self.device.id + "/" + self.id
											+ ":" + x);
						}
					}

					deferred.resolve();
				}).fail(function(error) {
			deferred.reject(error);
		});

		return deferred.promise;
	};

	/**
	 * 
	 */
	Led.prototype.getState = function() {
		return this.state;
	};

	/**
	 * 
	 */
	Led.prototype.setState = function(state) {
		this.state = state;

		if (this.led) {
			if (this.state.light == "blink") {
				this.led.blink();
			} else if (this.state.light == "on") {
				this.led.on();
			} else {
				this.led.stop().off();
			}
		}
	};

	/**
	 * 
	 */
	Led.prototype.on = function() {
		if (this.led) {
			this.led.on();
		}

		this.state.light = "on";

		this.publishStateChange();
	}

	/**
	 * 
	 */
	Led.prototype.off = function() {
		if (this.led) {
			this.led.stop().off();
		}

		this.state.light = "off";

		this.publishStateChange();
	}

	/**
	 * 
	 */
	Led.prototype.toggle = function() {
		if (this.state.light == "off") {
			this.state.light = "on";

			if (this.led) {
				this.led.on();
			}
		} else {
			this.state.light = "off";

			if (this.led) {
				this.led.stop().off();
			}
		}

		this.publishStateChange();
	}

	/**
	 * 
	 */
	Led.prototype.blink = function() {
		if (this.led) {
			this.led.blink();
		}

		this.state.light = "blink";

		this.publishStateChange();
	}
};