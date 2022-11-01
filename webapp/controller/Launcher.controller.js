sap.ui.define([
	"Monitor/PesagemZPP_MONIT_PESAGEM/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
	// "Monitor/PesagemZPP_MONIT_PESAGEM/model/formatter"	
], function(BaseController, JSONModel, MessageBox) {
	"use strict";

	return BaseController.extend("Monitor.PesagemZPP_MONIT_PESAGEM.controller.Launcher", {
		
		onInit: function() {
			
			this.setModel(this.getOwnerComponent().getModel());
			this.setModel(new JSONModel({
				busy: false,
				Werks: "",
				BdterDe: null,
				BdterAte: null
			}), "viewModel");

			// this.getModel().metadataLoaded().then(() => {
			// 	this.getUserDefaultParameters().then(() => {
			// 		this.getModel("viewModel").setProperty("/busy", false);
			// 	});

			// });
		},		
		goToBalanca: function() {
			var sWerks = this.getModel("viewModel").getProperty("/Werks");
			this.getRouter().navTo("Balanca", {
				lgnum: sWerks,
				layout: this.getNextUiState(1).layout
			});

		},
		goToKIT: function() {
			var oDialogData = this.oDialog.getModel().getData();
			// var sWerks = this.getModel("dialog").getProperty("/Werks");
			// var sMatnr = this.getModel("dialog").getProperty("/Matnr");
			// var sAufnr = this.getModel("dialog").getProperty("/Aufnr");
			// var sIdnrk = this.getModel("dialog").getProperty("/Idnrk");
			
			this.oDialog.close();
			this.oDialog.destroy(true);
			
			if ( !oDialogData.Matnr ) {
				oDialogData.Matnr = "0";
			}
			if ( !oDialogData.Aufnr ) {
				oDialogData.Aufnr = "0";
			}
			if ( !oDialogData.Idnrk ) {
				oDialogData.Idnrk = "0";
			}
			this.getRouter().navTo("Kit", {
				werks: oDialogData.Werks,
				matnr: oDialogData.Matnr,
				aufnr: oDialogData.Aufnr,
				idnrk: oDialogData.Idnrk,
				gstrp: oDialogData.Gstrp,
				layout: this.getNextUiState(1).layout
			});
		},		
		onDisplayKIT: function(oEvent) {
			this._currentContext = oEvent.getSource().getBindingContext();
			this.oDialog = new sap.ui.xmlfragment("Monitor.PesagemZPP_MONIT_PESAGEM.view.fragment.DisplayKITDialog", this);
			
			if (this.oDialog) {
				this.getView().addDependent(this.oDialog);

				this.oDialog.setModel(this.getModel());
				this.oDialog.setModel(new JSONModel({
					Werks: "",
					Matnr: "",
					Aufnr: ""
				}, "dialog"));

				this.oDialog.setBindingContext(this._currentContext);
				this.oDialog.open();
			}
		},
		onCloseDialog: function() {
			this.oDialog.close();
			this.oDialog.destroy(true);
		}
	});
});