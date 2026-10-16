// Da forma al "Contexto para facilitadores" (un párrafo largo en el Word) para que se lea bien
// en la ventana "Contexto": separa las oraciones y arma bloques.
//   - ANTECEDENTES: las oraciones que no calzan en ningún bloque de abajo, en párrafos cortos.
//   - PROTOCOLO: una oración que anuncia una lista ("…debe hacer tres cosas: a, b y c") se
//     muestra como pasos numerados.
//   - QUIÉNES PARTICIPAN: una oración "…participan: Nombre, Cargo, que…; Nombre (Cargo), que…"
//     se muestra como tarjetas de persona. Lo que va tras " — " en una persona es una nota
//     (ej. "en este ejercicio está de vacaciones") y se destaca aparte.
//   - CRONOLOGÍA: cada oración que empieza con una hora ("A las 14:10, …") es un hito; las
//     oraciones sin hora que vienen entre hitos (o justo después, antes de "Otros datos:") se
//     suman al hito anterior.
//   - DATOS CLAVE: lo que va después de "Otros datos:" / "Además:", en viñetas.
//   - ESCALAMIENTO: "…el SOC escala al TeamLeader y el TeamLeader pide las autorizaciones a
//     Empresa Eléctrica Ventanas" se muestra como cadena con flechas (SOC → TeamLeader → …).
//   - SE MENCIONAN, NO JUEGAN: "El Jefe … (nota) y el Área Legal solo se mencionan; no juegan"
//     se muestra como tarjetas, una por cargo, con la nota entre paréntesis.
//   - FICHAS: cada oración "Etiqueta: valor" (etiqueta corta, ej. "Plazos:", "Fuera de
//     alcance:", "Duración objetivo:") es una ficha. Si el valor es una enumeración, va en
//     renglones o etiquetas; si es corto ("50 minutos"), en grande; los tiempos se destacan.
// Si no se reconoce ninguna estructura, queda en párrafos cortos (2–3 oraciones). Función pura
// (sin DOM): devuelve HTML con todo el texto escapado. Script clásico: window.formatFacilitatorContext.
window.formatFacilitatorContext = (function(){
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  const trimEnd = s => String(s).trim().replace(/[.;,]\s*$/, '');
  // "A las 14:10, el SOC…" / "Desde las 9.30 …" / "14:10 – el SOC…"
  const TIME_START = /^(?:(?:a|desde|hacia|cerca de)\s+las\s+)?(\d{1,2}[:.]\d{2})(?:\s*(?:h|hrs?\.?))?\s*[,:–—-]?\s*/i;
  // Marcador que abre los datos clave; puede venir al inicio de una oración.
  const KEYS_MARK = /^(?:otros datos|datos adicionales|además|ademas|consideraciones)\s*:\s*/i;
  // "…participan: …" / "…intervienen: …" / "Los involucrados son: …"
  const PEOPLE_MARK = /^(.*?\b(?:participan|intervienen|involucrados(?: son)?|personajes(?: son)?))\s*:\s*(.+)$/i;
  // "…debe hacer tres cosas: …" / "…los pasos son: …"
  const STEPS_MARK = /^(.*?\b(?:dos|tres|cuatro|cinco|seis|\d+)\s+(?:cosas|pasos|acciones|reglas)\b[^:]*|.*?\b(?:pasos|acciones) (?:son|a seguir)\b[^:]*)\s*:\s*(.+)$/i;
  const NUM_WORD = {dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6};

  // Separa en oraciones: punto/cierre seguido de espacio y mayúscula, número o signo inicial.
  function sentences(text){
    return String(text || '').replace(/\s+/g, ' ').trim()
      .split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ¿¡0-9"“(])/)
      .map(s => s.trim()).filter(Boolean);
  }

  function paragraphsHtml(list){
    // 2–3 oraciones por párrafo; nunca deja una sola oración suelta al final si puede evitarlo.
    const out = [];
    for(let i = 0; i < list.length;){
      const take = list.length - i === 4 ? 2 : Math.min(3, list.length - i);
      out.push(list.slice(i, i + take).join(' '));
      i += take;
    }
    return out.map(p => `<p>${esc(p)}</p>`).join('');
  }

  // "a, b y c" → [a, b, c]. Solo se acepta si salen los pasos que anuncia la oración (si dice
  // "tres cosas", tienen que ser 3); si no, la oración queda como texto normal.
  function parseSteps(sentence){
    const m = sentence.match(STEPS_MARK);
    if(!m) return null;
    const items = trimEnd(m[2]).split(/,\s+(?:y\s+)?|\s+y\s+(?=[a-záéíóúñ]+(?:ar|er|ir)\b)/i)
      .map(s => trimEnd(s)).filter(Boolean);
    const n = (m[1].match(/\b(dos|tres|cuatro|cinco|seis|\d+)\s+(?:cosas|pasos|acciones|reglas)\b/i) || [])[1];
    const expected = n ? (NUM_WORD[n.toLowerCase()] || parseInt(n, 10)) : null;
    if(items.length < 2 || (expected && items.length !== expected)) return null;
    return {lead: cap(trimEnd(m[1])), items: items.map(cap)};
  }

  // "Danilo Contreras, Operador de Sala de Control, que recibe…" /
  // "Carlos Guevara (Ingeniero Proyectos y Soporte TI), que es…"
  function parsePerson(raw){
    let s = trimEnd(raw).replace(/^y\s+/i, '');
    let note = '';
    const dash = s.split(/\s+[—–]\s+/);
    if(dash.length > 1){ s = dash[0]; note = dash.slice(1).join(' — '); }
    let name, role = '', desc = '';
    const paren = s.match(/^([^,(]+?)\s*\(([^)]+)\)\s*,?\s*(.*)$/);
    if(paren){ name = paren[1]; role = paren[2]; desc = paren[3]; }
    else {
      const parts = s.split(/,\s*/);
      name = parts.shift();
      // El cargo es lo que viene antes de la frase que describe ("que…", "quien…").
      if(parts.length && !/^(?:que|quien|quienes|el|la|encargad[oa] de)\b/i.test(parts[0])) role = parts.shift();
      desc = parts.join(', ');
    }
    if(!name || name.split(/\s+/).length > 5) return null; // no parece un nombre
    desc = desc.trim().replace(/^(?:que|quien)\s+/i, ''); // "que recibe…" → "Recibe…"
    return {name: name.trim(), role: role.trim(), desc: cap(desc), note: cap(trimEnd(note))};
  }
  function parsePeople(sentence){
    const m = sentence.match(PEOPLE_MARK);
    if(!m) return null;
    const people = m[2].split(/;\s*/).map(parsePerson);
    if(people.length < 2 || people.some(p => !p)) return null;
    // "Por parte de Empresa Eléctrica Ventanas participan" → "Empresa Eléctrica Ventanas"
    const org = (m[1].match(/por parte de\s+(.+?)\s+(?:participan|intervienen)\b/i) || [])[1] || '';
    return {org, people};
  }

  const initials = name => name.split(/\s+/).filter(w => /^[A-ZÁÉÍÓÚÑ]/.test(w)).slice(0, 2).map(w => w[0]).join('');
  const words = s => String(s).trim().split(/\s+/).filter(Boolean).length;
  const stripArticle = s => String(s).trim().replace(/^(?:el|la|los|las)\s+/i, '');

  // Corta por ", " y " y " solo fuera de paréntesis: "a (x, y), b y c" → [a (x, y), b, c].
  function splitTop(str){
    const out = [];
    let depth = 0, cur = '';
    const s = String(str);
    for(let i = 0; i < s.length; i++){
      const c = s[i];
      if(c === '(') depth++;
      else if(c === ')') depth = Math.max(0, depth - 1);
      if(depth === 0 && c === ',' && s[i + 1] === ' '){ out.push(cur); cur = ''; i++; continue; }
      if(depth === 0 && s.slice(i, i + 3) === ' y ' ){ out.push(cur); cur = ''; i += 2; continue; }
      cur += c;
    }
    out.push(cur);
    return out.map(x => x.trim()).filter(Boolean);
  }

  // "Etiqueta: valor" con etiqueta corta (hasta 4 palabras, sin verbo de lista ni personas).
  const FACT_MARK = /^([A-ZÁÉÍÓÚÑ][^:;]{1,40}?)\s*:\s+(.+)$/;
  // Cola aclaratoria de una enumeración: ", contados desde…", ", salvo…".
  const QUALIFIER = /^(?:contad[oa]s?|medid[oa]s?|desde|a partir|seg[uú]n|salvo|excepto|siempre que|en ambos casos)\b/i;
  // Tiempos y duraciones que conviene destacar: "1 hora", "72 h", "50 minutos", "03:10".
  const DURATION = /(\b\d+(?:[.,]\d+)?\s*(?:h|hrs?|horas?|min|minutos?|d[ií]as?(?:\s+(?:h[aá]biles|corridos))?|semanas?)\b|\b\d{1,2}:\d{2}\b)/gi;
  const emph = s => esc(s).replace(DURATION, '<strong>$1</strong>');

  function parseFact(sentence){
    const m = trimEnd(sentence).match(FACT_MARK);
    if(!m || words(m[1]) > 4) return null;
    const label = m[1].trim();
    const value = m[2].trim();
    const parts = splitTop(value);
    let note = '';
    if(parts.length > 1 && QUALIFIER.test(parts[parts.length - 1])) note = parts.pop();
    const items = parts.length >= 2 && parts.every(p => words(p) <= 9) ? parts.map(cap) : null;
    return {label, value, items, note: cap(note)};
  }

  // "…el SOC escala al TeamLeader y el TeamLeader pide las autorizaciones a Empresa X".
  function parseChain(sentence){
    const m = trimEnd(sentence).match(/^(?:(?:en|dentro de)\s+[^,]+,\s*)?(?:el|la)\s+(.+?)\s+escala\s+(?:al|a la|a)\s+(.+)$/i);
    if(!m) return null;
    const from = m[1].trim();
    let rest = m[2].trim(), to = rest, then = '', last = '';
    const y = rest.match(/^(.+?)\s+y\s+(?:el|la)\s+(.+)$/i);
    if(y){
      to = y[1].trim();
      // "…y el TeamLeader pide las autorizaciones a Empresa X" → acción "pide las autorizaciones", destino "Empresa X"
      const act = y[2].trim().match(/^(?:\S+\s+){0,3}?(pide|solicita|informa|avisa|escala|deriva|reporta|consulta)\b(.*?)\s+(?:al|a la|a)\s+(.+)$/i);
      if(act){ then = (act[1] + act[2]).trim(); last = act[3].trim(); }
      else return null;
    }
    if(words(from) > 5 || words(to) > 5 || (last && words(last) > 6)) return null;
    const steps = [{name: from}, {name: to, via: 'escala'}];
    if(last) steps.push({name: last, via: then});
    return steps;
  }

  // "El Jefe Departamento Operaciones (autoriza…) y el Área Legal solo se mencionan; no juegan."
  function parseMentioned(sentence){
    const m = trimEnd(sentence).match(/^(.+?)\s+(?:solo\s+)?(?:se mencionan|no juegan|no participan)\b(.*)$/i);
    if(!m) return null;
    const items = splitTop(m[1]).map(raw => {
      const p = stripArticle(raw).match(/^([^()]+?)\s*(?:\(([^)]+)\))?$/);
      return p ? {name: cap(p[1].trim()), note: cap((p[2] || '').trim())} : null;
    });
    if(!items.length || items.some(x => !x || words(x.name) > 6)) return null;
    return items;
  }

  function factHtml(f){
    let body;
    if(f.items && /fuera de alcance|no incluye|excluye|no se juega/i.test(f.label)){
      body = `<div class="fc-chips">${f.items.map(it => `<span class="fc-chip">${esc(cap(stripArticle(it)))}</span>`).join('')}</div>`;
    } else if(f.items){
      body = `<ul class="fc-fact-list">${f.items.map(it => `<li>${emph(it)}</li>`).join('')}</ul>`;
    } else if(words(f.value) <= 3){
      body = `<div class="fc-fact-big">${emph(f.value)}</div>`;
    } else {
      body = `<div class="fc-fact-text">${emph(f.value)}</div>`;
    }
    return `<div class="fc-fact"><div class="fc-fact-label">${esc(f.label)}</div>${body}${f.note ? `<div class="fc-fact-note">${emph(f.note)}</div>` : ''}</div>`;
  }

  // Antecedentes + escalamiento + protocolo + personas + mencionados + fichas, a partir de una
  // lista de oraciones sin horas.
  function structuredHtml(list){
    const plain = [];
    const steps = [];
    const groups = [];
    const chains = [];
    const mentioned = [];
    const facts = [];
    list.forEach(s => {
      const st = parseSteps(s);
      if(st){ steps.push(st); return; }
      const pe = parsePeople(s);
      if(pe){ groups.push(pe); return; }
      const ch = parseChain(s);
      if(ch){ chains.push(ch); return; }
      const me = parseMentioned(s);
      if(me){ mentioned.push(...me); return; }
      const fa = parseFact(s);
      if(fa){ facts.push(fa); return; }
      plain.push(s);
    });
    if(!steps.length && !groups.length && !chains.length && !mentioned.length && !facts.length){
      return {html: plain.length ? paragraphsHtml(plain) : '', structured: false};
    }
    let html = '';
    if(plain.length) html += `<section class="fc-section fc-intro"><div class="fc-label">Antecedentes</div>${paragraphsHtml(plain)}</section>`;
    chains.forEach(ch => {
      html += `<section class="fc-section"><div class="fc-label">Cadena de escalamiento</div><ol class="fc-chain">` +
        ch.map((st, i) => (i ? `<li class="fc-chain-arrow" aria-hidden="true"><span>${esc(st.via || '')}</span>→</li>` : '') +
          `<li class="fc-chain-node">${esc(st.name)}</li>`).join('') + '</ol></section>';
    });
    steps.forEach(st => {
      html += `<section class="fc-section"><div class="fc-label">Protocolo</div><p class="fc-lead">${esc(st.lead)}:</p>` +
        `<ol class="fc-steps">${st.items.map((it, i) => `<li><span class="fc-step-n">${i + 1}</span><span>${esc(it)}</span></li>`).join('')}</ol></section>`;
    });
    groups.forEach(g => {
      html += `<section class="fc-section"><div class="fc-label">Quiénes participan${g.org ? ` · ${esc(g.org)}` : ''}</div><div class="fc-people">` +
        g.people.map(p => `<div class="fc-person">
          <span class="fc-avatar" aria-hidden="true">${esc(initials(p.name))}</span>
          <div class="fc-person-body">
            <div class="fc-person-name">${esc(p.name)}</div>
            ${p.role ? `<div class="fc-person-role">${esc(p.role)}</div>` : ''}
            ${p.desc ? `<div class="fc-person-desc">${esc(p.desc)}</div>` : ''}
            ${p.note ? `<div class="fc-person-note">${esc(p.note)}</div>` : ''}
          </div>
        </div>`).join('') + '</div></section>';
    });
    if(mentioned.length){
      html += `<section class="fc-section"><div class="fc-label">Se mencionan, pero no juegan</div><div class="fc-mentioned">` +
        mentioned.map(m => `<div class="fc-mention"><div class="fc-mention-name">${esc(m.name)}</div>${m.note ? `<div class="fc-mention-note">${esc(m.note)}</div>` : ''}</div>`).join('') +
        '</div></section>';
    }
    if(facts.length){
      html += `<section class="fc-section"><div class="fc-label">Datos clave</div><div class="fc-facts">${facts.map(factHtml).join('')}</div></section>`;
    }
    return {html, structured: true};
  }

  return function formatFacilitatorContext(text){
    const list = sentences(text);
    if(!list.length) return '';
    const firstTime = list.findIndex(s => TIME_START.test(s));
    if(firstTime === -1) return structuredHtml(list).html; // sin horas: bloques o párrafos cortos

    const intro = list.slice(0, firstTime);
    const events = [];
    const keys = [];
    let inKeys = false;
    list.slice(firstTime).forEach(s => {
      if(!inKeys && KEYS_MARK.test(s)){
        inKeys = true;
        const rest = s.replace(KEYS_MARK, '').trim();
        if(rest) keys.push(cap(rest));
        return;
      }
      if(inKeys){ keys.push(s); return; }
      const m = s.match(TIME_START);
      if(m) events.push({time: m[1].replace('.', ':'), text: cap(s.slice(m[0].length).trim())});
      else events[events.length - 1].text += ' ' + s; // sin hora: continúa el hito anterior
    });

    let html = '';
    if(intro.length){
      const head = structuredHtml(intro);
      html += head.structured ? head.html : `<section class="fc-section"><div class="fc-label">Antecedentes</div>${head.html}</section>`;
    }
    html += '<section class="fc-section"><div class="fc-label">Cronología</div><ol class="fc-timeline">' +
      events.map(e => `<li><span class="fc-time">${esc(e.time)}</span><span class="fc-event">${esc(e.text)}</span></li>`).join('') +
      '</ol></section>';
    if(keys.length) html += `<section class="fc-section"><div class="fc-label">Datos clave</div><ul class="fc-keys">${keys.map(k => `<li>${esc(k)}</li>`).join('')}</ul></section>`;
    return html;
  };
})();
