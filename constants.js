module.exports.FORM_URL =
  "https://action.aclu.org/give/become-freedom-fighter-join-aclu-7";
module.exports.FORM_FIELDS = {
  monthly_toggle: "submitted[donation][recurs_monthly]",
  other_toggle: "submitted[donation][amount]",
  once_amount: "submitted[donation][other_amount]",
  first_name: "submitted[donor_information][first_name]",
  last_name: "submitted[donor_information][last_name]",
  email: "submitted[donor_information][mail]",
  address: "submitted[billing_information][address]",
  address_2: "submitted[billing_information][address_line_2]",
  city: "submitted[billing_information][city]",
  state: "submitted[billing_information][state]",
  zipcode: "submitted[billing_information][zip]",
  country: "submitted[billing_information][country]",
  card_number:
    "submitted[payment_information][payment_fields][credit][card_number]",
  card_month:
    "submitted[payment_information][payment_fields][credit][expiration_date][card_expiration_month]",
  card_year:
    "submitted[payment_information][payment_fields][credit][expiration_date][card_expiration_year]",
  card_cvv: "submitted[payment_information][payment_fields][credit][card_cvv]",
  email_opt_in: "submitted[payment_information][email_opt_in][1]",
  share_info:
    "submitted[payment_information][profile_may_we_share_your_info][1]"
};
