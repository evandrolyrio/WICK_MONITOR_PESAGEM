sap.ui.define([
	"Monitor/PesagemZPP_MONIT_PESAGEM/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ndc/BarcodeScanner",
	"sap/m/MessageBox",
], function(BaseController, JSONModel, BarcodeScanner, MessageBox) {
	"use strict";

	return BaseController.extend("Monitor.PesagemZPP_MONIT_PESAGEM.controller.Reimpressao", {

		onInit: function() {

			this.setModel(this.getOwnerComponent().getModel());

			this.setModel(new JSONModel({
				busy: false,
				//FilterData
				ReimpressaoSet: [],
				Impressora: "",
				Peso: ""
			}), "viewModel");
			var that = this;

			this.getRouter().getRoute("Reimpressao").attachPatternMatched(function(oEvent) {
				var oModel = that.getModel();
				var _params = oEvent.getParameters();
				this._aufnr = _params.arguments.aufnr;

				that.getModel("viewModel").setProperty("/busy", true);
				oModel.invalidate();
				oModel.callFunction("/GetReimpressao", {
					method: "GET",
					urlParameters: {
						Aufnr: this._aufnr
					},
					success: function(oData) {
						that.getModel("viewModel").setProperty("/ReimpressaoSet", oData.results);
						that.getModel("viewModel").setProperty("/busy", false);
						that.getView().byId("tbReimpressao").getBinding("items").refresh();
					},
					error: function(error) {
						// alert(this.oResourceBundle.getText("ErrorReadingProfile"));
						// oGeneralModel.setProperty("/sideListBusy", false);
						that.getModel("viewModel").setProperty("/busy", false);
					}
				});
			});
		},
		Imprimir: function(oEvent) {
			var oTable = this.getView().byId("tbReimpressao");
			var oSelected = oTable.getSelectedItems()[0].oBindingContexts.viewModel.getObject();
			var items = oTable.getSelectedItems().length;
			var oModel = this.getModel();
			var that = this;
			that.getModel("viewModel").setProperty("/busy", true);
			for (var i = 0; i < items; i++) {

				var item = oTable.getSelectedItems()[i].oBindingContexts.viewModel.getObject();

				oModel.invalidate();
				oModel.callFunction("/ReimprimeEtiqueta", {
					method: "GET",
					urlParameters: {
						Zetiqid: item.Zetiqid
					},
					success: function(oData) {
						that.getModel("viewModel").setProperty("/busy", false);
						MessageBox.information("Impressão realizada com sucesso");
					},
					error: function(error) {
						// alert(this.oResourceBundle.getText("ErrorReadingProfile"));
						// oGeneralModel.setProperty("/sideListBusy", false);
						that.getModel("viewModel").setProperty("/busy", false);
						MessageBox.information("Erro na impressão");
					}
				});

			}
		}

	});

});