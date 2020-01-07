sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (Controller, MessageBox, JSONModel, Device) {
	"use strict";

	return Controller.extend("com.sap.upl.TOConfirmationDelivery.controller.ConfirmDelivery", {

		onInit: function () {
			jQuery.sap.delayedCall(400, this, function () {
				this.byId("WarehouseNo").focus();
			});
			this.onlyNumber(this.byId("DoNumber"));

			this.path = "/sap/fiori/ztoconfirmationdelivery/" + this.getOwnerComponent().getModel("soundModel").sServiceUrl +
				"/SoundFileSet('sapmsg1.mp3')/$value";
		},
		onlyNumber: function (element) {
			element.attachBrowserEvent("keydown", (function (e) {
				var isModifierkeyPressed = (e.metaKey || e.ctrlKey || e.shiftKey);
				var isCursorMoveOrDeleteAction = ([46, 8, 37, 38, 39, 40, 9].indexOf(e.keyCode) !== -1);
				var isNumKeyPressed = (e.keyCode >= 48 && e.keyCode <= 58) || (e.keyCode >= 96 && e.keyCode <= 105);
				var vKey = 86,
					cKey = 67,
					aKey = 65;
				switch (true) {
				case isCursorMoveOrDeleteAction:
				case isModifierkeyPressed === false && isNumKeyPressed:
				case (e.metaKey || e.ctrlKey) && ([vKey, cKey, aKey].indexOf(e.keyCode) !== -1):
					break;
				default:
					e.preventDefault();
				}
			}));
		},
		onAfterRenderinf: function () {
			jQuery.sap.delayedCall(400, this, function () {
				this.byId("WarehouseNo").focus();
			});
			this.onlyNumber(this.byId("DoNumber"));
		},

		onchange: function (oEvt) {
			if (oEvt.getSource().getValue() != "") {
				oEvt.getSource().setValueState("None");
			}
			if (oEvt.getSource().getName() == "WarehouseNo") {
				if (this.byId("WarehouseNo").getSelectedKey() != "") {
					this.getOwnerComponent().getModel("toConfirmModel").setProperty("/WHNUMBER", oEvt.getSource().getSelectedKey());
					jQuery.sap.delayedCall(400, this, function () {
						this.byId("DoNumber").focus();
					});
				}
				if (this.byId("DoNumber").getValue() != "" && this.byId("WarehouseNo").getValue() != "") {
					this.checkField();
				}
			} else if (oEvt.getSource().getName() == "DoNumber") {
				if (this.byId("DoNumber").getValue() != "") {
					jQuery.sap.delayedCall(400, this, function () {
						document.activeElement.blur();
					});
				}
				if (this.byId("DoNumber").getValue() != "" && this.byId("WarehouseNo").getValue() != "") {
					this.checkField();
				}
			}
		},

		checkField: function () {

			var InputFilter = new sap.ui.model.Filter({
				filters: [
					new sap.ui.model.Filter("WHNUMBER", sap.ui.model.FilterOperator.EQ, this.getOwnerComponent().getModel("toConfirmModel").getProperty(
						"/WHNUMBER")),
					new sap.ui.model.Filter("DONUMBER", sap.ui.model.FilterOperator.EQ, this.getOwnerComponent().getModel("toConfirmModel").getProperty(
						"/DONUMBER"))
				],
				and: true
			});

			var filter = new Array();
			filter.push(InputFilter);
			this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
			this.getOwnerComponent().getModel().read("/FIELDCHECKSet", {
				filters: filter,
				success: function (odata, oresponse) {
					var data = odata.results[0];
					if (data.ERROR_INDICATOR == 'E') {
						var audio = new Audio(this.path);
						audio.play();
						jQuery.sap.delayedCall(5000, this, function () {
							this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
							MessageBox.error(data.MESSAGE, {
								onClose: function (oAction) {
									if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
										var id;
										if (data.ERROR_TYPE == 'WHN') {
											this.getOwnerComponent().getModel("toConfirmModel").setProperty("/WHNUMBER", "");
											id = "WarehouseNo";
										} else if (data.ERROR_TYPE == 'DON') {
											this.getOwnerComponent().getModel("toConfirmModel").setProperty("/DONUMBER", "");
											id = "DoNumber";
										}
										jQuery.sap.delayedCall(400, this, function () {
											this.byId(id).focus();
										});
									}
								}.bind(this)
							});
						});
						this.getOwnerComponent().getModel("toConfirmModel").setProperty("/NAVHEADERDOTODODETAILS", []);
						this.getOwnerComponent().getModel("toConfirmModel").refresh();
						this.getOwnerComponent().getModel("toConfirmModel").updateBindings();
						this.getOwnerComponent().getModel("settingsModel").setProperty("/enableConfirm", false);

					} else {
						this.getTOItem();
					}
				}.bind(this),
				error: function (error) {
					this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
					var audio = new Audio(this.path);
					audio.play();

					if (JSON.parse(error.responseText).error.innererror.errordetails.length > 1) {
						var x = JSON.parse(error.responseText).error.innererror.errordetails;
						var details = '<ul>';
						var y = '';
						if (x.length > 1) {
							for (var i = 0; i < x.length - 1; i++) {
								y = '<li>' + x[i].message + '</li>' + y;
							}
						}
						details = details + y + "</ul>";

						MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("unabletocheckfield"), {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							details: details,
							contentWidth: "100px",
							onClose: function (oAction) {
								if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {

								}
							}.bind(this)
						});
					} else {
						MessageBox.error(JSON.parse(error.responseText).error.message.value, {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							details: details,
							contentWidth: "100px",
							onClose: function (oAction) {
								if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {

								}
							}.bind(this)
						});
					}
				}.bind(this)
			});
		},

		getTOItem: function () {
			var path = "/HEADERDOSet(DONUMBER='" + this.getOwnerComponent().getModel("toConfirmModel").getProperty("/DONUMBER") +
				"',WHNUMBER='" + this.getOwnerComponent().getModel("toConfirmModel").getProperty("/WHNUMBER") + "')";
			this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
			this.getOwnerComponent().getModel().read(path, {
				urlParameters: {
					$expand: 'NAVHEADERDOTODODETAILS'
				},
				success: function (odata, oresponse) {
					this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
					this.getOwnerComponent().getModel("toConfirmModel").setProperty("/NAVHEADERDOTODODETAILS", odata.NAVHEADERDOTODODETAILS.results);
					if (odata.NAVHEADERDOTODODETAILS.results.length > 0) {
						for (var i = 0; i < odata.NAVHEADERDOTODODETAILS.results.length; i++) {
							odata.NAVHEADERDOTODODETAILS.results[i].MATERIAL = odata.NAVHEADERDOTODODETAILS.results[i].MATERIAL.replace(/^0+/, '');
							odata.NAVHEADERDOTODODETAILS.results[i].QUANTITY = odata.NAVHEADERDOTODODETAILS.results[i].QUANTITY.replace(/^0+/, '');
						}

						this.getOwnerComponent().getModel("settingsModel").setProperty("/enableConfirm", true);
					} else {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/enableConfirm", false);
					}
					this.getOwnerComponent().getModel("toConfirmModel").refresh();
					this.getOwnerComponent().getModel("toConfirmModel").updateBindings();

					this.getOwnerComponent().getModel("settingsModel").refresh();
					this.getOwnerComponent().getModel("settingsModel").updateBindings();
					jQuery.sap.delayedCall(400, this, function () {
						document.activeElement.blur();
					});

				}.bind(this),
				error: function (error) {
					this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
					var audio = new Audio(this.path);
					audio.play();

					jQuery.sap.delayedCall(5000, this, function () {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
						this.getOwnerComponent().getModel("toConfirmModel").setProperty("/DONUMBER", "");
						this.getOwnerComponent().getModel("toConfirmModel").setProperty("/NAVHEADERDOTODODETAILS", []);
						this.getOwnerComponent().getModel("toConfirmModel").refresh();
						this.getOwnerComponent().getModel("toConfirmModel").updateBindings();
					});

					if (JSON.parse(error.responseText).error.innererror.errordetails.length > 1) {
						var x = JSON.parse(error.responseText).error.innererror.errordetails;
						var details = '<ul>';
						var y = '';
						if (x.length > 1) {
							for (var i = 0; i < x.length - 1; i++) {
								y = '<li>' + x[i].message + '</li>' + y;
							}
						}
						details = details + y + "</ul>";

						MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("unabletogetConfirmlist"), {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							details: details,
							contentWidth: "100px",
							onClose: function (oAction) {
								if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
									jQuery.sap.delayedCall(400, this, function () {
										this.byId("DoNumber").focus();
									});
								}
							}.bind(this)
						});
					} else {
						MessageBox.error(JSON.parse(error.responseText).error.message.value, {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							details: details,
							contentWidth: "100px",
							onClose: function (oAction) {
								if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
									jQuery.sap.delayedCall(400, this, function () {
										this.byId("DoNumber").focus();
									});
								}
							}.bind(this)
						});
					}

				}.bind(this)
			});
		},
		removeDuplicate: function (arr, comp) {
			var unique = arr.map(function (e) {
					return e[comp];
				}) // store the keys of the unique objects
				.map(function (e, i, final) {
					return final.indexOf(e) === i && i;
				}) // eliminate the dead keys & store unique objects
				.filter(function (e) {
					return arr[e];
				}).map(function (e) {
					return arr[e];
				});

			return unique;
		},

		onPressConfirm: function () {
			var sdata = {
				"WHNUMBER": this.getOwnerComponent().getModel("toConfirmModel").getProperty("/WHNUMBER"),
				"NAVHEADERDOTOITEMDO": []
			};
			/*var toNumber = {
				"TONUMBER": ""
			};*/

			for (var i = 0; i < this.getOwnerComponent().getModel("toConfirmModel").getProperty("/NAVHEADERDOTODODETAILS").length; i++) {
				var TONUMBERList = [];
				TONUMBERList = this.removeDuplicate(this.getOwnerComponent().getModel("toConfirmModel").getProperty("/NAVHEADERDOTODODETAILS"),
					"TONUMBER");
			}
			var NAVHEADERDOTOITEMDO = [];
			for (var j = 0; j < TONUMBERList.length; j++) {
				if (TONUMBERList[j].TONUMBER != "") {
					NAVHEADERDOTOITEMDO.push({
						"TONUMBER": TONUMBERList[j].TONUMBER
					});
				}
			}

			sdata["NAVHEADERDOTOITEMDO"] = NAVHEADERDOTOITEMDO;

			/*for (var i = 0; i < this.getOwnerComponent().getModel("toConfirmModel").getProperty("/NAVHEADERDOTODODETAILS").length; i++) {
				toNumber["TONUMBER"] = this.getOwnerComponent().getModel("toConfirmModel").getProperty("/NAVHEADERDOTODODETAILS")[i].TONUMBER;
				sdata["NAVHEADERDOTOITEMDO"].push(toNumber);
				toNumber = {
					"TONUMBER": ""
				};
			}*/

			this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
			this.getOwnerComponent().getModel().create("/HEADERDOSet", sdata, {
				method: 'POST',
				success: function (odata, oresponse) {

					MessageBox.success("TO Confirmed.", {
						icon: MessageBox.Icon.SUCCESS,
						title: "Success",
						contentWidth: "100px",
						onClose: function (oAction) {
							if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE" || oAction === null) {
								this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
								this.getOwnerComponent().getModel("settingsModel").setProperty("/enableConfirm", false);
								this.getOwnerComponent().getModel("toConfirmModel").setProperty("/DONUMBER", "");
								this.getOwnerComponent().getModel("toConfirmModel").setProperty("/WHNUMBER", "");
								this.getOwnerComponent().getModel("toConfirmModel").setProperty("/NAVHEADERDOTODODETAILS", []);
								this.getOwnerComponent().getModel("toConfirmModel").refresh();
								this.getOwnerComponent().getModel("toConfirmModel").updateBindings();
								jQuery.sap.delayedCall(400, this, function () {
									this.byId("WarehouseNo").focus();
									this.byId("WarehouseNo").setSeletedKey("");
								});
							}
						}.bind(this)
					});

				}.bind(this),
				error: function (error) {

					this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
					var audio = new Audio(this.path);
					audio.play();

					jQuery.sap.delayedCall(5000, this, function () {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
					});

					if (JSON.parse(error.responseText).error.innererror.errordetails.length > 1) {
						var x = JSON.parse(error.responseText).error.innererror.errordetails;
						var details = '<ul>';
						var y = '';
						if (x.length > 1) {
							for (var i = 0; i < x.length - 1; i++) {
								y = '<li>' + x[i].message + '</li>' + y;
							}
						}
						details = details + y + "</ul>";

						MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("unabletoConfirm"), {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							details: details,
							contentWidth: "100px",
							onClose: function (oAction) {
								if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
									/*jQuery.sap.delayedCall(400, this, function () {
										this.byId("WarehouseNo").focus();
									});*/
								}
							}.bind(this)
						});
					} else {
						MessageBox.error(JSON.parse(error.responseText).error.message.value, {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							details: details,
							contentWidth: "100px",
							onClose: function (oAction) {
								if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
									/*jQuery.sap.delayedCall(400, this, function () {
										this.byId("WarehouseNo").focus();
									});*/
								}
							}.bind(this)
						});
					}

				}.bind(this)
			});

		},

		getFormField: function (oFormContent) {
			var c = 0;
			for (var i = 0; i < oFormContent.length; i++) {
				if (oFormContent[i].getMetadata()._sClassName === "sap.m.Input") {
					if (oFormContent[i].getValue() == "") {
						oFormContent[i].setValueState("Error");
						oFormContent[i].setValueStateText(oFormContent[i - 1].getText() + " " + this.getOwnerComponent().getModel("i18n").getResourceBundle()
							.getText("isX"));
						oFormContent[i].focus();
						c++;
						return c;
					}
				} else if (oFormContent[i].getMetadata()._sClassName === "sap.m.ComboBox") {
					if (oFormContent[i].getSelectedKey() == "") {
						oFormContent[i].setValueState("Error");
						oFormContent[i].setValueStateText(oFormContent[i - 1].getText() + " " + this.getOwnerComponent().getModel("i18n").getResourceBundle()
							.getText("isX"));
						oFormContent[i].focus();
						c++;
						return c;
					}
				}
			}
		}

	});

});