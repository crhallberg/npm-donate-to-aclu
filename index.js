const { card, cvc, expiration } = require('creditcards');
const validator = require('validator');

const stateIndexes = require('./data/state-indexes');

function validate(formdata) {
  return new Promise(function (succeed, fail) {
    // Massage money
    if (formdata.amount) {
      formdata.amount = Math.floor(parseFloat(String(formdata.amount).replace(/[^\d.,]/g, '')) * 100) / 100;
      if (!formdata.amount) {
        return fail('Invalid currency amount');
      }
      // Too little money
      if (formdata.amount < 5) {
        return fail("Sorry, only donations $5 or larger can be processed ($" + formdata.amount + ").");
      }
    } else {
      return fail('Missing field: amount');
    }
    // Check email
    if (formdata.email && !validator.isEmail(formdata.email)) {
      return fail('Invalid email address.');
    }
    // Prepare date parts
    if (formdata.cc_exp) {
      if (formdata.cc_exp instanceof Date) {
        formdata.cc_exp = formdata.cc_exp.getMonth() + '/' + (formdata.cc_exp.getYear() % 100);
      }
      let expParts = String(formdata.cc_exp).split(/\D/);
      if (expParts.length != 2) {
        return fail('Invalid field: cc_exp');
      }
      formdata.exp_month = String(expiration.month.parse(expParts[0]));
      formdata.exp_year  = String(expiration.year.parse(expParts[1], true));
    } else {
      return fail('Missing field: cc_exp');
    }
    // Provide city and state from zip, if missing
    if (!formdata.zipcode) {
      return fail('Missing field: zipcode');
    }
    const zipcode = String(formdata.zipcode);
    if (zipcode.length !== 5 || zipcode.match(/\D/g)) {
      return fail('Invalid zipcode');
    }
    if (!formdata.city || !formdata.state) {
      const zips = require('zips');
      let place = zips.getByZipCode(zipcode);
      if (place) {
        formdata.city = place.city;
        formdata.state = place.state;
      } else {
        return fail('Missing fields: city and/or state, zipcode invalid');
      }
    }
    if (formdata.fullname && (!formdata.firstname || !formdata.lastname)) {
      let parts = formdata.fullname.split(/\W/);
      if (parts.length !== 2) {
        return fail('Missing fields: firstname OR lastname');
      }
      [ formdata.firstname, formdata.lastname ] = parts;
    }
    // Check for required fields
    const required = [ 'firstname', 'lastname', 'address', 'city', 'state', 'zipcode', 'cc_number', 'exp_month', 'exp_year', 'cc_code', 'amount' ];
    for (let i = 0; i < required.length; i++) {
      if (!formdata[required[i]]) {
        return fail('Missing field: ' + required[i]);
      }
      if (typeof formdata[required[i]] === 'string') {
        if (formdata[required[i]].match(/%/)) {
          formdata[required[i]] = decodeURI(formdata[required[i]]);
        }
        if (formdata[required[i]].match(/%/)) {
          return fail('Overly escaped value for ' + required[i] + ': "' + formdata[required[i]] + '"');
        }
      }
    }
    // Invalid state
    if (!stateIndexes[formdata.state]) {
      return fail('Please provide the full state name for ' + formdata.state + '.');
    }
    // Invalid country
    if (formdata.country_code && typeof formdata.country_code === 'string' && formdata.country_code.match(/\D/g)) {
      return fail("Please look up your country's numerical code: https://en.wikipedia.org/wiki/ISO_3166-1_numeric#Officially_assigned_code_elements.");
    }
    // Credit card number validation
    formdata.cc_number = String(formdata.cc_number);
    formdata.cc_code   = String(formdata.cc_code);
    if (
      !card.isValid(formdata.cc_number) ||
      !cvc.isValid(formdata.cc_code, card.type(formdata.cc_number))
    ) {
      return fail("Credit card number or security code is not valid (" + formdata.cc_number + ', ' + formdata.cc_code + ')');
    }
    if (expiration.isPast(formdata.exp_month, formdata.exp_year)) {
      return fail("Credit card is expired.");
    }
    // Apply defaults
    const defaults = {
      'email': 'crhallberg+acluapi@gmail.com',
      'country_code': '840', // US
      'get_updates': false,
      'share_info': false
    };
    for (let field in defaults) {
      formdata[field] = formdata[field] || defaults[field];
    }
    succeed(formdata);
  });
}
function automate(formdata) {
  const Browser = require('zombie');
  const browser = new Browser();
  browser.visit('https://action.aclu.org/give/become-freedom-fighter-join-aclu-7', function () {
    try {
      browser.fill('submitted[donation][aclu_recurring]', 0);
      browser.fill('submitted[donation][amount]', "other");
      browser.fill('submitted[donation][other_amount]', formdata.amount);

      browser.fill('submitted[donor_information][first_name]', formdata.firstname);
      browser.fill('submitted[donor_information][last_name]',  formdata.lastname);
      browser.fill('submitted[donor_information][email]',      formdata.email);

      browser.fill('submitted[billing_information][address]',        formdata.address);
      browser.fill('submitted[billing_information][address_line_2]', formdata.address2 ? formdata.address2 : '');
      browser.fill('submitted[billing_information][city]',           formdata.city);
      browser.select('submitted[billing_information][state]',        stateIndexes[formdata.state] + '');
      browser.fill('submitted[billing_information][zip]',            formdata.zipcode);
      if (formdata.country_code && formdata.country_code != 840) {
        browser.select('submitted[billing_information][country]', formdata.country_code + '');
      }

      browser.fill('submitted[credit_card_information][card_number]', formdata.cc_number);
      browser.select('submitted[credit_card_information][expiration_date][card_expiration_month]', formdata.exp_month + '');
      browser.select('submitted[credit_card_information][expiration_date][card_expiration_year]',  formdata.exp_year + '');
      browser.fill('submitted[credit_card_information][card_cvv]', formdata.cc_code);

      if (formdata.get_updates) {
        browser.check('submitted[credit_card_information][fight_for_freedom][1]');
      } else {
        browser.uncheck('submitted[credit_card_information][fight_for_freedom][1]');
      }
      if (formdata.share_info) {
        browser.check('submitted[credit_card_information][profile_may_we_share_your_info][1]');
      } else {
        browser.uncheck('submitted[credit_card_information][profile_may_we_share_your_info][1]');
      }
      browser.pressButton('JOIN THE ACLU', function() {
        let errors = browser.queryAll('.messages.error .form-message-link');
        if (errors.length === 0) {
          succeed();
        } else {
          let reason = '';
          for (let i = 0; i < errors.length; i++) {
            reason += ' - ' + browser.text(errors[i].parentNode) + '\n';
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
    validate(formdata).then(automate).catch(fail).then(succeed, fail);
  });
}

module.exports = {
  validate,
  submit
};
