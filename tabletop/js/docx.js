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
    // Contexto para facilitadores (solo si el escenario lo trae): mismo párrafo que escribe la
    // skill de tabletop, para que el Word exportado se vuelva a leer igual.
    if(String(scenario.facilitatorContext || '').trim()){
      out.push(p('Contexto para facilitadores. ' + String(scenario.facilitatorContext).trim()));
    }
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
  // INFORME DEL EJERCICIO (resultado -> .docx con formato SGSI)
  // ================================================================
  // Formato de los documentos del sistema de gestión (referencia: D-25, skill formato-sgsi):
  // Carta, encabezado con nombre/versión/código/fecha y razón social, pie "Página X de Y",
  // portada, Control de cambios + bloque de aprobación en la página 2, títulos numerados en
  // romanos (I., II.) y subtítulos 5.1, cuerpo Aptos Light 12 justificado y tablas azul marino.
  // El formato vive en los estilos de Word (styles.xml + numbering.xml), no párrafo a párrafo.
  //
  // report: {sections:[{title, blocks}], filename, meta}. Bloques (los arma
  // reportElementToDocBlocks en report.js): {type:'p'|'bullet', runs:[{text,bold}]},
  // {type:'heading', text}, {type:'table', rows:[[texto]], header:bool}.
  // meta: {docName, coverTitle, coverSubtitle, version, code, issueDate (MM/AAAA), company,
  //   authorRole, approverRole, approverCompany}.
  const SG = {
    navy: '000E3D', navyText: 'F1F5F9', zebra: 'F1F5F9', title: '0D0D0D', body: '171717',
    subtitle: '808080', cellText: '1E293B', footer: '3A3A3A',
    pageW: 12240, pageH: 15840,                      // Carta
    margin: {top: 1418, bottom: 851, left: 1701, right: 1750, header: 340, footer: 454},
    textW: 12240 - 1701 - 1750                       // 8789 twips
  };
  const SG_FONT_TITLE = 'Cambria';
  const SG_FONT_BODY = 'Aptos Light';

  function sgRun(text, o){
    o = o || {};
    const props = [];
    if(o.font) props.push(`<w:rFonts w:ascii="${o.font}" w:hAnsi="${o.font}" w:cs="${o.font}"/>`);
    if(o.bold) props.push('<w:b/>');
    if(o.caps) props.push('<w:caps/>');
    if(o.color) props.push(`<w:color w:val="${o.color}"/>`);
    if(o.size) props.push(`<w:sz w:val="${o.size}"/><w:szCs w:val="${o.size}"/>`);
    const rPr = props.length ? `<w:rPr>${props.join('')}</w:rPr>` : '';
    return `<w:r>${rPr}<w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r>`;
  }
  function sgPara(runs, o){
    o = o || {};
    const ppr = [];
    if(o.style) ppr.push(`<w:pStyle w:val="${o.style}"/>`);
    if(o.spacing) ppr.push(o.spacing);
    if(o.jc) ppr.push(`<w:jc w:val="${o.jc}"/>`);
    if(o.vAlignSect) ppr.push(o.vAlignSect);
    return `<w:p>${ppr.length ? `<w:pPr>${ppr.join('')}</w:pPr>` : ''}${runs || ''}</w:p>`;
  }
  const sgBodyRuns = runs => (runs || []).map(r => sgRun(r.text, {bold: !!r.bold})).join('');
  const sgBlank = () => '<w:p/>';
  const sgPageBreak = () => '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';

  // Tabla del formato: encabezado azul marino (Cambria 10, mayúsculas, centrado, se repite en
  // cada página), cuerpo Aptos Light 10 (#1E293B; 1.ª columna #000E3D), filas alternas
  // #F1F5F9, sin bordes, ancho completo y celdas centradas verticalmente.
  function sgTable(rows, opts){
    opts = opts || {};
    const header = opts.header !== false;
    const cols = Math.max(1, ...rows.map(r => r.length));
    const widths = opts.widths || sgAutoWidths(rows, cols, header);
    const centerCols = opts.centerCols || [];
    const grid = widths.map(w => `<w:gridCol w:w="${w}"/>`).join('');
    const body = rows.map((row, ri) => {
      const isHead = header && ri === 0;
      const dataIdx = header ? ri - 1 : ri;
      const fill = isHead ? SG.navy : (dataIdx % 2 === 1 ? SG.zebra : null);
      const cells = widths.map((w, ci) => {
        const text = row[ci] == null ? '' : String(row[ci]);
        const run = isHead
          ? sgRun(text, {font: SG_FONT_TITLE, size: 20, caps: true, color: SG.navyText})
          : sgRun(text, {font: SG_FONT_BODY, size: 20, color: ci === 0 ? SG.navy : SG.cellText});
        const jc = isHead || centerCols.includes(ci) ? 'center' : 'left';
        return `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/>${fill ? `<w:shd w:val="clear" w:color="auto" w:fill="${fill}"/>` : ''}<w:vAlign w:val="center"/></w:tcPr>` +
          `<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/><w:jc w:val="${jc}"/></w:pPr>${run}</w:p></w:tc>`;
      }).join('');
      return `<w:tr><w:trPr><w:cantSplit/>${isHead ? '<w:tblHeader/>' : ''}</w:trPr>${cells}</w:tr>`;
    }).join('');
    return `<w:tbl><w:tblPr><w:tblW w:w="${SG.textW}" w:type="dxa"/>` +
      '<w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders>' +
      '<w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="70" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="70" w:type="dxa"/></w:tblCellMar>' +
      `<w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/></w:tblPr><w:tblGrid>${grid}</w:tblGrid>${body}</w:tbl>`;
  }

  // Anchos de columna según el contenido, en dos pasos: (1) cada columna recibe el mínimo para
  // que su palabra más larga no se parta (en el encabezado en mayúsculas y en el cuerpo); (2) el
  // espacio que sobra se reparte según la cantidad de texto de cada columna (con tope, para que
  // una celda muy larga no se coma la tabla). Anchos aproximados por carácter, en twips.
  const SG_CHAR_HEAD = 118;  // Cambria 10 en mayúsculas
  const SG_CHAR_BODY = 104;  // Aptos Light 10
  const SG_CELL_PAD = 200;   // márgenes de celda + holgura
  function sgAutoWidths(rows, cols, header){
    const mins = [], wants = [];
    for(let ci = 0; ci < cols; ci++){
      let min = 0, want = 0;
      rows.forEach((row, ri) => {
        const text = row[ci] == null ? '' : String(row[ci]);
        const longestWord = Math.max(0, ...text.split(/\s+/).map(x => x.length));
        const perChar = header && ri === 0 ? SG_CHAR_HEAD : SG_CHAR_BODY;
        min = Math.max(min, longestWord * perChar + SG_CELL_PAD);
        if(!(header && ri === 0)) want = Math.max(want, Math.min(text.length, 45) * SG_CHAR_BODY + SG_CELL_PAD);
      });
      mins.push(min);
      wants.push(Math.max(want, min));
    }
    const minTotal = mins.reduce((a, b) => a + b, 0);
    let widths;
    if(minTotal >= SG.textW){
      widths = mins.map(m => Math.floor(SG.textW * m / minTotal)); // no alcanza: se achica parejo
    } else {
      const extra = wants.map((w, i) => w - mins[i]);
      const extraTotal = extra.reduce((a, b) => a + b, 0);
      const spare = SG.textW - minTotal;
      widths = mins.map((m, i) => Math.floor(m + (extraTotal ? spare * extra[i] / extraTotal : spare / cols)));
    }
    widths[widths.length - 1] += SG.textW - widths.reduce((a, b) => a + b, 0);
    return widths;
  }

  // Bloque de aprobación: tabla flotante anclada al pie de la página 2, sin bordes.
  function sgApprovalBlock(meta){
    const w = [3900, 989, 3900];
    const cell = (text, width, size) => `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/></w:tcPr>` +
      `<w:p><w:pPr><w:spacing w:before="0" w:after="60"/><w:jc w:val="center"/></w:pPr>${text ? sgRun(text, {font: SG_FONT_BODY, size, color: '000000'}) : ''}</w:p></w:tc>`;
    const row = (a, c, size) => `<w:tr>${cell(a, w[0], size)}${cell('', w[1], size)}${cell(c, w[2], size)}</w:tr>`;
    return '<w:tbl><w:tblPr><w:tblpPr w:leftFromText="0" w:rightFromText="0" w:vertAnchor="margin" w:horzAnchor="margin" w:tblpXSpec="center" w:tblpYSpec="bottom"/>' +
      `<w:tblW w:w="${w[0] + w[1] + w[2]}" w:type="dxa"/>` +
      '<w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders>' +
      `<w:tblLayout w:type="fixed"/></w:tblPr><w:tblGrid>${w.map(x => `<w:gridCol w:w="${x}"/>`).join('')}</w:tblGrid>` +
      row('Aprobado por:', 'Fecha de aprobación:', 24) +
      row('__________________________', '____ / ____ / ______', 24) +
      row(`${meta.approverRole} — ${meta.approverCompany}`, '', 20) +
      '</w:tbl>';
  }

  function sgSectPr(extra){
    const m = SG.margin;
    return '<w:sectPr><w:headerReference w:type="default" r:id="rIdHeader1"/><w:footerReference w:type="default" r:id="rIdFooter1"/>' +
      `<w:type w:val="nextPage"/><w:pgSz w:w="${SG.pageW}" w:h="${SG.pageH}"/>` +
      `<w:pgMar w:top="${m.top}" w:right="${m.right}" w:bottom="${m.bottom}" w:left="${m.left}" w:header="${m.header}" w:footer="${m.footer}" w:gutter="0"/>` +
      `${extra || ''}</w:sectPr>`;
  }

  function buildSgsiBodyXml(report){
    const meta = report.meta;
    const out = [];
    // Página 1: portada centrada verticalmente (sección propia con vAlign=center).
    out.push(sgPara(sgRun(meta.coverTitle), {style: 'CoverTitle'}));
    out.push(`<w:p><w:pPr><w:pStyle w:val="CoverSubtitle"/>${sgSectPr('<w:vAlign w:val="center"/>')}</w:pPr>${sgRun(meta.coverSubtitle)}</w:p>`);
    // Página 2: Control de cambios + bloque de aprobación al pie.
    out.push(sgPara(sgRun('Control de cambios'), {style: 'ChangesTitle'}));
    out.push(sgPara(sgRun(`Toda modificación a este documento debe ser aprobada por el ${meta.approverRole} de ${meta.approverCompany} antes de su distribución.`)));
    out.push(sgTable([
      ['VERSIÓN', 'FECHA', 'DESCRIPCIÓN', 'ELABORADO POR', 'APROBADO POR'],
      [meta.version, meta.issueDate.replace('/', ' / '), 'Creación del documento.', meta.authorRole, meta.approverRole]
    ], {widths: [983, 1258, 2654, 2222, 1672], centerCols: [0, 1]}));
    out.push(sgBlank());
    out.push(sgApprovalBlock(meta));
    out.push(sgPageBreak());
    // Página 3 en adelante: cada sección es un Título 1 (I., II., ...) y sus subtítulos Título 2.
    (report.sections || []).forEach(sec => {
      out.push(sgPara(sgRun(String(sec.title || '').replace(/\.\s*$/, '')), {style: 'Heading1'}));
      (sec.blocks || []).forEach(b => {
        if(b.type === 'heading') out.push(sgPara(sgRun(String(b.text || '').replace(/\.\s*$/, '')), {style: 'Heading2'}));
        else if(b.type === 'bullet') out.push(sgPara(sgBodyRuns(b.runs), {style: 'ListBullet'}));
        else if(b.type === 'table'){ out.push(sgTable(b.rows, {header: b.header})); out.push(sgBlank()); }
        else out.push(sgPara(sgBodyRuns(b.runs)));
      });
    });
    return out.join('');
  }

  function sgHeaderXml(meta){
    const w = [2000, 5260, 3800];
    const total = w[0] + w[1] + w[2];
    const p = (runs, jc) => `<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/><w:jc w:val="${jc}"/></w:pPr>${runs}</w:p>`;
    const small = t => p(sgRun(t, {font: SG_FONT_TITLE, size: 20, color: '000000'}), 'left');
    const tc = (width, content, extra) => `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/>${extra || ''}<w:vAlign w:val="center"/></w:tcPr>${content}</w:tc>`;
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
      `<w:tbl><w:tblPr><w:tblW w:w="${total}" w:type="dxa"/><w:tblInd w:w="${-Math.round((total - SG.textW) / 2)}" w:type="dxa"/>` +
      '<w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders>' +
      `<w:tblLayout w:type="fixed"/></w:tblPr><w:tblGrid>${w.map(x => `<w:gridCol w:w="${x}"/>`).join('')}</w:tblGrid>` +
      '<w:tr>' +
        tc(w[0], p('', 'left')) +
        tc(w[1], p(sgRun(meta.docName, {font: SG_FONT_TITLE, size: 22, bold: true, color: '000000'}), 'center')) +
        tc(w[2], small(`Versión: ${meta.version}`) + small(`Código: ${meta.code}`) + small(`Fecha Emisión: ${meta.issueDate}`)) +
      '</w:tr><w:tr>' +
        tc(total, p(sgRun(meta.company, {font: SG_FONT_TITLE, size: 22, color: '000000'}), 'center'), '<w:gridSpan w:val="3"/>') +
      '</w:tr></w:tbl><w:p><w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr></w:p></w:hdr>';
  }

  function sgFooterXml(){
    const rpr = `<w:rPr><w:rFonts w:ascii="${SG_FONT_TITLE}" w:hAnsi="${SG_FONT_TITLE}" w:cs="${SG_FONT_TITLE}"/><w:color w:val="${SG.footer}"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr>`;
    const r = t => sgRun(t, {font: SG_FONT_TITLE, size: 20, color: SG.footer});
    // Campo complejo (no fldSimple) con el formato en cada parte: al recalcular el número,
    // Word conserva Cambria 10 #3A3A3A en vez de aplicar la fuente por defecto.
    const field = instr => `<w:r>${rpr}<w:fldChar w:fldCharType="begin"/></w:r><w:r>${rpr}<w:instrText xml:space="preserve"> ${instr} \\* MERGEFORMAT </w:instrText></w:r>` +
      `<w:r>${rpr}<w:fldChar w:fldCharType="separate"/></w:r><w:r>${rpr}<w:t>1</w:t></w:r><w:r>${rpr}<w:fldChar w:fldCharType="end"/></w:r>`;
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      `<w:p><w:pPr><w:jc w:val="right"/></w:pPr>${r('Página ')}${field('PAGE')}${r(' de ')}${field('NUMPAGES')}</w:p></w:ftr>`;
  }

  // Estilos del formato: Normal (Aptos Light 12, #171717, justificado, 1,15), Título 1/2
  // (Cambria 14/12 negrita #0D0D0D, numerados), Lista con viñetas y los de portada.
  function sgStylesXml(){
    const font = f => `<w:rFonts w:ascii="${f}" w:hAnsi="${f}" w:eastAsia="${f}" w:cs="${f}"/>`;
    const sz = v => `<w:sz w:val="${v}"/><w:szCs w:val="${v}"/>`;
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      `<w:docDefaults><w:rPrDefault><w:rPr>${font(SG_FONT_BODY)}<w:color w:val="${SG.body}"/>${sz(24)}<w:lang w:val="es-CL"/></w:rPr></w:rPrDefault>` +
      '<w:pPrDefault><w:pPr><w:spacing w:before="0" w:after="100" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>' +
      `<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/>` +
        `<w:pPr><w:spacing w:before="0" w:after="100" w:line="276" w:lineRule="auto"/><w:jc w:val="both"/></w:pPr>` +
        `<w:rPr>${font(SG_FONT_BODY)}<w:color w:val="${SG.body}"/>${sz(24)}</w:rPr></w:style>` +
      `<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/>` +
        `<w:pPr><w:keepNext/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr><w:spacing w:before="0" w:after="80"/><w:ind w:left="426" w:hanging="142"/><w:jc w:val="left"/><w:outlineLvl w:val="0"/></w:pPr>` +
        `<w:rPr>${font(SG_FONT_TITLE)}<w:b/><w:bCs/><w:color w:val="${SG.title}"/>${sz(28)}</w:rPr></w:style>` +
      `<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/>` +
        `<w:pPr><w:keepNext/><w:numPr><w:ilvl w:val="1"/><w:numId w:val="1"/></w:numPr><w:spacing w:before="0" w:after="80"/><w:ind w:left="851" w:hanging="425"/><w:jc w:val="left"/><w:outlineLvl w:val="1"/></w:pPr>` +
        `<w:rPr>${font(SG_FONT_TITLE)}<w:b/><w:bCs/><w:color w:val="${SG.title}"/>${sz(24)}</w:rPr></w:style>` +
      `<w:style w:type="paragraph" w:styleId="ListBullet"><w:name w:val="List Bullet"/><w:basedOn w:val="Normal"/><w:qFormat/>` +
        `<w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="2"/></w:numPr><w:spacing w:after="160"/><w:ind w:left="360" w:hanging="360"/><w:jc w:val="both"/></w:pPr></w:style>` +
      `<w:style w:type="paragraph" w:customStyle="1" w:styleId="CoverTitle"><w:name w:val="Título de portada"/><w:basedOn w:val="Normal"/>` +
        `<w:pPr><w:spacing w:after="60"/><w:jc w:val="center"/></w:pPr><w:rPr>${font(SG_FONT_TITLE)}<w:b/><w:caps/><w:color w:val="${SG.title}"/>${sz(32)}</w:rPr></w:style>` +
      `<w:style w:type="paragraph" w:customStyle="1" w:styleId="CoverSubtitle"><w:name w:val="Subtítulo de portada"/><w:basedOn w:val="Normal"/>` +
        `<w:pPr><w:spacing w:after="60"/><w:jc w:val="center"/></w:pPr><w:rPr>${font(SG_FONT_TITLE)}<w:color w:val="${SG.subtitle}"/>${sz(24)}</w:rPr></w:style>` +
      `<w:style w:type="paragraph" w:customStyle="1" w:styleId="ChangesTitle"><w:name w:val="Título control de cambios"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/>` +
        `<w:pPr><w:keepNext/><w:spacing w:before="0" w:after="160"/><w:jc w:val="left"/></w:pPr><w:rPr>${font(SG_FONT_TITLE)}<w:b/><w:color w:val="${SG.title}"/>${sz(28)}</w:rPr></w:style>` +
      '<w:style w:type="table" w:default="1" w:styleId="TableNormal"><w:name w:val="Normal Table"/><w:tblPr><w:tblInd w:w="0" w:type="dxa"/>' +
        '<w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="70" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="70" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style>' +
      '</w:styles>';
  }

  // Numeración multinivel ligada a los títulos (I., II. / 5.1, 5.2 con isLgl) y viñetas.
  function sgNumberingXml(){
    const titleRun = `<w:rPr><w:rFonts w:ascii="${SG_FONT_TITLE}" w:hAnsi="${SG_FONT_TITLE}" w:cs="${SG_FONT_TITLE}"/><w:b/><w:color w:val="${SG.title}"/></w:rPr>`;
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      '<w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="multilevel"/>' +
        `<w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="upperRoman"/><w:pStyle w:val="Heading1"/><w:suff w:val="space"/><w:lvlText w:val="%1."/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="426" w:hanging="142"/></w:pPr>${titleRun}</w:lvl>` +
        `<w:lvl w:ilvl="1"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:pStyle w:val="Heading2"/><w:isLgl/><w:suff w:val="space"/><w:lvlText w:val="%1.%2"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="851" w:hanging="425"/></w:pPr>${titleRun}</w:lvl>` +
      '</w:abstractNum>' +
      '<w:abstractNum w:abstractNumId="1"><w:multiLevelType w:val="singleLevel"/>' +
        `<w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="360" w:hanging="360"/></w:pPr><w:rPr><w:rFonts w:ascii="${SG_FONT_BODY}" w:hAnsi="${SG_FONT_BODY}"/></w:rPr></w:lvl>` +
      '</w:abstractNum>' +
      '<w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num><w:num w:numId="2"><w:abstractNumId w:val="1"/></w:num>' +
      '</w:numbering>';
  }

  async function buildSgsiDocxBlob(report){
    const W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
    const documentXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      `<w:document ${W}><w:body>${buildSgsiBodyXml(report)}${sgSectPr()}</w:body></w:document>`;
    const contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
      '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>' +
      '<Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>' +
      '<Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>' +
      '<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>' +
      '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' +
      '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>' +
      '</Types>';
    const docRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
      '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>' +
      '<Relationship Id="rIdHeader1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>' +
      '<Relationship Id="rIdFooter1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>' +
      '</Relationships>';
    const zip = new JSZip();
    zip.file('[Content_Types].xml', contentTypes);
    zip.file('_rels/.rels', RELS_XML);
    zip.file('word/document.xml', documentXml);
    zip.file('word/_rels/document.xml.rels', docRels);
    zip.file('word/styles.xml', sgStylesXml());
    zip.file('word/numbering.xml', sgNumberingXml());
    zip.file('word/header1.xml', sgHeaderXml(report.meta));
    zip.file('word/footer1.xml', sgFooterXml());
    zip.file('docProps/core.xml', coreXml(report.meta.docName));
    zip.file('docProps/app.xml', APP_XML);
    return zip.generateAsync({type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
  }

  async function downloadReportDocx(report){
    const blob = await buildSgsiDocxBlob(report);
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
    // "Contexto para facilitadores. …": párrafo de notas para quien conduce (sin etiqueta con
    // dos puntos; se reconoce por cómo empieza). "Turnos. …" es otro párrafo de notas que se
    // ignora. Los dos cortan la introducción si quedaron después de "INTRODUCCIÓN:".
    let facilitatorContext = '';
    const CONTEXT_PREFIX = /^contexto para facilitadores\s*[.:\-–—]?\s*/i;
    const TURNS_PREFIX = /^turnos\s*[.:]/i;
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
      const plain = stripAccents(raw);
      if(CONTEXT_PREFIX.test(plain)){
        facilitatorContext = raw.slice(plain.match(CONTEXT_PREFIX)[0].length).trim();
        introActive = false; situationActive = false;
        continue;
      }
      if(TURNS_PREFIX.test(plain) && !currentStage){ introActive = false; continue; }
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
      facilitatorContext,
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
