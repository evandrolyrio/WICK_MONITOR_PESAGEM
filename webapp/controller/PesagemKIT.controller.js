sap.ui.define([
	"Monitor/PesagemZPP_MONIT_PESAGEM/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ndc/BarcodeScanner",
	"sap/m/MessageBox",
], function(BaseController, JSONModel, BarcodeScanner, MessageBox) {
	"use strict";

	return BaseController.extend("Monitor.PesagemZPP_MONIT_PESAGEM.controller.PesagemKIT", {

		onInit: function() {

			this.setModel(this.getOwnerComponent().getModel());

			this.getRouter().getRoute("Kit").attachPatternMatched(function (oEvent) {
				var _params = oEvent.getParameters();
				this._werks = _params.arguments.werks;
				this.getModel("viewModel").setProperty("/Werks", this._werks);
				this.getUserDefaultParameters().then(function() {
					this.getModel("viewModel").setProperty("/busy", false);
				});

				this.getModel().read("/PesagemKITSet", {
					filters: [
						new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, this._werks)
					],
					success: function(oData) {
						this.getModel("viewModel").setProperty("/BalancaSet", oData.results);
					},
					error: function(err) {
						this.toastMessage("Erro ao buscar Balança.");
						console.log("Erro ao buscar Balança", err);
					}
				});			

			});
			// this.getRouter().getRoute("PesagemKIT").attachPatternMatched(this._onObjectMatched, this);
			
		},

	});

});