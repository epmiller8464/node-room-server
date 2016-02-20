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
var KCSessionInfo = require('./sdk/internal/DefaultKurentoClientSessionInfo')
var Room = require('./sdk/internal/Room')
var RoomManager = require('./sdk/RoomManager')
var JsonRpcNotificationService = require('./rpc/JsonRpcNotificationService')
var UserParticipant = require('./sdk/api/poco/UserParticipant')
var uuid = require('node-uuid')
var c = require('chance')()

var dockerKmsHostIp = '192.168.99.100'
var dockerKmsHostPort = '8888'
var dockerKmsWsUri = util.format('ws://%s:%s/kurento', dockerKmsHostIp, dockerKmsHostPort)
//var t = require('./Offer.sdp')

function MyEmitter() {
    EventEmitter.call(this);
}
inherits(MyEmitter, EventEmitter);

const myEmitter = new MyEmitter();
myEmitter.on('event', function(evt) {
    logger.log('an event occurred!',evt.object);
});
myEmitter.emit('event',{object:'test'});

function go() {
    var stream = ''
    fs.readFile('./Offer.sdp', 'utf8', function (err, data) {
        if (err) throw err;
        stream = data.toString()
        logger.log(stream);
    })
    //let f = (x) => {
    //    return x * 2
    //}
    var roomName = uuid.v4()
    var pid = uuid.v4()
    var username = c.email().split('@')[0]
    var userNotifyService = new JsonRpcNotificationService()
    var user = new UserParticipant(pid, username, false)
    //logger.log(util.inspect(user))
    kurento(dockerKmsWsUri, function (error, kurentoClient) {
        //assert(!error, 'Some dumb error create kurentoClient')
        var room = new Room(roomName, kurentoClient, userNotifyService, false)
        //console.log(util.inspect(room))
        room.join(pid, user.getUserName(), true, function (e, publisher) {
            //room.join(pid, user.getUserName(), true, (e, publisher) => {
            //should(e).equal(null)
            //logger.log(e, newUser)
            publisher.createPublishingEndpoint(function (error, result) {

                logger.log(error, result)
                if (error) {
                }
                result.processOffer(stream, function (error, answer) {

                    logger.log(error, answer)
                    if (error) throw error

                })

            })
            //done()
        })
        //room.createPipeline(function (e, pipeline) {
        //    should(e).equal(null)
        //    console.log(e, pipeline)
        //    done()
        //})
    })
}

//go()

var t = ''