import { extname } from 'path';
import latex from 'node-latex';
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';

export default async function upload (req:NextApiRequest, res:NextApiResponse) {
  
  const template = fs.readFileSync(process.cwd() + '/public/texTemplate.tex', {encoding: 'utf-8'});

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
    \\multicolumn{${maxcols}}{!{\\VRule}l!{\\VRule}}{\\cellcolor{light-gray}\\textbf{${section.name}`;
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
            docContents += `\\raggedright ${field.params[0]} `;
            break;
          case 'textarea':
            docContents += `\\makecell[tl]{\\vspace{0.4in}} `;
            break;
          case 'checkbox':
            docContents += `\\makecell[tl]{\\checkbox{${field.data[0] ? '1' : '0'}} ${field.params[0]}} `;
            break;
          case 'multicheckbox':
            docContents += `\\makecell[tl]{`;
            for (let d=0;d<field.params.length;d++) docContents += `\\checkbox{${field.data[d] ? '1' : '0'}} ${field.params[d]} ${d < field.params.length-1 ? `\\\\` : ``}`;
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

  const output = fs.createWriteStream(process.cwd() + '/public/output.pdf');
  const pdf = latex(filledTemplate, {passes: 2});
  pdf.pipe(output);
  pdf.on('error', err=>console.log(err));
  pdf.on('finish', ()=>console.log('PDF generated!'));


  res.status(200).json({message: 'success'});
  res.setHeader

  // form.parse(req, (err, fields, files) => {
  //   if (err) {
  //     res.status(400).json(err);
  //   } else {
  //     res.status(201).json({filename: filename});
  //   }
  // });
};