'use strict';

const shellyHelper = require('../../shelly-helper');

/**
 * Shelly Bulb Duo / SHBDUO-1 / ShellyBulbDuo
 * CoAP:
 *  {"blk":[{"I":0,"D":"Channel0"}],"sen":[{"I":121,"T":"S","D":"State","R":"0/1","L":0},{"I":111,"T":"S","D":"Brightness","R":"0/100","L":0},{"I":131,"T":"S","D":"ColorTemperature","R":"2700/6500","L":0},{"I":141,"T":"P","D":"Power","R":"0/9","L":0},{"I":211,"T":"S","D":"Energy counter 0 [W-min]","L":0},{"I":212,"T":"S","D":"Energy counter 1 [W-min]","L":0},{"I":213,"T":"S","D":"Energy counter 2 [W-min]","L":0},{"I":214,"T":"S","D":"Energy counter total [W-min]","L":0}]}
 *
 * CoAP Version >= 1.8
 *  Shelly Duo SHBDUO-1:    {"blk":[{"I":1,"D":"light_0"},{"I":2,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":2},{"I":1101,"T":"S","D":"output","R":"0/1","L":1},{"I":5101,"T":"S","D":"brightness","R":"0/100","L":1},{"I":5103,"T":"S","D":"colorTemp","U":"K","R":"2700/6500","L":1},{"I":5104,"T":"S","D":"whiteLevel","R":"0/100","L":1},{"I":4101,"T":"P","D":"power","U":"W","R":["0/9","-1"],"L":1},{"I":4103,"T":"E","D":"energy","U":"Wmin","R":["U32","-1"],"L":1}]}
 */
const shellybulbduo = {
    'lights.Switch': {
        coap: {
            coap_publish: '1101',
            coap_publish_funct: value => value == 1,
            http_cmd: '/light/0',
            http_cmd_funct: value => {
                return value === true ? { turn: 'on' } : { turn: 'off' };
            },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/light/0',
            mqtt_publish_funct: value => value === 'on',
            mqtt_cmd: 'shellies/<mqttprefix>/light/0/command',
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
    'lights.AutoTimerOff': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).lights[0].auto_off : undefined),
            http_cmd: '/settings/light/0',
            http_cmd_funct: value => ({ auto_off: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).lights[0].auto_off : undefined),
            http_cmd: '/settings/light/0',
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
    'lights.AutoTimerOn': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).lights[0].auto_on : undefined),
            http_cmd: '/settings/light/0',
            http_cmd_funct: value => ({ auto_on: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).lights[0].auto_on : undefined),
            http_cmd: '/settings/light/0',
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
    'lights.white': {
        coap: {
            coap_publish: '5104',
            http_cmd: '/light/0',
            http_cmd_funct: value => ({ white: value }),
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/light/0/status',
            mqtt_publish_funct: value => (value ? JSON.parse(value).white : undefined),
            mqtt_cmd: 'shellies/<mqttprefix>/light/0/set',
            mqtt_cmd_funct: async (value, self) => JSON.stringify(await shellyHelper.getLightsObjectWhite(self)),
        },
        common: {
            name: 'White',
            type: 'number',
            role: 'level.color.white',
            unit: '%',
            read: true,
            write: true,
            min: 0,
            max: 100,
        },
    },
    'lights.temp': {
        coap: {
            coap_publish: '5103',
            http_cmd: '/light/0',
            http_cmd_funct: value => ({ temp: value }),
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/light/0/status',
            mqtt_publish_funct: value => (value ? JSON.parse(value).temp : undefined),
            mqtt_cmd: 'shellies/<mqttprefix>/light/0/set',
            mqtt_cmd_funct: async (value, self) => JSON.stringify(await shellyHelper.getLightsObjectWhite(self)),
        },
        common: {
            name: 'Temperature',
            type: 'number',
            role: 'level.color.temperature',
            read: true,
            write: true,
            unit: 'K',
        },
    },
    'lights.brightness': {
        coap: {
            coap_publish: '5101',
            http_cmd: '/light/0',
            http_cmd_funct: value => ({ brightness: value }),
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/light/0/status',
            mqtt_publish_funct: value => (value ? JSON.parse(value).brightness : undefined),
            mqtt_cmd: 'shellies/<mqttprefix>/light/0/set',
            mqtt_cmd_funct: async (value, self) => JSON.stringify(await shellyHelper.getLightsObjectWhite(self)),
        },
        common: {
            name: 'Brightness',
            type: 'number',
            role: 'level.brightness',
            read: true,
            write: true,
            min: 0,
            max: 100,
            unit: '%',
        },
    },
    'lights.Power': {
        coap: {
            coap_publish: '4101',
            coap_publish_funct: value => {
                return Math.round(value * 100) / 100;
            },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/light/0/power',
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
    'lights.Energy': {
        coap: {
            coap_publish: '4103',
            coap_publish_funct: value => {
                return Math.round((value / 60) * 100) / 100;
            },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/light/0/energy',
            mqtt_publish_funct: value => {
                return Math.round((value / 60) * 100) / 100;
            },
        },
        common: {
            name: 'Energy',
            type: 'number',
            role: 'value.power.consumption',
            read: true,
            write: false,
            def: 0,
            unit: 'Wh',
        },
    },
    'lights.TransitionTime': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).transition : undefined),
            http_cmd: '/settings',
            http_cmd_funct: value => ({ transition: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).transition : undefined),
            http_cmd: '/settings',
            http_cmd_funct: value => ({ transition: value }),
        },
        common: {
            name: 'Transition Time',
            type: 'number',
            role: 'value',
            def: 0,
            unit: 'ms',
            read: true,
            write: true,
        },
    },
};

module.exports = {
    shellybulbduo,
};
