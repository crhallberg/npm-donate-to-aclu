const { valid, invalid, Immutable, VALID } = require("./base");

describe("Location tests", function() {
  describe("valid submission with zipcode lookup", function() {
    valid("no city", VALID.set("city", ""));
    valid("no state", VALID.set("state", ""));
    valid("no city OR state", VALID.set("city", "").set("state", ""));
  });
});
