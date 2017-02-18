const { valid, invalid, Immutable, VALID } = require('./base');

describe('Date', function() {
  describe('Valid formats', function() {
    valid('12/19', VALID.set('cc_exp', '12/19'));
    valid('12/2019', VALID.set('cc_exp', '12/2019'));
    valid('12-19', VALID.set('cc_exp', '12-19'));
    valid('12-2019', VALID.set('cc_exp', '12-2019'));
    valid('array [12, 19]', VALID.set('cc_exp', [12, 19])); // by mistake lol
    valid('Date', VALID.set('cc_exp', new Date('2019-12-15')));
  });
  describe('Invalid formats', function() {
    invalid('no split', VALID.set('cc_exp', '1219'));
    invalid('number', VALID.set('cc_exp', 1219));
  });
});
