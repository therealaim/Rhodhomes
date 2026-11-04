(function () {
  'use strict';
  var CFG = window.RH_ENQUIRY;
  var els = {
    fields: document.getElementById('enqFields'),
    submit: document.getElementById('enqSubmit'),
    alert: document.getElementById('enqAlert'),
    panel: document.getElementById('enqPanel'),
    success: document.getElementById('enqSuccess'),
    hp: document.getElementById('enqWebsite')
  };
  var state = { data: { type: 'Rent', consent: false }, submissionId: '', startedAt: Date.now(), sending: false };

  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k]; if (v === false || v == null) return;
      if (k === 'text') el.textContent = v; else if (k === 'class') el.className = v; else el.setAttribute(k, v === true ? '' : v);
    });
    (kids || []).forEach(function (c) { if (c) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return el;
  }
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    var a = new Uint8Array(16); crypto.getRandomValues(a);
    return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }
  function showAlert(m) { els.alert.textContent = m || ''; els.alert.hidden = !m; }
  function clearError(name) {
    var w = els.fields.querySelector('[data-field="' + name + '"]'); if (!w) return;
    w.classList.remove('invalid'); var e = w.querySelector('.err'); if (e) e.remove();
  }
  function showErrors(errors) {
    var first = null;
    Object.keys(errors).forEach(function (name) {
      var w = els.fields.querySelector('[data-field="' + name + '"]'); if (!w) return;
      w.classList.add('invalid');
      var old = w.querySelector('.err'); if (old) old.remove();
      w.appendChild(h('p', { class: 'err', text: errors[name], role: 'alert' }));
      if (!first) first = w;
    });
    if (first) {
      first.scrollIntoView({ block: 'center', behavior: 'smooth' });
      var i = first.querySelector('input, select, textarea'); if (i) i.focus({ preventScroll: true });
    }
  }

  function reqMark(f) { return f.required ? h('span', { class: 'req', text: '*', 'aria-label': 'required' }) : h('span', { class: 'opt', text: '(optional)' }); }

  function renderField(f) {
    var id = 'q_' + f.name, wrap = h('div', { class: 'field', 'data-field': f.name }), v = state.data[f.name] || '';
    var lab = h('label', { class: 'lbl', for: id }); lab.appendChild(document.createTextNode(CFG.labelOf(f, state.data.type) + ' ')); lab.appendChild(reqMark(f));
    wrap.appendChild(lab);
    var inp;
    if (f.type === 'select') {
      inp = h('select', { id: id, name: f.name, autocomplete: f.autocomplete || null, 'aria-required': f.required ? 'true' : null });
      inp.appendChild(h('option', { value: '', text: 'Select...' }));
      f.options.forEach(function (o) { var op = h('option', { value: o, text: o }); if (v === o) op.selected = true; inp.appendChild(op); });
      inp.addEventListener('change', function () { state.data[f.name] = inp.value; clearError(f.name); });
    } else if (f.type === 'textarea') {
      inp = h('textarea', { id: id, name: f.name, maxlength: f.max }); inp.value = v;
      inp.addEventListener('input', function () { state.data[f.name] = inp.value; clearError(f.name); });
    } else {
      inp = h('input', { type: f.type, id: id, name: f.name, value: v, maxlength: f.max, autocomplete: f.autocomplete || 'off', inputmode: f.type === 'tel' ? 'tel' : (f.type === 'email' ? 'email' : null), 'aria-required': f.required ? 'true' : null });
      inp.addEventListener('input', function () { state.data[f.name] = inp.value; clearError(f.name); });
    }
    wrap.appendChild(inp);
    if (f.help) wrap.appendChild(h('p', { class: 'help', text: f.help }));
    return wrap;
  }

  function render() {
    els.fields.innerHTML = '';
    showAlert('');
    var tw = h('div', { class: 'field', 'data-field': 'type' });
    tw.appendChild(h('div', { class: 'lbl' }, ['I want to ', h('span', { class: 'req', text: '*' })]));
    var rg = h('div', { class: 'radios', role: 'radiogroup', 'aria-label': 'Enquiry type' });
    CFG.TYPES.forEach(function (t) {
      var rid = 'q_type_' + t, r = h('input', { type: 'radio', name: 'type', id: rid, value: t }); r.checked = state.data.type === t;
      var l = h('label', { class: 'choice' + (r.checked ? ' on' : ''), for: rid }, [r, h('span', { text: t })]);
      r.addEventListener('change', function () { state.data.type = t; render(); var el = document.getElementById(rid); if (el) el.focus({ preventScroll: true }); });
      rg.appendChild(l);
    });
    tw.appendChild(rg); els.fields.appendChild(tw);

    CFG.fieldsFor(state.data.type).forEach(function (f) { els.fields.appendChild(renderField(f)); });

    var cw = h('div', { class: 'field', 'data-field': 'consent' });
    var cb = h('input', { type: 'checkbox', id: 'q_consent' }); cb.checked = state.data.consent === true;
    var cl = h('label', { class: 'choice' + (cb.checked ? ' on' : ''), for: 'q_consent' }, [cb, h('span', { text: CFG.CONSENT + ' *' })]);
    cb.addEventListener('change', function () { state.data.consent = cb.checked; cl.classList.toggle('on', cb.checked); clearError('consent'); });
    cw.appendChild(cl); els.fields.appendChild(cw);
  }

  function setType(t) {
    state.data.type = t; render();
    document.getElementById('enquire').scrollIntoView({ block: 'start' });
  }
  Array.prototype.forEach.call(document.querySelectorAll('.js-type'), function (b) {
    b.addEventListener('click', function () { setType(b.getAttribute('data-type')); });
  });

  document.getElementById('enqForm').addEventListener('submit', function (e) { e.preventDefault(); });
  els.submit.addEventListener('click', function () {
    if (state.sending) return;
    var errors = CFG.validate(state.data);
    if (Object.keys(errors).length) { showErrors(errors); showAlert('Please fix the highlighted fields and try again.'); return; }
    if (!state.submissionId) state.submissionId = uuid();
    state.sending = true; els.submit.disabled = true; els.submit.textContent = 'Sending...'; showAlert('');

    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 30000);
    fetch('/api/enquiry', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: state.data, submissionId: state.submissionId, elapsedMs: Date.now() - state.startedAt, website: els.hp.value }),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { status: r.status, body: j }; }); })
      .then(function (res) {
        clearTimeout(timer); state.sending = false;
        if (res.body && res.body.ok && res.body.reference) { success(res.body.reference); return; }
        els.submit.disabled = false; els.submit.textContent = 'TRY AGAIN';
        if (res.status === 422 && res.body.errors) showErrors(res.body.errors);
        showAlert((res.body && res.body.message) || 'Your enquiry could not be sent. Please try again.');
      })
      .catch(function () {
        clearTimeout(timer); state.sending = false; els.submit.disabled = false; els.submit.textContent = 'TRY AGAIN';
        showAlert('We could not reach the server. Check your internet connection and tap Try Again - your answers are still here.');
      });
  });

  function success(ref) {
    els.panel.hidden = true;
    var s = els.success; s.innerHTML = ''; s.hidden = false;
    s.appendChild(h('div', { class: 'tick', 'aria-hidden': 'true', text: '✓' }));
    s.appendChild(h('h3', { text: 'Your RHODHOMES enquiry has been sent.' }));
    s.appendChild(h('p', { text: 'Thank you for getting in touch. A member of our team will review your enquiry and respond through the contact method you selected.' }));
    s.appendChild(h('div', { class: 'refbox' }, [h('small', { text: 'Enquiry reference' }), h('strong', { text: ref })]));
    s.appendChild(h('p', { class: 'notice', text: 'An enquiry is a request for information only. It does not guarantee availability, pricing or any transaction.' }));
    document.getElementById('enquire').scrollIntoView({ block: 'start' }); s.focus({ preventScroll: true });
  }

  render();
})();
