/**
 * Created by ghostmac on 1/12/16.
 */

var debug = require('debug')('node-room-server:DefaultKurentoClientSessionInfo')
var inherits = require('inherits');
var KurentoClientSessionInfo = require('../api/KurentoClientSessionInfo');

function DefaultKurentoClientSessionInfo(participantId, roomName) {
    var self = this
    DefaultKurentoClientSessionInfo.super_.call(self)
    self._participantId = participantId
    self._roomName = roomName
}


DefaultKurentoClientSessionInfo.prototype.getParticipantId = function () {
    var self = this
    return self._roomName
}

DefaultKurentoClientSessionInfo.prototype.setParticipantId = function (pid) {
    var self = this
    self._participantId = pid
}

DefaultKurentoClientSessionInfo.prototype.getRoomName = function () {
    var self = this
    return self._roomName
}

DefaultKurentoClientSessionInfo.prototype.setRoomName = function (roomName) {
    var self = this
    self._roomName = roomName
}

inherits(DefaultKurentoClientSessionInfo, KurentoClientSessionInfo)

module.exports = DefaultKurentoClientSessionInfo