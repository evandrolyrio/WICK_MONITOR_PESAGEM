sap.ui.define([
	"Monitor/PesagemZPP_MONIT_PESAGEM/controller/BaseController",
	"sap/ui/core/ResizeHandler",
	"sap/f/FlexibleColumnLayout"
], function(Controller, ResizeHandler, FlexibleColumnLayout) {
	"use strict";

	return Controller.extend("Monitor.PesagemZPP_MONIT_PESAGEM.controller.App", {

		onInit: function() {
			this.setModel(this.getOwnerComponent().getRoutingModel(), "routingModel");
			this.setModel(this.getOwnerComponent().getModel());
			this.oRouter = this.getRouter();
			this.oRouter.attachRouteMatched(this.onRouteMatched, this);
			this.oRouter.attachBeforeRouteMatched(this.onBeforeRouteMatched, this);

		},

		onBeforeRouteMatched: function(oEvent) {
			var oModel = this.getOwnerComponent().getRoutingModel();
			var sLayout = oEvent.getParameters().arguments.layout;

			// If there is no layout parameter, query for the default level 0 layout (normally OneColumn)
			if (!sLayout) {
				var oNextUIState = this.getHelper().getNextUIState(0);
				sLayout = oNextUIState.layout;
			}

			// Update the layout of the FlexibleColumnLayout
			if (sLayout) {
				oModel.setProperty("/layout", sLayout);
			}
		},

		_updateLayout: function(sLayout) {
			var oModel = this.getOwnerComponent().getRoutingModel();

			// If there is no layout parameter, query for the default level 0 layout (normally OneColumn)
			if (!sLayout) {
				var oNextUIState = this.getHelper().getNextUIState(0);
				sLayout = oNextUIState.layout;
			}

			// Update the layout of the FlexibleColumnLayout
			if (sLayout) {
				oModel.setProperty("/layout", sLayout);
			}
		},

		onRouteMatched: function(oEvent) {
			var sRouteName = oEvent.getParameter("name"),
				oArguments = oEvent.getParameter("arguments");

			this._updateUIElements();

			// Save the current route name
			this.currentRouteName = sRouteName;
			this.currentId = oArguments.Id;

		},

		onStateChanged: function(oEvent) {
			var bIsNavigationArrow = oEvent.getParameter("isNavigationArrow"),
				sLayout = oEvent.getParameter("layout");

			this._updateUIElements();

			// Replace the URL with the new layout if a navigation arrow was used
			if (bIsNavigationArrow) {
				this.oRouter.navTo(this.currentRouteName, {
					layout: sLayout,
					id: this.currentId
				}, true);
			}
		},

		// Update the close/fullscreen buttons visibility
		_updateUIElements: function() {
			var oModel = this.getOwnerComponent().getRoutingModel();
			var oUIState = this.getHelper().getCurrentUIState();
			oModel.setData(oUIState, true);
		},

		_onResize: function(oEvent) {
			var bPhone = (oEvent.size.width < FlexibleColumnLayout.TABLET_BREAKPOINT);
			this.getModel().setProperty("/isPhone", bPhone);
		},

		onExit: function() {
			this.oRouter.detachRouteMatched(this.onRouteMatched, this);
			this.oRouter.detachBeforeRouteMatched(this.onBeforeRouteMatched, this);
		}
	});
});