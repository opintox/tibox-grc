// Arma el .docx sobre la plantilla (assets/plantilla-informe.docx): estilos, encabezado, pie y
// numeración de la plantilla; portada, ficha y cuerpo salen de lo que se llenó en la app.
async function buildFromTemplate(JSZip, tplBytes, P, d) {
  const x = s => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const fill = (tpl, map) => tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => x(map[k] != null ? map[k] : ""));
  const m = d.meta;
  const map = {
    area: m.area, version: m.version, codigo: m.codigo, fecha: m.fecha, proceso: m.proceso,
    tituloMay: (m.titulo || "").toUpperCase(), subtitulo: m.subtitulo, intro: m.intro,
    gen_nombre: m.gen.nombre, gen_cargo: m.gen.cargo, rev_nombre: m.rev.nombre, rev_cargo: m.rev.cargo,
    apr_nombre: m.apr.nombre, apr_cargo: m.apr.cargo,
    f1_nombre: m.firmas[0].nombre, f1_cargo: m.firmas[0].cargo, f2_nombre: m.firmas[1].nombre, f2_cargo: m.firmas[1].cargo
  };

  // ---- texto con **negrita** ----
  const runs = (t, base) => {
    base = base || "";
    const out = [];
    String(t || "").split(/(\*\*[^*]+\*\*)/g).forEach(part => {
      if (!part) return;
      const b = /^\*\*[^*]+\*\*$/.test(part);
      const txt = b ? part.slice(2, -2) : part;
      const rpr = (b ? "<w:b/><w:bCs/>" : "") + base;
      out.push(`<w:r>${rpr ? "<w:rPr>" + rpr + "</w:rPr>" : ""}<w:t xml:space="preserve">${x(txt)}</w:t></w:r>`);
    });
    return out.join("");
  };
  const BODY_PPR = '<w:spacing w:after="240" w:line="276" w:lineRule="auto"/><w:jc w:val="both"/>';
  const roman = n => { const r = [[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]]; let s = ""; for (const [v, l] of r) while (n >= v) { s += l; n -= v } return s; };

  // ---- estimación de páginas para el índice (Word la actualiza al abrir) ----
  const PAGE_H = 12700; let y = 0, page = 1;
  const addH = h => { y += h; while (y > PAGE_H) { page++; y -= PAGE_H } };
  const lines = (t, cpl) => Math.max(1, Math.ceil(String(t || "").replace(/\*\*/g, "").length / cpl));

  // ---- cuerpo ----
  const blocks = d.blocks || [];
  const nH1 = blocks.filter(b => b.tipo === "h1").length;
  const incCambios = m.incCambios !== false, incFirmas = m.incFirmas !== false;
  const hasP2 = incCambios || incFirmas;
  page = (hasP2 ? 4 : 3) + Math.max(0, Math.ceil((nH1 - 24) / 26)); // portada, [control de cambios / firmas], índice
  const imgRels = []; let imgN = 0;
  const toc = []; let body = ""; let h1n = 0, bm = 900, numId = 100; const extraNums = [];
  blocks.forEach(b => {
    const t = b.tipo, texto = String(b.texto || ""); // un título puede quedar sin texto

    if (t === "h1") {
      h1n++; bm++; const name = "_Toc9" + String(bm).padStart(6, "0");
      if (y > PAGE_H - 1400) { page++; y = 0 }
      toc.push({n: roman(h1n), texto, name, page});
      body += `<w:p><w:pPr><w:pStyle w:val="Ttulo1"/><w:keepNext/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="7"/></w:numPr><w:spacing w:before="0"/><w:ind w:left="567" w:hanging="207"/><w:jc w:val="both"/><w:rPr><w:color w:val="auto"/></w:rPr></w:pPr><w:bookmarkStart w:id="${bm}" w:name="${name}"/>${runs(texto.replace(/\*\*/g, ""), '<w:color w:val="auto"/>')}<w:bookmarkEnd w:id="${bm}"/></w:p>`;
      addH(620);
    } else if (t === "h2") {
      body += `<w:p><w:pPr><w:pStyle w:val="Ttulo2"/><w:keepNext/><w:spacing w:before="120" w:after="120"/><w:jc w:val="both"/></w:pPr>${runs(texto.replace(/\*\*/g, ""))}</w:p>`;
      addH(520);
    } else if (t === "h3") {
      body += `<w:p><w:pPr><w:keepNext/><w:spacing w:after="120" w:line="276" w:lineRule="auto"/><w:jc w:val="both"/></w:pPr>${runs(texto.replace(/\*\*/g, ""), "<w:b/><w:bCs/>")}</w:p>`;
      addH(460);
    } else if (t === "lista" || t === "numerada") {
      let id = 8;
      if (t === "numerada") { id = numId++; extraNums.push(id) }
      (b.items || []).forEach(it => {
        body += `<w:p><w:pPr><w:pStyle w:val="Prrafodelista"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="${id}"/></w:numPr>${BODY_PPR}</w:pPr>${runs(it)}</w:p>`;
        addH(lines(it, 76) * 336 + 240);
      });
    } else if (t === "tabla") {
      const filas = (b.filas || []).filter(r => r && r.length);
      if (!filas.length) return;
      const cols = Math.max(...filas.map(r => r.length));
      const TOTAL = 8789;
      const weight = Array.from({length: cols}, (_, c) => {
        const L = filas.map(r => String(r[c] || "").length); const avg = L.reduce((a, v) => a + v, 0) / L.length;
        return Math.max(6, Math.min(60, avg + 4));
      });
      const ws = weight.reduce((a, v) => a + v, 0);
      const W = weight.map(w => Math.round(TOTAL * w / ws)); W[cols - 1] += TOTAL - W.reduce((a, v) => a + v, 0);
      const nil = '<w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/>';
      let xml = `<w:tbl><w:tblPr><w:tblW w:w="${TOTAL}" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblCellMar><w:left w:w="70" w:type="dxa"/><w:right w:w="70" w:type="dxa"/></w:tblCellMar><w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/></w:tblPr><w:tblGrid>${W.map(w => `<w:gridCol w:w="${w}"/>`).join("")}</w:tblGrid>`;
      filas.forEach((r, ri) => {
        const head = ri === 0, shade = !head && ri % 2 === 0;
        xml += `<w:tr><w:trPr>${head ? '<w:tblHeader/><w:trHeight w:val="340"/>' : '<w:cantSplit/><w:trHeight w:val="454"/>'}</w:trPr>`;
        for (let c = 0; c < cols; c++) {
          const right = !head && c === 0 && cols > 1 ? '<w:right w:val="single" w:sz="4" w:space="0" w:color="000E3D"/>' : '<w:right w:val="nil"/>';
          const fillc = head ? "000E3D" : shade ? "F1F5F9" : null;
          const base = head ? '<w:rFonts w:ascii="Cambria" w:eastAsia="Times New Roman" w:hAnsi="Cambria" w:cs="Times New Roman"/><w:color w:val="F1F5F9"/><w:sz w:val="20"/><w:szCs w:val="20"/>'
            : `<w:rFonts w:eastAsia="Times New Roman" w:cs="Times New Roman"/>${c === 0 && cols > 1 ? '<w:color w:val="000E3D"/>' : ""}<w:sz w:val="20"/><w:szCs w:val="20"/>`;
          const txt = head ? String(r[c] || "").replace(/\*\*/g, "").toUpperCase() : r[c];
          xml += `<w:tc><w:tcPr><w:tcW w:w="${W[c]}" w:type="dxa"/><w:tcBorders>${nil}${right}</w:tcBorders>${fillc ? `<w:shd w:val="clear" w:color="000000" w:fill="${fillc}"/>` : ""}<w:tcMar><w:top w:w="40" w:type="dxa"/><w:bottom w:w="40" w:type="dxa"/></w:tcMar><w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr>${head ? '<w:jc w:val="center"/>' : ""}</w:pPr>${runs(txt, base)}</w:p></w:tc>`;
        }
        xml += "</w:tr>";
        const ln = Math.max(...Array.from({length: cols}, (_, c) => lines(r[c], Math.max(8, W[c] / 115))));
        addH(Math.max(head ? 340 : 454, ln * 270 + 80));
      });
      body += xml + `</w:tbl><w:p><w:pPr><w:spacing w:line="276" w:lineRule="auto"/><w:jc w:val="both"/></w:pPr></w:p>`;
      addH(300);
    } else if (t === "imagen") {
      const im = (d.images || {})[b.ref];
      if (!im) return;
      const MAXW = 5577840, MAXH = 6400800; // 6,1" de ancho útil, 7" de alto
      const pxw = im.w, pxh = im.h;
      let cx = Math.round(pxw * 9525), cy = Math.round(pxh * 9525);
      const k = Math.min(1, MAXW / cx, MAXH / cy, (b.ancho || 100) / 100 * MAXW / cx);
      cx = Math.round(cx * k); cy = Math.round(cy * k);
      imgN++; const rid = "rIdImg" + imgN, file = "tbx_img" + imgN + "." + im.ext, did = 5000 + imgN;
      imgRels.push({rid, file, bytes: im.bytes});
      body += `<w:p><w:pPr><w:keepNext/><w:spacing w:before="120" w:after="${b.texto ? 80 : 240}"/><w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="${did}" name="Imagen ${imgN}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${did}" name="${file}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
      addH(Math.round(cy / 635) + 360);
      if (b.texto) {
        body += `<w:p><w:pPr><w:spacing w:after="240" w:line="276" w:lineRule="auto"/><w:jc w:val="center"/></w:pPr>${runs(b.texto, '<w:i/><w:iCs/><w:color w:val="64748B"/><w:sz w:val="20"/><w:szCs w:val="20"/>')}</w:p>`;
        addH(lines(b.texto, 90) * 300 + 240);
      }
    } else if (t === "nota") {
      body += `<w:p><w:pPr><w:pBdr><w:left w:val="single" w:sz="18" w:space="8" w:color="000E3D"/></w:pBdr><w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/><w:spacing w:after="240" w:line="276" w:lineRule="auto"/><w:ind w:left="170" w:right="170"/><w:jc w:val="both"/></w:pPr>${runs(b.texto)}</w:p>`;
      addH(lines(b.texto, 78) * 336 + 300);
    } else {
      body += `<w:p><w:pPr>${BODY_PPR}</w:pPr>${runs(b.texto)}</w:p>`;
      addH(lines(b.texto, 82) * 336 + 240);
    }
  });

  // ---- índice ----
  let tocXml = P.sdt_pr + P.toc_title;
  const instr = '<w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> TOC \\o "1-3" \\h \\z \\u </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r>';
  const hl = '<w:rPr><w:rStyle w:val="Hipervnculo"/><w:noProof/><w:color w:val="1E293B"/></w:rPr>';
  const wh = '<w:rPr><w:noProof/><w:webHidden/></w:rPr>';
  if (!toc.length) tocXml += `<w:p>${P.toc_entry_ppr}${instr}</w:p>`;
  toc.forEach((e, i) => {
    tocXml += `<w:p>${P.toc_entry_ppr}${i === 0 ? instr : ""}<w:hyperlink w:anchor="${e.name}" w:history="1"><w:r>${hl}<w:t>${e.n}.</w:t></w:r><w:r><w:rPr><w:noProof/></w:rPr><w:tab/></w:r><w:r>${hl}<w:t xml:space="preserve">${x(e.texto.replace(/\*\*/g, ""))}</w:t></w:r><w:r>${wh}<w:tab/></w:r><w:r>${wh}<w:fldChar w:fldCharType="begin"/></w:r><w:r>${wh}<w:instrText xml:space="preserve"> PAGEREF ${e.name} \\h </w:instrText></w:r><w:r>${wh}<w:fldChar w:fldCharType="separate"/></w:r><w:r>${wh}<w:t>${e.page}</w:t></w:r><w:r>${wh}<w:fldChar w:fldCharType="end"/></w:r></w:hyperlink></w:p>`;
  });
  tocXml += '<w:p><w:r><w:rPr><w:b/><w:bCs/><w:lang w:val="es-ES"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r></w:p></w:sdtContent></w:sdt>';

  // ---- control de cambios ----
  const cambios = (m.cambios && m.cambios.length) ? m.cambios : [{version: "", fecha: "", descripcion: "", elaborado: "", aprobado: ""}];
  const rowsXml = cambios.map(c => fill(P.row_tpl, {c0: c.version, c1: c.fecha, c2: c.descripcion, c3: c.elaborado, c4: c.aprobado})).join("");
  const spacers = incCambios ? Math.max(4, 15 - (cambios.length - 1) * 2 - Math.max(0, Math.ceil(String(m.intro || "").length / 85) - 2)) : 20;
  let page2 = "";
  if (incCambios) page2 += P.ctrl_title + fill(P.ctrl_intro, map) + P.tbl_head + rowsXml + P.tbl_tail + P.after_tbl;
  if (incFirmas) page2 += P.spacer.repeat(spacers) + fill(P.firmas, map);
  if (hasP2) page2 += P.pbreak;

  // ---- portada (título y subtítulo debajo de la imagen) ----
  let cover = P.cover_spacers + fill(P.t13, map) + (m.subtitulo ? fill(P.t14, map) : "");

  const docXml = P.doc_head + cover + P.sect1 + page2 +
    tocXml + P.break38 + body + P.sect_final + "</w:body></w:document>";

  // ---- ensamblar ----
  const zip = await JSZip.loadAsync(tplBytes);
  zip.file("word/document.xml", docXml);
  if (imgRels.length) {
    imgRels.forEach(r => zip.file("word/media/" + r.file, r.bytes));
    let rels = await zip.file("word/_rels/document.xml.rels").async("string");
    rels = rels.replace("</Relationships>", imgRels.map(r => `<Relationship Id="${r.rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${r.file}"/>`).join("") + "</Relationships>");
    zip.file("word/_rels/document.xml.rels", rels);
  }
  zip.file("word/media/image2.jpg", d.cover);
  let h3 = await zip.file("word/header3.xml").async("string");
  if (m.headerSimple && m.ocultarCodigo) h3 = h3.replace(/<w:p[ >](?:(?!<\/w:p>)[\s\S])*\{\{codigo\}\}[\s\S]*?<\/w:p>/, "");
  if (m.headerSimple) h3 = h3.replace(/<w:tr[ >](?:(?!<\/w:tr>)[\s\S])*\{\{gen_nombre\}\}[\s\S]*?<\/w:tr>/, "");
  h3 = fill(h3, map);
  if (d.logo) {
    zip.file("word/media/image1.png", d.logo.bytes);
    const BW = 1238250, BH = 304800; let w = BW, h = Math.round(BW * d.logo.h / d.logo.w);
    if (h > BH) { h = BH; w = Math.round(BH * d.logo.w / d.logo.h) }
    const fix = s => s.replace(/cx="1238250" cy="304800"/g, `cx="${w}" cy="${h}"`);
    h3 = fix(h3);
  }
  zip.file("word/header3.xml", h3);
  zip.file("word/header1.xml", h3); // página de control de cambios: misma tabla documental que el resto
  if (extraNums.length) {
    let n = await zip.file("word/numbering.xml").async("string");
    const add = extraNums.map(id => `<w:num w:numId="${id}"><w:abstractNumId w:val="4"/><w:lvlOverride w:ilvl="0"><w:startOverride w:val="1"/></w:lvlOverride></w:num>`).join("");
    n = n.replace(/(<w:num w:numId=)/, add + "$1");
    zip.file("word/numbering.xml", n);
  }
  let core = await zip.file("docProps/core.xml").async("string");
  core = core.replace(/<dc:title>[^<]*<\/dc:title>/, `<dc:title>${x(m.titulo)}</dc:title>`);
  zip.file("docProps/core.xml", core);
  return zip;
}
