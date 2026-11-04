/*
 * RHODHOMES home-page enquiry form (Rent / Buy / Sell).
 * Shared by the browser and by api/enquiry.js so both validate identically.
 */
(function (root) {
  'use strict';

  var TYPES = ['Rent', 'Buy', 'Sell'];

  var US_STATES = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming','Multiple states / flexible'];

  /* showFor = which enquiry types display the field. label may differ per type. */
  var fields = [
    { name: 'firstName', label: 'First name', type: 'text', required: true, max: 60, autocomplete: 'given-name' },
    { name: 'lastName', label: 'Last name', type: 'text', required: true, max: 60, autocomplete: 'family-name' },
    { name: 'email', label: 'Email address', type: 'email', required: true, max: 120, autocomplete: 'email' },
    { name: 'phone', label: 'Phone number', type: 'tel', required: false, max: 25, autocomplete: 'tel', help: 'Optional. Include country code if outside the US.' },
    { name: 'contactPreference', label: 'Best way to reach you', type: 'select', required: true, options: ['Email', 'Phone call', 'Text message', 'WhatsApp'] },
    { name: 'state', label: { Rent: 'State where you want to rent', Buy: 'State where you want to buy', Sell: 'State where the property is' }, type: 'select', required: true, options: US_STATES, autocomplete: 'address-level1' },
    { name: 'city', label: { Rent: 'Preferred city or area', Buy: 'Preferred city or area', Sell: 'Property city or area' }, type: 'text', required: true, max: 100, autocomplete: 'address-level2' },
    { name: 'propertyType', label: 'Property type', type: 'select', required: true, options: ['House', 'Apartment / Condo', 'Townhouse', 'Multi-family', 'Land', 'Commercial', 'Other'] },
    { name: 'bedrooms', label: 'Bedrooms', type: 'select', required: true, showFor: ['Rent', 'Buy'], options: ['Studio', '1', '2', '3', '4 or more', 'Any'] },
    { name: 'budget', label: { Rent: 'Monthly rent budget (USD)', Buy: 'Purchase budget (USD)' }, type: 'text', required: false, max: 60, showFor: ['Rent', 'Buy'], help: 'Optional.' },
    { name: 'propertyAddress', label: 'Property address', type: 'text', required: false, max: 200, showFor: ['Sell'], help: 'Optional - street address is not needed to enquire.' },
    { name: 'askingPrice', label: 'Expected asking price (USD)', type: 'text', required: false, max: 60, showFor: ['Sell'], help: 'Optional.' },
    { name: 'timeline', label: 'Timeline', type: 'select', required: true, options: ['As soon as possible', 'Within 1 month', '1 - 3 months', '3 - 6 months', 'Just exploring'] },
    { name: 'message', label: 'Anything else we should know?', type: 'textarea', required: false, max: 1500, help: 'Optional. Please do not include passwords, card numbers or ID numbers.' }
  ];

  var CONSENT = 'I agree that RHODHOMES may use these details to respond to my enquiry. I understand this is an enquiry only and does not guarantee availability, pricing or any transaction.';

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var PHONE_RE = /^\+?[0-9][0-9\s\-().]{5,24}$/;

  function labelOf(f, type) { return typeof f.label === 'string' ? f.label : (f.label[type] || f.label.Rent || ''); }
  function fieldsFor(type) { return fields.filter(function (f) { return !f.showFor || f.showFor.indexOf(type) !== -1; }); }

  function validateField(f, data) {
    var val = typeof data[f.name] === 'string' ? data[f.name].trim() : '';
    if (!val) return f.required ? 'This field is required.' : '';
    if (val.length > (f.max || 200)) return 'Too long (maximum ' + (f.max || 200) + ' characters).';
    if (f.type === 'email' && !EMAIL_RE.test(val)) return 'Enter a valid email address.';
    if (f.type === 'tel' && !PHONE_RE.test(val)) return 'Enter a valid phone number.';
    if (f.type === 'select' && f.options.indexOf(val) === -1) return 'Please choose one of the listed options.';
    return '';
  }

  function validate(data) {
    var errors = {};
    if (TYPES.indexOf(data.type) === -1) { errors.type = 'Please choose Rent, Buy or Sell.'; return errors; }
    fieldsFor(data.type).forEach(function (f) { var m = validateField(f, data); if (m) errors[f.name] = m; });
    if (data.consent !== true) errors.consent = 'This confirmation is required.';
    return errors;
  }

  function sanitize(data) {
    var out = { type: data.type };
    fieldsFor(data.type).forEach(function (f) {
      out[f.name] = typeof data[f.name] === 'string' ? data[f.name].trim().slice(0, f.max || 200) : '';
    });
    return out;
  }

  var api = { TYPES: TYPES, fields: fields, fieldsFor: fieldsFor, labelOf: labelOf, validate: validate, sanitize: sanitize, CONSENT: CONSENT };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; } else { root.RH_ENQUIRY = api; }
})(typeof self !== 'undefined' ? self : this);
