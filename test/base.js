const assert = require("assert");
const library = require("../index.js");
const Immutable = require("immutable");

module.exports = {
    assert: assert,
    library: library,
    Immutable: Immutable,
    VALID: Immutable.Map(require("./valid.json")),

    valid: function valid(name, imm) {
        it(name, done => {
            library
                .validate(imm.toJS())
                .then(assert.ok)
                .catch(assert.fail)
                .then(done, done);
        });
    },
    invalid: function invalid(name, obj) {
        it(name, done => {
            library
                .validate(obj.toJS())
                .then(result => assert.fail(name + " was found valid"))
                .catch(reason => {
                    if (reason instanceof Error) {
                        assert.fail(reason);
                    } else {
                        assert.ok(reason);
                    }
                })
                .then(done, done);
        });
    }
};
