//package org.kurento.room;
//import static org.kurento.commons.PropertiesManager.getPropertyJson;
//import java.util.List;
//
///**
// * @author Ivan Gracia (izanmail@gmail.com)
// * @author Micael Gallego (micael.gallego@gmail.com)
// * @since 1.0.0
// */
//@Import(JsonRpcConfiguration.class)
//@SpringBootApplication

var ws = require('ws')
var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter
var kurento = require('kurento-client');
var RoomJsonRpcHandler = require('./RoomJsonRpcHandler')
var AutodiscoveryKurentoClientProvider = require('./AutoDiscoveryKurentoClientProvider')
var FixedOneKmsManager = require('./kms/FixedOneKmsManager')
var Kms = require('./kms/Kms')
var JsonRpcNotificationService = require('./rpc/JsonRpcNotificationService')
var JsonRpcUserControl = require('./rpc/JsonRpcUserControl')
var NotificationRoomManager = require('./sdk/NotificationRoomManager')
//var hostAddress = 'ws://roomAddress:roomPort/room'
//var KMSS_URIS_PROPERTY = 'kms.uris';
//var KMSS_URIS_DEFAULT = '[ \'ws://localhost:8888/kurento\' ]';

function KurentoRoomServerApp(opts, callback) {
    //EventEmitter.call(this)
    var self = this
    this.kmsManager = null
    this.notificationService = null// = new JsonRpcNotificationService()
    this.roomManager = null
    this.roomHandler = null
    this.userControl = null
    this.log = null
    this.options = opts || {}
    this.kmsWsUri = opts.kmsWsUri
    this.kmsClientCount = 1

    function getKurentoClient(callback) {
        kurento(self.kmsWsUri, callback)
    }

    function bootServer(callback) {

        self.kmsManager = new FixedOneKmsManager();
        self.notificationService = new JsonRpcNotificationService()
        self.roomManager = new NotificationRoomManager(self.notificationService, self.kmsManager);
        self.userControl = new JsonRpcUserControl(self.roomManager);
        self.roomHandler = new RoomJsonRpcHandler(self.userControl, self.notificationService);

        getKurentoClient(function (error, kurentoClient) {
            self.kmsManager.addKms(new Kms(kurentoClient, self.kmsWsUri))

            callback(self)
        })

    }

    bootServer(callback)
}
//inherits(KurentoRoomServerApp, EventEmitter)

module.exports = KurentoRoomServerApp