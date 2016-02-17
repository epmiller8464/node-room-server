/*
 /!*
 * (C) Copyright 2015 Kurento (http://kurento.org/)
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the GNU Lesser General Public License
 * (LGPL) version 2.1 which accompanies this distribution, and is available at
 * http://www.gnu.org/licenses/lgpl-2.1.html
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 *!/

 package org.kurento.room.kms;

 import org.kurento.client.KurentoClient;

 public class FixedOneKmsManager extends KmsManager {

 public FixedOneKmsManager(String kmsWsUri) {
 this(kmsWsUri, 1);
 }

 public FixedOneKmsManager(String kmsWsUri, int numKmss) {
 for (int i = 0; i < numKmss; i++)
 this.addKms(new Kms(KurentoClient.create(kmsWsUri), kmsWsUri));
 }
 }
 */
var inherits = require('inherits');
var kurento = require('kurento-client');

var KmsManager = require('./KmsManager');
var Kms = require('./Kms');

function FixedOneKmsManager(kmsWsUri, numKmss, callback) {
    var self = this
    FixedOneKmsManager.super_.call(self)

    for (var i = 0; i < numKmss; i++) {
        kurento(kmsWsUri, function (error, kc) {
            if (error) {
                assert.fail(error, undefined, 'Error should be undefined')
                return null
            }
            console.log(kc.sessionId)
            var kms = new Kms(kc, kmsWsUri)
            self.addKms(kms)
            if (self.kmss.length === (numKmss))
                callback()
        });
    }
}


inherits(FixedOneKmsManager, KmsManager);


function loadNewKurentoClient(wsUri, cb) {
    kurento(wsUri, cb);
}


module.exports = FixedOneKmsManager