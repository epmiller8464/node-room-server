/**
 * Created by ghostmac on 1/12/16.
 */
var debug = require('debug')('node-room-server:publisherendpoint')
var inherits = require('inherits');
var kurento = require('kurento-client');
var MutedMediaType = require('../api/MutedMediaType');
var RoomError = require('../exception/RoomException');
var MediaEndpoint = require('./MediaEndpoint');
var SdpType = require('./SdpType');
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
function PublisherEndpoint(endpointConfig) {
    endpointConfig = endpointConfig || {}
    var self = this;
    PublisherEndpoint.super_.call(self, endpointConfig);

    self._passThru = null
    self._passThruSubscription = null
    self._elements = {}
    self._elementIds = []
    self._connected = false
    self._elementsErrorSubscriptions = {}

    self.log = null//initLogger()
}

inherits(PublisherEndpoint, MediaEndpoint);

PublisherEndpoint.prototype.internalEndpointInitialization = function (cb) {
    var self = this;
    PublisherEndpoint.super_.internalEndpointInitialization.call(this, function (error, endpoint) {

        console.log(error, endpoint)
        self._pipeline.create('PassThrough', function (error, passThrough) {
            if (error) {
                return cb(error, null);
                //throw new Error(error);
            }

            self._passThru = passThrough;
            //self._passThruSubscription = self.registerElemErrListener(self._passThru);
            console.log("EP %s: Created a new PassThrough");
            return cb(null, endpoint);
        });
    });
};

PublisherEndpoint.prototype.unregisterErrorListeners = function () {
    var self = this;
    PublisherEndpoint.super_.unregisterErrorListeners.call(this);
    this.unregisterElementErrListener(this._passThru, this._passThruSubscription)
    if (this._elementIds) {
        this._elementIds.forEach(function (id) {
            var element = self._elements[id]
            var subscription = self._elementsErrorSubscriptions[id]
            self.unregisterElementErrListener(element, subscription)

        });
    }
};

PublisherEndpoint.prototype.getMediaElements = function () {
    if (this._passThru) {
        this._elements[this._passThru.id] = this._passThru
    }
    return this._elements
}

PublisherEndpoint.prototype.mute = function (muteType) {
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

PublisherEndpoint.prototype.unmute = function () {
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

PublisherEndpoint.prototype.getNext = function (uid) {
    var self = this
    var idx = self._elementIds.indexOf(uid);
    if (idx < 0 || idx + 1 === self._elementIds.length)
        return null;
    return self._elementIds[idx + 1];
}

PublisherEndpoint.prototype.getPrevious = function (uid) {
    var self = this
    var idx = self._elementIds.indexOf(uid);
    if (idx < 1)
        return null
    return self._elementIds[idx - 1];
}
/**
 *
 * @param sdpType {String}
 * @param sdpString {String}
 * @param doLoopback {bool}
 * @param loopbackAltSrc {MediaElement}
 * @param loopbackConnType {MediaType}
 */
PublisherEndpoint.prototype.publish = function (sdpType,
                                                sdpString,
                                                doLoopback,
                                                loopbackAltSrc,
                                                loopbackConnType,
                                                cb) {
    var self = this
    PublisherEndpoint.super_.registerOnIceCandidateEventListener.call(self)

    if (doLoopback) {
        if (loopbackAltSrc) {
            self.connectAltLoopbackSrc(loopbackAltSrc, loopbackConnType)
        } else {
            self.connect(self.getEndpoint(), loopbackConnType)

        }
    } else {
        self.innerConnect()
    }
    var sdpResponse = null
    switch (sdpType.toUpperCase()) {
        case SdpType.ANSWER:
            sdpResponse = self.processAnswer(sdpString, cb)
            break
        case SdpType.OFFER:
            sdpResponse = self.processOffer(sdpString, cb)
            break
        default:
            throw new RoomError('Cannot publish SdpType: %s ' + sdpType + ')', RoomError.Code.MEDIA_WEBRTC_ENDPOINT_ERROR_CODE);
    }

    self.gatherCandidates(function () {

    });

    return sdpResponse

};


/**
 *
 */
PublisherEndpoint.prototype.preparePublishConnection = function (callback) {

    return this.generateOffer(callback)
}
/**
 *
 * @param {MediaElement} sink
 * @param {MediaType} type
 */
PublisherEndpoint.prototype.connect = function (sink, type) {
    var self = this
    if (!self._connected)
        self.innerConnect()

    self.internalSinkConnect(self._passThru, sink, type)

}
/**
 *
 * @param {MediaElement} sink
 * @param {MediaType} type
 */
PublisherEndpoint.prototype.disconnectFrom = function (sink, type) {
    var self = this
    self.internalSinkDisconnect(self._passThru, sink, type, null, null);

}
/**
 *
 * @param {MediaElement} shaper
 * @param {MediaType} type
 */
PublisherEndpoint.prototype.apply = function (shaper, type) {
    var self = this
    //String id = shaper.getId();
    var id = shaper.id
    //if (id === null)
    if (!id)
        throw new RoomError("Unable to connect media element with null id", RoomError.Code.MEDIA_WEBRTC_ENDPOINT_ERROR_CODE);
    //if (elements.containsKey(id))
    if (!self._elements[id])
        throw new RoomError("Unable to connect media element with null id", RoomError.Code.MEDIA_WEBRTC_ENDPOINT_ERROR_CODE);

    //throw new RoomException(Code.MEDIA_WEBRTC_ENDPOINT_ERROR_CODE,
    //"This endpoint already has a media element with id " + id);
    //MediaElement first = null;
    var first = null;
    //if (!elementIds.isEmpty())
    if (!self._elementIds)
        first = self._elements[self._elementIds.pop()];
    if (self._connected) {
        if (first)
            self.internalSinkConnect(first, shaper, type);
        else
            self.internalSinkConnect(self.getEndpoint(), shaper, type);
        self.internalSinkConnect(shaper, self._passThru, type);
    }
    self._elementIds.push(id);
    self._elements[id] = shaper;
    self.elementsErrorSubscriptions[id] = self.registerElemErrListener(shaper);
    return id;

}

/**
 *
 * @param {MediaElement} shaper
 */
PublisherEndpoint.prototype.revert = function (shaper) {
    var self = this
    var elementId = shaper.id;
    if (!self._elements[elementId])
        throw new RoomError("This endpoint (" + getEndpointName() + ") has no media element with id " + elementId, RoomError.Code.MEDIA_ENDPOINT_ERROR_CODE);

    var element = self._elements[elementId];
    self.unregisterElementErrListener(element, self._elementsErrorSubscriptions[elementId]);
    delete self._elements[elementId]
    delete self._elementsErrorSubscriptions[elementId]

    // careful, the order in the elems list is reverted
    if (self._connected) {
        var nextId = self.getNext(elementId),
            prevId = self.getPrevious(elementId);
        // next connects to prev
        var prev = null, next = null;
        if (nextId !== null)
            next = self._elements[nextId];
        else
            next = self.getEndpoint();
        if (prevId !== null)
            prev = self._elements[prevId];
        else
            prev = self._passThru;
        self.internalSinkConnect(next, prev);
    }
    var index = self._elementIds.indexOf(elementId)
    self._elementIds.splice(index, 1)
    //  self.torrents.splice(self.torrents.indexOf(torrent), 1)

    //self._elements.release(cb)
    self._elements.release()
    console.log("EP {}: Released media element {}", getEndpointName(), elementId);
    console.log("EP {}: Failed to release media element {}", getEndpointName(), elementId, cause);
}
/**
 *
 * @param {MediaType} muteType
 */

/**
 *
 * @param {MediaElement} loopbackAltSrc
 * @param {MediaType} loopbackConnType
 */
PublisherEndpoint.prototype.connectAltLoopbackSrc = function (loopbackAltSrc, loopbackConnType) {
    var self = this
    if (!self._connected) {
        self.innerConnect()
        self.internalSinkConnect(loopbackAltSrc, this.getEndpoint(), loopbackConnType)
    }
}

PublisherEndpoint.prototype.innerConnect = function () {
    var self = this
    var current = self.getEndpoint();
    if (current === null)
        throw new RoomError("Can't connect null endpoint (ep: " + self.getEndpointName() + ")", RoomError.Code.MEDIA_ENDPOINT_ERROR_CODE);

    var prevId = self.elementIds.pop();//peekLast();
    while (prevId !== null) {
        var prev = self.elements.get(prevId);
        if (prev === null)
            throw new RoomError("No media element with id " + prevId + " (ep: " + self.getEndpointName() + ")", RoomError.Code.MEDIA_ENDPOINT_ERROR_CODE);
        self.internalSinkConnect(current, prev);
        current = prev;
        prevId = self.getPrevious(prevId);
    }
    self.internalSinkConnect(current, passThru);
    self._connected = true;
}
/**
 *
 * @param source
 * @param sink
 * @param type
 * @param sourceMediaDescription
 * @param sinkMediaDescription
 * @param cb
 */
PublisherEndpoint.prototype.internalSinkConnect = function (source,
                                                            sink,
                                                            type,
                                                            sourceMediaDescription,
                                                            sinkMediaDescription,
                                                            cb) {
    var self = this
    cb = (cb || noop).bind(self)
    type = type || null
    source.connect(sink, type, sourceMediaDescription, sinkMediaDescription, cb)
}

/**
 *
 * @param source
 * @param sink
 * @param type
 * @param sourceMediaDescription
 * @param sinkMediaDescription
 * @param cb
 */
PublisherEndpoint.prototype.internalSinkDisconnect = function (source,
                                                               sink,
                                                               type,
                                                               sourceMediaDescription,
                                                               sinkMediaDescription,
                                                               cb) {
    var self = this
    cb = (cb || noop).bind(self)

    type = type || null
    source.disconnect(sink, type, sourceMediaDescription, sinkMediaDescription, cb)
}

module.exports = PublisherEndpoint