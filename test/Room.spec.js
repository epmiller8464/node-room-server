/**
 * Created by ghostmac on 2/17/16.
 */


var util = require('util')
//var inherits = require('inherits');
var kurento = require('kurento-client');
var should = require('should');
var assert = require('assert');
var KCSessionInfo = require('../sdk/internal/KurentoClientSessionInfo')
var Room = require('../sdk/internal/Room')
var RoomManager = require('../sdk/RoomManager')
var JsonRpcNotificationService = require('../rpc/JsonRpcNotificationService')
var UserParticipant = require('../sdk/api/poco/UserParticipant')
var uuid = require('node-uuid')
var c = require('chance')()

var dockerKmsHostIp = '192.168.99.100'
var dockerKmsHostPort = '8888'
var dockerKmsWsUri = util.format('ws://%s:%s/kurento', dockerKmsHostIp, dockerKmsHostPort)

describe('RoomManager', function () {
    it('CreatePipeline', function (done) {

        var roomName = uuid.v4()
        var pid = uuid.v4()
        var username = c.email().split('@')[0]
        var userNotifyService = new JsonRpcNotificationService()
        var user = new UserParticipant(pid, username, false)
        console.log(util.inspect(user))
        kurento(dockerKmsWsUri, function (error, kurentoClient) {
            assert(!error, 'Some dumb error create kurentoClient')
            var room = new Room(roomName, kurentoClient, userNotifyService, false)
            //console.log(util.inspect(room))
            room.join(pid, user.getUserName(), true, function (e, newUser) {
                should(e).equal(null)
                console.log(e, newUser)
                done()

            })
            //room.createPipeline(function (e, pipeline) {
            //    should(e).equal(null)
            //    console.log(e, pipeline)
            //    done()
            //})
        })


    });
});
