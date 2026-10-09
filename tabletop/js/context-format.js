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

  // Antecedentes + protocolo + personas a partir de una lista de oraciones sin horas.
  function structuredHtml(list){
    const plain = [];
    const steps = [];
    const groups = [];
    list.forEach(s => {
      const st = parseSteps(s);
      if(st){ steps.push(st); return; }
      const pe = parsePeople(s);
      if(pe){ groups.push(pe); return; }
      plain.push(s);
    });
    if(!steps.length && !groups.length) return {html: plain.length ? paragraphsHtml(plain) : '', structured: false};
    let html = '';
    if(plain.length) html += `<section class="fc-section"><div class="fc-label">Antecedentes</div>${paragraphsHtml(plain)}</section>`;
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
