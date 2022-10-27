sap.ui.define([
	"sap/ui/Device"
], function(Device) {
	"use strict";

	return {

		formatStatus: function(status) {
			if (status === "3") {
				return 'Concluída';
			}

			if (status === "2") {
				return "Há itens pendentes de confirmação";
			}

			if (status === 1) {
				return "Fornecimento processado. Aguardando geração da OT.";
			}
		},
		removeLeadingZeros: function(value) {
			return value.replace(/\b0+/g, '');
		},
		removeDecimals: function(value) {
			return parseFloat(value, 10).toFixed(0);
		},
		numberToLocale: function(sNumber) {
			return (Math.round(sNumber * 1000) / 1000).toLocaleString();
		},
		numberToLocale2: function(sNumber) {
			return parseFloat(sNumber, 10).toLocaleString('pt-BR', {minimumFractionDigits: 3});	
		},
		formatNumberUnit: function(number, unit) {
			return `${this.numberToLocale(number)} ${unit}`;
		},
		formatStateLote: function(disponivel, verme) {
			if (disponivel >= verme) {
				return sap.ui.core.ValueState.Success;
			} else {
				return sap.ui.core.ValueState.Warning;
			}
		},
		formatOTStatus: function(pquit, inbound) {
			const sDirection = !inbound ? "Saida" : "Entrada";

			return !pquit ? "Aguardando " + sDirection : sDirection + " efetuada";

		}

	};
});