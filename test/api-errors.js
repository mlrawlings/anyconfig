const chai = require("chai");
const anyconfig = require("../");
const expect = chai.expect;

describe('errors', () => {
    it('invalid defaultLoader', () => {
        expect(() => anyconfig.load({
            defaultLoader:123
        })).to.throw(/built in loaders/);
    });

    it('unfound defaultLoader', () => {
        expect(() => anyconfig.load({
            defaultLoader:'foo'
        })).to.throw(/built in loaders/);
    });
});