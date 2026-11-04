/*
 * RHODHOMES application form: single source of truth.
 * Used by the browser (form building + friendly validation) AND by the
 * server (api/submit.js) so both always validate with identical rules.
 */
(function (root) {
  'use strict';

  var YES_NO = ['Yes', 'No'];

  var sections = [
    {
      id: 'personal',
      title: 'Personal Information',
      intro: 'Tell us who you are. Fields marked * are required.',
      fields: [
        { name: 'firstName', label: 'First name', type: 'text', required: true, max: 60, autocomplete: 'given-name' },
        { name: 'middleName', label: 'Middle name', type: 'text', required: false, max: 60, autocomplete: 'additional-name' },
        { name: 'lastName', label: 'Last name', type: 'text', required: true, max: 60, autocomplete: 'family-name' },
        { name: 'email', label: 'Email address', type: 'email', required: true, max: 120, autocomplete: 'email' },
        { name: 'phone', label: 'Phone number', type: 'tel', required: true, max: 25, autocomplete: 'tel', help: 'Include your country code, e.g. +1...' },
        { name: 'country', label: 'Country', type: 'text', required: true, max: 80, autocomplete: 'country-name' },
        { name: 'state', label: 'State or region', type: 'text', required: true, max: 80, autocomplete: 'address-level1' },
        { name: 'city', label: 'City', type: 'text', required: true, max: 80, autocomplete: 'address-level2' }
      ]
    },
    {
      id: 'contact',
      title: 'Contact Preferences',
      intro: 'How would you like RHODHOMES to contact you? Select all that apply.',
      fields: [
        {
          name: 'contactMethods', label: 'Preferred contact channels', type: 'checkgroup', required: true,
          options: [
            { value: 'WhatsApp', detailLabel: 'WhatsApp number', detailPlaceholder: '+1...' },
            { value: 'Telegram', detailLabel: 'Telegram username or number', detailPlaceholder: '@username' },
            { value: 'Email', detailLabel: 'Email address to use', detailPlaceholder: 'name@example.com' },
            { value: 'SMS', detailLabel: 'SMS phone number', detailPlaceholder: '+1...' },
            { value: 'Signal', detailLabel: 'Signal number or username', detailPlaceholder: '+1...' },
            { value: 'Zangi', detailLabel: 'Zangi number', detailPlaceholder: '+1...' },
            { value: 'Other', detailLabel: 'Other method and contact detail', detailPlaceholder: 'e.g. CA - 707...' }
          ]
        },
        {
          name: 'contactTime', label: 'Preferred contact time', type: 'select', required: true,
          options: ['Morning (8am - 12pm)', 'Afternoon (12pm - 4pm)', 'Evening (4pm - 8pm)', 'Any time']
        },
        { name: 'contactTimeNote', label: 'Time zone or other timing note', type: 'text', required: false, max: 120, help: 'Optional.' }
      ]
    },
    {
      id: 'platforms',
      title: 'Social Media and Online Platforms',
      intro: 'Where can you share available rental listings? Select all that apply. Never share passwords - we only need a username or link.',
      fields: [
        {
          name: 'platforms', label: 'Platforms', type: 'checkgroup', required: true,
          options: [
            { value: 'Facebook', detailLabel: 'Facebook profile, page or group link', detailPlaceholder: 'facebook.com/...' },
            { value: 'Instagram', detailLabel: 'Instagram username or link', detailPlaceholder: '@username' },
            { value: 'TikTok', detailLabel: 'TikTok username or link', detailPlaceholder: '@username' },
            { value: 'YouTube', detailLabel: 'YouTube channel link', detailPlaceholder: 'youtube.com/@...' },
            { value: 'X', detailLabel: 'X username or link', detailPlaceholder: '@username' },
            { value: 'LinkedIn', detailLabel: 'LinkedIn profile link', detailPlaceholder: 'linkedin.com/in/...' },
            { value: 'WhatsApp', detailLabel: 'WhatsApp group, channel link or number', detailPlaceholder: 'Link or number' },
            { value: 'Telegram', detailLabel: 'Telegram group, channel link or username', detailPlaceholder: 't.me/... or @username' },
            { value: 'Other', detailLabel: 'Other platform name and link', detailPlaceholder: 'Platform and link' }
          ]
        }
      ]
    },
    {
      id: 'audience',
      title: 'Audience and Experience',
      intro: 'Help us understand your reach and background.',
      fields: [
        { name: 'managesCommunity', label: 'Do you manage a social media group or online community?', type: 'radio', required: true, options: YES_NO },
        {
          name: 'audienceSize', label: 'Audience or community size', type: 'select', required: true,
          options: ['None yet', 'Under 500', '500 - 2,000', '2,001 - 10,000', '10,001 - 50,000', 'Over 50,000']
        },
        { name: 'occupation', label: 'Occupation', type: 'text', required: true, max: 100, autocomplete: 'organization-title' },
        {
          name: 'experience', label: 'Previous experience', type: 'checkgroup', required: true,
          help: 'Select all that apply.',
          options: [
            { value: 'Referral' }, { value: 'Marketing' }, { value: 'Sales' },
            { value: 'Content creation' }, { value: 'Community management' }, { value: 'No previous experience' }
          ]
        },
        { name: 'experienceExplanation', label: 'Explain your relevant experience', type: 'textarea', required: false, max: 1500, help: 'Optional.' }
      ]
    },
    {
      id: 'interests',
      title: 'Rental Referral Interests',
      intro: 'Tell us where and how you would share available rental listings.',
      fields: [
        { name: 'locations', label: 'Locations or areas where you can share rental listings', type: 'textarea', required: true, max: 1000 },
        {
          name: 'propertyTypes', label: 'Property types you are interested in promoting', type: 'checkgroup', required: true,
          options: [
            { value: 'Self-contained / studio' }, { value: '1-bedroom' }, { value: '2-bedroom' },
            { value: '3-bedroom or larger' }, { value: 'Shared apartment' }, { value: 'Student accommodation' },
            { value: 'Short-let' }, { value: 'Commercial space' }, { value: 'Other' }
          ]
        },
        { name: 'multipleCities', label: 'Can you cover multiple cities?', type: 'radio', required: true, options: YES_NO },
        {
          name: 'availability', label: 'Availability', type: 'select', required: true,
          options: ['Under 5 hours a week', '5 - 10 hours a week', '10 - 20 hours a week', 'Over 20 hours a week']
        },
        {
          name: 'schedule', label: 'Preferred participation schedule', type: 'select', required: true,
          options: ['Weekdays', 'Weekends', 'Evenings', 'Flexible']
        },
        { name: 'sharingPlan', label: 'How do you plan to share available listings?', type: 'textarea', required: true, max: 1500 },
        { name: 'motivation', label: 'Why are you interested in joining RHODHOMES?', type: 'textarea', required: true, max: 1500 }
      ]
    },
    {
      id: 'payment',
      title: 'Payment Preferences',
      intro: 'Only your preferred method and country are needed now. Do NOT enter bank account numbers, PINs, card details or any passwords.',
      fields: [
        {
          name: 'paymentMethod', label: 'Preferred payment method', type: 'select', required: true,
          options: ['Bank transfer', 'Mobile money', 'PayPal', 'Wise', 'Other', 'Discuss later']
        },
        { name: 'paymentCountry', label: 'Payment country', type: 'text', required: true, max: 80 }
      ]
    }
  ];

  var consents = [
    { name: 'truth', label: 'I confirm that the information I have provided is true and accurate to the best of my knowledge.' },
    { name: 'privacy', label: 'I consent to RHODHOMES collecting and using my information to review my application and contact me.' },
    { name: 'terms', label: 'I accept the programme terms, and I understand that submitting an application does not guarantee acceptance, referrals, compensation or earnings.' }
  ];

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var PHONE_RE = /^\+?[0-9][0-9\s\-().]{5,24}$/;

  function optVal(o) { return typeof o === 'string' ? o : o.value; }

  function validateField(f, data) {
    var v = data[f.name];
    var i, val;

    if (f.type === 'checkgroup') {
      var arr = Array.isArray(v) ? v : [];
      var details = (data[f.name + 'Details'] && typeof data[f.name + 'Details'] === 'object') ? data[f.name + 'Details'] : {};
      if (f.required && arr.length === 0) return 'Please select at least one option.';
      for (i = 0; i < arr.length; i++) {
        var opt = null;
        for (var j = 0; j < f.options.length; j++) { if (optVal(f.options[j]) === arr[i]) { opt = f.options[j]; break; } }
        if (!opt) return 'One of the selected options is not valid.';
        if (opt.detailLabel) {
          var d = String(details[arr[i]] == null ? '' : details[arr[i]]).trim();
          if (!d) return 'Please fill in: ' + opt.detailLabel + '.';
          if (d.length > 300) return 'Details for ' + arr[i] + ' are too long (300 characters max).';
        }
      }
      return '';
    }

    val = typeof v === 'string' ? v.trim() : '';
    if (!val) return f.required ? 'This field is required.' : '';
    if (val.length > (f.max || 200)) return 'Too long (maximum ' + (f.max || 200) + ' characters).';
    if (f.type === 'email' && !EMAIL_RE.test(val)) return 'Enter a valid email address.';
    if (f.type === 'tel' && !PHONE_RE.test(val)) return 'Enter a valid phone number, e.g. +2348012345678.';
    if (f.type === 'select' || f.type === 'radio') {
      var ok = false;
      for (i = 0; i < f.options.length; i++) { if (optVal(f.options[i]) === val) { ok = true; break; } }
      if (!ok) return 'Please choose one of the listed options.';
    }
    return '';
  }

  function validateSection(section, data) {
    var errors = {};
    for (var i = 0; i < section.fields.length; i++) {
      var msg = validateField(section.fields[i], data);
      if (msg) errors[section.fields[i].name] = msg;
    }
    return errors;
  }

  function validateConsents(data) {
    var errors = {};
    var c = (data.consents && typeof data.consents === 'object') ? data.consents : {};
    for (var i = 0; i < consents.length; i++) {
      if (c[consents[i].name] !== true) errors[consents[i].name] = 'This confirmation is required.';
    }
    return errors;
  }

  /* Build a clean object containing ONLY known fields, trimmed and clipped. */
  function sanitize(data) {
    var out = {};
    data = data || {};
    sections.forEach(function (s) {
      s.fields.forEach(function (f) {
        if (f.type === 'checkgroup') {
          var arr = Array.isArray(data[f.name]) ? data[f.name] : [];
          var allowed = f.options.map(optVal);
          out[f.name] = arr.filter(function (x) { return allowed.indexOf(x) !== -1; });
          var det = (data[f.name + 'Details'] && typeof data[f.name + 'Details'] === 'object') ? data[f.name + 'Details'] : {};
          var cleanDet = {};
          out[f.name].forEach(function (x) {
            if (det[x] != null && String(det[x]).trim()) cleanDet[x] = String(det[x]).trim().slice(0, 300);
          });
          out[f.name + 'Details'] = cleanDet;
        } else {
          out[f.name] = typeof data[f.name] === 'string' ? data[f.name].trim().slice(0, f.max || 200) : '';
        }
      });
    });
    return out;
  }

  var api = {
    sections: sections,
    consents: consents,
    optVal: optVal,
    validateField: validateField,
    validateSection: validateSection,
    validateConsents: validateConsents,
    sanitize: sanitize
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.RH_CONFIG = api; }
})(typeof self !== 'undefined' ? self : this);
