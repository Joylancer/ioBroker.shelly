'use strict';

/**
 * Shelly Button / SHBTN-1 / shellybutton1
 * CoAP:
 *  {"blk":[{"I":1,"D":"sensors"}],"sen":[{"I":77,"D":"battery","T":"B","R":"0/100","L":1},{"I":118,"T":"S","D":"Input","R":"0","L":1},{"I":119,"T":"S","D":"Input event","R":"S/SS/SSS/L","L":1},{"I":120,"T":"S","D":"Input event counter","R":"U16","L":1}]}
 *
 * CoAP Version >= 1.8
 *  Shelly Button SHBTN-1:    {"blk":[{"I":1,"D":"sensor_0"},{"I":2,"D":"device"}],"sen":[{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":2},{"I":2102,"T":"EV","D":"inputEvent","R":["S/L/SS/SSS",""],"L":1},{"I":2103,"T":"EVC","D":"inputEventCnt","R":"U16","L":1},{"I":3115,"T":"S","D":"sensorError","R":"0/1","L":1},{"I":3112,"T":"S","D":"charger","R":["0/1","-1"],"L":2},{"I":3111,"T":"B","D":"battery","R":["0/100","-1"],"L":2},{"I":9102,"T":"EV","D":"wakeupEvent","R":["battery/button/periodic/poweron/sensor/ext_power","unknown"],"L":2}]}
 */
const shellybutton1 = {
    'bat.value': {
        coap: {
            coap_publish: '3111', // CoAP >= 1.8
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/sensor/battery',
        },
        common: {
            name: {
                en: 'Battery capacity',
                de: 'Batteriekapazität',
                ru: 'Емкость батареи',
                pt: 'Capacidade da bateria',
                nl: 'Batterij capaciteit',
                fr: 'Capacité de la batterie',
                it: 'Capacità della batteria',
                es: 'Capacidad de la batería',
                pl: 'Pojemność baterii',
                'zh-cn': '包 容能力',
            },
            type: 'number',
            role: 'value.battery',
            read: true,
            write: false,
            min: 0,
            max: 100,
            unit: '%',
        },
    },
    'Button.Event': {
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
                SS: '2xShort',
                SSS: '3xShort',
                L: 'Long',
            },
        },
    },
    'Button.EventCount': {
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
    'Button.Input': {
        coap: {
            http_publish: '/status',
            http_publish_funct: value => (value ? JSON.parse(value).inputs[0].input : undefined),
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: value => (value ? JSON.parse(value).inputs[0].input : undefined),
        },
        common: {
            name: 'Input',
            type: 'number',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'sensor.wakeupevent': {
        coap: {
            coap_publish: '9102',
            coap_publish_funct: value => JSON.stringify(value),
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/sensor/wakeupevent',
        },
        common: {
            name: 'Wakeup Event',
            type: 'string',
            role: 'json',
            read: true,
            write: false,
        },
    },
    led_wifi_disable: {
        coap: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).led_status_disable : undefined),
            http_cmd: '/settings',
            http_cmd_funct: value => ({ led_status_disable: value }),
        },
        mqtt: {
            http_publish: '/settings',
            http_publish_funct: value => (value ? JSON.parse(value).led_status_disable : undefined),
            http_cmd: '/settings',
            http_cmd_funct: value => ({ led_status_disable: value }),
        },
        common: {
            name: 'Wi-Fi status light',
            type: 'boolean',
            role: 'state',
            read: true,
            write: true,
        },
    },
};

module.exports = {
    shellybutton1,
};
