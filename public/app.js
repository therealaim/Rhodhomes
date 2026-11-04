(function () {
  'use strict';

  var CFG = window.RH_CONFIG;
  var sections = CFG.sections;
  var REVIEW = sections.length;            // index of the review step
  var TOTAL = sections.length + 1;
  var DRAFT_KEY = 'rhodhomes_draft_v1';

  var els = {
    root: document.getElementById('appRoot'),
    success: document.getElementById('successRoot'),
    body: document.getElementById('stepBody'),
    back: document.getElementById('backBtn'),
    next: document.getElementById('nextBtn'),
    alert: document.getElementById('formAlert'),
    label: document.getElementById('stepLabel'),
    count: document.getElementById('stepCount'),
    bar: document.getElementById('bar'),
    fill: document.getElementById('barFill'),
    hp: document.getElementById('website')
  };

  var state = { step: 0, data: { consents: {} }, submissionId: '', startedAt: Date.now(), sending: false };

  /* ---------- helpers ---------- */
  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === false || v == null) return;
      if (k === 'text') el.textContent = v;
      else if (k === 'class') el.className = v;
      else el.setAttribute(k, v === true ? '' : v);
    });
    (kids || []).forEach(function (c) { if (c) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return el;
  }
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    var a = new Uint8Array(16); (window.crypto || window.msCrypto).getRandomValues(a);
    return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }
  function saveDraft() {
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ data: state.data, step: state.step, submissionId: state.submissionId, startedAt: state.startedAt })); } catch (e) {}
  }
  function loadDraft() {
    try {
      var d = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || 'null');
      if (d && d.data) { state.data = d.data; if (!state.data.consents) state.data.consents = {}; state.step = Math.min(d.step || 0, REVIEW); state.submissionId = d.submissionId || ''; state.startedAt = d.startedAt || Date.now(); }
    } catch (e) {}
  }
  function clearDraft() { try { sessionStorage.removeItem(DRAFT_KEY); } catch (e) {} }
  function showAlert(msg) { els.alert.textContent = msg || ''; els.alert.hidden = !msg; }
  function scrollToTop() { document.getElementById('apply').scrollIntoView({ block: 'start' }); }

  /* ---------- error display ---------- */
  function clearError(name) {
    var w = els.body.querySelector('[data-field="' + name + '"]');
    if (!w) return;
    w.classList.remove('invalid');
    var e = w.querySelector('.err'); if (e) e.remove();
  }
  function showErrors(errors) {
    var first = null;
    Object.keys(errors).forEach(function (name) {
      var w = els.body.querySelector('[data-field="' + name + '"]');
      if (!w) return;
      w.classList.add('invalid');
      var old = w.querySelector('.err'); if (old) old.remove();
      w.appendChild(h('p', { class: 'err', text: errors[name], role: 'alert' }));
      if (!first) first = w;
    });
    if (first) {
      first.scrollIntoView({ block: 'center', behavior: 'smooth' });
      var inp = first.querySelector('input, select, textarea'); if (inp) inp.focus({ preventScroll: true });
    }
    return !!first;
  }

  /* ---------- field renderers ---------- */
  function labelEl(f, forId) {
    var l = h('label', { class: 'lbl', for: forId });
    l.appendChild(document.createTextNode(f.label + ' '));
    l.appendChild(f.required ? h('span', { class: 'req', text: '*', 'aria-label': 'required' }) : h('span', { class: 'opt', text: '(optional)' }));
    return l;
  }
  function renderField(f) {
    var id = 'f_' + f.name;
    var wrap = h('div', { class: 'field', 'data-field': f.name });
    var v = state.data[f.name];

    if (f.type === 'text' || f.type === 'email' || f.type === 'tel') {
      wrap.appendChild(labelEl(f, id));
      var inp = h('input', { type: f.type, id: id, name: f.name, value: v || '', maxlength: f.max, autocomplete: f.autocomplete || 'off', inputmode: f.type === 'tel' ? 'tel' : (f.type === 'email' ? 'email' : null), 'aria-required': f.required ? 'true' : null });
      inp.addEventListener('input', function () { state.data[f.name] = inp.value; clearError(f.name); saveDraft(); });
      wrap.appendChild(inp);
    } else if (f.type === 'textarea') {
      wrap.appendChild(labelEl(f, id));
      var ta = h('textarea', { id: id, name: f.name, maxlength: f.max, 'aria-required': f.required ? 'true' : null });
      ta.value = v || '';
      ta.addEventListener('input', function () { state.data[f.name] = ta.value; clearError(f.name); saveDraft(); });
      wrap.appendChild(ta);
    } else if (f.type === 'select') {
      wrap.appendChild(labelEl(f, id));
      var sel = h('select', { id: id, name: f.name, 'aria-required': f.required ? 'true' : null });
      sel.appendChild(h('option', { value: '', text: 'Select...' }));
      f.options.forEach(function (o) { var op = h('option', { value: CFG.optVal(o), text: CFG.optVal(o) }); if (v === CFG.optVal(o)) op.selected = true; sel.appendChild(op); });
      sel.addEventListener('change', function () { state.data[f.name] = sel.value; clearError(f.name); saveDraft(); });
      wrap.appendChild(sel);
    } else if (f.type === 'radio') {
      var lg = h('div', { class: 'lbl' }); lg.appendChild(document.createTextNode(f.label + ' '));
      lg.appendChild(f.required ? h('span', { class: 'req', text: '*' }) : h('span', { class: 'opt', text: '(optional)' }));
      wrap.appendChild(lg);
      var rg = h('div', { class: 'radios', role: 'radiogroup' });
      f.options.forEach(function (o) {
        var rid = id + '_' + o.replace(/\W/g, '');
        var inp2 = h('input', { type: 'radio', name: f.name, id: rid, value: o });
        inp2.checked = (v === o);
        var lab = h('label', { class: 'choice' + (v === o ? ' on' : ''), for: rid }, [inp2, h('span', { text: o })]);
        inp2.addEventListener('change', function () {
          state.data[f.name] = o; clearError(f.name); saveDraft();
          Array.prototype.forEach.call(rg.children, function (c) { c.classList.remove('on'); });
          lab.classList.add('on');
        });
        rg.appendChild(lab);
      });
      wrap.appendChild(rg);
    } else if (f.type === 'checkgroup') {
      var lg2 = h('div', { class: 'lbl' }); lg2.appendChild(document.createTextNode(f.label + ' '));
      lg2.appendChild(f.required ? h('span', { class: 'req', text: '*' }) : h('span', { class: 'opt', text: '(optional)' }));
      wrap.appendChild(lg2);
      if (f.help) wrap.appendChild(h('p', { class: 'help', text: f.help }));
      var group = h('div', { class: 'choices' + (f.options.length > 6 ? ' cols' : '') });
      wrap.appendChild(group);
      buildCheckgroup(f, group);
    }
    if (f.help && f.type !== 'checkgroup') wrap.appendChild(h('p', { class: 'help', text: f.help }));
    return wrap;
  }

  function buildCheckgroup(f, group) {
    group.innerHTML = '';
    var selected = Array.isArray(state.data[f.name]) ? state.data[f.name] : [];
    var detKey = f.name + 'Details';
    if (!state.data[detKey]) state.data[detKey] = {};
    f.options.forEach(function (o) {
      var val = o.value, on = selected.indexOf(val) !== -1;
      var cid = 'c_' + f.name + '_' + val.replace(/\W/g, '');
      var cb = h('input', { type: 'checkbox', id: cid, value: val });
      cb.checked = on;
      var lab = h('label', { class: 'choice' + (on ? ' on' : ''), for: cid }, [cb, h('span', { text: val })]);
      cb.addEventListener('change', function () {
        var cur = Array.isArray(state.data[f.name]) ? state.data[f.name].slice() : [];
        var i = cur.indexOf(val);
        if (cb.checked && i === -1) cur.push(val);
        if (!cb.checked && i !== -1) cur.splice(i, 1);
        state.data[f.name] = cur;
        clearError(f.name); saveDraft();
        buildCheckgroup(f, group);
        var again = document.getElementById(cid); if (again) again.focus();
      });
      group.appendChild(lab);
      if (on && o.detailLabel) {
        var did = 'd_' + f.name + '_' + val.replace(/\W/g, '');
        var di = h('input', { type: 'text', id: did, maxlength: 300, placeholder: o.detailPlaceholder || '', autocomplete: 'off', value: state.data[detKey][val] || '' });
        di.addEventListener('input', function () { state.data[detKey][val] = di.value; clearError(f.name); saveDraft(); });
        group.appendChild(h('div', { class: 'detail' }, [h('label', { for: did, text: o.detailLabel + ' *' }), di]));
      }
    });
  }

  /* ---------- review ---------- */
  function formatValue(f) {
    if (f.type === 'checkgroup') {
      var sel = state.data[f.name] || [], det = state.data[f.name + 'Details'] || {};
      if (!sel.length) return h('span', { text: '-' });
      var ul = h('ul');
      sel.forEach(function (v) { ul.appendChild(h('li', { text: det[v] ? v + ': ' + det[v] : v })); });
      return ul;
    }
    return h('span', { text: (state.data[f.name] || '').trim() || '-' });
  }
  function renderReview() {
    var frag = document.createDocumentFragment();
    frag.appendChild(h('h2', { class: 'step-title', tabindex: '-1', id: 'stepTitle', text: 'Review and Declaration' }));
    frag.appendChild(h('p', { class: 'step-intro', text: 'Please check your answers. Use Edit to change anything - your information is kept.' }));
    sections.forEach(function (s, i) {
      var btn = h('button', { type: 'button', class: 'rev-edit', text: 'Edit', 'aria-label': 'Edit ' + s.title });
      btn.addEventListener('click', function () { goTo(i); });
      var dl = h('dl', { class: 'rev-list' });
      s.fields.forEach(function (f) { dl.appendChild(h('dt', { text: f.label })); dl.appendChild(h('dd', null, [formatValue(f)])); });
      frag.appendChild(h('section', { class: 'rev-sec' }, [h('div', { class: 'rev-head' }, [h('h3', { text: (i + 1) + '. ' + s.title }), btn]), dl]));
    });

    var box = h('div', { class: 'consents' });
    box.appendChild(h('p', { class: 'lbl', text: 'Declaration' }));
    CFG.consents.forEach(function (c) {
      var wrap = h('div', { class: 'field', 'data-field': c.name });
      var cid = 'k_' + c.name;
      var cb = h('input', { type: 'checkbox', id: cid }); cb.checked = state.data.consents[c.name] === true;
      var lab = h('label', { class: 'choice' + (cb.checked ? ' on' : ''), for: cid }, [cb, h('span', { text: c.label + ' *' })]);
      cb.addEventListener('change', function () { state.data.consents[c.name] = cb.checked; lab.classList.toggle('on', cb.checked); clearError(c.name); saveDraft(); });
      wrap.appendChild(lab); box.appendChild(wrap);
    });
    frag.appendChild(box);
    frag.appendChild(h('p', { class: 'notice', text: 'Submitting an application does not guarantee acceptance, referrals, compensation or earnings. All applications are subject to review. Any partner compensation, if offered, will be governed by the applicable written partner agreement and its conditions.' }));
    return frag;
  }

  /* ---------- step rendering & navigation ---------- */
  function render(pendingErrors) {
    els.body.innerHTML = '';
    showAlert('');
    var pct = Math.round((state.step / (TOTAL - 1)) * 100);
    els.fill.style.width = (state.step === 0 ? 6 : pct) + '%';
    els.bar.setAttribute('aria-valuenow', String(pct));
    els.count.textContent = 'Step ' + (state.step + 1) + ' of ' + TOTAL;
    els.back.hidden = state.step === 0;
    els.back.style.visibility = state.step === 0 ? 'hidden' : 'visible';

    if (state.step === REVIEW) {
      els.label.textContent = 'Review and Declaration';
      els.body.appendChild(renderReview());
      els.next.textContent = 'SUBMIT APPLICATION';
    } else {
      var s = sections[state.step];
      els.label.textContent = s.title;
      els.body.appendChild(h('h2', { class: 'step-title', tabindex: '-1', id: 'stepTitle', text: (state.step + 1) + '. ' + s.title }));
      els.body.appendChild(h('p', { class: 'step-intro', text: s.intro }));
      s.fields.forEach(function (f) { els.body.appendChild(renderField(f)); });
      els.next.textContent = 'Next';
    }
    els.next.disabled = false;
    saveDraft();
    if (pendingErrors) showErrors(pendingErrors);
  }
  function goTo(i, errors) {
    state.step = i; render(errors);
    if (!errors) { scrollToTop(); var t = document.getElementById('stepTitle'); if (t) t.focus({ preventScroll: true }); }
  }

  function collectErrors() {
    for (var i = 0; i < sections.length; i++) {
      var e = CFG.validateSection(sections[i], state.data);
      if (Object.keys(e).length) return { step: i, errors: e };
    }
    var c = CFG.validateConsents(state.data);
    if (Object.keys(c).length) return { step: REVIEW, errors: c };
    return null;
  }

  els.back.addEventListener('click', function () { if (state.step > 0 && !state.sending) goTo(state.step - 1); });
  els.next.addEventListener('click', function () {
    if (state.sending) return;
    if (state.step < REVIEW) {
      var errs = CFG.validateSection(sections[state.step], state.data);
      if (Object.keys(errs).length) { showErrors(errs); showAlert('Please fix the highlighted fields to continue.'); return; }
      goTo(state.step + 1);
    } else { submit(); }
  });
  document.getElementById('form').addEventListener('submit', function (e) { e.preventDefault(); });
  document.getElementById('form').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox' && e.target.type !== 'radio') { e.preventDefault(); els.next.click(); }
  });

  /* ---------- submission ---------- */
  function submit() {
    var problem = collectErrors();
    if (problem) {
      if (problem.step === state.step) { showErrors(problem.errors); showAlert('Please complete the highlighted items.'); }
      else { goTo(problem.step, problem.errors); showAlert('Please fix the highlighted fields, then return to the review step.'); }
      return;
    }
    if (!state.submissionId) { state.submissionId = uuid(); saveDraft(); }
    state.sending = true; els.next.disabled = true; els.back.disabled = true;
    els.next.textContent = 'Submitting...'; showAlert('');

    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 30000);

    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: state.data, submissionId: state.submissionId, elapsedMs: Date.now() - state.startedAt, website: els.hp.value }),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { return { status: r.status, body: j }; });
    }).then(function (res) {
      clearTimeout(timer);
      if (res.body && res.body.ok && res.body.reference) { showSuccess(res.body.reference); return; }
      state.sending = false; els.back.disabled = false;
      if (res.status === 422 && res.body.errors) {
        var names = Object.keys(res.body.errors);
        for (var i = 0; i < sections.length; i++) {
          var hit = sections[i].fields.some(function (f) { return names.indexOf(f.name) !== -1; });
          if (hit) { goTo(i, res.body.errors); showAlert(res.body.message); return; }
        }
      }
      state.step = REVIEW; render();
      showAlert((res.body && res.body.message) || 'Your application could not be submitted. Please try again.');
      els.next.textContent = 'TRY AGAIN';
    }).catch(function () {
      clearTimeout(timer);
      state.sending = false; els.back.disabled = false; els.next.disabled = false;
      els.next.textContent = 'TRY AGAIN';
      showAlert('We could not reach the server. Check your internet connection and tap Try Again - your answers are saved on this page.');
    });
  }

  function showSuccess(ref) {
    clearDraft();
    els.root.hidden = true;
    var s = els.success; s.innerHTML = ''; s.hidden = false;
    s.appendChild(h('div', { class: 'tick', 'aria-hidden': 'true', text: '✓' }));
    s.appendChild(h('h3', { text: 'Your RHODHOMES partner application has been successfully submitted.' }));
    s.appendChild(h('p', { text: 'Thank you for your interest in joining the RHODHOMES Rental Referral Partner Network. Your application will be reviewed, and further communication will follow through your selected contact channel.' }));
    s.appendChild(h('div', { class: 'refbox' }, [h('small', { text: 'Application reference' }), h('strong', { text: ref })]));
    s.appendChild(h('p', { class: 'help', text: 'Please keep this reference for your records.' }));
    s.appendChild(h('p', { class: 'notice', text: 'Submitting an application does not guarantee acceptance, referrals, compensation or earnings. All applications are subject to review. Any partner compensation, if offered, will be governed by the applicable written partner agreement and its conditions.' }));
    scrollToTop(); s.focus({ preventScroll: true });
  }

  /* ---------- start ---------- */
  loadDraft();
  render();
})();
