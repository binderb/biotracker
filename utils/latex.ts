import fs from 'fs';
import latex from 'node-latex';

function sanitizeForLatex(input:string) {
  return input.replaceAll(`&`,`\\&`);
}

function generateLatex (metadata:any, content:any) {
  const template = fs.readFileSync(process.cwd() + '/public/texTemplate.tex', {encoding: 'utf-8'});
    
  if (!template) throw new Error(`Server setup error: In order to use this feature, you need to have a 'texTemplate.tex' file available on the server.`);

  let docContents = ``;
  for (let i=0;i<content.sections.length; i++) {
    const section = content.sections[i];
    let maxcols = 1;
    for (let row of section.rows) if (row.fields.length > maxcols) maxcols = row.fields.length;

    docContents += `\\begin{tabularx}{\\textwidth}{!{\\VRule}${maxcols > 1 ? `p{111pt}` : `X`}`;
    if (maxcols > 1) {
      for (let c=1;c<maxcols;c++) docContents += `!{\\VRule}X`;
    }
    docContents += '!{\\VRule}}';
    docContents += `
    \\specialrule{0.4pt}{0pt}{0pt}
    \\multicolumn{${maxcols}}{!{\\VRule}l!{\\VRule}}{\\cellcolor{light-gray}\\textbf{${sanitizeForLatex(section.name)}`;
    if (section.extensible) {
      docContents += section.extensibleReference ? ` ${content.sections.indexOf(section)+1-section.extensibleReference}` : ` ${i+1}`;
    }
    docContents += `:}} \\\\
    \\specialrule{0.4pt}{0pt}{0pt}`;
    for (let j=0;j<section.rows.length;j++) {
      const row = section.rows[j];
      for (let k=0;k<row.fields.length;k++) {
        const field = row.fields[k];
        if (field.type === 'label') docContents += `\\cellcolor{light-gray} `;
        switch (field.type) {
          case 'label':
            docContents += `\\raggedright ${sanitizeForLatex(field.params[0])}`;
            if (row.extensible) {
              docContents += row.extensibleReference ? ` ${content.sections[i].rows.indexOf(row)+1-row.extensibleReference}` : ` ${j+1}`;
            }
            docContents += `: `;
            break;
          case 'textarea':
            docContents += `\\makecell[tl]{\\vspace{0.4in}} `;
            break;
          case 'checkbox':
            docContents += `\\makecell[tl]{\\checkbox{${field.data[0] ? '1' : '0'}} ${sanitizeForLatex(field.params[0])}} `;
            break;
          case 'multicheckbox':
            docContents += `\\makecell[tl]{`;
            for (let d=0;d<field.params.length;d++) docContents += `\\checkbox{${field.data[d] ? '1' : '0'}} ${sanitizeForLatex(field.params[d])} ${d < field.params.length-1 ? `\\\\` : ``}`;
            docContents += `} `;
            break;
          default:
            break;
        }
        if (k < row.fields.length-1) docContents += `& `; 
      }
      docContents += `\\\\
      \\specialrule{0.4pt}{0pt}{0pt}`;
    }
    docContents += `
    \\end{tabularx}
    \\vspace{0.1in} \\\\`;
    
  }

  const filledTemplate = template
    .replace('docBranding', `\\includegraphics[width=100pt]{${process.cwd() + '/public/documentBranding.png'}}`)
    .replace('docType',metadata.type)
    .replace('docId', metadata.id)
    .replace('docRevision', metadata.revision)
    .replace('docEffectiveDate', metadata.effectiveDate)
    .replace('docTitle', metadata.name)
    .replace('docOwningDepartment', metadata.owningDepartment)
    .replace('docContents', docContents)

  return filledTemplate;
};

export async function createPDFFile (metadata:any, content:any, filename:string) {
  const filledTemplate = generateLatex(metadata,content);

  async function writePDFFile () {
    return new Promise<void>((resolve, reject) => {
      const output = fs.createWriteStream(process.cwd() + `/public/${filename}`);
      const pdf = latex(filledTemplate, {passes: 2});
      pdf.pipe(output);
      pdf.on('finish', resolve);
      pdf.on('error', reject);
    })
  }
  try {
    await writePDFFile();
    return filename;
  } catch (err:any) {
    throw new Error('Could not generate PDF file.')
  }
}