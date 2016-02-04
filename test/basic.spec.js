/**
 * Created by ghostmac on 1/14/16.
 */
var should = require('should');
var assert = require('assert');
var FIFO = require('fifo');
describe('basic', function () {
    it('b', function (done) {
        var x = [1, 2, 3];
        var n = 0;
        while (x.length) {
            n += x.pop();
            console.log(n)
        }
        n.should.equal(6);
        (x.length).should.be.equal(0);
        done();
    });

    it('fifo tests', function (done) {
        var fifo = new FIFO();

        fifo.push('h');
        fifo.push('e');
        ('h').should.equal(fifo.first());
        ('e').should.equal(fifo.last());
        (fifo.length).should.equal(2);
        //console.log(fifo);
        ('h').should.equal(fifo.shift());
        ('e').should.equal(fifo.shift());
        (fifo.length).should.equal(0);
        done();

    });
});


