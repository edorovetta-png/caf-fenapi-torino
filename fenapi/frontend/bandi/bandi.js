/* ENFIP Piemonte — rendering bandi da bandi-data.js */
(function () {
  'use strict';
  var DATA = Array.isArray(window.ENFIP_BANDI) ? window.ENFIP_BANDI : [];
  var MESI = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];

  function fmtDate(iso) {
    if (!iso) return '';
    var p = iso.split('-');
    if (p.length !== 3) return iso;
    return parseInt(p[2], 10) + ' ' + MESI[parseInt(p[1], 10) - 1] + ' ' + p[0];
  }
  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function isOpen(b) {
    if (b.stato === 'chiuso') return false;
    if (b.scadenza && b.scadenza < today()) return false;
    return true;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function byDateDesc(a, b) { return (b.pubblicato || '').localeCompare(a.pubblicato || ''); }

  var ICON_PDF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/></svg>';
  var ICON_EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  var ICON_MAIL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';
  var ICON_IMG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';

  function card(b, open) {
    var meta = '';
    if (b.periodo) meta += '<span>Corso ' + esc(b.periodo) + '</span>';
    else if (b.pubblicato) meta += '<span>Pubblicato il ' + esc(fmtDate(b.pubblicato)) + '</span>';
    if (open && b.scadenza) meta += '<span class="scadenza">Iscrizioni entro il ' + esc(fmtDate(b.scadenza)) + '</span>';
    if (!open) meta += '<span class="chiuso">' + (b.periodo ? 'Corso concluso' : 'Bando chiuso' + (b.scadenza ? ' &mdash; scaduto il ' + esc(fmtDate(b.scadenza)) : '')) + '</span>';
    if (b.sede) meta += '<span>' + esc(b.sede) + '</span>';

    var media;
    if (b.locandina) {
      media = '<a href="' + esc(b.locandina) + '" class="bando-card-media js-lightbox" data-title="' + esc(b.titolo) + '">' +
              '<img src="' + esc(b.locandina) + '" alt="Locandina: ' + esc(b.titolo) + '" loading="lazy"></a>';
    } else if (b.pdf) {
      media = '<a href="' + esc(b.pdf) + '" class="bando-card-media" target="_blank" rel="noopener"><div class="bando-placeholder">' + ICON_PDF + 'Locandina PDF</div></a>';
    } else {
      media = '<div class="bando-card-media"><div class="bando-placeholder">' + ICON_IMG + 'Locandina in arrivo</div></div>';
    }

    var actions = '';
    if (b.locandina) actions += '<a href="' + esc(b.locandina) + '" class="btn-bando js-lightbox" data-title="' + esc(b.titolo) + '">' + ICON_EYE + ' Vedi locandina</a>';
    if (b.pdf) actions += '<a href="' + esc(b.pdf) + '" class="btn-bando' + (b.locandina ? ' btn-bando-secondary' : '') + '" target="_blank" rel="noopener">' + ICON_PDF + ' Scarica PDF</a>';
    if (open) actions += '<a href="mailto:info@enfip.eu?subject=' + encodeURIComponent('Informazioni: ' + b.titolo) + '" class="btn-bando btn-bando-secondary">' + ICON_MAIL + ' Chiedi info / iscriviti</a>';

    return '<article class="bando-card" id="' + esc(b.id || '') + '">' + media +
           '<div class="bando-card-body"><div class="bando-card-meta">' + meta + '</div>' +
           '<h3>' + esc(b.titolo) + '</h3>' +
           (b.descrizione ? '<p>' + esc(b.descrizione) + '</p>' : '') +
           '<div class="bando-card-actions">' + actions + '</div></div></article>';
  }

  // ---- Pagina categoria ----------------------------------------------------
  var root = document.getElementById('bandiRoot');
  if (root) {
    var cat = root.getAttribute('data-categoria');
    var items = DATA.filter(function (b) { return b.categoria === cat; }).sort(byDateDesc);
    var aperti = items.filter(isOpen);
    var chiusi = items.filter(function (b) { return !isOpen(b); });

    var openEl = document.getElementById('bandiAperti');
    var closedEl = document.getElementById('bandiChiusi');
    var countEl = document.getElementById('bandiApertiCount');
    var archEl = document.getElementById('bandiArchivio');
    var archCount = document.getElementById('bandiChiusiCount');

    if (aperti.length) {
      openEl.innerHTML = '<div class="bandi-list">' + aperti.map(function (b) { return card(b, true); }).join('') + '</div>';
    } else {
      openEl.innerHTML = '<div class="bandi-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg><div><strong>Nessun bando aperto in questo momento</strong><p>Le nuove edizioni vengono pubblicate qui e sulla pagina Facebook ENFIP Piemonte. Per essere avvisato quando parte un corso scrivi a <a href="mailto:info@enfip.eu">info@enfip.eu</a> o chiama lo <a href="tel:+39011799999">011 799999</a> (int. 1).</p></div></div>';
    }
    if (countEl) countEl.textContent = aperti.length ? '(' + aperti.length + ')' : '';
    if (archEl && closedEl) {
      if (chiusi.length) {
        closedEl.innerHTML = '<div class="bandi-list">' + chiusi.map(function (b) { return card(b, false); }).join('') + '</div>';
      } else {
        closedEl.innerHTML = '<div class="bandi-empty bandi-empty-muted"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><div><strong>Nessun bando concluso</strong><p>Qui compariranno i bandi di questa categoria una volta chiuse le iscrizioni.</p></div></div>';
      }
      if (archCount) archCount.textContent = chiusi.length ? '(' + chiusi.length + ')' : '';
    }
  }

  // ---- Pagina indice: contatori per categoria ------------------------------
  document.querySelectorAll('[data-count-categoria]').forEach(function (el) {
    var c = el.getAttribute('data-count-categoria');
    var n = DATA.filter(function (b) { return b.categoria === c && isOpen(b); }).length;
    if (n > 0) {
      el.textContent = n + (n === 1 ? ' bando aperto' : ' bandi aperti');
      el.classList.add('has-open');
    } else {
      el.textContent = 'Nessun bando aperto';
    }
  });

  // ---- Lightbox --------------------------------------------------------------
  var lb = document.getElementById('lightbox');
  if (lb) {
    var lbImg = lb.querySelector('img');
    function closeLb() { lb.classList.remove('open'); lbImg.src = ''; document.body.style.overflow = ''; }
    document.addEventListener('click', function (e) {
      var a = e.target.closest('.js-lightbox');
      if (a) {
        e.preventDefault();
        lbImg.src = a.getAttribute('href');
        lbImg.alt = 'Locandina: ' + (a.getAttribute('data-title') || '');
        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
      } else if (e.target === lb || e.target.closest('.lightbox-close')) {
        closeLb();
      }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb.classList.contains('open')) closeLb(); });
  }
})();
