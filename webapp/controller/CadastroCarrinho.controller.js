sap.ui.define([
	"Monitor/PesagemZPP_MONIT_PESAGEM/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ndc/BarcodeScanner",
	"sap/m/MessageBox",
	'sap/m/ColumnListItem',
	'sap/m/Input',
	'sap/m/Text'
	 
], function( BaseController, JSONModel, BarcodeScanner, MessageBox, ColumnListItem, Input, Text) {
	"use strict";

	return BaseController.extend("Monitor.PesagemZPP_MONIT_PESAGEM.controller.CadastroCarrinho", {

		onInit: function() {
			
			this.setModel(new JSONModel({
				busy: false,
				//FilterData
				CarrinhoSet: []
			}), "viewModel");	
			this.oTable = this.byId("tbCadastroCar");
			this.oEditableTemplate = new ColumnListItem({
				cells: [
					new Input({
						value: "{viewModel>Werks}"
					}), new Input({
						value: "{viewModel>Id_carrinho}"
					}), new Input({
						value: "{viewModel>Uso}"
					})
				]
			});	
			this.oNavTemplate = new ColumnListItem({
				cells: [
					new Text({
						text: "{viewModel>Werks}"
					}), new Text({
						text: "{viewModel>Id_carrinho}"
					}), new Text({
						text: "{viewModel>Uso}"
					})
				]
			});				

			this.setModel(this.getOwnerComponent().getModel());
			this.oReadOnlyTemplate = this.byId("tbCadastroCar");
			var that = this;
			this.getRouter().getRoute("Carrinho").attachPatternMatched(function(oEvent) {
				var oModel = that.getModel();
				var _params = oEvent.getParameters();
				this._werks = _params.arguments.werks;
				that.getModel("viewModel").setProperty("/busy", true);
				oModel.invalidate();
				oModel.callFunction("/GetCarrinho", {
					method: "GET",
					urlParameters: {
						Werks: this._werks
					},
					success: function(oData) {
						that.getModel("viewModel").setProperty("/CarrinhoSet", oData.results);
						that.getModel("viewModel").setProperty("/busy", false);
						that.getView().byId("tbCadastroCar").getBinding("items").refresh();
					},
					error: function(error) {
						// alert(this.oResourceBundle.getText("ErrorReadingProfile"));
						// oGeneralModel.setProperty("/sideListBusy", false);
						that.getModel("viewModel").setProperty("/busy", false);
					}
				});

			});

		},
		rebindTable: function(oTemplate, sKeyboardMode) {
			this.oTable.bindItems({
				path: "viewModel>/CarrinhoSet",
				template: oTemplate,
				templateShareable: true
				// key: "ProductId"
			}).setKeyboardMode(sKeyboardMode);
		},

		onEdit: function() {
			this.aProductCollection = this.getModel("viewModel").getProperty("/CarrinhoSet");
			this.byId("editButton").setVisible(false);
			this.byId("saveButton").setVisible(true);
			this.byId("cancelButton").setVisible(true);
			this.rebindTable(this.oEditableTemplate, "Edit");
		},

		onSave: function() {
			this.byId("saveButton").setVisible(false);
			this.byId("cancelButton").setVisible(false);
			this.byId("editButton").setVisible(true);
			this.rebindTable(this.oNavTemplate, "Navigation");
		},

		onCancel: function() {
			this.byId("cancelButton").setVisible(false);
			this.byId("saveButton").setVisible(false);
			this.byId("editButton").setVisible(true);
			this.oModel.setProperty("/CarrinhoSet", this.aProductCollection);
			// this.rebindTable(this.oReadOnlyTemplate, "Navigation");
			this.rebindTable(this.oNavTemplate, "Navigation");
		},

		onOrder: function() {
			// MessageToast.show("Order button pressed");
		},

		onExit: function() {
			this.aProductCollection = [];
			this.oEditableTemplate.destroy();
			this.oModel.destroy();
		},

		onPaste: function(oEvent) {
			var aData = oEvent.getParameter("data");
			// MessageToast.show("Pasted Data: " + aData);
		}		

	});

});