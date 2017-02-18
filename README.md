# donate-to-aclu [![Travis status](https://img.shields.io/travis/USER/REPO.svg)](https://travis-ci.org/crhallberg/npm-donate-to-aclu)

Takes an object to submit an automated ACLU donation form.

> https://aclu-api.herokuapp.com/

### Security
 - no database at all
 - open source
 - as many validation checks as I can make before submitting to ACLU

### Required Fields

| Field     | Format  | Example |
|-----------|---------|-|
| firstname | string  | Casey |
| lastname  | string  | Doe |
| address   | string  | 123 Rainbow Lane |
| zipcode   | string  | 12345 |
| cc_number | str/num | no spaces, just numbers |
| cc_exp    | xx/xx   | Month/Year |
| cc_code   | xxx     | number or string |
| amount    | xx.xx   | ACLU only takes donations of $5 or more. Code strips all but numbers, period, comma; parseFloat; round down to 2 cent digits |

### Optional Fields

| Field | Format  | Default |
|-------|---------|---------|
| fullname | string | Casey Doe (can be used in place of firstname and lastname |
| email | string | crhallberg+acluapi@gmail.com  |
| city      | string  | Chicago (determined by zipcode if absent) |
| state     | string  | Illinois or IL (determined by zipcode if absent)  |
| country_code | str/num | 840 (US) - [ISO_3166-1 country code](https://en.wikipedia.org/wiki/ISO_3166-1_numeric#Officially_assigned_code_elements)                   |
| get_updates | boolean | false |
| share_info | boolean | false |

### Example

```javascript
const aclu = require('donate-to-aclu');

const fields = { /* ... */ };

if (aclu.validate(fields)) {
  aclu.submit(fields);
}
```

### Powered By
 - [Zombie.js](https://github.com/assaf/zombie)
 - Inspired by [ACLU Dash Button Hack](https://github.com/nathanpryor/donation_button)
