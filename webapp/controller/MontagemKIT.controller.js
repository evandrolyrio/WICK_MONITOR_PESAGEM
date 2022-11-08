sap.ui.define([
	"Monitor/PesagemZPP_MONIT_PESAGEM/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ndc/BarcodeScanner",
	"sap/m/MessageBox"
], function(BaseController, JSONModel, BarcodeScanner, MessageBox) {
	"use strict";

	return BaseController.extend("Monitor.PesagemZPP_MONIT_PESAGEM.controller.MontagemKIT", {

		onInit: function() {

			this.setModel(this.getOwnerComponent().getModel());

			this.setModel(new JSONModel({
				busy: false,
				//FilterData
				MontaKITSet: [],
				Id_carrinho: "",
				Aufnr: "",
				Werks: "",
				Editable: ""
			}), "viewModel");
			var that = this;

			this.getRouter().getRoute("Montagem").attachPatternMatched(function(oEvent) {
				var oModel = that.getModel();
				var _params = oEvent.getParameters();
				this._aufnr = _params.arguments.aufnr;
				this._id_carrinho = _params.arguments.id_carrinho;
				that.getModel("viewModel").setProperty("/busy", true);
				that.getModel("viewModel").setProperty("/Id_carrinho", this._id_carrinho);
				that.getModel("viewModel").setProperty("/Aufnr", this._aufnr);
				
				oModel.invalidate();
				oModel.callFunction("/GetMontagemKIT", {
					method: "GET",
					urlParameters: {
						Aufnr: this._aufnr,
						Id_carrinho: this._id_carrinho,
						Deleta: ""
					},
					"$expand": "Items",
					success: function(oData) {
						that.getModel("viewModel").setProperty("/MontaKITSet", oData.results);
						that.getModel("viewModel").setProperty("/busy", false);
						that.getView().byId("tbMontaKIT").getBinding("items").refresh();
					},
					error: function(error) {
						// alert(this.oResourceBundle.getText("ErrorReadingProfile"));
						// oGeneralModel.setProperty("/sideListBusy", false);
						that.getModel("viewModel").setProperty("/busy", false);
					}
				});				

			});
			// this.getRouter().getRoute("PesagemKIT").attachPatternMatched(this._onObjectMatched, this);

		},
		onChangeImpressora: function(oEvent) {
			var oViewModel = this.getModel("viewModel");
			var sData = oEvent.getParameter("selectedItem").getBindingContext().getObject().Id_impressora;
			oViewModel.setProperty("/Impressora", sData);

		},
		pesarImprimir: function(oEvent) {
			var oTable = this.getView().byId("tbPesaKIT");
			var oSelected = oTable.getSelectedItems()[0].oBindingContexts.viewModel.getObject();
			var oModel = this.getModel();

			var oData = this.getModel("viewModel").getData();
			var that = this;
			if (!oData.Id_balanca) {
				if (!oData.Impressora) {
					MessageBox.error("Escolher impressora");
				} else {
					if (!oSelected.Qtd_pesada) {
						MessageBox.error("Campo Qtd.Pesada está vazio e é obrigatório em pesagem manual.");
					} else {
						// MessageBox.information("Pesagem manual, o peso considerado será o informado.");
						this.confirmAction("Pesagem manual, o peso considerado será o informado:" + oSelected.Qtd_pesada, "Confirm", function(answer) {

							if (answer !== sap.m.MessageBox.Action.YES) {
								return;
							}

							that.getModel("viewModel").setProperty("/busy", true);
							oModel.invalidate();
							oModel.callFunction("/ImprimeEtiqueta", {
								method: "GET",
								urlParameters: {
									Aufnr: oSelected.Aufnr,
									Charg: oSelected.Charg,
									Charg_op: oSelected.Charg_op,
									Data_valid: oSelected.Expirydate,
									Maktx: oSelected.Maktx,
									Maktx_op: oSelected.Maktx_c,
									Matnr: oSelected.Matnr,
									Meins: oSelected.Meins,
									Plnbez: oSelected.Componente,
									Qtd_pesada: oSelected.Qtd_pesada,
									Werks: oSelected.Werks,
									Impressora: oData.Impressora
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
						});
					}
				}
			}

		}

	});

});