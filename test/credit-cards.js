const { valid, invalid, Immutable, VALID } = require("./base");

describe("Credit cards", function() {
  describe("Invalid credit cards", function() {
    invalid("cc_number too short", VALID.set("cc_number", "4"));
    invalid(
      "cc_number too long",
      VALID.set("cc_number", "423456789012345678901")
    );
    invalid("cc_number invalid", VALID.set("cc_number", "4242424242424241"));
    invalid("cc_code too short", VALID.set("cc_code", "1"));
    invalid("cc_code too long", VALID.set("cc_code", "1234"));
    invalid("cc_code invalid", VALID.set("cc_code", "abc"));
  });
  describe("Credit card types", function() {
    valid(
      "valid numeric cc_number",
      VALID.set("cc_number", Number(VALID.get("cc_number")))
    );
    valid(
      "valid string cc_number",
      VALID.set("cc_number", String(VALID.get("cc_number")))
    );
    valid(
      "valid numeric CVC",
      VALID.set("cc_number", Number(VALID.get("cc_number")))
    );
    valid(
      "valid string CVC",
      VALID.set("cc_number", String(VALID.get("cc_number")))
    );
  });
});
