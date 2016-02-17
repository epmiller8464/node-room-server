///*
// * (C) Copyright 2015 Kurento (http://kurento.org/)
// *
// * All rights reserved. This program and the accompanying materials are made
// * available under the terms of the GNU Lesser General Public License (LGPL)
// * version 2.1 which accompanies this distribution, and is available at
// * http://www.gnu.org/licenses/lgpl-2.1.html
// *
// * This library is distributed in the hope that it will be useful, but WITHOUT
// * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
// * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
// * details.
// */
//
var util = require('util')
var inherits = require('inherits')
var DefaultKurentoClientSessionInfo = require('../sdk/internal/DefaultKurentoClientSessionInfo')
var KurentoClientProvider = require('../sdk/api/KurentoClientProvider')
var FIFO = require('fifo')

function KmsLoad(kms, load) {
    var self = this;
    self.kms = kms || null
    self.load = load || 0
}


KmsLoad.prototype.getLoad = function () {
    return this.load
}

KmsLoad.prototype.getKMS = function () {
    return this.kms
}
KmsLoad.prototype.compareTo = function (kmsLoad) {
    return this.load > kmsLoad.load
}

function KmsManager() {
    var self = this
    self.kmss = new FIFO()
    self.usageIterator = null

}

inherits(KmsManager, KurentoClientProvider)

KmsManager.prototype.getKurentoClient = function (sessionInfo) {
    var self = this
    //var msg = util.format('Unknow session type.'
    console.log('get kurento client %s', sessionInfo)

    var kc = self.getKms(sessionInfo)
    return kc.getKurentoClient()
}

KmsManager.prototype.getKms = function (sessionInfo) {
    var self = this
    if (self.kmss && self.kmss.length > 0) {
        return self.kmss.shift()
    } else
        return null

}

KmsManager.prototype.addKms = function (kms) {
    var self = this
    return self.kmss.push(kms)
}
KmsManager.prototype.getLessLoadedKms = function () {
    throw new Error('Not implemented exception')
}
KmsManager.prototype.getNextLessLoadedKms = function () {
    throw new Error('Not implemented exception')
}
KmsManager.prototype.getKmssSortedByLoad = function () {
    throw new Error('Not implemented exception')
}

KmsManager.prototype.getKmsLoads = function () {
    var self = this
    var loads = self.kmss.toArray()
    for (var i = 0; i < loads.length; i++) {
        //while (self.kmss.first()) {
        var kms = loads[i]
        //var kms = self.kmss.shift()
        loads[i] = new KmsLoad(kms, kms.getLoad())
    }

    return loads
}

KmsManager.prototype.destroyWhenUnused = function () {
    return false
}

module.exports = KmsLoad
module.exports = KmsManager