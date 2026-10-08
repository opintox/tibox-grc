// Da forma al "Contexto para facilitadores" (un párrafo largo en el Word) para que se lea bien
// en la ventana "Contexto": separa las oraciones y arma hasta tres bloques.
//   - ANTECEDENTES: lo que va antes de la primera hora.
//   - CRONOLOGÍA: cada oración que empieza con una hora ("A las 14:10, …") es un hito; las
//     oraciones sin hora que vienen entre hitos (o justo después, antes de "Otros datos:") se
//     suman al hito anterior.
//   - DATOS CLAVE: lo que va después de "Otros datos:" / "Además:", en viñetas.
// Si el texto no trae horas, se divide en párrafos cortos (2–3 oraciones). Función pura (sin
// DOM): devuelve HTML con todo el texto escapado. Script clásico: window.formatFacilitatorContext.
window.formatFacilitatorContext = (function(){
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  // "A las 14:10, el SOC…" / "Desde las 9.30 …" / "14:10 – el SOC…"
  const TIME_START = /^(?:(?:a|desde|hacia|cerca de)\s+las\s+)?(\d{1,2}[:.]\d{2})(?:\s*(?:h|hrs?\.?))?\s*[,:–—-]?\s*/i;
  // Marcador que abre los datos clave; puede venir al inicio de una oración.
  const KEYS_MARK = /^(?:otros datos|datos adicionales|además|ademas|consideraciones)\s*:\s*/i;

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

  return function formatFacilitatorContext(text){
    const list = sentences(text);
    if(!list.length) return '';
    const firstTime = list.findIndex(s => TIME_START.test(s));
    if(firstTime === -1) return paragraphsHtml(list); // sin horas: párrafos cortos

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
    if(intro.length) html += `<section class="fc-section"><div class="fc-label">Antecedentes</div>${paragraphsHtml(intro)}</section>`;
    html += '<section class="fc-section"><div class="fc-label">Cronología</div><ol class="fc-timeline">' +
      events.map(e => `<li><span class="fc-time">${esc(e.time)}</span><span class="fc-event">${esc(e.text)}</span></li>`).join('') +
      '</ol></section>';
    if(keys.length) html += `<section class="fc-section"><div class="fc-label">Datos clave</div><ul class="fc-keys">${keys.map(k => `<li>${esc(k)}</li>`).join('')}</ul></section>`;
    return html;
  };
})();
