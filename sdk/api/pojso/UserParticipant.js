/**
 * Created by ghostmac on 1/12/16.
 */
/*
 */

//package org.kurento.room.api.pojo;
//
///**
// * This POJO holds information about a room participant.
// *
// * @author <a href="mailto:rvlad@naevatec.com">Radu Tom Vlad</a>
// *
// */
var util = require('util');
function UserParticipant(participantId, userName, streaming) {
  var self = this;
  self._participantId = participantId;
  self._userName = userName;
  self._streaming = streaming || false;
}

UserParticipant.prototype.getParticipantId = function getParticipantId() {
  return this._participantId;
};

UserParticipant.prototype.setParticipantId = function setParticipantId(participantId) {
  this._participantId = participantId;
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
  var prime = 31;
  var result = 1;
  result = prime * result + ((this._participantId) ? 0 : this._participantId);
  result = prime * result + (this._streaming ? 1231 : 1237);
  //TODO:userName to hex
  result = prime * result + ((this._userName) ? 0 : this._userName.toString());
  return result;
};
//TODO:override
UserParticipant.prototype.toString = function toString() {
  var self = this;
  var parts = [];
  var builder = '[';
  if (self._participantId)
    parts.push(util.format('participantId=%s', self._participantId));
  //util.format('?limit=%s', limit);
  if (self._userName)
    parts.push(util.format('userName=%s', self._userName));
  //builder += util.format('userName=%s,', self._userName );
  parts.push(util.format('streaming=%s', self._streaming));
  //builder += 'streaming=' + self._streaming + ']';
  return util.format('[%s]', parts.join(','));
};

