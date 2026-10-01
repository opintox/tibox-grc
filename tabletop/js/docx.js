// Lectura y escritura de escenarios como documentos Word (.docx).
// Permite exportar cualquier escenario (o una plantilla en blanco) a un .docx editable,
// y volver a importarlo ya completado para que quede disponible como escenario jugable.
// No depende de nada del motor del juego: solo lee/escribe el formato de datos que
// espera QUESTIONS[id] en js/data/escenarios.js. Requiere JSZip (js/lib/jszip.min.js).

const TibDocx = (function(){

  const NS_W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

  // ---------------- etiquetas del formato (sin tildes: normLabel les quita las tildes también) ----------------
  const LABELS = {
    NOMBRE: 'NOMBRE DEL ESCENARIO',
    DESC: 'DESCRIPCION CORTA',
    OBJ: 'OBJETIVO (ACTIVO AFECTADO)',
    EXTRA_ROLES: 'FUNCIONES ADICIONALES QUE PARTICIPAN',
    FUNCION_ESCENARIO: 'FUNCION DEL ESCENARIO',
    INTRO: 'INTRODUCCION',
    ETAPA: 'ETAPA',
    FUNCION: 'FUNCION QUE RESPONDE',
    TITULO: 'TITULO DEL ACTO',
    CONTEXTO: 'CONTEXTO',
    SITUACION: 'SITUACION',
    ALT_CORRECTA: 'ALTERNATIVA CORRECTA',
    PORQUE: 'POR QUE RESPONDE ESTA FUNCION'
  };
  const LETTERS = ['A','B','C','D'];

  // ---------------- utilidades de texto ----------------
  function stripAccents(s){ return String(s || '').normalize('NFD').replace(/\p{M}/gu, ''); }
  function normLabel(s){ return stripAccents(s).toUpperCase().replace(/\s+/g,' ').trim().replace(/:$/, ''); }
  function xmlEscape(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function roleByDisplayName(){
    const map = {};
    ROLE_KEYS.forEach(k => { map[normLabel(ROLE_NAMES[k])] = k; });
    return map;
  }
  // Fisher-Yates: [0,1,2,...,n-1] en un orden al azar.
  function shuffledOrder(n){
    const arr = Array.from({length: n}, (_, i) => i);
    for(let i = arr.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  // Genera una clave simple (sin tildes, minúscula, "_") a partir del nombre de una función
  // propia del escenario, evitando choques entre nombres parecidos dentro del mismo documento.
  function slugifyKey(name, used){
    const base = stripAccents(name || 'funcion').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'') || 'funcion';
    let key = base, n = 2;
    while(used.has(key)) key = `${base}_${n++}`;
    used.add(key);
    return key;
  }

  // ================================================================
  // GENERACIÓN (escenario -> .docx)
  // ================================================================

  function runXml(text, opts){
    opts = opts || {};
    const props = [];
    if(opts.bold) props.push('<w:b/>');
    if(opts.italic) props.push('<w:i/>');
    if(opts.color) props.push(`<w:color w:val="${opts.color}"/>`);
    if(opts.size) props.push(`<w:sz w:val="${opts.size}"/><w:szCs w:val="${opts.size}"/>`);
    const rPr = props.length ? `<w:rPr>${props.join('')}</w:rPr>` : '';
    const segs = String(text == null ? '' : text).split('\n');
    const body = segs.map((seg,i) => (i>0?'<w:br/>':'') + `<w:t xml:space="preserve">${xmlEscape(seg)}</w:t>`).join('');
    return `<w:r>${rPr}${body}</w:r>`;
  }
  function p(runs, opts){
    opts = opts || {};
    const spacingAfter = opts.spacingAfter == null ? 160 : opts.spacingAfter;
    const list = Array.isArray(runs) ? runs : [runs];
    const runsXml = list.map(r => typeof r === 'string' ? runXml(r) : runXml(r.text, r)).join('');
    return `<w:p><w:pPr><w:spacing w:after="${spacingAfter}"/></w:pPr>${runsXml}</w:p>`;
  }
  function pLabelValue(label, value){
    return p([{text: label + ': ', bold:true}, {text: value || ''}]);
  }
  function pHeading(text, size){
    return p([{text, bold:true, size: size || 26}], {spacingAfter:140});
  }
  function pBlank(){ return '<w:p/>'; }

  function buildScenarioParagraphsXml(scenario){
    // scenario: {name, blurb, target, stages:[{stage, questions:[...]}],
    //   roleNames?: {roleKey: nombre a mostrar} (por defecto ROLE_NAMES),
    //   customRoleList?: [{key, name}, ...] — si viene, el escenario declara sus propias
    //     funciones (en vez de las 6 estándar) y se exporta el bloque FUNCIÓN DEL ESCENARIO;
    //   extraRoleKeys?: [roleKey,...] — solo se usa cuando NO hay customRoleList.
    const roleNames = scenario.roleNames || ROLE_NAMES;
    const out = [];
    out.push(pHeading('TABLETOP DE CIBERSEGURIDAD — PLANTILLA DE ESCENARIO', 30));
    out.push(p('No borres las palabras en MAYÚSCULAS seguidas de dos puntos: son las etiquetas que la aplicación usa para leer este archivo. El texto que va después de cada una se puede editar libremente. Para agregar una situación extra dentro de la misma etapa, copia un bloque completo (desde "FUNCIÓN QUE RESPONDE" hasta "POR QUÉ RESPONDE ESTA FUNCIÓN") y pégalo antes de la siguiente línea "ETAPA:". Las etapas pueden llamarse y ser tantas como el ejercicio necesite: se juegan en el mismo orden en que aparecen acá.', {spacingAfter:280}));
    out.push(pBlank());
    out.push(pLabelValue(LABELS.NOMBRE, scenario.name));
    out.push(pLabelValue(LABELS.DESC, scenario.blurb));
    out.push(pLabelValue(LABELS.OBJ, scenario.target));
    if(scenario.customRoleList && scenario.customRoleList.length){
      scenario.customRoleList.forEach(r => out.push(pLabelValue(LABELS.FUNCION_ESCENARIO, r.name)));
      out.push(p('Este escenario usa sus propias funciones (arriba, una línea "FUNCIÓN DEL ESCENARIO" por cada una) en vez de Seguridad/TI/Legal/Comunicaciones/RRHH/Dirección. Cada "FUNCIÓN QUE RESPONDE" más abajo debe repetir uno de esos nombres tal cual. Para agregar una función nueva, agrega otra línea "FUNCIÓN DEL ESCENARIO" acá arriba.', {spacingAfter:280}));
    } else {
      const extraNames = (scenario.extraRoleKeys || []).map(k => roleNames[k] || k).join(', ');
      out.push(pLabelValue(LABELS.EXTRA_ROLES, extraNames));
      out.push(p('Seguridad y TI participan siempre en todo escenario; escribe aquí solo funciones adicionales, separadas por coma, eligiendo entre: Legal, Comunicaciones, RRHH, Dirección. Si ninguna otra función participa, deja la línea de arriba en blanco. (Si en cambio tu ejercicio necesita funciones completamente distintas a estas 6 — otros cargos, otro organigrama — bórrala y usa líneas "FUNCIÓN DEL ESCENARIO:" en su lugar, una por función.)', {spacingAfter:280}));
    }
    out.push(pBlank());
    // Introducción: se muestra en pantalla antes de la primera etapa. Va justo antes de la
    // primera ETAPA porque toma todos los párrafos que siguen a la etiqueta hasta la próxima.
    out.push(pLabelValue(LABELS.INTRO, ''));
    String(scenario.intro || '').split('\n\n').filter(par => par.trim()).forEach(par => out.push(p(par)));
    out.push(pBlank());

    scenario.stages.forEach(stageEntry => {
      out.push(pHeading(LABELS.ETAPA + ': ' + stageEntry.stage, 26));
      if(stageEntry.stage === 'Cierre' && !scenario.customRoleList){
        out.push(p('En esta etapa, quién responde lo decide automáticamente la aplicación (Dirección si participa, o Seguridad si no); el valor que pongas abajo en "FUNCIÓN QUE RESPONDE" es solo referencial.', {spacingAfter:200}));
      }
      out.push(pBlank());
      stageEntry.questions.forEach(q => {
        out.push(pLabelValue(LABELS.FUNCION, roleNames[q.target] || q.target));
        out.push(pLabelValue(LABELS.TITULO, q.title || ''));
        out.push(pLabelValue(LABELS.CONTEXTO, (q.meta || []).join(' · ')));
        out.push(pLabelValue(LABELS.SITUACION, ''));
        String(q.situation || '').split('\n\n').forEach(par => out.push(p(par)));
        out.push(pBlank());
        // En los datos, el índice 0 siempre es la correcta (la app mezcla el orden al jugar);
        // en el documento se escribe con un orden propio y al azar por acto, para que no quede
        // "ALTERNATIVA CORRECTA: A" repetido en todos los actos al leerlo directamente.
        const order = shuffledOrder(4);
        LETTERS.forEach((letter, idx) => {
          const srcIdx = order[idx];
          out.push(pLabelValue('ALTERNATIVA ' + letter, (q.options || [])[srcIdx] || ''));
          out.push(pLabelValue('EXPLICACION ' + letter, (q.explanations || [])[srcIdx] || ''));
        });
        out.push(pLabelValue(LABELS.ALT_CORRECTA, LETTERS[order.indexOf(q.correctIndex || 0)]));
        out.push(pLabelValue(LABELS.PORQUE, q.mismatchContext || ''));
        out.push(pBlank());
        out.push(pBlank());
      });
    });
    return out.join('');
  }

  const CONTENT_TYPES_XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
    '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>' +
    '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' +
    '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>' +
    '</Types>';
  const RELS_XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>' +
    '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>' +
    '</Relationships>';
  const DOC_RELS_XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
    '</Relationships>';
  const STYLES_XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
    '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
    '<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:rPrDefault></w:docDefaults>' +
    '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>' +
    '</w:styles>';
  const APP_XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
    '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>TIBOX Tabletop</Application></Properties>';
  function coreXml(title){
    const now = new Date().toISOString();
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
      `<dc:title>${xmlEscape(title)}</dc:title><dc:creator>TIBOX Tabletop</dc:creator>` +
      `<dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>` +
      '</cp:coreProperties>';
  }

  async function paragraphsXmlToDocxBlob(paragraphsXml, title){
    const documentXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      `<w:body>${paragraphsXml}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1417" w:right="1417" w:bottom="1417" w:left="1417"/></w:sectPr></w:body>` +
      '</w:document>';
    const zip = new JSZip();
    zip.file('[Content_Types].xml', CONTENT_TYPES_XML);
    zip.file('_rels/.rels', RELS_XML);
    zip.file('word/document.xml', documentXml);
    zip.file('word/_rels/document.xml.rels', DOC_RELS_XML);
    zip.file('word/styles.xml', STYLES_XML);
    zip.file('docProps/core.xml', coreXml(title));
    zip.file('docProps/app.xml', APP_XML);
    return zip.generateAsync({type:'blob', mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
  }

  function slugFilename(name){
    const base = stripAccents(name || 'escenario').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');
    return (base || 'escenario') + '.docx';
  }

  function downloadBlob(blob, filename){
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  async function downloadScenarioDocx(scenario){
    const xml = buildScenarioParagraphsXml(scenario);
    const blob = await paragraphsXmlToDocxBlob(xml, scenario.name);
    downloadBlob(blob, slugFilename(scenario.name));
  }

  function blankTemplateScenario(){
    const ejemploMeta = ['[hora, ej: 09:12]', '[día / contexto, ej: martes de cierre]', '[canal por el que se reporta]', '[sistema o activo afectado]'];
    return {
      name: '[Nombre del nuevo escenario, ej: Ataque al proveedor de nómina]',
      blurb: '[Una frase corta que resuma el ataque — se muestra en la tarjeta de selección]',
      target: '[Activo principal afectado, ej: Servidor de nómina]',
      intro: '[Introducción que se muestra en pantalla antes de empezar: en 2 o 3 párrafos, presenta la organización, el momento en que ocurre el ejercicio y qué se busca practicar, sin adelantar lo que va a pasar. Escríbela justo debajo de "INTRODUCCIÓN:", antes de la primera "ETAPA:".]\n\n[Segundo párrafo, opcional. Deja una línea en blanco entre párrafos, tal como aquí.]',
      extraRoleKeys: [], // si tu ejercicio tiene un organigrama propio (no Seguridad/TI/Legal/Comunicaciones/RRHH/Dirección), reemplaza esto por líneas "FUNCIÓN DEL ESCENARIO:" — ver docx.js
      stages: STAGE_LABELS.map((stage, i) => ({
        stage,
        questions: [{
          target: i % 2 === 0 ? 'ti' : 'seguridad',
          title: `[Título breve del acto de esta etapa, ej: "Acto ${i+1} · ..."]`,
          meta: ejemploMeta,
          situation: '[Describe en 2 a 4 párrafos la situación que el equipo debe resolver en esta etapa: quién, qué pasó, qué se sabe y qué no todavía. Sé específico y realista.]\n\n[Segundo párrafo — continúa hasta el punto en que el equipo debe decidir. Deja una línea en blanco entre párrafos, tal como aquí.]',
          options: [
            '[Alternativa correcta: la decisión técnicamente adecuada para esta etapa]',
            '[Alternativa incorrecta 1 — tentadora pero equivocada]',
            '[Alternativa incorrecta 2]',
            '[Alternativa incorrecta 3]'
          ],
          explanations: [
            '[Por qué la alternativa A es la correcta]',
            '[Por qué la alternativa B es incorrecta]',
            '[Por qué la alternativa C es incorrecta]',
            '[Por qué la alternativa D es incorrecta]'
          ],
          mismatchContext: '[Por qué esta acción específica le corresponde a la función indicada en "FUNCIÓN QUE RESPONDE" y no a otra]',
          correctIndex: 0
        }]
      }))
    };
  }

  async function downloadBlankTemplate(){
    const scenario = blankTemplateScenario();
    const xml = buildScenarioParagraphsXml(scenario);
    const blob = await paragraphsXmlToDocxBlob(xml, 'Plantilla de escenario');
    downloadBlob(blob, 'plantilla_escenario_tabletop.docx');
  }

  // ================================================================
  // INFORME DEL EJERCICIO (resultado -> .docx)
  // ================================================================
  // report: {title, subtitle, sections:[{title, blocks}], filename}. Bloques (los arma
  // reportElementToDocBlocks en app.js): {type:'p'|'bullet', runs:[{text,bold}]},
  // {type:'heading', level, text}, {type:'table', rows:[[texto]], header:bool}.
  const REPORT_NAVY = '1F3A5F';
  const PAGE_TEXT_WIDTH = 9072; // A4 (11906) menos márgenes de 1417 a cada lado, en twips

  function reportRunsXml(runs, extra){
    return (runs || []).map(r => runXml(r.text, Object.assign({bold: !!r.bold}, extra || {}))).join('');
  }
  function reportParagraph(runsXml, opts){
    opts = opts || {};
    // Orden exigido por el esquema de Word dentro de <w:pPr>: keepNext, spacing, ind.
    const ppr = [];
    if(opts.keepNext) ppr.push('<w:keepNext/>');
    ppr.push(`<w:spacing w:after="${opts.after == null ? 120 : opts.after}"/>`);
    if(opts.indent) ppr.push(`<w:ind w:left="${opts.indent}" w:hanging="240"/>`);
    return `<w:p><w:pPr>${ppr.join('')}</w:pPr>${runsXml}</w:p>`;
  }
  function reportTableXml(rows, header){
    const cols = Math.max(1, ...rows.map(r => r.length));
    const colW = Math.floor(PAGE_TEXT_WIDTH / cols);
    const border = '<w:top w:val="single" w:sz="4" w:color="BFBFBF"/><w:left w:val="single" w:sz="4" w:color="BFBFBF"/><w:bottom w:val="single" w:sz="4" w:color="BFBFBF"/><w:right w:val="single" w:sz="4" w:color="BFBFBF"/><w:insideH w:val="single" w:sz="4" w:color="BFBFBF"/><w:insideV w:val="single" w:sz="4" w:color="BFBFBF"/>';
    const grid = Array.from({length: cols}, () => `<w:gridCol w:w="${colW}"/>`).join('');
    const body = rows.map((row, ri) => {
      const isHead = header && ri === 0;
      const cells = Array.from({length: cols}, (_, ci) => {
        const shade = isHead ? `<w:shd w:val="clear" w:color="auto" w:fill="${REPORT_NAVY}"/>` : '';
        const text = runXml(row[ci] || '', isHead ? {bold: true, size: 20, color: 'FFFFFF'} : {size: 20});
        return `<w:tc><w:tcPr><w:tcW w:w="${colW}" w:type="dxa"/>${shade}</w:tcPr><w:p><w:pPr><w:spacing w:after="0"/></w:pPr>${text}</w:p></w:tc>`;
      }).join('');
      return `<w:tr>${isHead ? '<w:trPr><w:tblHeader/></w:trPr>' : ''}${cells}</w:tr>`;
    }).join('');
    return `<w:tbl><w:tblPr><w:tblW w:w="${PAGE_TEXT_WIDTH}" w:type="dxa"/><w:tblBorders>${border}</w:tblBorders>` +
      `<w:tblCellMar><w:top w:w="60" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar></w:tblPr>` +
      `<w:tblGrid>${grid}</w:tblGrid>${body}</w:tbl>` + reportParagraph('', {after: 120});
  }

  function buildReportXml(report){
    const out = [];
    out.push(reportParagraph(runXml(report.title || 'Informe', {bold: true, size: 36, color: REPORT_NAVY}), {after: 60}));
    if(report.subtitle) out.push(reportParagraph(runXml(report.subtitle, {size: 24, color: '555555'}), {after: 360}));
    (report.sections || []).forEach(sec => {
      out.push(reportParagraph(runXml(sec.title, {bold: true, size: 28, color: REPORT_NAVY}), {after: 120, keepNext: true}));
      (sec.blocks || []).forEach(b => {
        if(b.type === 'heading') out.push(reportParagraph(runXml(b.text, {bold: true, size: 23}), {after: 80, keepNext: true}));
        else if(b.type === 'bullet') out.push(reportParagraph(runXml('•  ') + reportRunsXml(b.runs), {indent: 480}));
        else if(b.type === 'table') out.push(reportTableXml(b.rows, b.header));
        else out.push(reportParagraph(reportRunsXml(b.runs)));
      });
      out.push(reportParagraph('', {after: 120}));
    });
    return out.join('');
  }

  async function downloadReportDocx(report){
    const blob = await paragraphsXmlToDocxBlob(buildReportXml(report), report.title || 'Informe');
    downloadBlob(blob, report.filename || 'informe_tabletop.docx');
  }

  // ================================================================
  // LECTURA (.docx -> escenario)
  // ================================================================

  function extractParagraphs(documentXmlText){
    const xml = new DOMParser().parseFromString(documentXmlText, 'application/xml');
    if(xml.getElementsByTagName('parsererror').length){
      throw new Error('No se pudo leer el contenido interno del documento Word (parece estar dañado).');
    }
    const pNodes = xml.getElementsByTagNameNS(NS_W, 'p');
    const paragraphs = [];
    for(let i = 0; i < pNodes.length; i++){
      let text = '';
      (function walk(node){
        for(let j = 0; j < node.childNodes.length; j++){
          const child = node.childNodes[j];
          if(child.nodeType !== 1) continue;
          const local = child.localName;
          if(local === 't') text += child.textContent;
          else if(local === 'br' || local === 'cr') text += '\n';
          else if(local === 'tab') text += '\t';
          else walk(child);
        }
      })(pNodes[i]);
      paragraphs.push(text);
    }
    return paragraphs;
  }

  function splitLabel(text){
    const idx = text.indexOf(':');
    if(idx === -1) return null;
    return {label: normLabel(text.slice(0, idx)), value: text.slice(idx + 1).trim()};
  }

  function paragraphsToScenario(paragraphs){
    const errors = [];
    const ROLE_BY_NAME = roleByDisplayName();
    let name = null, desc = '', objetivo = '', extraRolesRaw = '';
    // Funciones propias del escenario (bloque "FUNCIÓN DEL ESCENARIO", opcional): si el
    // documento trae al menos una, reemplazan por completo a las 6 funciones estándar para
    // resolver "FUNCIÓN QUE RESPONDE" en todos los actos de este escenario.
    const customRoleList = [];
    const customUsedKeys = new Set();
    const customRoleByName = {};
    const stages = [];
    let currentStage = null;
    let currentQ = null;
    let situationActive = false;
    // INTRODUCCIÓN: puede traer texto en la misma línea y/o en los párrafos siguientes; toma
    // todo hasta la próxima etiqueta reconocida (normalmente la primera "ETAPA:").
    const introParts = [];
    let introActive = false;
    const optLabelSet = {}; LETTERS.forEach(l => { optLabelSet['ALTERNATIVA ' + l] = l; });
    const expLabelSet = {}; LETTERS.forEach(l => { expLabelSet['EXPLICACION ' + l] = l; });

    function closeQuestion(){
      if(!currentQ) return;
      const missing = [];
      if(!currentQ.target) missing.push(LABELS.FUNCION);
      if(!currentQ.title) missing.push(LABELS.TITULO);
      if(!currentQ.situation) missing.push(LABELS.SITUACION);
      LETTERS.forEach(l => {
        if(!currentQ.options[l]) missing.push('ALTERNATIVA ' + l);
        if(!currentQ.explanations[l]) missing.push('EXPLICACION ' + l);
      });
      if(!currentQ.correctLetter) missing.push(LABELS.ALT_CORRECTA);
      const label = currentQ.title ? `«${currentQ.title}»` : '(sin título)';
      if(missing.length){
        errors.push(`En el acto ${label} de la etapa "${currentStage.stage}" falta completar: ${missing.join(', ')}.`);
      } else if(LETTERS.indexOf(currentQ.correctLetter) === -1){
        errors.push(`En el acto ${label} el valor de "ALTERNATIVA CORRECTA" ("${currentQ.correctLetter}") debe ser A, B, C o D.`);
      } else {
        const correctIdx = LETTERS.indexOf(currentQ.correctLetter);
        const order = [correctIdx].concat(LETTERS.map((_,i)=>i).filter(i => i !== correctIdx));
        const opts = LETTERS.map(l => currentQ.options[l]);
        const exps = LETTERS.map(l => currentQ.explanations[l]);
        currentStage.questions.push({
          target: currentQ.target,
          title: currentQ.title,
          meta: currentQ.meta,
          situation: currentQ.situation,
          options: order.map(i => opts[i]),
          explanations: order.map(i => exps[i]),
          mismatchContext: currentQ.mismatchContext || '',
          correctIndex: 0
        });
      }
      currentQ = null;
    }
    function closeStage(){
      closeQuestion();
      if(currentStage){
        if(currentStage.questions.length === 0){
          errors.push(`La etapa "${currentStage.stage}" no tiene ningún acto completo (revisa que tenga FUNCIÓN QUE RESPONDE, TÍTULO DEL ACTO, SITUACIÓN, las 4 alternativas, sus explicaciones y ALTERNATIVA CORRECTA).`);
        }
        stages.push(currentStage);
      }
      currentStage = null;
    }

    for(let i = 0; i < paragraphs.length; i++){
      const raw = paragraphs[i].trim();
      if(!raw) continue;
      const parts = splitLabel(raw);
      const label = parts ? parts.label : null;
      const value = parts ? parts.value : raw;

      // Cualquier etiqueta del encabezado o una ETAPA cierra la introducción.
      if(label === LABELS.NOMBRE || label === LABELS.DESC || label === LABELS.OBJ ||
         label === LABELS.EXTRA_ROLES || label === LABELS.FUNCION_ESCENARIO || label === LABELS.ETAPA){
        introActive = false;
      }
      if(label === LABELS.INTRO){
        if(value) introParts.push(value);
        introActive = true; situationActive = false;
        continue;
      }
      if(label === LABELS.NOMBRE){ name = value; situationActive = false; continue; }
      if(label === LABELS.DESC){ desc = value; situationActive = false; continue; }
      if(label === LABELS.OBJ){ objetivo = value; situationActive = false; continue; }
      if(label === LABELS.EXTRA_ROLES){ extraRolesRaw = value; situationActive = false; continue; }
      if(label === LABELS.FUNCION_ESCENARIO){
        if(value){
          const key = slugifyKey(value, customUsedKeys);
          customRoleList.push({key, name: value});
          customRoleByName[normLabel(value)] = key;
        }
        situationActive = false;
        continue;
      }
      if(label === LABELS.ETAPA){
        closeStage();
        currentStage = {stage: value, questions: []};
        situationActive = false;
        continue;
      }
      if(introActive){ introParts.push(raw); continue; }
      if(!currentStage) continue; // texto suelto antes de la primera ETAPA (instrucciones)

      if(label === LABELS.FUNCION){
        closeQuestion();
        const usingCustomRoles = customRoleList.length > 0;
        const roleKey = usingCustomRoles ? customRoleByName[normLabel(value)] : ROLE_BY_NAME[normLabel(value)];
        currentQ = {target: roleKey || null, title: null, meta: [], situation: '', options: {}, explanations: {}, mismatchContext: '', correctLetter: null};
        if(!roleKey){
          const validas = usingCustomRoles ? customRoleList.map(r => r.name).join(', ') : 'Seguridad, TI, Legal, Comunicaciones, RRHH, Dirección';
          errors.push(`En la etapa "${currentStage.stage}" hay un acto con "FUNCIÓN QUE RESPONDE" = "${value}", que no es ninguna de las funciones válidas (${validas}).`);
        }
        situationActive = false;
        continue;
      }
      if(!currentQ) continue; // texto suelto entre la etapa y el primer acto

      if(label === LABELS.TITULO){ currentQ.title = value; situationActive = false; continue; }
      if(label === LABELS.CONTEXTO){
        let meta = value.split('·').map(s => s.trim()).filter(Boolean);
        if(meta.length <= 1) meta = value.split(',').map(s => s.trim()).filter(Boolean);
        currentQ.meta = meta;
        situationActive = false;
        continue;
      }
      if(label === LABELS.SITUACION){ situationActive = true; continue; }
      if(label && optLabelSet[label]){ currentQ.options[optLabelSet[label]] = value; situationActive = false; continue; }
      if(label === LABELS.ALT_CORRECTA){ currentQ.correctLetter = value.trim().toUpperCase().replace(/[^ABCD]/g, ''); situationActive = false; continue; }
      if(label && expLabelSet[label]){ currentQ.explanations[expLabelSet[label]] = value; situationActive = false; continue; }
      if(label === LABELS.PORQUE){ currentQ.mismatchContext = value; situationActive = false; continue; }

      if(situationActive){
        currentQ.situation = currentQ.situation ? currentQ.situation + '\n\n' + raw : raw;
      }
      // cualquier otro texto suelto (comentarios del usuario, el título del documento) se ignora
    }
    closeStage();

    if(!name) errors.push(`Falta la línea "${LABELS.NOMBRE}:" con el nombre del escenario.`);
    // Las etapas se toman tal cual el documento las declaró (nombre y orden libres): el juego
    // simplemente recorre "ETAPA:" en el orden en que aparecen, así que un ejercicio puede tener
    // más, menos o etapas con otro nombre que las 5 estándar (Detección/Clasificación/Contención/
    // Recuperación/Cierre) de los escenarios que vienen con la app.
    if(stages.length === 0){
      errors.push('El documento no tiene ninguna etapa (falta al menos una línea "ETAPA: ...").');
    }

    if(errors.length){
      const e = new Error(errors.join('\n'));
      e.tibDocxErrors = errors;
      throw e;
    }

    const extraRoleKeys = extraRolesRaw.split(',').map(s => s.trim()).filter(Boolean)
      .map(s => ROLE_BY_NAME[normLabel(s)]).filter(Boolean);

    return {
      name: name.trim(), blurb: desc.trim(), target: objetivo.trim(),
      intro: introParts.join('\n\n'),
      extraRoleKeys,
      customRoles: customRoleList.length ? customRoleList : null,
      customStages: stages.map(s => s.stage),
      stages,
      // Texto completo del documento (sin depender de qué etiqueta lo trae), para que la app
      // pueda detectar menciones de un cliente específico y aplicar detalles propios de su
      // tarjeta (ver SCENARIO_BG_IMAGES / registerCustomScenario en app.js).
      rawText: paragraphs.join('\n')
    };
  }

  async function parseScenarioDocxFile(file){
    let buf;
    try{ buf = await file.arrayBuffer(); }
    catch(e){ throw new Error('No se pudo leer el archivo seleccionado.'); }
    let zip;
    try{ zip = await JSZip.loadAsync(buf); }
    catch(e){ throw new Error('El archivo no es un .docx válido (¿es un .doc antiguo, un PDF, o el archivo está dañado?). Guárdalo desde Word como ".docx" e inténtalo de nuevo.'); }
    const entry = zip.file('word/document.xml');
    if(!entry) throw new Error('El archivo no parece ser un documento de Word (.docx): falta word/document.xml dentro del paquete.');
    const xmlText = await entry.async('string');
    const paragraphs = extractParagraphs(xmlText);
    return paragraphsToScenario(paragraphs);
  }

  return {downloadScenarioDocx, downloadBlankTemplate, parseScenarioDocxFile, downloadReportDocx};
})();
