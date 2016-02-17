var inherits = require('inherits')
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
    //StringBuilder builder = new StringBuilder();
    //builder.append("[");
    //if (participantName != null)
    //    builder.append("participantName=").append(participantName)
    //        .append(", ");
    //if (roomName != null)
    //    builder.append("roomName=").append(roomName);
    //builder.append("]");
    //return builder.toString();

}


module.exports = ParticipantSession