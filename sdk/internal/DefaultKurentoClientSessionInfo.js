/**
 * Created by ghostmac on 1/12/16.
 */

var debug = require('debug')('node-room-server:publisherendpoint')
var inherits = require('inherits');
var kurento = require('kurento-client');
var KurentoClientSessionInfo = require('../api/KurentoClientSessionInfo');
var RoomError = require('../exception/RoomException');

function noop(error, result) {
    if (error) console.trace(error);

    return result
}


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