const { valid, invalid, Immutable, VALID } = require("./base");

// Add default fields
const complete = VALID.merge({
    email: "crhallberg+acluapi@gmail.com",
    country_code: 840, // US
    // 'get_updates': false, // falsey
    // 'share_info': false   // falsey
});
const keys = Object.keys(complete.toJS());
const expendable = ["city", "state", "email", "country_code"];

describe("Invalid if missing or empty:", function() {
    for (let i = 0; i < keys.length; i++) {
        if (expendable.indexOf(keys[i]) > -1) {
            continue;
        }
        describe("field: " + keys[i], function() {
            invalid("empty string", complete.set(keys[i], ""));
            invalid("null", complete.set(keys[i], null));
            invalid("false", complete.set(keys[i], false));
        });
    }
});
describe("Valid, even if missing or empty:", function() {
    for (let i = 0; i < expendable.length; i++) {
        describe("field: " + expendable[i], function() {
            valid("empty string", complete.set(expendable[i], ""));
            valid("null", complete.set(expendable[i], null));
            valid("false", complete.set(expendable[i], false));
        });
    }
});
