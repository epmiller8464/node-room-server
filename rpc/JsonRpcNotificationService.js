var inherits = require('inherits')
var ParticipantSession = require('./ParticipantSession')
var UserNotificationService = require('../sdk/api/UserNotificationService')

function JsonRpcNotificationService() {
    //private static ConcurrentMap<var , var > sessions = new ConcurrentHashMap<var , var >();
    var self = this
    self.log = null
    self.sessions = {}
}

inherits(JsonRpcNotificationService, UserNotificationService)

JsonRpcNotificationService.prototype.addTransaction = function (t, request) {
    var self = this

    var sessionId = t.getSession().getSessionId();
    var sw = self.sessions[sessionId];
    if (sw === null) {
        //sw = new (t.getSession())
        var oldSw = self.sessions.putIfAbsent(sessionId, sw);
        if (oldSw !== null) {
            console.log('Concurrent initialization of session wrapper #%s', sessionId);
            sw = oldSw;
        }
    }
    sw.addTransaction(request.getId(), t);
    return sw;
}
JsonRpcNotificationService.prototype.getSession = function (sessionId) {
    var self = this

    var sw = self.sessions[sessionId];
    if (sw == null)
        return null;
    return sw.getSession();
}
JsonRpcNotificationService.prototype.getAndRemoveTransaction = function (participantRequest) {
    var self = this

    var tid = null;
    if (participantRequest === null) {
        console.log('Unable to obtain a transaction for a null ParticipantRequest object');
        return null;
    }
    var tidVal = participantRequest.getRequestId();
    try {
        tid = parseInt(tidVal);
    } catch (e) {
        console.log(
            'Invalid transaction id, a number was expected but recv: %s',
            tidVal, e);
        return null;
    }
    var sessionId = participantRequest.getParticipantId();
    var sw = self.sessions[sessionId];
    if (sw === null) {
        console.log('Invalid session id %s', sessionId);
        return null;
    }
    console.log('#%s - %s transactions', sessionId, sw.getTransactions().length);
    var t = sw.getTransaction(tid);
    sw.removeTransaction(tid);
    return t;
}
JsonRpcNotificationService.prototype.sendResponse = function (participantRequest, result) {
    var self = this
    var t = self.getAndRemoveTransaction(participantRequest);
    if (t === null) {
        console.log('No transaction found for %s, unable to send result %s', participantRequest, result);
        return;
    }
    try {
        t.sendResponse(result);
    } catch (e) {
        console.log('Exception responding to user', e);
    }
}
JsonRpcNotificationService.prototype.sendErrorResponse = function (participantRequest, data, error) {
    var self = this

    var t = self.getAndRemoveTransaction(participantRequest);
    if (t === null) {
        console.log('No transaction found for %s, unable to send result %s', participantRequest, data);
        return;
    }
    try {
        var dataVal = (data || data.toString());
        //t.sendError(error.getCodeValue(), error.getMessage(), dataVal);
    } catch (e) {
        console.log('Exception sending error response to user', e);
    }
}
JsonRpcNotificationService.prototype.sendNotification = function (participantId, method, params) {
    var self = this

    var sw = self.sessions.get(participantId);
    if (sw === null || sw.getSession() === null) {
        console.log('No session found for id %s, unable to send notification %s: %s', participantId, method, params);
        return;
    }
    var s = sw.getSession();

    try {
        s.sendNotification(method, params);
    } catch (e) {
        console.log('Exception sending notification to user', e);
    }
}
JsonRpcNotificationService.prototype.closeSession = function (participantRequest) {
    var self = this

    if (participantRequest === null) {
        console.log('No session found for null ParticipantRequest object, unable to cleanup');
        return;
    }
    var sessionId = participantRequest.getParticipantId();
    var sw = self.sessions[sessionId];
    if (sw === null || sw.getSession() === null) {
        console.log('No session found for id %s, unable to cleanup', sessionId);
        return;
    }
    var s = sw.getSession();
    try {

        var ps = null;
        if (s.getAttributes().containsKey(ParticipantSession.SESSION_KEY))
            ps = s.getAttributes().get(ParticipantSession.SESSION_KEY);
        s.close();
        console.log('Closed session for req %s (userInfo:%s)',
            participantRequest, ps);
    } catch (e) {
        console.log('Error closing session for req %s', participantRequest, e);
    }
    self.sessions.remove(sessionId);
}

module.exports = JsonRpcNotificationService