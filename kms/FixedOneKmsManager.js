
var util = require('util')
var inherits = require('inherits');
var kurento = require('kurento-client');

var KmsManager = require('./KmsManager');
var Kms = require('./Kms');

function FixedOneKmsManager() {
//function FixedOneKmsManager() {
    FixedOneKmsManager.super_.call(this)
    var self = this
}

inherits(FixedOneKmsManager, KmsManager);
//FixedOneKmsManager.getKurentoClient = function (sessionInfo) {
//    var self = this
//    //var msg = util.format('Unknow session type.'
//    console.log('get kurento client %s', sessionInfo)
//
//    var kc = self.getKms(sessionInfo)
//    return kc.getKurentoClient()
//}
module.exports = FixedOneKmsManager