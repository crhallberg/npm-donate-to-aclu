const assert = require("assert");
const jsdom = require("jsdom");

const { FORM_URL, FORM_FIELDS } = require("../constants.js");

describe("Browser tests with JSDOM", function() {
    describe("Check form for used inputs", function() {
        let document, inputs;
        before(function(done) {
            jsdom.env({
                url: FORM_URL,
                done: function(err, window) {
                    document = window.document;
                    inputs = document.querySelector("form.webform-client-form").querySelectorAll("[name]");
                    done();
                },
            });
        });

        for (let name in FORM_FIELDS) {
            it(FORM_FIELDS[name], function() {
                let present = false;
                for (let j = 0; j < inputs.length; j++) {
                    if (FORM_FIELDS[name] === inputs[j].name) {
                        present = true;
                        break;
                    }
                }
                assert.ok(present, FORM_FIELDS[name] + " is missing");
            });
        }

        it("button with name Join The ACLU", function() {
            const button = document.getElementById("edit-submit");
            assert.ok(button, "Submit button missing");
            assert.equal(button.value, "Join The ACLU");
        });
    });
});
