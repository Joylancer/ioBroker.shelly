'use strict';

const shellyHelper = require('../../shelly-helper');

/**
 * Sehlly EM / SHEM / shellyem
 * CoAP:
 *
 * CoAP Version >= 1.8
 *  Shelly EM SHEM:    {"blk":[{"I":1,"D":"relay_0"},{"I":2,"D":"emeter_0"},{"I":3,"D":"emeter_1"},{"I":4,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":4},{"I":1101,"T":"S","D":"output","R":"0/1","L":1},{"I":4105,"T":"P","D":"power","U":"W","R":["0/31800","-1"],"L":2},{"I":4106,"T":"E","D":"energy","U":"Wh","R":["U32","-1"],"L":2},{"I":4107,"T":"E","D":"energyReturned","U":"Wh","R":["U32","-1"],"L":2},{"I":4108,"T":"V","D":"voltage","U":"V","R":["0/265","-1"],"L":2},{"I":4205,"T":"P","D":"power","U":"W","R":["0/31800","-1"],"L":3},{"I":4206,"T":"E","D":"energy","U":"Wh","R":["U32","-1"],"L":3},{"I":4207,"T":"E","D":"energyReturned","U":"Wh","R":["U32","-1"],"L":3},{"I":4208,"T":"V","D":"voltage","U":"V","R":["0/265","-1"],"L":3},{"I":6102,"T":"A","D":"overpower","R":["0/1","-1"],"L":1}]}
 */
const shellyem = {
    'Relay0.Switch': {
        coap: {
            coap_publish: '1101',
            coap_publish_funct: value => value == 1,
            http_cmd: '/relay/0',
            http_cmd_funct: value => {
                return value === true ? { turn: 'on' } : { turn: 'off' };
            },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/relay/0',
            mqtt_publish_funct: value => value === 'on',
            mqtt_cmd: 'shellies/<mqttprefix>/relay/0/command',
            mqtt_cmd_funct: value => (value === true ? 'on' : 'off'),
        },
        common: {
            name: {
                en: 'Switch',
                de: 'Schalter',
                ru: 'Переключить',
                pt: 'Interruptor',
                nl: 'Vertaling:',
                fr: 'Interrupteur',
                it: 'Interruttore',
                es: 'Interruptor',
                pl: 'Switch',
                'zh-cn': '目 录',
            },
            type: 'boolean',
            role: 'switch',
            read: true,
            write: true,
            def: false,
        },
    },
    'Relay0.ChannelName': {
        coap: {
            http_publish: '/settings/relay/0',
            http_publish_funct: async (value, self) =>
                value ? await shellyHelper.setChannelName(self, 'Relay0', JSON.parse(value).name) : undefined,
            http_cmd: '/settings/relay/0',
            http_cmd_funct: value => ({ name: value }),
        },
        mqtt: {
            http_publish: '/settings/relay/0',
            http_publish_funct: async (value, self) =>
                value ? await shellyHelper.setChannelName(self, 'Relay0', JSON.parse(value).name) : undefined,
            http_cmd: '/settings/relay/0',
            http_cmd_funct: value => ({ name: value }),
        },
        common: {
            name: {
                en: 'Channel name',
                de: 'Kanalname',
                ru: 'Имя канала',
                pt: 'Nome do canal',
                nl: 'Kanaalnaam',
                fr: 'Nom du canal',
                it: 'Nome del canale',
                es: 'Nombre del canal',
                pl: 'Channel imię',
                'zh-cn': '姓名',
            },
            type: 'string',
            role: 'text',
            read: true,
            write: true,
            icon: shellyHelper.getIcon('signature'),
        },
    },
    'Relay0.AutoTimerOff': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).relays[0].auto_off : undefined),
            http_cmd: '/settings/relay/0',
            http_cmd_funct: value => ({ auto_off: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).relays[0].auto_off : undefined),
            http_cmd: '/settings/relay/0',
            http_cmd_funct: value => ({ auto_off: value }),
        },
        common: {
            name: 'Auto Timer Off',
            type: 'number',
            role: 'level.timer',
            def: 0,
            unit: 's',
            read: true,
            write: true,
        },
    },
    'Relay0.AutoTimerOn': {
        coap: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/0',
            http_publish_funct: value => (value ? JSON.parse(value).relays[0].auto_on : undefined),
            http_cmd_funct: value => ({ auto_on: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/0',
            http_publish_funct: value => (value ? JSON.parse(value).relays[0].auto_on : undefined),
            http_cmd_funct: value => ({ auto_on: value }),
        },
        common: {
            name: 'Auto Timer On',
            type: 'number',
            role: 'level.timer',
            def: 0,
            unit: 's',
            read: true,
            write: true,
        },
    },
    'Emeter0.Power': {
        coap: {
            coap_publish: '4105',
            coap_publish_funct: value => {
                return Math.round(value * 100) / 100;
            },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/emeter/0/power',
            mqtt_publish_funct: value => {
                return Math.round(value * 100) / 100;
            },
        },
        common: {
            name: 'Power',
            type: 'number',
            role: 'value.power',
            read: true,
            write: false,
            def: 0,
            unit: 'W',
        },
    },
    'Emeter0.Total': {
        coap: {
            coap_publish: '4106',
            coap_publish_funct: value => {
                return Math.round(value * 100) / 100;
            },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/emeter/0/total',
        },
        common: {
            name: 'Total',
            type: 'number',
            role: 'value.power.consumption',
            read: true,
            write: false,
            def: 0,
            unit: 'Wh',
        },
    },
    'Emeter0.Total_Returned': {
        coap: {
            coap_publish: '4107',
            coap_publish_funct: value => {
                return Math.round(value * 100) / 100;
            },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/emeter/0/total_returned',
        },
        common: {
            name: 'Total Returned',
            type: 'number',
            role: 'value.power.consumption',
            read: true,
            write: false,
            def: 0,
            unit: 'Wh',
        },
    },
    'Emeter0.ReactivePower': {
        coap: {
            http_publish: '/status',
            http_publish_funct: value => {
                return value ? Math.round(JSON.parse(value).emeters[0].reactive * 100) / 100 : undefined;
            },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/emeter/0/reactive_power',
            mqtt_publish_funct: value => {
                return Math.round(value * 100) / 100;
            },
        },
        common: {
            name: 'Reactive Power',
            type: 'number',
            role: 'value.power.reactive',
            read: true,
            write: false,
            def: 0,
            unit: 'VAR',
        },
    },
    'Emeter0.PowerFactor': {
        coap: {
            http_publish: '/status',
            http_publish_funct: async (value, self) => shellyHelper.getPowerFactor(self, 0),
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: async (value, self) => shellyHelper.getPowerFactor(self, 0),
        },
        common: {
            name: 'Power Factor',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            def: 0,
        },
    },
    'Emeter0.Voltage': {
        coap: {
            coap_publish: '4108',
            coap_publish_funct: value => {
                return Math.round(value * 100) / 100;
            },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/emeter/0/voltage',
            mqtt_publish_funct: value => {
                return Math.round(value * 100) / 100;
            },
        },
        common: {
            name: {
                en: 'Voltage',
                de: 'Spannung',
                ru: 'Напряжение',
                pt: 'Tensão',
                nl: 'Voltage',
                fr: 'Tension',
                it: 'Tensione',
                es: 'Voltaje',
                pl: 'Voltage',
                'zh-cn': '动产',
            },
            type: 'number',
            role: 'value.voltage',
            read: true,
            write: false,
            def: 0,
            unit: 'V',
        },
    },
    'Emeter0.Current': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => {
                return value ? Math.round(JSON.parse(value).emeters[0].ctraf_type * 100) / 100 : undefined;
            },
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => {
                return value ? Math.round(JSON.parse(value).emeters[0].ctraf_type * 100) / 100 : undefined;
            },
        },
        common: {
            name: 'Current Transformation Type',
            type: 'number',
            role: 'value.current',
            read: true,
            write: false,
            def: 0,
            unit: 'A',
        },
    },
    'Emeter1.Power': {
        coap: {
            coap_publish: '4205',
            coap_publish_funct: value => {
                return Math.round(value * 100) / 100;
            },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/emeter/1/power',
            mqtt_publish_funct: value => {
                return Math.round(value * 100) / 100;
            },
        },
        common: {
            name: 'Power',
            type: 'number',
            role: 'value.power',
            read: true,
            write: false,
            def: 0,
            unit: 'W',
        },
    },
    'Emeter1.Total': {
        coap: {
            coap_publish: '4206',
            coap_publish_funct: value => {
                return Math.round(value * 100) / 100;
            },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/emeter/1/total',
            mqtt_publish_funct: value => {
                return Math.round(value * 100) / 100;
            },
        },
        common: {
            name: 'Total',
            type: 'number',
            role: 'value.power.consumption',
            read: true,
            write: false,
            def: 0,
            unit: 'Wh',
        },
    },
    'Emeter1.Total_Returned': {
        coap: {
            coap_publish: '4207',
            coap_publish_funct: value => {
                return Math.round(value * 100) / 100;
            },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/emeter/1/total_returned',
            mqtt_publish_funct: value => {
                return Math.round(value * 100) / 100;
            },
        },
        common: {
            name: 'Total Returned',
            type: 'number',
            role: 'value.power.consumption',
            read: true,
            write: false,
            def: 0,
            unit: 'Wh',
        },
    },
    'Emeter1.ReactivePower': {
        coap: {
            http_publish: '/status',
            http_publish_funct: value => {
                return value ? Math.round(JSON.parse(value).emeters[1].reactive * 100) / 100 : undefined;
            },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/emeter/1/reactive_power',
            mqtt_publish_funct: value => {
                return Math.round(value * 100) / 100;
            },
        },
        common: {
            name: 'Reactive Power',
            type: 'number',
            role: 'value.power.reactive',
            read: true,
            write: false,
            def: 0,
            unit: 'VAR',
        },
    },
    'Emeter1.PowerFactor': {
        coap: {
            http_publish: '/status',
            http_publish_funct: async (value, self) => shellyHelper.getPowerFactor(self, 1),
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: async (value, self) => shellyHelper.getPowerFactor(self, 1),
        },
        common: {
            name: 'Power Factor',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            def: 0,
        },
    },
    'Emeter1.Voltage': {
        coap: {
            coap_publish: '4208',
            coap_publish_funct: value => {
                return Math.round(value * 100) / 100;
            },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/emeter/1/voltage',
            mqtt_publish_funct: value => {
                return Math.round(value * 100) / 100;
            },
        },
        common: {
            name: {
                en: 'Voltage',
                de: 'Spannung',
                ru: 'Напряжение',
                pt: 'Tensão',
                nl: 'Voltage',
                fr: 'Tension',
                it: 'Tensione',
                es: 'Voltaje',
                pl: 'Voltage',
                'zh-cn': '动产',
            },
            type: 'number',
            role: 'value.voltage',
            read: true,
            write: false,
            def: 0,
            unit: 'V',
        },
    },
    'Emeter1.Current': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => {
                return value ? Math.round(JSON.parse(value).emeters[1].ctraf_type * 100) / 100 : undefined;
            },
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => {
                return value ? Math.round(JSON.parse(value).emeters[1].ctraf_type * 100) / 100 : undefined;
            },
        },
        common: {
            name: 'Current Transformation Type',
            type: 'number',
            role: 'value.current',
            read: true,
            write: false,
            def: 0,
            unit: 'A',
        },
    },
};

module.exports = {
    shellyem,
};
