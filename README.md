# aclu-donation-api

Takes POST data to submit an automated ACLU donation form.

> https://aclu-api.herokuapp.com/`

### Security
 - https connection
 - POST data
 - no database at all
 - open source
 - no sensitive information in the logs
   - amount and first name in the private logs
   - `ready to donate $5 for Chris`

### Required Fields

| Field     | Format  | Example |
|-----------|---------|-|
| firstname | string  | John |
| lastname  | string  | Doe |
| address   | string  | 123 Rainbow Lane |
| zipcode   | string  | 12345 (can be used to determine city and state) |
| cc_number | str/num | no spaces, just numbers |
| cc_exp    | xx/xx   | Month/Year |
| cc_code   | xxx     | number or string |
| amount    | xx.xx   | ACLU only takes donations of $5 or more. Code strips all but numbers, period, comma; parseFloat; round down to 2 cent digits |

### Optional Fields

| Field | Format  | Default |
|-------|---------|---------|
| email | string | crhallberg+acluapi@gmail.com  |
| city      | string  | Chicago (determined by zipcode if absent) |
| state     | string  | Illinois or IL (determined by zipcode if absent)  |
| country_code | str/num | 840 (US) - [ISO_3166-1 country code](https://en.wikipedia.org/wiki/ISO_3166-1_numeric#Officially_assigned_code_elements)                   |
| get_updates | boolean | false |
| share_info | boolean | false |

### Example

```javascript
var FormData = require('form-data');

const fields = { /* ... */ };

var form = new FormData();
for (let i in fields) {
  form.append(i, fields[i]);
}

form.submit('https://aclu-api.herokuapp.com/', function(err, res) {
  if (err) {
    console.log(err);
  } else {
    console.log(res.statusCode);
    if (res.statusCode === 200) {
      console.log(res.statusCode);
      console.log("SUCCESS!");
    } else {
      // Print out error
      var body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => { console.log(body); });
    }
  }
});
```

### Powered By
 - [Heroku](https://www.heroku.com/)
 - [node.js](https://nodejs.org/en/)
 - [Zombie.js](https://github.com/assaf/zombie)
 - Inspired by [ACLU Dash Button Hack](https://github.com/nathanpryor/donation_button)
