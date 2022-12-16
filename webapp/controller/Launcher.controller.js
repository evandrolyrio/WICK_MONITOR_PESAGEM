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
		goToCarrinho: function() {
			var oDialogData = this.oDialog.getModel().getData();
			
			this.oDialog.close();
			this.oDialog.destroy(true);
			
			this.getRouter().navTo("Carrinho", {
				werks: oDialogData.Werks,
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
		goToMontaKIT: function() {
			var oDialogData = this.oDialog.getModel().getData();

			this.oDialog.close();
			this.oDialog.destroy(true);
			
			this.getRouter().navTo("Montagem", {
				aufnr: oDialogData.Aufnr,
				id_carrinho: oDialogData.Id_carrinho,
				layout: this.getNextUiState(1).layout
			});			
		},
		goToReimp: function() {
			var oDialogData = this.oDialog.getModel().getData();
			this.oDialog.close();
			this.oDialog.destroy(true);
			
			if ( !oDialogData.Aufnr ) {
				oDialogData.Aufnr = "0";
			}
			this.getRouter().navTo("Reimpressao", {
				aufnr: oDialogData.Aufnr,
				layout: this.getNextUiState(1).layout
			});
		},		
		onDisplayKIT: function(oEvent) {
			this._currentContext = oEvent.getSource().getBindingContext();
			this.oDialog = new sap.ui.xmlfragment("Monitor.PesagemZPP_MONIT_PESAGEM.view.fragment.DisplayKITDialog", this);
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
    							pattern: "dd.MM.YYYY"
				});
		    var oModel = this.getModel();
		    var that = this;
			oModel.invalidate();
			oModel.callFunction("/GetCentro", {
				method: "GET",
				success: function(oData) {
					that.getModel("viewModel").setProperty("/Werks", oData.Werks);
					that.getModel("viewModel").setProperty("/busy", false);
					if (that.oDialog) {
						that.getView().addDependent(that.oDialog);
		
						that.oDialog.setModel(that.getModel());
						that.oDialog.setModel(new JSONModel({
							Werks: that.getModel("viewModel").getProperty("/Werks"),
							Matnr: "",
							Aufnr: "",
							Gstrp: oDateFormat.format(new Date())
						}, "dialog"));
		
						that.oDialog.setBindingContext(that._currentContext);
						that.oDialog.open();
					}					
				},
				error: function(error) {
					that.getModel("viewModel").setProperty("/busy", false);
				}
			});				
			// if (this.oDialog) {
			// 	this.getView().addDependent(this.oDialog);

			// 	this.oDialog.setModel(this.getModel());
			// 	this.oDialog.setModel(new JSONModel({
			// 		Werks: that.getModel("viewModel").getProperty("/Werks"),
			// 		Matnr: "",
			// 		Aufnr: "",
			// 		Gstrp: oDateFormat.format(new Date())
			// 	}, "dialog"));

			// 	this.oDialog.setBindingContext(this._currentContext);
			// 	this.oDialog.open();
			// }
		},
		onCarrinho: function(oEvent) {
			this._currentContext = oEvent.getSource().getBindingContext();
			this.oDialog = new sap.ui.xmlfragment("Monitor.PesagemZPP_MONIT_PESAGEM.view.fragment.CarrinhoDialog", this);
			if (this.oDialog) {
				this.getView().addDependent(this.oDialog);

				this.oDialog.setModel(this.getModel());
				this.oDialog.setModel(new JSONModel({
					Werks: ""
				}, "dialog"));

				this.oDialog.setBindingContext(this._currentContext);
				this.oDialog.open();
			}			
		},		
		onMontaKIT: function(oEvent) {
			this._currentContext = oEvent.getSource().getBindingContext();
			this.oDialog = new sap.ui.xmlfragment("Monitor.PesagemZPP_MONIT_PESAGEM.view.fragment.MontagemKITDialog", this);
			if (this.oDialog) {
				this.getView().addDependent(this.oDialog);

				this.oDialog.setModel(this.getModel());
				this.oDialog.setModel(new JSONModel({
					Aufnr: "",
					Id_carrinho: ""
				}, "dialog"));

				this.oDialog.setBindingContext(this._currentContext);
				this.oDialog.open();
			}			
		},
		onDisplayReimp: function(oEvent) {
			this._currentContext = oEvent.getSource().getBindingContext();
			this.oDialog = new sap.ui.xmlfragment("Monitor.PesagemZPP_MONIT_PESAGEM.view.fragment.DisplayReimpDialog", this);
			if (this.oDialog) {
				this.getView().addDependent(this.oDialog);

				this.oDialog.setModel(this.getModel());
				this.oDialog.setModel(new JSONModel({
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