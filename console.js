'use strict'
/**
 * Created by ghostmac on 2/17/16.
 */
var Console = require('console').Console
var fs = require('fs')
// custom simple logger
var logger = new Console(process.stdout, process.stderr);
// use it like console
//var count = 5;
//logger.log('count: %d', count);
// in stdout.log: count 5
var EventEmitter = require('events');
var util = require('util')
var inherits = require('inherits');
var kurento = require('kurento-client');
var should = require('should');
var assert = require('assert');
var RoomJsonRpcHandler = require('./RoomJsonRpcHandler')
var NotificationRoomManager = require('./sdk/NotificationRoomManager')
var Kms = require('./kms/Kms')
var FixedOneKmsManager = require('./kms/FixedOneKmsManager')
var JsonRpcUserControl = require('./rpc/JsonRpcUserControl')
var JsonRpcNotificationService = require('./rpc/JsonRpcNotificationService')

var uuid = require('node-uuid')
var c = require('chance')()
//var faker = require('faker')
var kmsHostIp = '192.168.99.100'
var kmsHostPort = '8888'
var kmsWsUri = util.format('ws://%s:%s/kurento', kmsHostIp, kmsHostPort)

var RoomServer = require('./KurentoRoomServerApp')
var roomServer = null

RoomServer({kmsWsUri: kmsWsUri}, function (_roomServer) {

    roomServer = _roomServer
    if (roomServer) {
        logger.log(util.inspect(roomServer.kmsManager.getKurentoClient().sessionId))
        //logger.log(util.inspect(roomServer))
    }
})

//function MyEmitter() {
//    EventEmitter.call(this);
//}
//inherits(MyEmitter, EventEmitter);
//
//const myEmitter = new MyEmitter();
//myEmitter.on('event', function (evt) {
//    logger.log('an event occurred!', evt.object);
//});
//myEmitter.emit('event', {object: 'test'});
//var userNotifyService = null,
//    handler = null,
//    kms = null,
//    userControl = null
//var roomHandler = new NotificationRoomHandler(userNotifyService)
//var pid = uuid.v4()
//var roomName = uuid.v4()
//var requestId = faker.random.number(1024)
//
//function getKurentoClient(options,callback) {
//    var roomName = uuid.v4()
//    var username = c.email().split('@')[0]
//kurento(kmsWsUri, onNewClient)
//
//}
//function onNewClient(error, kurentoClient) {
//    var user = new UserParticipant(pid, username, false)
//    kms.addKms(new Kms(kurentoClient, kmsWsUri))
//kms = kms || new FixedOneKmsManager(kmsWsUri)
//kms.addKms(new Kms(kurentoClient, kmsWsUri))
//var room = rmMgr.createRoom(new KCSessionInfo(pid, roomName))
//onKmsReady(kms)
//rmMgr.joinRoom(username, roomName, true, new ParticipantRequest(pid, requestId))
//logger.log(util.inspect(room))
//}
//function onKmsReady(kms) {
//    userNotifyService = new JsonRpcNotificationService()
//    var roomManager = new NotificationRoomManager(userNotifyService, kms)
//    userControl = new JsonRpcUserControl(roomManager)
//    handler = new RoomJsonRpcHandler(userControl, userNotifyService)
//}
//
//go()
