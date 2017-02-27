const assert = require('assert');
const jsdom = require("jsdom");

describe('Browser tests with JSDOM', function() {
  describe('Check form for used inputs', function() {
    const NAMES = [
      'submitted[donation][aclu_recurring]',
      'submitted[donation][amount]',
      'submitted[donation][other_amount]',
      'submitted[donor_information][first_name]',
      'submitted[donor_information][last_name]',
      'submitted[donor_information][email]',
      'submitted[billing_information][address]',
      'submitted[billing_information][address_line_2]',
      'submitted[billing_information][city]',
      'submitted[billing_information][state]',
      'submitted[billing_information][zip]',
      'submitted[billing_information][country]',
      'submitted[credit_card_information][card_number]',
      'submitted[credit_card_information][expiration_date][card_expiration_month]',
      'submitted[credit_card_information][expiration_date][card_expiration_year]',
      'submitted[credit_card_information][card_cvv]',
      'submitted[credit_card_information][fight_for_freedom][1]',
      'submitted[credit_card_information][profile_may_we_share_your_info][1]',
      // 'JOIN THE ACLU'
    ];

    let document, inputs;
    before(function(done) {
      jsdom.env({
        url: 'https://action.aclu.org/donate-aclu',
        done: function (err, window) {
          document = window.document;
          inputs = document.querySelector('form.webform-client-form').querySelectorAll('[name]');
          done();
        }
      });
    });

    for (let i = 0; i < NAMES.length; i++) {
      it(NAMES[i], function() {
        let present = false;
        for (let j = 0; j < inputs.length; j++) {
          if (NAMES[i] === inputs[j].name) {
            present = true;
            break;
          }
        }
        assert.ok(present, NAMES[i] + ' is missing');
      });
    }

    it('button with name JOIN THE ACLU', function() {
      const button = document.getElementById('edit-submit');
      assert.ok(button, 'Submit button missing');
      assert.equal(button.value, 'JOIN THE ACLU');
    });
  });
});
