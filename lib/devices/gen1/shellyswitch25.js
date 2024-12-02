'use strict';

const shellyHelper = require('../../shelly-helper');

/**
 * Shelly Switch 2.5 / SHSW-25 / shellyswitch25
 * CoAP:
 *  {"blk":[{"I":0,"D":"Relay0"},{"I":1,"D":"Relay1"},{"I":2,"D":"Device"}],"sen":[{"I":112,"T":"S","D":"State","R":"0/1","L":0},{"I":122,"T":"S","D":"State","R":"0/1","L":1},{"I":111,"T":"W","D":"Power","R":"0/2300","L":0},{"I":121,"T":"W","D":"Power","R":"0/2300","L":1},{"I":113,"T":"S","D":"Position","R":"0/100","L":2},{"I":118,"T":"S","D":"Input","R":"0/1/2","L":2},{"I":128,"T":"S","D":"Input","R":"0/1/2","L":2},{"I":115,"T":"tC","R":"-40/300","L":2},{"I":116,"T":"tF","R":"-40/300","L":2},{"I":117,"T":"Overtemp","R":"0/1","L":2}]}
 *
 * CoAP Version >= 1.8
 *  Shelly 2.5 SHSW-25 relay-mode:    {"blk":[{"I":1,"D":"relay_0"},{"I":2,"D":"relay_1"},{"I":4,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":4},{"I":1101,"T":"S","D":"output","R":"0/1","L":1},{"I":1201,"T":"S","D":"output","R":"0/1","L":2},{"I":2101,"T":"S","D":"input","R":"0/1","L":1},{"I":2102,"T":"EV","D":"inputEvent","R":["S/L",""],"L":1},{"I":2103,"T":"EVC","D":"inputEventCnt","R":"U16","L":1},{"I":2201,"T":"S","D":"input","R":"0/1","L":2},{"I":2202,"T":"EV","D":"inputEvent","R":["S/L",""],"L":2},{"I":2203,"T":"EVC","D":"inputEventCnt","R":"U16","L":2},{"I":4101,"T":"P","D":"power","U":"W","R":["0/2300","-1"],"L":1},{"I":4103,"T":"E","D":"energy","U":"Wmin","R":["U32","-1"],"L":1},{"I":6102,"T":"A","D":"overpower","R":["0/1","-1"],"L":1},{"I":4201,"T":"P","D":"power","U":"W","R":["0/2300","-1"],"L":2},{"I":4203,"T":"E","D":"energy","U":"Wmin","R":["U32","-1"],"L":2},{"I":6202,"T":"A","D":"overpower","R":["0/1","-1"],"L":2},{"I":3104,"T":"T","D":"deviceTemp","U":"C","R":["-40/300","999"],"L":4},{"I":6101,"T":"A","D":"overtemp","R":["0/1","-1"],"L":4},{"I":9101,"T":"S","D":"mode","R":"relay/roller","L":4}]}
 *  Shelly 2.5 SHSW-25 roller-mode:   {"blk":[{"I":1,"D":"relay_0"},{"I":2,"D":"relay_1"},{"I":3,"D":"roller_0"},{"I":4,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":4},{"I":1102,"T":"S","D":"roller","R":"open/close/stop","L":3},{"I":1103,"T":"S","D":"rollerPos","R":["0/100","-1"],"L":3},{"I":2101,"T":"S","D":"input","R":"0/1","L":1},{"I":2102,"T":"EV","D":"inputEvent","R":["S/L",""],"L":1},{"I":2103,"T":"EVC","D":"inputEventCnt","R":"U16","L":1},{"I":2201,"T":"S","D":"input","R":"0/1","L":2},{"I":2202,"T":"EV","D":"inputEvent","R":["S/L",""],"L":2},{"I":2203,"T":"EVC","D":"inputEventCnt","R":"U16","L":2},{"I":4102,"T":"P","D":"rollerPower","U":"W","R":["0/2300","-1"],"L":3},{"I":4104,"T":"E","D":"rollerEnergy","U":"Wmin","R":["U32","-1"],"L":3},{"I":6103,"T":"A","D":"rollerStopReason","R":"normal/safety_switch/obstacle/overpower","L":3},{"I":3104,"T":"T","D":"deviceTemp","U":"C","R":["-40/300","999"],"L":4},{"I":6101,"T":"A","D":"overtemp","R":["0/1","-1"],"L":4},{"I":9101,"T":"S","D":"mode","R":"relay/roller","L":4}]}
 */
const shellyswitch25 = {
    'Sys.deviceMode': {
        coap: {
            init_funct: self => self.getDeviceMode(),
            coap_publish: '9101',
            http_cmd: '/settings',
            http_cmd_funct: value => ({ mode: value }),
        },
        mqtt: {
            init_funct: self => self.getDeviceMode(),
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).mode : undefined),
            http_cmd: '/settings',
            http_cmd_funct: value => ({ mode: value }),
        },
        common: {
            name: 'Mode',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                relay: 'relay',
                roller: 'shutter',
            },
        },
    },
    'Relay0.Switch': {
        coap: {
            coap_publish: '1101',
            coap_publish_funct: value => value == 1,
            http_cmd: '/relay/0',
            http_cmd_funct: async (value, self) => {
                return value === true
                    ? { turn: 'on', timer: await shellyHelper.getSetDuration(self, 'Relay0.Timer') }
                    : { turn: 'off', timer: await shellyHelper.getSetDuration(self, 'Relay0.Timer') };
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
    'Relay0.ButtonType': {
        coap: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/0',
            http_publish_funct: value => (value ? JSON.parse(value).relays[0].btn_type : undefined),
            http_cmd_funct: value => ({ btn_type: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/0',
            http_publish_funct: value => (value ? JSON.parse(value).relays[0].btn_type : undefined),
            http_cmd_funct: value => ({ btn_type: value }),
        },
        common: {
            name: 'Button Type',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                momentary: 'momentary',
                toggle: 'toggle',
                edge: 'edge',
                detached: 'detached',
                action: 'action',
                cycle: 'cycle',
                momentary_on_release: 'momentary_on_release',
            },
        },
    },
    'Relay0.ButtonReverse': {
        coap: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/0',
            http_publish_funct: value => (value ? JSON.parse(value).relays[0].btn_reverse : undefined),
            http_cmd_funct: value => ({ btn_reverse: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/0',
            http_publish_funct: value => (value ? JSON.parse(value).relays[0].btn_reverse : undefined),
            http_cmd_funct: value => ({ btn_reverse: value }),
        },
        common: {
            name: 'Button Type',
            type: 'number',
            role: 'state',
            read: true,
            write: true,
            states: {
                0: 'normal',
                1: 'inverted',
            },
        },
    },
    'Relay0.Timer': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value, self) => shellyHelper.getSetDuration(self, 'Relay0.Timer'),
        },
        mqtt: {
            no_display: true,
        },
        common: {
            name: {
                en: 'Duration',
                de: 'Dauer',
                ru: 'Продолжительность',
                pt: 'Duração',
                nl: 'Vertaling:',
                fr: 'Durée',
                it: 'Durata',
                es: 'Duración',
                pl: 'Duracja',
                'zh-cn': '期间',
            },
            type: 'number',
            role: 'level.timer',
            read: true,
            write: true,
            def: 0,
            unit: 's',
        },
    },
    'Shutter.swap': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).rollers?.[0]?.swap : undefined),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).rollers?.[0]?.swap : undefined),
        },
        common: {
            name: 'swap OPEN and CLOSE directions',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'Shutter.swap_inputs': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).rollers?.[0]?.swap_inputs : undefined),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).rollers?.[0]?.swap_inputs : undefined),
        },
        common: {
            name: 'inputs are swapped',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'Relay0.Power': {
        coap: {
            coap_publish: '4101',
            coap_publish_funct: value => {
                return Math.round(value * 100) / 100;
            },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/relay/0/power',
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
    'Relay0.Energy': {
        coap: {
            coap_publish: '4103',
            coap_publish_funct: value => {
                return Math.round((value / 60) * 100) / 100;
            },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/relay/0/energy',
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
    'Relay0.Input': {
        coap: {
            coap_publish: '2101',
            coap_publish_funct: value => {
                return value === 1 || value === 2;
            },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input/0',
            mqtt_publish_funct: value => value == 1,
        },
        common: {
            name: {
                en: 'Input mode',
                de: 'Eingangsmodus',
                ru: 'Входной режим',
                pt: 'Modo de entrada',
                nl: 'Input modus',
                fr: "Mode d ' entrée",
                it: 'Modalità di ingresso',
                es: 'Modo de entrada',
                pl: 'Tryb gry',
                'zh-cn': '投入模式',
            },
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
            def: false,
        },
    },
    'Relay0.Event': {
        coap: {
            coap_publish: '2102', // CoAP >= 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input_event/0',
            mqtt_publish_funct: value => (value ? JSON.parse(value).event : undefined),
        },
        common: {
            name: 'Event',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
            states: {
                S: '1xShort',
                L: 'Long',
            },
        },
    },
    'Relay0.EventCount': {
        coap: {
            coap_publish: '2103', // CoAP >= 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input_event/0',
            mqtt_publish_funct: value => (value ? JSON.parse(value).event_cnt : undefined),
        },
        common: {
            name: {
                en: 'Event count',
                de: 'Anzahl Ereignisse',
                ru: 'Количество событий',
                pt: 'Contagem de eventos',
                nl: 'De gebeurtenissen tellen',
                fr: "Compte de l'événement",
                it: 'Conteggio eventi',
                es: 'Conteo de eventos',
                pl: 'Event',
                'zh-cn': '活动',
            },
            type: 'number',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'Relay0.longpush': {
        coap: {
            coap_publish: '2102',
            coap_publish_funct: value => value == 'L',
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/longpush/0',
            mqtt_publish_funct: value => value == 1,
        },
        common: {
            name: 'Longpush',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
            def: false,
        },
    },
    'Relay0.longpushtime': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).longpush_time : undefined),
            http_cmd: '/settings',
            http_cmd_funct: value => ({ longpush_time: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).longpush_time : undefined),
            http_cmd: '/settings',
            http_cmd_funct: value => ({ longpush_time: value }),
        },
        common: {
            name: 'Longpush Time',
            type: 'number',
            role: 'state',
            unit: 'ms',
            min: 1,
            max: 5000,
            read: true,
            write: true,
        },
    },
    'Relay0.source': {
        coap: {
            http_publish: '/status',
            http_publish_funct: value => (value ? JSON.parse(value).relays[0].source : undefined),
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: value => (value ? JSON.parse(value).relays[0].source : undefined),
        },
        common: {
            name: {
                en: 'Source of last command',
                de: 'Quelle des letzten Befehls',
                ru: 'Источник последней команды',
                pt: 'Fonte do último comando',
                nl: 'Vertaling:',
                fr: 'Source de la dernière commande',
                it: "Fonte dell'ultimo comando",
                es: 'Fuente del último comando',
                pl: 'Źródło ostatniego dowództwa',
                'zh-cn': '最后一次指挥的来源',
            },
            type: 'string',
            role: 'text',
            read: true,
            write: false,
        },
    },
    'Relay0.overpowerValue': {
        coap: {
            // coap_publish: '6109',
            no_display: true,
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/relay/0/overpower_value',
        },
        common: {
            name: 'overpower Value',
            type: 'number',
            role: 'state',
            unit: 'W',
            read: true,
            write: false,
            def: 0,
        },
    },
    'Relay1.Switch': {
        coap: {
            coap_publish: '1201',
            coap_publish_funct: value => value == 1,
            http_cmd: '/relay/1',
            http_cmd_funct: async (value, self) => {
                return value === true
                    ? { turn: 'on', timer: await shellyHelper.getSetDuration(self, 'Relay1.Timer') }
                    : { turn: 'off', timer: await shellyHelper.getSetDuration(self, 'Relay1.Timer') };
            },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/relay/1',
            mqtt_publish_funct: value => value === 'on',
            mqtt_cmd: 'shellies/<mqttprefix>/relay/1/command',
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
    'Relay1.ChannelName': {
        coap: {
            http_publish: '/settings/relay/1',
            http_publish_funct: async (value, self) =>
                value ? await shellyHelper.setChannelName(self, 'Relay1', JSON.parse(value).name) : undefined,
            http_cmd: '/settings/relay/1',
            http_cmd_funct: value => ({ name: value }),
        },
        mqtt: {
            http_publish: '/settings/relay/1',
            http_publish_funct: async (value, self) =>
                value ? await shellyHelper.setChannelName(self, 'Relay1', JSON.parse(value).name) : undefined,
            http_cmd: '/settings/relay/1',
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
    'Relay1.AutoTimerOff': {
        coap: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/1',
            http_publish_funct: value => (value ? JSON.parse(value).relays[1].auto_off : undefined),
            http_cmd_funct: value => ({ auto_off: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/1',
            http_publish_funct: value => (value ? JSON.parse(value).relays[1].auto_off : undefined),
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
    'Relay1.AutoTimerOn': {
        coap: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/1',
            http_publish_funct: value => (value ? JSON.parse(value).relays[1].auto_on : undefined),
            http_cmd_funct: value => ({ auto_on: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/1',
            http_publish_funct: value => (value ? JSON.parse(value).relays[1].auto_on : undefined),
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
    'Relay1.ButtonType': {
        coap: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/1',
            http_publish_funct: value => (value ? JSON.parse(value).relays[1].btn_type : undefined),
            http_cmd_funct: value => ({ btn_type: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/1',
            http_publish_funct: value => (value ? JSON.parse(value).relays[1].btn_type : undefined),
            http_cmd_funct: value => ({ btn_type: value }),
        },
        common: {
            name: 'Button Type',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                momentary: 'momentary',
                toggle: 'toggle',
                edge: 'edge',
                detached: 'detached',
                action: 'action',
                cycle: 'cycle',
                momentary_on_release: 'momentary_on_release',
            },
        },
    },
    'Relay1.ButtonReverse': {
        coap: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/1',
            http_publish_funct: value => (value ? JSON.parse(value).relays[1].btn_reverse : undefined),
            http_cmd_funct: value => ({ btn_reverse: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_cmd: '/settings/relay/1',
            http_publish_funct: value => (value ? JSON.parse(value).relays[1].btn_reverse : undefined),
            http_cmd_funct: value => ({ btn_reverse: value }),
        },
        common: {
            name: 'Button Type',
            type: 'number',
            role: 'state',
            read: true,
            write: true,
            states: {
                0: 'normal',
                1: 'inverted',
            },
        },
    },
    'Relay1.Timer': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value, self) => shellyHelper.getSetDuration(self, 'Relay1.Timer'),
        },
        mqtt: {
            no_display: true,
        },
        common: {
            name: {
                en: 'Duration',
                de: 'Dauer',
                ru: 'Продолжительность',
                pt: 'Duração',
                nl: 'Vertaling:',
                fr: 'Durée',
                it: 'Durata',
                es: 'Duración',
                pl: 'Duracja',
                'zh-cn': '期间',
            },
            type: 'number',
            role: 'level.timer',
            read: true,
            write: true,
            def: 0,
            unit: 's',
        },
    },
    'Relay1.Power': {
        coap: {
            coap_publish: '4201',
            coap_publish_funct: value => {
                return Math.round(value * 100) / 100;
            },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/relay/1/power',
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
    'Relay1.Energy': {
        coap: {
            coap_publish: '4203',
            coap_publish_funct: value => {
                return Math.round((value / 60) * 100) / 100;
            },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/relay/1/energy',
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
    'Relay1.Event': {
        coap: {
            coap_publish: '2202', // CoAP >= 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input_event/1',
            mqtt_publish_funct: value => (value ? JSON.parse(value).event : undefined),
        },
        common: {
            name: 'Event',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
            states: {
                S: '1xShort',
                L: 'Long',
            },
        },
    },
    'Relay1.EventCount': {
        coap: {
            coap_publish: '2203', // CoAP >= 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input_event/1',
            mqtt_publish_funct: value => (value ? JSON.parse(value).event_cnt : undefined),
        },
        common: {
            name: {
                en: 'Event count',
                de: 'Anzahl Ereignisse',
                ru: 'Количество событий',
                pt: 'Contagem de eventos',
                nl: 'De gebeurtenissen tellen',
                fr: "Compte de l'événement",
                it: 'Conteggio eventi',
                es: 'Conteo de eventos',
                pl: 'Event',
                'zh-cn': '活动',
            },
            type: 'number',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'Relay1.Input': {
        coap: {
            coap_publish: '2201',
            coap_publish_funct: value => {
                return value === 1 || value === 2;
            },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/input/1',
            mqtt_publish_funct: value => value == 1,
        },
        common: {
            name: {
                en: 'Input mode',
                de: 'Eingangsmodus',
                ru: 'Входной режим',
                pt: 'Modo de entrada',
                nl: 'Input modus',
                fr: "Mode d ' entrée",
                it: 'Modalità di ingresso',
                es: 'Modo de entrada',
                pl: 'Tryb gry',
                'zh-cn': '投入模式',
            },
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
            def: false,
        },
    },
    'Relay1.longpush': {
        coap: {
            coap_publish: '2202',
            coap_publish_funct: value => value == 'L',
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/longpush/1',
            mqtt_publish_funct: value => value == 1,
        },
        common: {
            name: 'Longpush',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
            def: false,
        },
    },
    'Relay1.longpushtime': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).longpush_time : undefined),
            http_cmd: '/settings',
            http_cmd_funct: value => ({ longpush_time: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).longpush_time : undefined),
            http_cmd: '/settings',
            http_cmd_funct: value => ({ longpush_time: value }),
        },
        common: {
            name: 'Longpush Time',
            type: 'number',
            role: 'state',
            unit: 'ms',
            min: 1,
            max: 5000,
            read: true,
            write: true,
        },
    },
    'Relay1.source': {
        coap: {
            http_publish: '/status',
            http_publish_funct: value => (value ? JSON.parse(value).relays[1].source : undefined),
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: value => (value ? JSON.parse(value).relays[1].source : undefined),
        },
        common: {
            name: {
                en: 'Source of last command',
                de: 'Quelle des letzten Befehls',
                ru: 'Источник последней команды',
                pt: 'Fonte do último comando',
                nl: 'Vertaling:',
                fr: 'Source de la dernière commande',
                it: "Fonte dell'ultimo comando",
                es: 'Fuente del último comando',
                pl: 'Źródło ostatniego dowództwa',
                'zh-cn': '最后一次指挥的来源',
            },
            type: 'string',
            role: 'text',
            read: true,
            write: false,
        },
    },
    'Relay1.overpowerValue': {
        coap: {
            // coap_publish: '6109',
            no_display: true,
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/relay/1/overpower_value',
        },
        common: {
            name: 'overpower Value',
            type: 'number',
            role: 'state',
            unit: 'W',
            read: true,
            write: false,
            def: 0,
        },
    },
    'Shutter.state': {
        coap: {
            coap_publish: '1102',
            // coap_publish_funct: value => value[0] === 1 ? 'open' : value[1] === 1 ? 'close' : 'stop',
            http_cmd: '/roller/0',
            http_cmd_funct: value => ({ go: value }),
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/roller/0',
            mqtt_cmd: 'shellies/<mqttprefix>/roller/0/command',
        },
        common: {
            name: 'Roller state',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                close: 'close',
                open: 'open',
                stop: 'stop',
            },
        },
    },
    'Shutter.Close': {
        coap: {
            http_cmd: '/roller/0',
            http_cmd_funct: async (value, self) => ({
                go: 'close',
                duration: await shellyHelper.getSetDuration(self, 'Shutter.Duration', 0),
            }),
        },
        mqtt: {
            mqtt_cmd_funct: () => 'close',
            mqtt_cmd: 'shellies/<mqttprefix>/roller/0/command',
        },
        common: {
            name: 'Close',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    },
    'Shutter.Open': {
        coap: {
            http_cmd: '/roller/0',
            http_cmd_funct: async (value, self) => ({
                go: 'open',
                duration: await shellyHelper.getSetDuration(self, 'Shutter.Duration', 0),
            }),
        },
        mqtt: {
            mqtt_cmd: 'shellies/<mqttprefix>/roller/0/command',
            mqtt_cmd_funct: () => 'open',
        },
        common: {
            name: 'Open',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    },
    'Shutter.Pause': {
        coap: {
            http_cmd: '/roller/0',
            http_cmd_funct: async (value, self) => ({
                go: 'stop',
                duration: await shellyHelper.getSetDuration(self, 'Shutter.Duration', 0),
            }),
        },
        mqtt: {
            mqtt_cmd: 'shellies/<mqttprefix>/roller/0/command',
            mqtt_cmd_funct: () => 'stop',
        },
        common: {
            name: 'Pause',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    },
    'Shutter.Duration': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: (value, self) => shellyHelper.getSetDuration(self, 'Shutter.Duration'),
            // http_publish_funct: value => value ? JSON.parse(value).rollers?.[0]?.maxtime : undefined,
        },
        mqtt: {
            no_display: true,
        },
        common: {
            name: {
                en: 'Duration',
                de: 'Dauer',
                ru: 'Продолжительность',
                pt: 'Duração',
                nl: 'Vertaling:',
                fr: 'Durée',
                it: 'Durata',
                es: 'Duración',
                pl: 'Duracja',
                'zh-cn': '期间',
            },
            type: 'number',
            role: 'level.timer',
            read: true,
            write: true,
            def: 0,
            unit: 's',
        },
    },
    'Shutter.Position': {
        coap: {
            coap_publish: '1103',
            coap_publish_funct: value => {
                return value === -1 ? undefined : value;
            },
            http_cmd: '/roller/0',
            http_cmd_funct: async (value, self) => ({
                go: 'to_pos',
                roller_pos: value,
                duration: await shellyHelper.getSetDuration(self, 'Shutter.Duration', 0),
            }),
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/roller/0/pos',
            mqtt_publish_funct: value => {
                return value == -1 ? 101 : value;
            },
            mqtt_cmd: 'shellies/<mqttprefix>/roller/0/command/pos',
            mqtt_cmd_funct: value => value.toString(),
        },
        common: {
            name: 'Position',
            type: 'number',
            role: 'level.blind',
            read: true,
            write: true,
            unit: '%',
        },
    },
    'Shutter.ButtonType': {
        coap: {
            http_publish: '/settings',
            http_cmd: '/settings/roller/0',
            http_publish_funct: value => (value ? JSON.parse(value).rollers?.[0]?.button_type : undefined),
            http_cmd_funct: value => ({ btn_type: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_cmd: '/settings/roller/0',
            http_publish_funct: value => (value ? JSON.parse(value).rollers?.[0]?.button_type : undefined),
            http_cmd_funct: value => ({ btn_type: value }),
        },
        common: {
            name: 'Button Type',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                momentary: 'momentary',
                toggle: 'toggle',
                detached: 'detached',
            },
        },
    },
    'Shutter.ButtonReverse': {
        coap: {
            http_publish: '/settings',
            http_cmd: '/settings/roller/0',
            http_publish_funct: value => (value ? JSON.parse(value).rollers?.[0]?.btn_reverse : undefined),
            http_cmd_funct: value => ({ btn_reverse: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_cmd: '/settings/roller/0',
            http_publish_funct: value => (value ? JSON.parse(value).rollers?.[0]?.btn_reverse : undefined),
            http_cmd_funct: value => ({ btn_reverse: value }),
        },
        common: {
            name: 'Button Type',
            type: 'number',
            role: 'state',
            read: true,
            write: true,
            states: {
                0: 'normal',
                1: 'inverted',
            },
        },
    },
    'Shutter.Power': {
        coap: {
            coap_publish: '4102',
            coap_publish_funct: value => {
                return Math.round(value * 100) / 100;
            },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/roller/0/power',
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
    'Shutter.Energy': {
        coap: {
            coap_publish: '4104',
            coap_publish_funct: value => {
                return Math.round((value / 60) * 100) / 100;
            },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/roller/0/energy',
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
    'Shutter.source': {
        coap: {
            http_publish: '/status',
            http_publish_funct: value => (value ? JSON.parse(value).rollers?.[0]?.source : undefined),
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: value => (value ? JSON.parse(value).rollers?.[0]?.source : undefined),
        },
        common: {
            name: {
                en: 'Source of last command',
                de: 'Quelle des letzten Befehls',
                ru: 'Источник последней команды',
                pt: 'Fonte do último comando',
                nl: 'Vertaling:',
                fr: 'Source de la dernière commande',
                it: "Fonte dell'ultimo comando",
                es: 'Fuente del último comando',
                pl: 'Źródło ostatniego dowództwa',
                'zh-cn': '最后一次指挥的来源',
            },
            type: 'string',
            role: 'text',
            read: true,
            write: false,
        },
    },
    temperatureC: {
        coap: {
            coap_publish: '3104',
            http_publish: '/status',
            http_publish_funct: value => (value ? JSON.parse(value).temperature : undefined),
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/temperature',
        },
        common: {
            name: {
                en: 'Temperature',
                de: 'Temperatur',
                ru: 'Температура',
                pt: 'Temperatura',
                nl: 'Temperatuur',
                fr: 'Température',
                it: 'Temperatura',
                es: 'Temperatura',
                pl: 'Temperatura',
                'zh-cn': '模范',
            },
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°C',
        },
    },
    overtemperature: {
        coap: {
            coap_publish: '6101',
            coap_publish_funct: value => value == 1,
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/overtemperature',
            mqtt_publish_funct: value => value == 1,
        },
        common: {
            name: 'Temperature',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'ext.temperatureC1': {
        coap: {
            http_publish: '/status',
            http_publish_funct: value => (value ? shellyHelper.getExtTemp(JSON.parse(value), '0', 'C') : undefined),
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/ext_temperature/0',
            mqtt_publish_funct: value => parseFloat(value),
        },
        common: {
            name: {
                en: 'External sensor temperature',
                de: 'Externe Sensortemperatur',
                ru: 'Температура наружного датчика',
                pt: 'Temperatura do sensor externo',
                nl: 'Externe sensortem',
                fr: 'Température du capteur externe',
                it: 'Temperatura del sensore esterno',
                es: 'Temperatura del sensor externo',
                pl: 'Temperatura zewnętrznego czujnika',
                'zh-cn': '外部传感器',
            },
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°C',
        },
    },
    'ext.temperatureC2': {
        coap: {
            http_publish: '/status',
            http_publish_funct: value => (value ? shellyHelper.getExtTemp(JSON.parse(value), '1', 'C') : undefined),
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/ext_temperature/1',
            mqtt_publish_funct: value => parseFloat(value),
        },
        common: {
            name: {
                en: 'External sensor temperature',
                de: 'Externe Sensortemperatur',
                ru: 'Температура наружного датчика',
                pt: 'Temperatura do sensor externo',
                nl: 'Externe sensortem',
                fr: 'Température du capteur externe',
                it: 'Temperatura del sensore esterno',
                es: 'Temperatura del sensor externo',
                pl: 'Temperatura zewnętrznego czujnika',
                'zh-cn': '外部传感器',
            },
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°C',
        },
    },
    'ext.temperatureC3': {
        coap: {
            http_publish: '/status',
            http_publish_funct: value => (value ? shellyHelper.getExtTemp(JSON.parse(value), '2', 'C') : undefined),
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/ext_temperature/2',
            mqtt_publish_funct: value => parseFloat(value),
        },
        common: {
            name: {
                en: 'External sensor temperature',
                de: 'Externe Sensortemperatur',
                ru: 'Температура наружного датчика',
                pt: 'Temperatura do sensor externo',
                nl: 'Externe sensortem',
                fr: 'Température du capteur externe',
                it: 'Temperatura del sensore esterno',
                es: 'Temperatura del sensor externo',
                pl: 'Temperatura zewnętrznego czujnika',
                'zh-cn': '外部传感器',
            },
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°C',
        },
    },
    'ext.temperatureF1': {
        coap: {
            http_publish: '/status',
            http_publish_funct: value => (value ? shellyHelper.getExtTemp(JSON.parse(value), '0', 'F') : undefined),
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/ext_temperature_f/0',
            mqtt_publish_funct: value => parseFloat(value),
        },
        common: {
            name: {
                en: 'External sensor temperature',
                de: 'Externe Sensortemperatur',
                ru: 'Температура наружного датчика',
                pt: 'Temperatura do sensor externo',
                nl: 'Externe sensortem',
                fr: 'Température du capteur externe',
                it: 'Temperatura del sensore esterno',
                es: 'Temperatura del sensor externo',
                pl: 'Temperatura zewnętrznego czujnika',
                'zh-cn': '外部传感器',
            },
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°F',
        },
    },
    'ext.temperatureF2': {
        coap: {
            http_publish: '/status',
            http_publish_funct: value => (value ? shellyHelper.getExtTemp(JSON.parse(value), '1', 'F') : undefined),
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/ext_temperature_f/1',
            mqtt_publish_funct: value => parseFloat(value),
        },
        common: {
            name: {
                en: 'External sensor temperature',
                de: 'Externe Sensortemperatur',
                ru: 'Температура наружного датчика',
                pt: 'Temperatura do sensor externo',
                nl: 'Externe sensortem',
                fr: 'Température du capteur externe',
                it: 'Temperatura del sensore esterno',
                es: 'Temperatura del sensor externo',
                pl: 'Temperatura zewnętrznego czujnika',
                'zh-cn': '外部传感器',
            },
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°F',
        },
    },
    'ext.temperatureF3': {
        coap: {
            http_publish: '/status',
            http_publish_funct: value => (value ? shellyHelper.getExtTemp(JSON.parse(value), '2', 'F') : undefined),
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/ext_temperature_f/2',
            mqtt_publish_funct: value => parseFloat(value),
        },
        common: {
            name: {
                en: 'External sensor temperature',
                de: 'Externe Sensortemperatur',
                ru: 'Температура наружного датчика',
                pt: 'Temperatura do sensor externo',
                nl: 'Externe sensortem',
                fr: 'Température du capteur externe',
                it: 'Temperatura del sensore esterno',
                es: 'Temperatura del sensor externo',
                pl: 'Temperatura zewnętrznego czujnika',
                'zh-cn': '外部传感器',
            },
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°F',
        },
    },
    factoryResetFromSwitch: {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).factory_reset_from_switch : undefined),
            http_cmd: '/settings',
            http_cmd_funct: value => ({ factory_reset_from_switch: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).factory_reset_from_switch : undefined),
            http_cmd: '/settings',
            http_cmd_funct: value => ({ factory_reset_from_switch: value }),
        },
        common: {
            name: {
                en: 'Factory reset by switch',
                de: 'Werkseinstellungen durch Schalter',
                ru: 'Сброс завода с помощью переключателя',
                pt: 'Restauração de fábrica por interruptor',
                nl: 'Factorie reset',
                fr: 'Réinitialisation en usine par interrupteur',
                it: 'Ripristino della fabbrica tramite interruttore',
                es: 'Ajuste de fábrica por interruptor',
                pl: 'Powstań zakładowa',
                'zh-cn': '转换引起的因素',
            },
            type: 'boolean',
            role: 'state',
            read: true,
            write: true,
        },
    },
    'Shutter.StopReason': {
        coap: {
            coap_publish: '6103',
        },
        mqtt: {
            http_publish: '/roller/0',
            http_publish_funct: value => (value ? JSON.parse(value).stop_reason : undefined),
        },
        common: {
            name: 'Shutter stop reason',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'Favorites.Position1Name': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).favorites[0].name : undefined),
            http_cmd: '/settings/favorites/0',
            http_cmd_funct: value => ({ name: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).favorites[0].name : undefined),
            http_cmd: '/settings/favorites/0',
            http_cmd_funct: value => ({ name: value }),
        },
        common: {
            name: 'Position Name',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
        },
    },
    'Favorites.Position1Pos': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).favorites[0].pos : undefined),
            http_cmd: '/settings/favorites/0',
            http_cmd_funct: value => ({ pos: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).favorites[0].pos : undefined),
            http_cmd: '/settings/favorites/0',
            http_cmd_funct: value => ({ pos: value }),
        },
        common: {
            name: 'Position',
            type: 'number',
            role: 'level.blind',
            read: true,
            write: true,
            unit: '%',
            min: 0,
            max: 100,
        },
    },
    'Favorites.Position1': {
        coap: {
            http_cmd: '/roller/0',
            http_cmd_funct: async (value, self) => ({
                go: 'to_pos',
                roller_pos: await shellyHelper.getFavoritePosition(self, 'Favorites.Position1Pos'),
            }),
        },
        mqtt: {
            http_cmd: '/roller/0',
            http_cmd_funct: async (value, self) => ({
                go: 'to_pos',
                roller_pos: await shellyHelper.getFavoritePosition(self, 'Favorites.Position1Pos'),
            }),
        },
        common: {
            name: 'Set favorite position',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    },
    'Favorites.Position2Name': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).favorites[1].name : undefined),
            http_cmd: '/settings/favorites/1',
            http_cmd_funct: value => ({ name: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).favorites[1].name : undefined),
            http_cmd: '/settings/favorites/1',
            http_cmd_funct: value => ({ name: value }),
        },
        common: {
            name: 'Position Name',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
        },
    },
    'Favorites.Position2Pos': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).favorites[1].pos : undefined),
            http_cmd: '/settings/favorites/1',
            http_cmd_funct: value => ({ pos: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).favorites[1].pos : undefined),
            http_cmd: '/settings/favorites/1',
            http_cmd_funct: value => ({ pos: value }),
        },
        common: {
            name: 'Position',
            type: 'number',
            role: 'level.blind',
            read: true,
            write: true,
            unit: '%',
            min: 0,
            max: 100,
        },
    },
    'Favorites.Position2': {
        coap: {
            http_cmd: '/roller/0',
            http_cmd_funct: async (value, self) => ({
                go: 'to_pos',
                roller_pos: await shellyHelper.getFavoritePosition(self, 'Favorites.Position2Pos'),
            }),
        },
        mqtt: {
            http_cmd: '/roller/0',
            http_cmd_funct: async (value, self) => ({
                go: 'to_pos',
                roller_pos: await shellyHelper.getFavoritePosition(self, 'Favorites.Position2Pos'),
            }),
        },
        common: {
            name: 'Set favorite position',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    },
    'Favorites.Position3Name': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).favorites[2].name : undefined),
            http_cmd: '/settings/favorites/2',
            http_cmd_funct: value => ({ name: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).favorites[2].name : undefined),
            http_cmd: '/settings/favorites/2',
            http_cmd_funct: value => ({ name: value }),
        },
        common: {
            name: 'Position Name',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
        },
    },
    'Favorites.Position3Pos': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).favorites[2].pos : undefined),
            http_cmd: '/settings/favorites/2',
            http_cmd_funct: value => ({ pos: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).favorites[2].pos : undefined),
            http_cmd: '/settings/favorites/2',
            http_cmd_funct: value => ({ pos: value }),
        },
        common: {
            name: 'Position',
            type: 'number',
            role: 'level.blind',
            read: true,
            write: true,
            unit: '%',
            min: 0,
            max: 100,
        },
    },
    'Favorites.Position3': {
        coap: {
            http_cmd: '/roller/0',
            http_cmd_funct: async (value, self) => ({
                go: 'to_pos',
                roller_pos: await shellyHelper.getFavoritePosition(self, 'Favorites.Position3Pos'),
            }),
        },
        mqtt: {
            http_cmd: '/roller/0',
            http_cmd_funct: async (value, self) => ({
                go: 'to_pos',
                roller_pos: await shellyHelper.getFavoritePosition(self, 'Favorites.Position3Pos'),
            }),
        },
        common: {
            name: 'Set favorite position',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    },
    'Favorites.Position4Name': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).favorites[3].name : undefined),
            http_cmd: '/settings/favorites/3',
            http_cmd_funct: value => ({ name: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).favorites[3].name : undefined),
            http_cmd: '/settings/favorites/3',
            http_cmd_funct: value => ({ name: value }),
        },
        common: {
            name: 'Position Name',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
        },
    },
    'Favorites.Position4Pos': {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).favorites[3].pos : undefined),
            http_cmd: '/settings/favorites/3',
            http_cmd_funct: value => ({ pos: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).favorites[3].pos : undefined),
            http_cmd: '/settings/favorites/3',
            http_cmd_funct: value => ({ pos: value }),
        },
        common: {
            name: 'Position',
            type: 'number',
            role: 'level.blind',
            read: true,
            write: true,
            unit: '%',
            min: 0,
            max: 100,
        },
    },
    'Favorites.Position4': {
        coap: {
            http_cmd: '/roller/0',
            http_cmd_funct: async (value, self) => ({
                go: 'to_pos',
                roller_pos: await shellyHelper.getFavoritePosition(self, 'Favorites.Position4Pos'),
            }),
        },
        mqtt: {
            http_cmd: '/roller/0',
            http_cmd_funct: async (value, self) => ({
                go: 'to_pos',
                roller_pos: await shellyHelper.getFavoritePosition(self, 'Favorites.Position4Pos'),
            }),
        },
        common: {
            name: 'Set favorite position',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    },
};

module.exports = {
    shellyswitch25,
};
