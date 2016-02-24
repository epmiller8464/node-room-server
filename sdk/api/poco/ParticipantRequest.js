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
    self.participantId = participantId;
    self.requestId = requestId;
}

ParticipantRequest.prototype.getRequestId = function getRequestId() {
    return this.requestId;
};

ParticipantRequest.prototype.setRequestId = function setRequestId(id) {
    this.requestId = id;
};

ParticipantRequest.prototype.getParticipantId = function getParticipantId() {
    return this.participantId;
};

ParticipantRequest.prototype.setParticipantId = function setParticipantId(participantId) {
    this.participantId = participantId;
};

ParticipantRequest.prototype.hashCode = function hashCode() {
    var self = this
    var partId = self.getParticipantId(),
        requestId = self.getRequestId(),
        prime = 31,
        result = 1;

    var pid = (partId) ? (util.isNumber(partId) ? partId : stringToHash(partId)) : 0
    var rid = (requestId) ? (util.isNumber(requestId) ? requestId : stringToHash(requestId)) : 0

    result = prime * result + (pid)
    result = prime * result + (rid)
    return result;

};

ParticipantRequest.prototype.toString = function toString() {
    var self = this;
    var parts = [];
    if (self.requestId) {
        parts.push(util.format('requestId=%s', self.requestId));
    }
    if (self.participantId) {
        parts.push(util.format('participantId=%s', self.participantId));
    }

    return util.format('[%s]', parts.join(','));
};

function stringToHash(string) {
    string = (string) ? string.toString() : ''
    var hash = 0
    for (var i = 0; i < string.length; i++)
        hash += string.charCodeAt(i)
    return hash
}


ParticipantRequest.prototype.equals = function (obj) {
    var self = this;

    if (!(obj) || !(obj instanceof ParticipantRequest))
        return false

    return self.getParticipantId() === obj.getParticipantId() && self.getRequestId() === obj.getRequestId()
};

module.exports = ParticipantRequest
