/**
 * Created by ghostmac on 2/3/16.
 */

var debug = require('debug')('node-room-server:poco.spec')
var util = require('util')
var c = require('chance')();
var should = require('should');
var assert = require('assert');
//var EventEmitter = require('events').EventEmitter;
var ParticipantRequest = require('../sdk/api/poco/ParticipantRequest')
var UserParticipant = require('../sdk/api/poco/UserParticipant')

describe('ParticipantRequest', function () {
    //for (var i = 0; i < 500; i++) {
    it('hashCode', function (done) {
        debug('aksdkabs')
        var rid = (Math.random() * (Math.random() * 1024) | 0) * 100 + 1
        var pid = ((Math.random() * (Math.random() * 1024) | 0) * 31) + 1
        var pr = new ParticipantRequest(pid, rid)
        var pr2 = new ParticipantRequest(pid, rid)
        var ts = pr.toString()
        var expected = util.format('[requestId=%s,participantId=%s]', rid, pid)
        expected.should.equal(ts)
        expected.should.not.equal('')
        console.log(ts)
        console.log(pr.hashCode())
        //console.log(pr2.equals(pr))
        assert(pr2.equals(pr))
        assert(!pr.equals(new ParticipantRequest(0, 123)))

        done()
    });
    //}
});

describe('UserParticipant', function () {
    it('hashCode', function (done) {
        console.log('\n')
        var uid = c.email()// (Math.random() * (Math.random() * 1024) | 0) * 100
        var pid = (Math.random() * (Math.random() * 1024) | 0) * 31
        var ur = new UserParticipant(pid, uid, true)
        var ur2 = new UserParticipant(pid << 1, uid, true)
        var ts = ur.toString()
        var expected = util.format('[participantId=%s,userName=%s,streaming=true]', pid, uid)
        expected.should.equal(ts)
        console.log(ur.toString())
        console.log(ur2.toString())
        //console.log(pr.hashCode())
        //console.log(pr2.equals(pr))
        assert(!ur2.equals(ur))
        ur2.setParticipantId(ur2._participantId >> 1)
        assert(ur2.equals(ur))
        assert(!ur.equals(new ParticipantRequest(pid, uid, true)))

        done()
    });
});

