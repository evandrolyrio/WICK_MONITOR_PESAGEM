sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"Monitor/PesagemZPP_MONIT_PESAGEM/model/models",
	"sap/f/FlexibleColumnLayoutSemanticHelper"
], function(UIComponent, Device, JSONModel, models, FCLSHelper) {
	"use strict";

	return UIComponent.extend("Monitor.PesagemZPP_MONIT_PESAGEM.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			UIComponent.prototype.init.apply(this, arguments);
			
			// this.setModel(models.createDeviceModel(), "device");
			this.setModel(new JSONModel(), "routing");

			this.getRouter().initialize();

			this.oMessageManager = sap.ui.getCore().getMessageManager();
			this.setModel(this.oMessageManager.getMessageModel(), "message");

		},
		createContent: function() {
			return sap.ui.view({
				viewName: "Monitor.PesagemZPP_MONIT_PESAGEM.view.App",
				type: "XML"
			});
		},
		getMessageManager: function() {
			return this.oMessageManager;
		},
		getRoutingModel: function() {
			return this.getModel("routing");
		},
		getHelper: function() {
			var oFCL = this.getRootControl().byId("fcl"),

				oSettings = {
					defaultTwoColumnLayoutType: sap.f.LayoutType.TwoColumnsMidExpanded,
					defaultThreeColumnLayoutType: sap.f.LayoutType.ThreeColumnsEndExpanded,
					initialColumnsCount: 1,
					maxColumnsCount: 3
				};

			return FCLSHelper.getInstanceFor(oFCL, oSettings);
		}
	});
});