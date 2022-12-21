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

			this.getRouter().getRoute("Kit").attachPatternMatched(function(oEvent) {
				var oModel = that.getModel();
				var _params = oEvent.getParameters();
				that._werks = _params.arguments.werks;
				that._matnr = _params.arguments.matnr;
				that._aufnr = _params.arguments.aufnr;
				that._idnrk = _params.arguments.idnrk;
				that._gstrp = _params.arguments.gstrp;
				// this.getModel("viewModel").setProperty("/Werks", this._werks);
				// this.getUserDefaultParameters().then(function() {
				// 	this.getModel("viewModel").setProperty("/busy", false);
				// });

				that.getModel("viewModel").setProperty("/busy", true);
				oModel.invalidate();
				oModel.callFunction("/GetPesagemKIT", {
					method: "GET",
					urlParameters: {
						Werks: that._werks,
						Matnr: that._matnr,
						Aufnr: that._aufnr,
						Idnrk: that._idnrk,
						Gstrp: that._gstrp,
						Id_balanca: 'N',
						Sku: ""
					},
					"$expand": "Items",
					success: function(oData) {
						that.getModel("viewModel").setProperty("/PesaKITSet", oData.results);
						that.getModel("viewModel").setProperty("/busy", false);
						that.getView().byId("tbPesaKIT").getBinding("items").refresh();
					},
					error: function(error) {
						// alert(this.oResourceBundle.getText("ErrorReadingProfile"));
						// oGeneralModel.setProperty("/sideListBusy", false);
						that.getModel("viewModel").setProperty("/busy", false);
					}
				});

				// this.getModel().read("/PesagemKITSet", {
				// 	filters: [
				// 		new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, this._werks)
				// 	],
				// 	success: function(oData) {
				// 		this.getModel("viewModel").setProperty("/BalancaSet", oData.results);
				// 	},
				// 	error: function(err) {
				// 		this.toastMessage("Erro ao buscar Balança.");
				// 		console.log("Erro ao buscar Balança", err);
				// 	}
				// });			

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
			var oTable = this.getView().byId("tbPesaKIT");
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
					oModel.callFunction("/GetPesagemKIT", {
						method: "GET",
						urlParameters: {
							Werks: this._werks,
							Matnr: this._matnr,
							Aufnr: this._aufnr,
							Idnrk: this._idnrk,
							Gstrp: this._gstrp,
							Id_balanca: oData.Id_balanca,
							Sku: "0"
						},
						success: function(Data) {
							that.getModel("viewModel").setProperty("/PesaKITSet", Data.results);
							that.getModel("viewModel").setProperty("/busy", false);
							that.getView().byId("tbPesaKIT").getBinding("items").refresh();
						},
						error: function(error) {
							// alert(this.oResourceBundle.getText("ErrorReadingProfile"));
							// oGeneralModel.setProperty("/sideListBusy", false);
							that.getModel("viewModel").setProperty("/busy", false);
						}
					});	
				} else {
    				oModel.callFunction("/GetPesagemKIT", {
						method: "GET",
						urlParameters: {
							Werks: this._werks,
							Matnr: this._matnr,
							Aufnr: this._aufnr,
							Idnrk: this._idnrk,
							Gstrp: this._gstrp,
							Id_balanca: oData.Id_balanca,
							Sku: oSelected.Componente
						},
						success: function(Data) {
							that.getModel("viewModel").setProperty("/PesaKITSet", Data.results);
							that.getModel("viewModel").setProperty("/busy", false);
							that.getView().byId("tbPesaKIT").getBinding("items").refresh();
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
			var oTable = this.getView().byId("tbPesaKIT");
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
									Qtd_pesada: oSelected.Peso,
									Werks: oSelected.Werks,
									Impressora: oData.Impressora,
									Quebra: quebra,
									Bdmng: oSelected.Bdmng
								},
								success: function(oData) {
									that.getModel("viewModel").setProperty("/busy", false);
									if (!oData.Aufnr) {
										MessageBox.information("Esse componente já foi totalmente pesado para essa ordem, verificar");	
									} else if (!oData.Charg_op) {
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
					oModel.callFunction("/ImprimeEtiquetaBal", {
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
							// Qtd_pesada: oSelected.Qtd_pesada, 
							Qtd_pesada: oSelected.Qtd_pesada,
							Werks: oSelected.Werks,
							Impressora: oData.Impressora,
							Id_balanca: oData.Id_balanca,
							Quebra: quebra,
							Qtd_nes: oSelected.Bdmng
						},
						success: function(oData) {
							if (!oData.Aufnr) {
								that.getModel("viewModel").setProperty("/busy", false);
								MessageBox.information("Esse componente já foi totalmente pesado para essa ordem, verificar");	
							} else if (!oData.Qtd_pesada) {
								that.getModel("viewModel").setProperty("/busy", false);
								MessageBox.information("Peso fora da tolerância");							
							} else if (!oData.Charg_op) {
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