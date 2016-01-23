/**
 * Created by ghostmac on 1/12/16.
 */
/*
 * (C) Copyright 2015 Kurento (http://kurento.org/)
 *
 * All rights reserved. This program and the accompanying materials are made
 * available under the terms of the GNU Lesser General Public License (LGPL)
 * version 2.1 which accompanies this distribution, and is available at
 * http://www.gnu.org/licenses/lgpl-2.1.html
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

//package org.kurento.room.api.pojo;

/**
 * This POJO uniquely identifies a participant's request.
 *
 * @author <a href="mailto:rvlad@naevatec.com">Radu Tom Vlad</a>
 *
 */
var util = require('util');

function ParticipantRequest(participantId, requestId) {
  var self = this;
  //ParticipantRequest.super_.call(self);
  self._requestId = requestId;
  self._participantId = participantId;
  //Object.prototype
}

ParticipantRequest.prototype.getRequestId = function getRequestId() {
  return this._requestId;
};

ParticipantRequest.prototype.setRequestId = function setRequestId(id) {
  this._requestId = id;
};

ParticipantRequest.prototype.getParticipantId = function getParticipantId() {
  return this._participantId;
};

ParticipantRequest.prototype.setParticipantId = function setParticipantId(participantId) {
  this._participantId = participantId;
};

//@Override

ParticipantRequest.prototype.hashCode = function hashCode() {
  var self = this;
  var prime = 31;
  var result = 1;
  result = prime * result + ((self._requestId === null) ? 0 : self._requestId);
  result = prime * result + ((self._participantId === null) ? 0 : self._participantId);
  return result;
};

UserParticipant.prototype.toString = function toString() {
  var self = this;
  var parts = [];
  if (self._requestId) {
    parts.push(util.format('requestId=%s', self._requestId));
  }
  if (self._participantId) {
    //util.format('?limit=%s', limit);
    parts.push(util.format('participantId=%s', self._participantId));
  }

  //builder += 'streaming=' + self._streaming + ']';
  return util.format('[%s]', parts.join(','));
};


//@
//Override
//public
//boolean
//ParticipantRequest.prototype.equals = function (obj) {
//  var self = this;
//  if (self === obj)
//    return true;
//  if (!obj)
//    return false;
//  if (!(obj instanceof ParticipantRequest))
//    return false;
//
//  var other = obj;
//
//  if (self.requestId !== other.requestId) {
//    return false;
//  }
//
//  if(obj)
//  return self.participantId === other.participantId;
//};
