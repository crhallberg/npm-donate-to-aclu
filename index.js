const { card, cvc, expiration } = require("creditcards");
const validator = require("validator");

const { FORM_URL, FORM_FIELDS } = require("./constants.js");
const stateIndexes = require("./data/state-indexes");

function validate(formdata) {
    return new Promise(function(succeed, fail) {
        // Massage money
        if (formdata.amount) {
            formdata.amount = Math.floor(parseFloat(String(formdata.amount).replace(/[^\d.,]/g, "")) * 100) / 100;
            if (!formdata.amount) {
                return fail("Invalid currency amount");
            }
            // Too little money
            if (formdata.amount < 5) {
                return fail("Sorry, only donations $5 or larger can be processed ($" + formdata.amount + ").");
            }
        } else {
            return fail("Missing field: amount");
        }
        // Check email
        if (formdata.email && !validator.isEmail(formdata.email)) {
            return fail("Invalid email address.");
        }
        // Prepare date parts
        if (formdata.cc_exp) {
            if (formdata.cc_exp instanceof Date) {
                formdata.cc_exp = formdata.cc_exp.getMonth() + "/" + formdata.cc_exp.getYear() % 100;
            }
            let expParts = String(formdata.cc_exp).split(/\D/);
            if (expParts.length != 2) {
                return fail("Invalid field: cc_exp");
            }
            formdata.exp_month = String(expiration.month.parse(expParts[0]));
            formdata.exp_year = String(expiration.year.parse(expParts[1], true));
        } else {
            return fail("Missing field: cc_exp");
        }
        // Provide city and state from zip, if missing
        if (!formdata.zipcode) {
            return fail("Missing field: zipcode");
        }
        const zipcode = String(formdata.zipcode);
        if (zipcode.length !== 5 || zipcode.match(/\D/g)) {
            return fail("Invalid zipcode");
        }
        if (!formdata.city || !formdata.state) {
            const zips = require("zips");
            let place = zips.getByZipCode(zipcode);
            if (place) {
                formdata.city = place.city;
                formdata.state = place.state;
            } else {
                return fail("Missing fields: city and/or state, zipcode invalid");
            }
        }
        if (formdata.fullname && (!formdata.firstname || !formdata.lastname)) {
            let parts = formdata.fullname.split(/\W/);
            if (parts.length !== 2) {
                return fail("Missing fields: firstname OR lastname");
            }
            [formdata.firstname, formdata.lastname] = parts;
        }
        // Check for required fields
        const required = ["firstname", "lastname", "address", "city", "state", "zipcode", "cc_number", "exp_month", "exp_year", "cc_code", "amount"];
        for (let i = 0; i < required.length; i++) {
            if (!formdata[required[i]]) {
                return fail("Missing field: " + required[i]);
            }
            if (typeof formdata[required[i]] === "string") {
                if (formdata[required[i]].match(/%/)) {
                    formdata[required[i]] = decodeURI(formdata[required[i]]);
                }
                if (formdata[required[i]].match(/%/)) {
                    return fail("Overly escaped value for " + required[i] + ': "' + formdata[required[i]] + '"');
                }
            }
        }
        // Invalid state
        if (!stateIndexes[formdata.state]) {
            return fail("Please provide the full state name for " + formdata.state + ".");
        }
        // Invalid country
        if (formdata.country_code && typeof formdata.country_code === "string" && formdata.country_code.match(/\D/g)) {
            return fail("Please look up your country's numerical code: https://en.wikipedia.org/wiki/ISO_3166-1_numeric#Officially_assigned_code_elements.");
        }
        // Credit card number validation
        formdata.cc_number = String(formdata.cc_number);
        formdata.cc_code = String(formdata.cc_code);
        if (!card.isValid(formdata.cc_number) || !cvc.isValid(formdata.cc_code, card.type(formdata.cc_number))) {
            return fail("Credit card number or security code is not valid (" + formdata.cc_number + ", " + formdata.cc_code + ")");
        }
        if (expiration.isPast(formdata.exp_month, formdata.exp_year)) {
            return fail("Credit card is expired.");
        }
        // Apply defaults
        const defaults = {
            email: "crhallberg+acluapi@gmail.com",
            country_code: "840", // US
            get_updates: false,
            share_info: false,
        };
        for (let field in defaults) {
            formdata[field] = formdata[field] || defaults[field];
        }
        succeed(formdata);
    });
}
function automate(formdata) {
    const Browser = require("zombie");
    const browser = new Browser();
    browser.visit(FORM_URL, function() {
        try {
            browser.fill(FORM_FIELDS.monthly_toggle, 1);
            browser.fill(FORM_FIELDS.other_toggle, "other");
            browser.fill(FORM_FIELDS.once_amount, formdata.amount);

            browser.fill(FORM_FIELDS.first_name, formdata.firstname);
            browser.fill(FORM_FIELDS.last_name, formdata.lastname);
            browser.fill(FORM_FIELDS.email, formdata.email);

            browser.fill(FORM_FIELDS.address, formdata.address);
            browser.fill(FORM_FIELDS.address_2, formdata.address2 ? formdata.address2 : "");
            browser.fill(FORM_FIELDS.city, formdata.city);
            browser.select(FORM_FIELDS.state, stateIndexes[formdata.state] + "");
            browser.fill(FORM_FIELDS.zipcode, formdata.zipcode);
            if (formdata.country_code && formdata.country_code != 840) {
                browser.select(FORM_FIELDS.country, formdata.country_code + "");
            }

            browser.fill(FORM_FIELDS.card_number, formdata.cc_number);
            browser.select(FORM_FIELDS.card_month, formdata.exp_month + "");
            browser.select(FORM_FIELDS.card_year, formdata.exp_year + "");
            browser.fill(FORM_FIELDS.card_cvv, formdata.cc_code);

            if (formdata.get_updates) {
                browser.check(FORM_FIELDS.email_opt_in);
            } else {
                browser.uncheck(FORM_FIELDS.email_opt_in);
            }
            if (formdata.share_info) {
                browser.check(FORM_FIELDS.share_your_info);
            } else {
                browser.uncheck(FORM_FIELDS.share_your_info);
            }
            browser.pressButton("Join The ACLU", function() {
                let errors = browser.queryAll(".messages.error .form-message-link");
                if (errors.length === 0) {
                    succeed();
                } else {
                    let reason = "";
                    for (let i = 0; i < errors.length; i++) {
                        reason += " - " + browser.text(errors[i].parentNode) + "\n";
                    }
                    fail(reason);
                }
            });
        } catch (e) {
            fail(e.message);
        }
    });
}
function submit(formdata) {
    return new Promise((succeed, fail) => {
        validate(formdata)
            .then(automate)
            .catch(fail)
            .then(succeed, fail);
    });
}

module.exports = {
    validate,
    submit,
};
