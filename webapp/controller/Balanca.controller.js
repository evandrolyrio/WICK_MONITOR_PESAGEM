sap.ui.define([
	"Monitor/PesagemZPP_MONIT_PESAGEM/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ndc/BarcodeScanner",
	"sap/m/MessageBox",
	"zwmfc/mov_posicao/model/formatter"
], function(BaseController, JSONModel, BarcodeScanner, MessageBox, formatter) {
	"use strict";

	return BaseController.extend("Monitor.PesagemZPP_MONIT_PESAGEM.controller.Balanca", {
		formatter: formatter,
		onInit: function() {

			this.setModel(this.getOwnerComponent().getModel());

			this.getRouter().getRoute("Balanca").attachPatternMatched((oEvent) => {
				var _params = oEvent.getParameters();
				this._werks = _params.arguments.werks;
				this.getModel("viewModel").setProperty("/Werks", this._werks);
				this.getUserDefaultParameters().then(() => {
					this.getModel("viewModel").setProperty("/busy", false);
				});

				this.getModel().read("/BalancaSet", {
					filters: [
						new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, this._werks)
					],
					success: (oData) => {
						this.getModel("viewModel").setProperty("/BalancaSet", oData.results);
					},
					error: (err) => {
						this.toastMessage("Erro ao buscar Balança.");
						console.log("Erro ao buscar Balança", err);
					}
				});

			});

		}

	});

});