/* Manual do Interno – web app estática.
 * Todo o conteúdo vem de ficheiros em /data (editáveis via Pages CMS). */
(function () {
  'use strict';

  var SVG = {
    cirurgia: '<path d="M3 21l7-7"/><path d="M10 14l-1-1 8-9c1.5-1 3.5-1 3.5-1s0 2-1 3.5l-9 8z"/><path d="M14 8l2 2"/>',
    mgf: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M12 12v5M9.5 14.5h5"/>',
    interna: '<path d="M5 3v6a4 4 0 0 0 8 0V3"/><path d="M9 13v2a5 5 0 0 0 10 0v-2"/><circle cx="19" cy="11" r="2"/>',
    pediatria: '<circle cx="12" cy="12" r="9"/><path d="M8 14.5a5 5 0 0 0 8 0"/><path d="M9 10h.01M15 10h.01"/><path d="M12 3c0 1.5 1 2.2 2.2 2.4"/>',
    rh: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14a5 5 0 0 1 4.5 5"/>',
    trabalho: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M12 9v6M9 12h6"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>'
  };

  var AREAS = [
    { id: 'cirurgia-geral', icon: 'cirurgia' },
    { id: 'mgf', icon: 'mgf' },
    { id: 'medicina-interna', icon: 'interna' },
    { id: 'pediatria', icon: 'pediatria' }
  ];
  var SUPPORT = [
    { id: 'recursos-humanos', icon: 'rh' },
    { id: 'medicina-do-trabalho', icon: 'trabalho' }
  ];

  var app = document.getElementById('app');
  var cache = {};
  var site = {};
  var infoItems = [];

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function icon(name) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' + SVG[name] + '</svg>';
  }

  function safeUrl(u) {
    u = String(u || '').trim();
    if (/^(https?:|mailto:|tel:)/i.test(u)) return u;
    if (/^(javascript|data|vbscript):/i.test(u)) return '#';
    return u; // caminhos relativos (ex.: media/ficheiro.pdf)
  }

  function getJSON(path) {
    if (!cache[path]) {
      cache[path] = fetch(path, { cache: 'no-cache' }).then(function (r) {
        if (!r.ok) throw new Error(path + ' (' + r.status + ')');
        return r.json();
      });
    }
    return cache[path];
  }

  /* ---------- Markdown mínimo e seguro ---------- */
  function inline(t) {
    t = esc(t);
    t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, function (m, alt, url) {
      return '<img src="' + safeUrl(url.replace(/&amp;/g, '&')) + '" alt="' + alt + '" loading="lazy">';
    });
    t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, txt, url) {
      var u = safeUrl(url.replace(/&amp;/g, '&'));
      var ext = /^https?:/i.test(u) ? ' target="_blank" rel="noopener noreferrer"' : '';
      return '<a href="' + u + '"' + ext + '>' + txt + '</a>';
    });
    t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/(^|[^*\w])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
    t = t.replace(/(^|[^_\w])_([^_\n]+)_(?!\w)/g, '$1<em>$2</em>');
    return t;
  }

  /* Se o editor gravar HTML em vez de Markdown, limpa-o com uma lista de permissões. */
  var ALLOWED = { P:1, BR:1, STRONG:1, B:1, EM:1, I:1, U:1, H1:1, H2:1, H3:1, H4:1, UL:1, OL:1, LI:1, A:1, BLOCKQUOTE:1, CODE:1, PRE:1, HR:1, IMG:1, TABLE:1, THEAD:1, TBODY:1, TR:1, TH:1, TD:1 };
  function cleanNode(n) {
    if (n.nodeType === 3) return esc(n.nodeValue);
    if (n.nodeType !== 1) return '';
    var tag = n.tagName, kids = Array.prototype.map.call(n.childNodes, cleanNode).join('');
    if (!ALLOWED[tag]) return kids;
    var t = tag.toLowerCase();
    if (t === 'h1') t = 'h2';
    if (t === 'br' || t === 'hr') return '<' + t + '>';
    if (t === 'img') return '<img src="' + esc(safeUrl(n.getAttribute('src'))) + '" alt="' + esc(n.getAttribute('alt')) + '" loading="lazy">';
    if (t === 'a') {
      var u = safeUrl(n.getAttribute('href')), ext = /^https?:/i.test(u) ? ' target="_blank" rel="noopener noreferrer"' : '';
      return '<a href="' + esc(u) + '"' + ext + '>' + kids + '</a>';
    }
    return '<' + t + '>' + kids + '</' + t + '>';
  }
  function sanitizeHtml(html) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    return Array.prototype.map.call(doc.body.childNodes, cleanNode).join('');
  }

  function markdown(src) {
    if (/^\s*<(p|h[1-6]|ul|ol|blockquote|div|table)[\s>]/i.test(String(src || ''))) return sanitizeHtml(src);
    var lines = String(src || '').replace(/\r\n?/g, '\n').split('\n');
    var out = [], i = 0, m;

    function isBlockStart(l) {
      return /^\s*(#{1,6}\s|[-*+]\s|\d+[.)]\s|>|(-{3,}|\*{3,})\s*$)/.test(l);
    }

    while (i < lines.length) {
      var line = lines[i];
      if (/^\s*$/.test(line)) { i++; continue; }

      if ((m = line.match(/^(#{1,6})\s+(.*)$/))) {
        var lvl = Math.min(m[1].length + 1, 4); // # -> h2 (h1 está reservado ao título da página)
        out.push('<h' + lvl + '>' + inline(m[2]) + '</h' + lvl + '>'); i++; continue;
      }
      if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) { out.push('<hr>'); i++; continue; }

      if (/^\s*>/.test(line)) {
        var q = [];
        while (i < lines.length && /^\s*>/.test(lines[i])) { q.push(lines[i].replace(/^\s*>\s?/, '')); i++; }
        out.push('<blockquote>' + markdown(q.join('\n')) + '</blockquote>'); continue;
      }
      if (/^\s*[-*+]\s+/.test(line)) {
        var ul = [];
        while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) { ul.push('<li>' + inline(lines[i].replace(/^\s*[-*+]\s+/, '')) + '</li>'); i++; }
        out.push('<ul>' + ul.join('') + '</ul>'); continue;
      }
      if (/^\s*\d+[.)]\s+/.test(line)) {
        var ol = [];
        while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) { ol.push('<li>' + inline(lines[i].replace(/^\s*\d+[.)]\s+/, '')) + '</li>'); i++; }
        out.push('<ol>' + ol.join('') + '</ol>'); continue;
      }
      var p = [];
      while (i < lines.length && !/^\s*$/.test(lines[i]) && (p.length === 0 || !isBlockStart(lines[i]))) { p.push(inline(lines[i].replace(/\s{2,}$/, ''))); i++; }
      out.push('<p>' + p.join('<br>') + '</p>');
    }
    return out.join('\n');
  }

  /* ---------- Layout comum ---------- */
  function renderChrome() {
    document.getElementById('brand-name').textContent = site.nome || 'Manual do Interno';
    document.getElementById('brand-sub').textContent = site.subtitulo || '';
    document.getElementById('footer-text').textContent = site.rodape || '';
    document.title = site.nome || 'Manual do Interno';

    var list = document.getElementById('menu-list');
    list.innerHTML = infoItems.map(function (it) {
      return '<li><a href="#/info/' + esc(it.slug) + '">' + esc(it.titulo) + '</a></li>';
    }).join('');
    if (!infoItems.length) list.innerHTML = '<li><a href="#/">Sem conteúdos</a></li>';
  }

  function slugify(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  /* ---------- Páginas ---------- */
  function homePage() {
    var all = AREAS.concat(SUPPORT);
    return Promise.all(all.map(function (a) {
      return getJSON('data/' + a.id + '.json').catch(function () { return { titulo: a.id }; });
    })).then(function (data) {
      var byId = {};
      all.forEach(function (a, k) { byId[a.id] = data[k]; });

      var big = AREAS.map(function (a) {
        var d = byId[a.id];
        return '<a class="area-card" href="#/area/' + a.id + '">' +
          '<span class="area-card__icon">' + icon(a.icon) + '</span>' +
          '<span><h2>' + esc(d.titulo) + '</h2>' + (d.resumo ? '<p>' + esc(d.resumo) + '</p>' : '') + '</span>' +
          '<span class="area-card__go">Abrir →</span></a>';
      }).join('');

      var small = SUPPORT.map(function (a) {
        var d = byId[a.id];
        return '<a class="mini-card" href="#/area/' + a.id + '">' +
          '<span class="mini-card__icon">' + icon(a.icon) + '</span>' +
          '<span><h2>' + esc(d.titulo) + '</h2>' + (d.resumo ? '<p>' + esc(d.resumo) + '</p>' : '') + '</span></a>';
      }).join('');

      app.innerHTML =
        '<section class="hero"><div class="hero__inner">' +
          '<span class="eyebrow">' + esc(site.etiqueta || 'Bem-vindo') + '</span>' +
          '<h1>' + esc(site.titulo || site.nome) + '</h1>' +
          (site.boasvindas ? '<p>' + esc(site.boasvindas) + '</p>' : '') +
        '</div></section>' +
        '<div class="wrap">' +
          '<section class="areas" aria-label="Áreas clínicas"><div class="areas__grid">' + big + '</div></section>' +
          '<section class="support" aria-label="Serviços de apoio"><h3>Serviços de apoio</h3><div class="support__grid">' + small + '</div></section>' +
        '</div>';
    });
  }

  function linksHtml(links) {
    var items = (links || []).map(function (l) {
      var url = l.url || l.ficheiro;
      if (!url) return '';
      var isFile = !l.url && l.ficheiro;
      var ext = /^https?:/i.test(url) ? ' target="_blank" rel="noopener noreferrer"' : '';
      return '<li><a href="' + esc(safeUrl(url)) + '"' + ext + (isFile ? ' download' : '') + '>' +
        icon(isFile ? 'file' : 'link') + esc(l.texto || url) + '</a></li>';
    }).filter(Boolean);
    return items.length ? '<section class="panel"><h2>Ligações e documentos</h2><ul class="links">' + items.join('') + '</ul></section>' : '';
  }

  function contentPage(d, opts) {
    var sections = (d.seccoes || []).map(function (s) {
      return '<section class="panel">' +
        (s.titulo ? '<h2>' + esc(s.titulo) + '</h2>' : '') +
        (s.imagem ? '<img class="cover" src="' + esc(safeUrl(s.imagem)) + '" alt="" loading="lazy">' : '') +
        '<div class="prose">' + markdown(s.conteudo) + '</div></section>';
    }).join('');
    var body = d.conteudo ? '<section class="panel"><div class="prose">' + markdown(d.conteudo) + '</div></section>' : '';

    app.innerHTML =
      '<section class="hero hero--page"><div class="hero__inner">' +
        '<nav class="crumbs" aria-label="Navegação"><a href="#/">← Página inicial</a></nav>' +
        '<span class="eyebrow">' + esc(opts.eyebrow) + '</span>' +
        '<h1>' + esc(d.titulo) + '</h1>' +
        (d.resumo ? '<p>' + esc(d.resumo) + '</p>' : '') +
      '</div></section>' +
      '<div class="wrap"><div class="page">' + body + sections + linksHtml(d.ligacoes) +
        (!body && !sections && !(d.ligacoes || []).length ? '<p class="notice">Ainda não há conteúdo nesta página.</p>' : '') +
      '</div></div>';
  }

  function areaPage(id) {
    var all = AREAS.concat(SUPPORT);
    if (!all.some(function (a) { return a.id === id; })) return notFound();
    return getJSON('data/' + id + '.json').then(function (d) {
      var support = SUPPORT.some(function (a) { return a.id === id; });
      contentPage(d, { eyebrow: support ? 'Serviços de apoio' : 'Área clínica' });
      document.title = d.titulo + ' · ' + (site.nome || '');
    });
  }

  function infoPage(slug) {
    var item = infoItems.filter(function (i) { return i.slug === slug; })[0] || (!slug ? infoItems[0] : null);
    if (!item) return notFound();
    contentPage({ titulo: item.titulo, resumo: item.resumo, conteudo: item.conteudo, ligacoes: item.ligacoes }, { eyebrow: 'Informações Gerais' });
    document.title = item.titulo + ' · ' + (site.nome || '');
    return Promise.resolve();
  }

  function notFound() {
    app.innerHTML = '<div class="wrap"><div class="error">Página não encontrada. <a href="#/">Voltar ao início</a></div></div>';
    return Promise.resolve();
  }

  /* ---------- Router ---------- */
  function closeMenu() {
    var b = document.getElementById('menu-btn');
    b.setAttribute('aria-expanded', 'false');
    document.getElementById('menu-list').hidden = true;
  }

  function route() {
    closeMenu();
    var h = (location.hash || '#/').replace(/^#\/?/, '').split('/');
    var p;
    if (h[0] === 'area' && h[1]) p = areaPage(h[1]);
    else if (h[0] === 'info') p = infoPage(h[1]);
    else { p = homePage(); document.title = site.nome || 'Manual do Interno'; }
    p.catch(function (e) {
      app.innerHTML = '<div class="wrap"><div class="error">Não foi possível carregar o conteúdo. ' + esc(e.message) + '</div></div>';
    }).then(function () { window.scrollTo(0, 0); });
  }

  function init() {
    var btn = document.getElementById('menu-btn');
    var list = document.getElementById('menu-list');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      list.hidden = open;
    });
    document.addEventListener('click', function (e) { if (!list.contains(e.target)) closeMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeMenu(); btn.focus(); } });
    window.addEventListener('hashchange', route);

    Promise.all([
      getJSON('data/site.json').catch(function () { return {}; }),
      getJSON('data/informacoes-gerais.json').catch(function () { return { itens: [] }; })
    ]).then(function (r) {
      site = r[0] || {};
      infoItems = ((r[1] && r[1].itens) || []).map(function (it) {
        it.slug = it.slug || slugify(it.titulo);
        return it;
      });
      renderChrome();
      route();
    });
  }

  init();
})();
