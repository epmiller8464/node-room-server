/**
 * Created by ghostmac on 2/16/16.
 */
var kurento = require('kurento-client');
var debug = require('debug')('node-room-server:kms.spec')
var util = require('util')
var should = require('should');
var assert = require('assert');

var FixedOneKmsManager = require('../kms/FixedOneKmsManager')
var Kms = require('../kms/Kms')

var dockerKmsHostIp = '192.168.99.100'
var dockerKmsHostPort = '8888'
var dockerKmsWsUri = util.format('ws://%s:%s/kurento', dockerKmsHostIp, dockerKmsHostPort)

describe('KMS', function () {
    it('Create New KmsManager', function (done) {
        console.log(dockerKmsWsUri)
        var numKmss = 5
        var kmsWsUri = dockerKmsWsUri
        var kmsManager = new FixedOneKmsManager(kmsWsUri, numKmss, function () {
            //console.log(kmsManager)
            while (kmsManager.kmss.first()) {
                var kms = kmsManager.kmss.shift()
                kms.should.be.not.equal(undefined)
                var sessionId = kms.getKurentoClient().sessionId
                sessionId.should.not.equal(null)
                sessionId.should.not.equal(undefined)
                sessionId.should.not.equal('')
                console.log(sessionId)

            }
            done()
        })
    });
});