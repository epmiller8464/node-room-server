/**
 * Created by ghostmac on 1/12/16.
 */
var debug = require('debug')('node-room-server:publisherendpoint')
var inherits = require('inherits');
var kurento = require('kurento-client');
var MutedMediaType = require('../api/MutedMediaType');
var RoomError = require('../exception/RoomException');
var MediaEndpoint = require('./MediaEndpoint');
var EndpointConfig = {web: false, owner: null, endpointName: '', pipeline: null, log: null}

function noop(error, result) {
    if (error) console.trace(error);

    return result
}

/**
 *
 * @param {EndpointConfig} endpointConfig
 * @constructor
 */
function SubscriberEndpoint(endpointConfig) {
    endpointConfig = endpointConfig || {}
    var self = this;
    SubscriberEndpoint.super_.call(self, endpointConfig);

    self._connectedToPublisher = false
    self._publisher = null
    self.log = null//initLogger()
}

inherits(SubscriberEndpoint, MediaEndpoint);

SubscriberEndpoint.prototype.subscribe = function (sdpOffer, publisher, cb) {
    var self = this
    cb = (cb || noop).bind(self)

    self.super_.registerOnIceCandidateEventListener.call(this)
    //will yield a promise
    var sdpAnswer = null;
    self.processOffer(sdpOffer, function (err, sdpAnswer) {
        if (err)
            throw new RoomError('Error occured processing sdpOffer: ' + sdpOffer, RoomError.Code.MEDIA_WEBRTC_ENDPOINT_ERROR_CODE)

        try {
            self.gatherCandidates()
            publisher.connect(self.getEndpoint())
            self.setConnectedToPublisher(true)
            self.setPublisher(publisher)
            return cb(null, sdpAnswer)
        } catch (roomError) {
            console.log(roomError)
            return cb(roomError, sdpAnswer)
        }
    });
}

SubscriberEndpoint.prototype.isConnectedToPublisher = function () {
    var self = this
    return self._connectedToPublisher
}

SubscriberEndpoint.prototype.setConnectedToPublisher = function (connectedToPublisher) {
    var self = this
    self._connectedToPublisher = connectedToPublisher
}
SubscriberEndpoint.prototype.getPublisher = function () {
    var self = this
    return self._publisher
}
SubscriberEndpoint.prototype.setPublisher = function (publisher) {
    var self = this
    self._publisher = publisher
}
SubscriberEndpoint.prototype.mute = function (muteType) {
    var self = this
    var sink = self._passThru;
    if (self._elements) {
        var sinkId = self._elementIds.pop();
        if (!self._elements[sinkId])
            throw new RoomError("This endpoint (" + self.getEndpointName() + ") has no media self._element with id " + sinkId + " (should've been connected to the internal ep)",
                RoomError.Code.MEDIA_ENDPOINT_ERROR_CODE);
        sink = self._elements[sinkId];
    } else {

        console.log("Will mute connection of WebRTC and PassThrough (no other elems)");
    }

    switch (muteType) {
        case MutedMediaType.ALL:
            self.internalSinkDisconnect(self.getEndpoint(), sink);
            break;
        case MutedMediaType.AUDIO:
            self.internalSinkDisconnect(self.getEndpoint(), sink, MutedMediaType.AUDIO);
            break;
        case MutedMediaType.VIDEO:
            self.internalSinkDisconnect(self.getEndpoint(), sink, MutedMediaType.VIDEO);
            break;
    }
    self.resolveCurrentMuteType(muteType);
}
SubscriberEndpoint.prototype.unmute = function () {
    var self = this
    var sink = self._passThru;

    if (self._elements) {
        var sinkId = self._elementIds.pop();
        if (!self._elements[sinkId])
            throw new RoomError("This endpoint (" + self.getEndpointName() + ") has no media self._element with id " + sinkId + " (should've been connected to the internal ep)",
                RoomError.Code.MEDIA_ENDPOINT_ERROR_CODE);
        sink = self._elements[sinkId];
    } else {
        console.log("Will unmute connection of WebRTC and PassThrough (no other elems)");
    }
    self.internalSinkConnect(self.getEndpoint(), sink);
    self.setMuteType(null);
}

module.exports = SubscriberEndpoint