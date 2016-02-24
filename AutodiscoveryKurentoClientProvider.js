//package org.kurento.room;
//
//import org.kurento.client.KurentoClient;
//import org.kurento.client.Properties;
//import org.kurento.room.api.KurentoClientProvider;
//import org.kurento.room.api.KurentoClientSessionInfo;
//import org.kurento.room.exception.RoomException;
//
//public class AutodiscoveryKurentoClientProvider
//		implements KurentoClientProvider {
//
//	private static final int ROOM_PIPELINE_LOAD_POINTS = 50;
//
//	@Override
//	public KurentoClient getKurentoClient(KurentoClientSessionInfo sessionInfo)
//			throws RoomException {
//
///


var kurento = require('kurento-client')
var KurentoClientProvider = require('./sdk/api/KurentoClientProvider')

var inherits = require('inherits')

function AutoDiscoveryKurentoClientProvider() {
    var self = this
    AutoDiscoveryKurentoClientProvider.super_.call(self)
}
AutoDiscoveryKurentoClientProvider.ROOM_PIPELINE_LOAD_POINTS = 50;
inherits(AutoDiscoveryKurentoClientProvider, KurentoClientProvider)

AutoDiscoveryKurentoClientProvider.prototype.getKurentoClient = function (sessionInfo) {
    var self = this

    //kurento(kmsWsUri, function (error, kc) {
    //    if (error) {
    //        assert.fail(error, undefined, 'Error should be undefined')
    //        return null
    //    }
    //    console.log(kc.sessionId)
    //    var kms = new Kms(kc, kmsWsUri)
    //    self.addKms(kms)
    //    if (self.kmss.length === (numKmss))
    //        callback()
    //});
    return KurentoClient.create(Properties.of("loadPoints", ROOM_PIPELINE_LOAD_POINTS));
}
AutoDiscoveryKurentoClientProvider.prototype.destroyWhenUnused = function () {
    return true;
}

module.exports = AutoDiscoveryKurentoClientProvider