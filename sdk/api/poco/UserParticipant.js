/**
 * Created by ghostmac on 1/12/16.
 */
/*
 */
var util = require('util')

function UserParticipant(participantId, userName, streaming) {
    var self = this;
    self.participantId = participantId;
    self._userName = userName;
    self._streaming = streaming || false;
}

UserParticipant.prototype.getParticipantId = function getParticipantId() {
    return this.participantId;
};

UserParticipant.prototype.setParticipantId = function setParticipantId(participantId) {
    this.participantId = participantId;
};

UserParticipant.prototype.getUserName = function getUserName() {
    return this._userName;
};

UserParticipant.prototype.setUserName = function setUserName(userName) {
    this._userName = userName;
};

UserParticipant.prototype.isStreaming = function isStreaming() {
    return this._streaming;
};

UserParticipant.prototype.setStreaming = function setStreaming(streaming) {
    this._streaming = streaming;
};

UserParticipant.prototype.hashCode = function hashCode() {
    var self = this

    var partId = self.getParticipantId(),
        userName = self.getUserName(),
        prime = 31,
        result = 1;

    var pid = (partId) ? (util.isNumber(partId) ? partId : stringToHash(partId)) : 0
    var uid = (userName) ? (util.isNumber(userName) ? userName : stringToHash(userName)) : 0

    result = prime * result + (pid);
    result = prime * result + (self._streaming ? 1231 : 1237);
    //TODO:userName to hex
    result = prime * result + (uid)
    return result;

};

//TODO:override
UserParticipant.prototype.toString = function toString() {
    var self = this;
    var parts = [];
    //var builder = '[';
    if (self.participantId)
        parts.push(util.format('participantId=%s', self.participantId));
    //util.format('?limit=%s', limit);
    if (self._userName)
        parts.push(util.format('userName=%s', self._userName));
    //builder += util.format('userName=%s,', self._userName );
    parts.push(util.format('streaming=%s', self._streaming));
    //builder += 'streaming=' + self._streaming + ']';
    return util.format('[%s]', parts.join(','));
};

function stringToHash(string) {
    string = (string) ? string.toString() : ''
    var hash = 0
    for (var i = 0; i < string.length; i++)
        hash += string.charCodeAt(i)
    return hash
}

UserParticipant.prototype.equals = function (obj) {
    var self = this;

    if (!(obj) || !(obj instanceof UserParticipant))
        return false

    return self.getParticipantId() === obj.getParticipantId() &&
           self.getUserName() === obj.getUserName()
}


module.exports = UserParticipant