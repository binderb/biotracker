import { extname } from 'path';
import latex from 'node-latex';
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';

function sanitizeForLatex(input:string) {
  return input.replaceAll(`&`,`\\&`);
}

export default async function generatePDF (req:NextApiRequest, res:NextApiResponse) {
  const template = fs.readFileSync(process.cwd() + '/public/texTemplate.tex', {encoding: 'utf-8'});
    
  if (!template) throw new Error(`Server setup error: In order to use this feature, you need to have a 'texTemplate.tex' file available on the server.`);

  let docContents = ``;
  for (let i=0;i<req.body.content[0].sections.length; i++) {
    const section = req.body.content[0].sections[i];
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
      docContents += section.extensibleReference ? ` ${req.body.content[0]?.sections.indexOf(section)+1-section.extensibleReference}` : ` ${i+1}`;
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
              docContents += row.extensibleReference ? ` ${req.body.content[0]?.sections[i].rows.indexOf(row)+1-row.extensibleReference}` : ` ${j+1}`;
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
  console.log(docContents);

  const filledTemplate = template
    .replace('docBranding', `\\includegraphics[width=100pt]{${process.cwd() + '/public/documentBranding.png'}}`)
    .replace('docType',req.body.type)
    .replace('docId', req.body.id)
    .replace('docRevision', req.body.revision)
    .replace('docEffectiveDate', req.body.effectiveDate)
    .replace('docTitle', req.body.content[0].name)
    .replace('docOwningDepartment', req.body.owningDepartment)
    .replace('docContents', docContents)

  // const output = fs.createWriteStream(process.cwd() + '/public/output.pdf');
  const pdf = latex(filledTemplate, {passes: 2});
  res.setHeader('Content-Disposition', 'attachment; filename=testPDF.pdf');
  res.setHeader('Content-Type', 'application/pdf');
  pdf.pipe(res);
  pdf.on('error', err=>console.log(err));
  pdf.on('finish', ()=> {
    res.status(201);
    console.log('PDF generated!');
  });

  // form.parse(req, (err, fields, files) => {
  //   if (err) {
  //     res.status(400).json(err);
  //   } else {
  //     res.status(201).json({filename: filename});
  //   }
  // });
};