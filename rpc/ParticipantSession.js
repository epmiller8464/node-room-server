var inherits = require('inherits')
var util = require('util')
/**
 * Participant information that should be stored in the WebSocket session.
 *
 * @author <a href="mailto:rvlad@naevatec.com">Radu Tom Vlad</a>
 */
function ParticipantSession(participantName, roomName) {
    var self = this
    self.participantName = participantName || ''
    self.roomName = roomName || ''

}

ParticipantSession.SESSION_KEY = "participant";

ParticipantSession.prototype.getParticipantName = function () {
    var self = this

    return self.participantName;
}

ParticipantSession.prototype.setParticipantName = function (participantName) {
    var self = this
    self.participantName = participantName;
}

ParticipantSession.prototype.getRoomName = function () {
    var self = this
    return self.roomName;
}

ParticipantSession.prototype.setRoomName = function (roomName) {
    var self = this
    self.roomName = roomName;
}

ParticipantSession.prototype.toString = function () {

    var self = this
    var data = []
    if (self.participantName && self.participantName.length) {
        data.push(util.format('participantName=%s', self.participantName))
    }
    if (self.roomName && self.roomName.length) {
        data.push(util.format('roomName=%s', self.roomName))
    }
    return util.format('[%s]', data.join((data.length > 1 ? ',' : '')));

}


module.exports = ParticipantSession