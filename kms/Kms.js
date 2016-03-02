///*
// * (C) Copyright 2015 Kurento (http://kurento.org/)
// *
// * All rights reserved. This program and the accompanying materials
// * are made available under the terms of the GNU Lesser General Public License
// * (LGPL) version 2.1 which accompanies this distribution, and is available at
// * http://www.gnu.org/licenses/lgpl-2.1.html
// *
// * This library is distributed in the hope that it will be useful,
// * but WITHOUT ANY WARRANTY; without even the implied warranty of
// * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
// * Lesser General Public License for more details.
// *
// */
//
//package org.kurento.room.kms;
//
//import org.kurento.client.KurentoClient;
//
//
var MaxWebRtcLoadManager = require('./MaxWebRtcLoadManager')

function Kms(kc, kmsUri) {
    var self = this

    self.loadManager = new MaxWebRtcLoadManager(50);
    self.kurentoClient = kc || null
    self.kmsUri = kmsUri || null
}

Kms.prototype.setLoadManager = function (loadManager) {
    var self = this
    self.loadManager = loadManager;
}
Kms.prototype.getLoad = function () {
    var self = this
    return self.loadManager.calculateLoad(self);
}

Kms.prototype.allowMoreElements = function () {
    var self = this
    return self.loadManager.allowMoreElements(self);
}
Kms.prototype.getUri = function () {
    var self = this
    return self.kmsUri;
}

Kms.prototype.getKurentoClient = function () {
    var self = this
    return self.kurentoClient;
}


module.exports = Kms