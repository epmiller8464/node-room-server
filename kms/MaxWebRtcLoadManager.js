var inherits = require('inherits');

var LoadManager = require('./LoadManager')

function MaxWebRtcLoadManager(maxWebRtcPerKms) {
    MaxWebRtcLoadManager.super_.call(this)
    //LoadManager.call(this)
    var self = this
    console.log('MAX_LM init')
    self.maxWebRtcPerKms = maxWebRtcPerKms || 50
}
inherits(MaxWebRtcLoadManager, LoadManager)

MaxWebRtcLoadManager.prototype.calculateLoad = function (kms) {
    var self = this
    //var n = MaxWebRtcLoadManager.super_.calculateLoad.call(self)
    //console.log(MaxWebRtcLoadManager.super_)
    //return  self.maxWebRtcPerKms << n
    var numWebRtcs = self._countWebRtcEndpoints(kms);
    if (numWebRtcs > self.maxWebRtcPerKms) {
        return 1;
    } else {
        return numWebRtcs / self.maxWebRtcPerKms
    }
}


MaxWebRtcLoadManager.prototype.allowMoreElements = function (kms) {
    var self = this
    //var n = MaxWebRtcLoadManager.super_.allowMoreElements.call(self)
    //var n = self.prototype.allowMoreElements.call(self)
    //return n + n
    return self._countWebRtcEndpoints(kms) < self.maxWebRtcPerKms
}

MaxWebRtcLoadManager.prototype._countWebRtcEndpoints = function (kms) {
    try {
        var result = kms.getKurentoClient()
            .getServerManager()
            .getPipelines()
            .then(function () {
                console.log(arguments)
            })

        return result
    } catch (e) {
        console.log('Error counting KurentoClient pipelines %s', e);

        return 0;
    }
}
module.exports = MaxWebRtcLoadManager