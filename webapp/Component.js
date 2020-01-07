sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/sap/upl/TOConfirmationDelivery/model/models",
	"sap/ui/model/json/JSONModel"
], function (UIComponent, Device, models, JSONModel) {
	"use strict";

	return UIComponent.extend("com.sap.upl.TOConfirmationDelivery.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			var oModel = new JSONModel({
				busy: false,
				enableConfirm: false,
			});
			this.setModel(oModel, "settingsModel");
			this.getModel("settingsModel").refresh();
			this.getModel("settingsModel").updateBindings();
			var toConfirmData = new JSONModel({
				DONUMBER: "",
				WHNUMBER: "",
				TOITEMNUMBER: "",
				MATERIAL: "",
				BATCH: "",
				QUANTITY: "",
				INDICATOR: "",
				TONUMBER: "",
				NAVHEADERDOTODODETAILS: []
			});
			this.setModel(toConfirmData, "toConfirmModel");
			this.getModel("toConfirmModel").refresh();
			this.getModel("toConfirmModel").updateBindings();

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
		}
	});
});