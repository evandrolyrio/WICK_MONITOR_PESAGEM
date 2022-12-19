sap.ui.define([
	"Monitor/PesagemZPP_MONIT_PESAGEM/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ndc/BarcodeScanner",
	"sap/m/MessageBox",
], function(BaseController, JSONModel, BarcodeScanner, MessageBox) {
	"use strict";

	return BaseController.extend("Monitor.PesagemZPP_MONIT_PESAGEM.controller.PesagemInd", {

		onInit: function() {

			this.setModel(this.getOwnerComponent().getModel());

			this.setModel(new JSONModel({
				busy: false,
				//FilterData
				PesaKITSet: [],
				Id_balanca: "",
				Impressora: "",
				Peso: "",
				Quebra: "",
				Editable: ""
			}), "viewModel");
			var that = this;
			this.getModel().metadataLoaded().then(function() {
				that.getModel().read("/ImpressoraSet", {
					success: function(oData) {
						that.getModel("viewModel").setProperty("/ImpressoraSet", oData.results);
					}
				});
			});
			this.getModel().metadataLoaded().then(function() {
				that.getModel().read("/BalancaSet", {
					success: function(oData) {
						that.getModel("viewModel").setProperty("/BalancaSet", oData.results);
					}
				});
			});	
			
			this.scanHU().then(function (scanned) {
				var barcode = scanned;
				var oModel = that.getModel();
				that._barcode = barcode;
				oModel.invalidate();
				oModel.callFunction("/GetPesagemInd", {
					method: "GET",
					urlParameters: {
						Barcode: barcode,
						Id_balanca: 'N'
					},
					success: function(oData) {
						that.getModel("viewModel").setProperty("/PesaKITSet", oData.results);
						that.getModel("viewModel").setProperty("/busy", false);
						that.getView().byId("tbPesaInd").getBinding("items").refresh();
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
		onChangeBalanca: function(oEvent) {
			var oViewModel = this.getModel("viewModel");
			var sData = oEvent.getParameter("selectedItem").getBindingContext().getObject().Id_balanca;
			oViewModel.setProperty("/Id_balanca", sData);

		},	
		atualizaPeso: function(oEvent) {
			var oTable = this.getView().byId("tbPesaInd");
			var oSelected = oTable.getSelectedItems()[0].oBindingContexts.viewModel.getObject();			
			var oModel = this.getModel();
			var oData = this.getModel("viewModel").getData();
			var that = this;
			
			if (!oData.Id_balanca) {
				MessageBox.error("Escolher balança");
			} else {
				
				that.getModel("viewModel").setProperty("/busy", true);
				oModel.invalidate();
				if	(!oSelected.Componente) {
					oModel.callFunction("/GetPesagemInd", {
						method: "GET",
						urlParameters: {
							Barcode: that._barcode,
							Id_balanca: oData.Id_balanca
						},
						success: function(Data) {
							that.getModel("viewModel").setProperty("/PesaKITSet", Data.results);
							that.getModel("viewModel").setProperty("/busy", false);
							that.getView().byId("tbPesaInd").getBinding("items").refresh();
						},
						error: function(error) {
							// alert(this.oResourceBundle.getText("ErrorReadingProfile"));
							// oGeneralModel.setProperty("/sideListBusy", false);
							that.getModel("viewModel").setProperty("/busy", false);
						}
					});	
				} else {
    				oModel.callFunction("/GetPesagemInd", {
						method: "GET",
						urlParameters: {
							Barcode: that._barcode,
							Id_balanca: oData.Id_balanca
						},
						success: function(Data) {
							that.getModel("viewModel").setProperty("/PesaKITSet", Data.results);
							that.getModel("viewModel").setProperty("/busy", false);
							that.getView().byId("tbPesaInd").getBinding("items").refresh();
						},
						error: function(error) {
							// alert(this.oResourceBundle.getText("ErrorReadingProfile"));
							// oGeneralModel.setProperty("/sideListBusy", false);
							that.getModel("viewModel").setProperty("/busy", false);
						}
					});						
				}
				
			}
		},
		pesarImprimir: function(oEvent) {
			var oTable = this.getView().byId("tbPesaInd");
			var oSelected = oTable.getSelectedItems()[0].oBindingContexts.viewModel.getObject();
			var oModel = this.getModel();

			var oData = this.getModel("viewModel").getData();
			var that = this;
			
			var quebra = "N";
			if (oSelected.Quebra === true) {
				quebra = "S";
			}
			
			if (!oData.Id_balanca) {
				if (!oData.Impressora) {
					MessageBox.error("Escolher impressora");
				} else {
					if (!oSelected.Peso) {
						MessageBox.error("Campo Qtd.Pesada está vazio e é obrigatório em pesagem manual.");
					} else {
						// MessageBox.information("Pesagem manual, o peso considerado será o informado.");
						this.confirmAction("Pesagem manual, o peso considerado será o informado:" + oSelected.Peso, "Confirm", function(answer) {

							if (answer !== sap.m.MessageBox.Action.YES) {
								return;
							}

							that.getModel("viewModel").setProperty("/busy", true);
							oModel.invalidate();
							oModel.callFunction("/ImprimeEtiquetaInd", {
								method: "GET",
								urlParameters: {
									Charg: oSelected.Charg,
									Data_valid: oSelected.Expirydate,
									Maktx_op: oSelected.Maktx_c,
									// Meins: oSelected.Meins,
									Plnbez: oSelected.Componente,
									Qtd_pesada: oSelected.Peso,
									Werks: oSelected.Werks,
									Impressora: oData.Impressora
								},
								success: function(oData) {
									that.getModel("viewModel").setProperty("/busy", false);
									if (!oData.Charg) {
									    // MessageBox.information(" Ordem de produção ainda não liberada.");
									    MessageBox.information(oData.Msg);
									} else {
										oTable.removeSelections();
										// MessageBox.information("Impressão realizada com sucesso");
									}
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
			} else {
				if (!oData.Impressora) {
					MessageBox.error("Escolher impressora");
				} else {

					that.getModel("viewModel").setProperty("/busy", true);
					oModel.invalidate();
					oModel.callFunction("/ImprimeEtiquetaIndBal", {
						method: "GET",
						urlParameters: {
							Charg: oSelected.Charg,
							Data_valid: oSelected.Expirydate,
							Maktx_op: oSelected.Maktx_c,
							// Meins: oSelected.Meins,
							Plnbez: oSelected.Componente,
							Qtd_pesada: oSelected.Qtd_pesada,
							Werks: oSelected.Werks,
							Impressora: oData.Impressora,
							Id_balanca: oData.Id_balanca
						},
						success: function(oData) {
							if (!oData.Qtd_pesada) {
								that.getModel("viewModel").setProperty("/busy", false);
								MessageBox.information("Peso fora da tolerância");							
							} else if (!oData.Charg) {
								that.getModel("viewModel").setProperty("/busy", false);
								// MessageBox.information("Erro no movimento 261");
								MessageBox.information(oData.Msg);
							} else {
								that.getModel("viewModel").setProperty("/busy", false);
								oTable.removeSelections();
								// MessageBox.information("Impressão realizada com sucesso");								
							}

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

		}

	});

});