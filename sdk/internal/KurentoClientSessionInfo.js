/**
 * Created by ghostmac on 1/12/16.
 */

var debug = require('debug')('node-room-server:DefaultKurentoClientSessionInfo')
var inherits = require('inherits');
var DefaultKurentoClientSessionInfo = require('../api/DefaultKurentoClientSessionInfo');

function KurentoClientSessionInfo(participantId, roomName) {
    var self = this
    KurentoClientSessionInfo.super_.call(self)
    self.participantId = participantId
    self.roomName = roomName
}

inherits(KurentoClientSessionInfo, DefaultKurentoClientSessionInfo)

KurentoClientSessionInfo.prototype.getParticipantId = function () {
    var self = this
    return self.participantId
}

KurentoClientSessionInfo.prototype.setParticipantId = function (pid) {
    var self = this
    self.participantId = pid
}

KurentoClientSessionInfo.prototype.getRoomName = function () {
    var self = this
    return self.roomName
}

KurentoClientSessionInfo.prototype.setRoomName = function (roomName) {
    var self = this
    self.roomName = roomName
}


module.exports = KurentoClientSessionInfo