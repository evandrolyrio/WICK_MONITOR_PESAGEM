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
				// that.getModel("viewModel").setProperty("/busy", true);
				that.getModel("viewModel").setProperty("/Id_carrinho", this._id_carrinho);
				that.getModel("viewModel").setProperty("/Aufnr", this._aufnr);
				
				oModel.invalidate();
				oModel.callFunction("/GetMontagemKIT", {
					method: "GET",
					urlParameters: {
						Aufnr: this._aufnr,
						Id_carrinho: this._id_carrinho
					},
					"$expand": "Items",
					success: function(oData) {
						if (!oData.Aufnr) {
							MessageBox.error("Não foi possível localizar pesagens para essa ordem.");
							that.navigateBack();
						} else if (!oData.Id_carrinho) {
							MessageBox.error("Carrinho não cadastrado para esse centro, verificar.");
							that.navigateBack();
						} else {						
							that.getModel("viewModel").setProperty("/Werks", oData.Werks);
							that.getView().byId("tbMontaKIT").getBinding("items").refresh();
							that.scanHU().then(function (scanned) {
								var barcode = scanned;
								var oModel2 = that.getModel();
								oModel2.invalidate();
								oModel2.callFunction("/MontagemKIT", {
									method: "GET",
									urlParameters: {
										Aufnr: that.getModel("viewModel").getProperty("/Aufnr"),
										Id_carrinho: that.getModel("viewModel").getProperty("/Id_carrinho"),
										Werks: that.getModel("viewModel").getProperty("/Werks"),
										Barcode: barcode,
										Delete: "I"
									},
									"$expand": "Items",
									success: function(Data) {	
										that.getModel("viewModel").setProperty("/MontaKITSet", Data.results);
										that.getModel("viewModel").setProperty("/busy", false);
										that.getView().byId("tbMontaKIT").getBinding("items").refresh();
										that.lerCod();
									},
									error: function(error) {
										that.getModel("viewModel").setProperty("/busy", false);
									}
								});	
							});											
						}
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
		lerCod: function() {
			var that = this;
			this.scanHU().then(function (scanned) {
				var barcode = scanned;
				var oModel = that.getModel();
				oModel.invalidate();
				oModel.callFunction("/MontagemKIT", {
					method: "GET",
					urlParameters: {
						Aufnr: that.getModel("viewModel").getProperty("/Aufnr"),
						Id_carrinho: that.getModel("viewModel").getProperty("/Id_carrinho"),
						Werks: that.getModel("viewModel").getProperty("/Werks"),
						Barcode: barcode,
						Delete: "N"
					},
					success: function(oData) {	
						that.getModel("viewModel").setProperty("/MontaKITSet", oData.results);
						that.getModel("viewModel").setProperty("/busy", false);
						that.getView().byId("tbMontaKIT").getBinding("items").refresh();
						that.lerCod();
					},
					error: function(error) {
						that.getModel("viewModel").setProperty("/busy", false);
					}
				});	
			});					
		},
		deletar: function() {
			var oTable = this.getView().byId("tbMontaKIT");
			var items = oTable.getSelectedItems().length;
			var oModel = this.getModel();
			
			
			var that = this;
			that.getModel("viewModel").setProperty("/busy", true);
			for (var i = 0; i < items; i++) {

				var item = oTable.getSelectedItems()[i].oBindingContexts.viewModel.getObject();

				oModel.invalidate();
				oModel.callFunction("/MontagemKIT", {
					method: "GET",
					urlParameters: {
						Aufnr: that.getModel("viewModel").getProperty("/Aufnr"),
						Id_carrinho: that.getModel("viewModel").getProperty("/Id_carrinho"),
						Werks: that.getModel("viewModel").getProperty("/Werks"),
						Barcode: item.Barcode,
						Delete: "Y"
					},
					success: function(oData) {	
						that.getModel("viewModel").setProperty("/MontaKITSet", oData.results);
						that.getModel("viewModel").setProperty("/busy", false);
						that.getView().byId("tbMontaKIT").getBinding("items").refresh();
					},
					error: function(error) {
						that.getModel("viewModel").setProperty("/busy", false);
					}
				});
			}			
			
			
			
		},
		finalizar: function() {
			var that = this;
			var oModel = this.getModel();
			this.getModel("viewModel").setProperty("/busy", true);
			oModel.invalidate();
			oModel.callFunction("/Finalizar", {
				method: "GET",
				urlParameters: {
					Aufnr: this.getModel("viewModel").getProperty("/Aufnr"),
					Id_carrinho: this.getModel("viewModel").getProperty("/Id_carrinho"),
					Werks: this.getModel("viewModel").getProperty("/Werks")
				},
				success: function(oData) {	
					that.getModel("viewModel").setProperty("/busy", false);
					if (oData.Matnr) {
						MessageBox.information("Não lido o componente:" + oData.Matnr);
					} else if (oData.Qtd_p === "1") {
						MessageBox.information("Quantidade pesada divergente da LT");
					} else {
					   	MessageBox.information("Finalização da montagem do carrinho efetuada.");
					   	that.navigateBack();
					}
					
				},
				error: function(error) {
					that.getModel("viewModel").setProperty("/busy", false);
				}
			});			
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