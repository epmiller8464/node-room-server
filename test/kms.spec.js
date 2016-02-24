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
        var kms = new FixedOneKmsManager()//dockerKmsWsUri, kurentoClient)
        kms.addKms(new Kms(null, dockerKmsWsUri))
        kms.getKurentoClient();
        //kurento(dockerKmsWsUri, function (error, kurentoClient) {
        //    //kms
        //})
        //var kc = kurento.KurentoClient(dockerKmsWsUri)

        //var t = kc.beginTransaction()
        //t.commit()
        //console.log(util.inspect(t))
        //t = kc.endTransaction()
        //console.log(util.inspect(kc))
        var numKmss = 1
        var kmsWsUri = dockerKmsWsUri
        var kmsManager = new FixedOneKmsManager(kmsWsUri, numKmss, function (e, kmsMgr) {
            console.log(util.inspect(kmsManager))
            //console.log(kmsManager)
            //while (kmsManager.kmss.first()) {
            for (var key in kmsManager.kmss) {

                var kms = kmsManager.kmss[key]
                kms.should.be.not.equal(undefined)
                var sessionId = kms.getKurentoClient().sessionId
                sessionId.should.not.equal(null)
                sessionId.should.not.equal(undefined)
                sessionId.should.not.equal('')
                console.log(sessionId)

            }


            done()
        })
        //done()
    });
});