const { library, assert, valid, invalid, Immutable, VALID } = require("./base");

describe("Basic tests", function() {
    valid("valid submission", VALID);
    // Make sure submit is set up correctly
    it(".submit() rejecting correctly", function(done) {
        library
            .submit(VALID.set("amount", 0).toJS())
            .then(result => assert.fail(".submit() found invalid submission valid"))
            .catch(assert.ok)
            .then(done, done);
    });
    // Money check
    invalid("too little money", VALID.set("amount", 4));
    invalid("not real money", VALID.set("amount", "apple"));
    // Email
    valid("valid email address", VALID.set("email", "1234567890@example.com"));
    valid("valid +gmail address", VALID.set("email", "crhallberg+acluapi@gmail.com"));
    invalid("invalid email address 1", VALID.set("email", "Joe Smith <email@example.com>"));
    invalid("invalid email address 2", VALID.set("email", "acluapi"));
    invalid("invalid email address 3", VALID.set("email", 'this is"really"notallowed@example.com'));
    // Full name extrapolation
    valid("fullname w/o firstname", VALID.set("fullname", "Casey Doe").set("firstname", ""));
    valid("fullname w/o lastname", VALID.set("fullname", "Casey Doe").set("lastname", ""));
    valid(
        "fullname w/o first or last name",
        VALID.set("fullname", "Casey Doe")
            .set("firstname", "")
            .set("lastname", ""),
    );
    invalid("too short fullname", VALID.set("fullname", "Casey").set("firstname", ""));
    invalid("too long fullname", VALID.set("fullname", "Casey Doe Jr.").set("firstname", ""));
});
