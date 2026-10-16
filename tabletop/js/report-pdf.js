// Informe en PDF con el mismo formato que el Word (skill formato-sgsi-v2, ver docx.js): recibe
// el mismo payload que TibDocx.downloadReportDocx ({meta, sections, filename}) y lo maqueta como
// documento Carta para "Guardar como PDF" del navegador. Un sitio estático no puede convertir
// el .docx a PDF (eso necesita Word o un servidor), así que este módulo replica sus reglas:
// portada con la imagen TIBOX a toda la hoja y sin encabezado ni pie, encabezado con logo desde
// la página 2, Control de cambios + aprobación al pie de la página 2, títulos I./1.1, tablas
// azul marino y "Página X de Y" (márgenes de página de CSS: Chrome/Edge 131 o superior).
// Las fuentes son las del equipo (Cambria y Aptos Light vienen con Office).
window.TabletopReportPdf = (function(){
  const IMG = {
    cover: 'assets/informe/portada-tibox.jpg',
    logo: 'assets/informe/logo-tibox-encabezado.png'
  };

  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function roman(n){
    const map = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
    let out = '';
    map.forEach(([v, r]) => { while(n >= v){ out += r; n -= v; } });
    return out;
  }
  const runs = rs => (rs || []).map(r => r.bold ? `<b>${esc(r.text)}</b>` : esc(r.text)).join('');
  const noDot = t => String(t || '').replace(/\.\s*$/, '');

  // Mismas medidas que docx.js (SG): Carta, márgenes 2,5 / 1,5 / 3 / 3,1 cm, encabezado a 0,6 cm.
  // El encabezado va en el <thead> de la tabla que envuelve el cuerpo (el navegador lo repite en
  // cada página); su alto completa los 2,5 cm del margen superior de Word. La tabla del
  // encabezado mide 553 pt, más que el área de texto (439,45 pt): si sobresaliera, el navegador
  // achicaría todo el documento para que quepa y recortaría el logo. Por eso los márgenes
  // laterales de la página dejan 553 pt de ancho y el cuerpo recupera los 3 / 3,1 cm del Word
  // con relleno interno (56,75 pt por lado = (553 − 439,45) / 2).
  const CSS = `
    @page{size:letter; margin:0.6cm 30.75pt 1.5cm 28.3pt;
      @bottom-right{content:"Página " counter(page) " de " counter(pages); font-family:Cambria,Georgia,serif; font-size:10pt; color:#3A3A3A; vertical-align:bottom; padding-bottom:0.55cm;}}
    @page cover{margin:0; @bottom-right{content:none;}}
    html,body{margin:0; padding:0; background:#fff;}
    body{-webkit-print-color-adjust:exact; print-color-adjust:exact; font-family:'Aptos Light','Aptos','Calibri Light','Segoe UI Light',sans-serif; font-size:12pt; color:#171717;}
    .cover{page:cover; position:relative; width:8.5in; height:11in; overflow:hidden; break-after:page;}
    .cover img{position:absolute; left:0; top:0; width:100%; height:100%;}
    .cover-text{position:absolute; left:3cm; right:3.1cm; top:611pt; text-align:center;}
    .cover-text p{text-align:center; line-height:1.15;}
    .cover-title{font-family:Cambria,Georgia,serif; font-size:16pt; font-weight:bold; text-transform:uppercase; color:#0D0D0D; margin:0 0 3pt;}
    .cover-sub{font-family:Cambria,Georgia,serif; font-size:12pt; color:#808080; margin:0 0 3pt;}
    table.doc{width:100%; border-collapse:collapse;}
    table.doc > thead > tr > td{padding:0; height:1.9cm; vertical-align:top;}
    table.doc > tbody > tr > td{padding:0 56.75pt; vertical-align:top;}
    tr.flow{break-before:page;}
    .hdr{width:553pt; border-collapse:collapse; table-layout:fixed; font-family:Cambria,Georgia,serif; color:#000;}
    .hdr td{vertical-align:middle; padding:0 3.5pt; line-height:1.15;}
    .hdr .c1{width:100pt; text-align:center;} .hdr .c1 img{width:60pt; height:auto; display:inline-block;}
    .hdr .c2{width:263pt; text-align:center; font-weight:bold; font-size:11pt;}
    .hdr .c3{width:190pt; text-align:left; font-size:10pt;}
    .hdr .c4{text-align:center; font-size:11pt; padding-top:6pt;}
    .p2{height:calc(11in - 0.6cm - 1.5cm - 1.9cm - 0.6cm); display:flex; flex-direction:column;}
    .changes-title{font-family:Cambria,Georgia,serif; font-size:14pt; font-weight:bold; color:#0D0D0D; margin:0 0 8pt;}
    p{margin:0 0 5pt; line-height:1.15; text-align:justify;}
    h1{font-family:Cambria,Georgia,serif; font-size:14pt; font-weight:bold; color:#0D0D0D; margin:0 0 4pt; padding-left:21.3pt; text-indent:-7.1pt; break-after:avoid;}
    h2{font-family:Cambria,Georgia,serif; font-size:12pt; font-weight:bold; color:#0D0D0D; margin:0 0 4pt; padding-left:42.55pt; text-indent:-21.25pt; break-after:avoid;}
    ul{margin:0; padding-left:18pt;} li{margin:0 0 8pt; text-align:justify; line-height:1.15;}
    table.t{width:100%; border-collapse:collapse; margin:0 0 14pt; font-size:10pt; line-height:1;}
    table.t th{background:#000E3D; color:#F1F5F9; font-family:Cambria,Georgia,serif; font-weight:normal; text-transform:uppercase; text-align:center; vertical-align:middle; padding:1pt 3.5pt;}
    table.t td{color:#1E293B; vertical-align:middle; padding:1pt 3.5pt; text-align:left;}
    table.t td:first-child{color:#000E3D;}
    table.t tbody tr:nth-child(even) td{background:#F1F5F9;}
    table.t tr{break-inside:avoid;}
    table.t td.center{text-align:center;}
    .approval{margin-top:auto; width:100%; border-collapse:collapse; font-family:'Aptos Light','Aptos','Calibri Light',sans-serif; color:#000; text-align:center;}
    .approval td{padding:0 0 3pt; font-size:12pt;} .approval tr.role td{font-size:10pt;}
  `;

  function headerHtml(meta){
    return `<table class="hdr"><tr>
        <td class="c1"><img src="${esc(new URL(IMG.logo, location.href).href)}" alt="TIBOX"></td>
        <td class="c2">${esc(meta.docName)}</td>
        <td class="c3">Versión: ${esc(meta.version)}<br>Código: ${esc(meta.code)}<br>Fecha Emisión: ${esc(meta.issueDate)}</td>
      </tr><tr><td class="c4" colspan="3">${esc(meta.company)}</td></tr></table>`;
  }

  function tableHtml(rows, header, opts){
    opts = opts || {};
    const head = header !== false && rows.length ? rows[0] : null;
    const body = head ? rows.slice(1) : rows;
    const cols = opts.widths ? `<colgroup>${opts.widths.map(w => `<col style="width:${w}pt">`).join('')}</colgroup>` : '';
    const center = opts.centerCols || [];
    return `<table class="t">${cols}` +
      (head ? `<thead><tr>${head.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead>` : '') +
      `<tbody>${body.map(r => `<tr>${r.map((c, i) => `<td${center.includes(i) ? ' class="center"' : ''}>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  }

  // Cuerpo desde la página 3: cada sección es un Título 1 (I., II., ...) y sus subtítulos
  // Título 2 llevan el número arábigo de la sección (3.1, 3.2), igual que la numeración del Word.
  function sectionsHtml(sections){
    return (sections || []).map((sec, si) => {
      let sub = 0, list = [];
      const out = [`<h1>${roman(si + 1)}. ${esc(noDot(sec.title))}</h1>`];
      const flushList = () => { if(list.length){ out.push(`<ul>${list.join('')}</ul>`); list = []; } };
      (sec.blocks || []).forEach(b => {
        if(b.type === 'bullet'){ list.push(`<li>${runs(b.runs)}</li>`); return; }
        flushList();
        if(b.type === 'heading') out.push(`<h2>${si + 1}.${++sub} ${esc(noDot(b.text))}</h2>`);
        else if(b.type === 'table') out.push(tableHtml(b.rows || [], b.header));
        else out.push(`<p>${runs(b.runs)}</p>`);
      });
      flushList();
      return out.join('');
    }).join('');
  }

  function documentHtml(report){
    const meta = report.meta;
    const title = String(report.filename || 'informe_tabletop').replace(/\.docx$/i, '');
    const changes = tableHtml([
      ['Versión', 'Fecha', 'Descripción', 'Elaborado por', 'Aprobado por'],
      [meta.version, String(meta.issueDate).replace('/', ' / '), 'Creación del documento.', meta.authorRole, meta.approverRole]
    ], true, {widths: [50, 64, 135, 113, 85], centerCols: [0, 1]});
    return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${esc(title)}</title><style>${CSS}</style></head><body>
      <div class="cover">
        <img src="${esc(new URL(IMG.cover, location.href).href)}" alt="">
        <div class="cover-text"><p class="cover-title">${esc(meta.coverTitle)}</p><p class="cover-sub">${esc(meta.coverSubtitle)}</p></div>
      </div>
      <table class="doc">
        <thead><tr><td>${headerHtml(meta)}</td></tr></thead>
        <tbody>
          <tr><td><div class="p2">
            <p class="changes-title">Control de cambios</p>
            <p>Toda modificación a este documento debe ser aprobada por el ${esc(meta.approverRole)} de ${esc(meta.approverCompany)} antes de su distribución.</p>
            ${changes}
            <table class="approval">
              <tr><td>Aprobado por:</td><td></td><td>Fecha de aprobación:</td></tr>
              <tr><td>__________________________</td><td></td><td>____ / ____ / ______</td></tr>
              <tr class="role"><td>${esc(meta.approverRole)} — ${esc(meta.approverCompany)}</td><td></td><td></td></tr>
            </table>
          </div></td></tr>
          <tr class="flow"><td>${sectionsHtml(report.sections)}</td></tr>
        </tbody>
      </table>
    </body></html>`;
  }

  // Imprime en un iframe oculto, después de que cargan las imágenes y las fuentes, para no
  // tocar la pantalla del informe. El nombre sugerido del PDF sale del <title> del documento.
  function print(report){
    const frame = document.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText = 'position:fixed; right:0; bottom:0; width:0; height:0; border:0; visibility:hidden;';
    const pageTitle = document.title;
    const cleanup = () => { document.title = pageTitle; frame.remove(); };
    frame.onload = async () => {
      const doc = frame.contentDocument;
      try{
        await Promise.all([...doc.images].map(img => img.decode().catch(() => {})));
        if(doc.fonts && doc.fonts.ready) await doc.fonts.ready;
      }catch(e){ /* se imprime igual */ }
      document.title = doc.title; // algunos navegadores sugieren el nombre del PDF desde la página principal
      frame.contentWindow.addEventListener('afterprint', () => setTimeout(cleanup, 500));
      frame.contentWindow.focus();
      frame.contentWindow.print();
      setTimeout(() => { if(frame.isConnected) cleanup(); }, 120000); // por si afterprint no llega
    };
    frame.srcdoc = documentHtml(report);
    document.body.appendChild(frame);
  }

  return {print};
})();
