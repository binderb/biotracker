const {google} = require('googleapis');

export async function createAndSetupDocument (documentName:string, parentFolderId:string, auth:any) {
  
  const drive = google.drive({ version: 'v3', auth });
  const docs = google.docs({ version: 'v1', auth });

  const resource = {
    name: documentName,
    mimeType: 'application/vnd.google-apps.document',
    parents: [parentFolderId],
  };
  const createdFile = await drive.files.create({
    requestBody: resource,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });
  const fileId = createdFile.data.id;
  console.log("new file id: ", fileId)

  await docs.documents.batchUpdate({
    documentId: fileId,
    requestBody: {
      requests: [
        {
          updateDocumentStyle: {
            documentStyle: {
              marginLeft: {
                magnitude: 72,
                unit: 'PT'
              },
              marginRight: {
                magnitude: 72,
                unit: 'PT'
              },
              marginTop: {
                magnitude: 36,
                unit: 'PT'
              },
              marginBottom: {
                magnitude: 36,
                unit: 'PT'
              }
            },
            fields: 'marginLeft,marginRight,marginTop,marginBottom'
          }
        },
        {
          createHeader: {
            sectionBreakLocation: {
              index: 0
            },
            type: "DEFAULT"
          },
        },
        {
          createFooter: {
            sectionBreakLocation: {
              index: 0
            },
            type: "DEFAULT"
          },
        },
        {
          updateTextStyle: {
            textStyle: {
              fontSize: {
                magnitude: 11,
                unit: 'PT'
              },
              weightedFontFamily: {
                fontFamily: 'Calibri'
              }
            },
            range: {
              startIndex: 1,
              endIndex: 2
            },
            fields: 'fontSize,weightedFontFamily'
          }
        },
        
      ]
    }
    
  });

  return fileId;

}

export async function buildFormHeader (fileId:string, auth:any) {

  const docs = google.docs({ version: 'v1', auth });
  let document = await docs.documents.get({ 
    documentId: fileId,
  });
  const headerId = Object.keys(document.data.headers)[0];

  // Set font in header.
  // Insert table in document header.
  // Change font size of the first and last line for compactness.
  await docs.documents.batchUpdate({
    documentId: fileId,
    requestBody: {
      requests: [
        {
          updateTextStyle: {
            textStyle: {
              fontSize: {
                magnitude: 11,
                unit: 'PT'
              },
              weightedFontFamily: {
                fontFamily: 'Calibri'
              }
            },
            range: {
              segmentId: headerId,
              startIndex: 0,
              endIndex: 1
            },
            fields: 'fontSize,weightedFontFamily'
          }
        },
        {
          insertTable: {
            columns: 4,
            rows: 3,
            location: {
              segmentId: headerId,
              index: 0
            }
          }
        },
        {
          updateTextStyle: {
            textStyle: {
              fontSize: {
                magnitude: 6,
                unit: 'PT'
              }
            },
            range: {
              segmentId: headerId,
              startIndex: 1,
              endIndex: 2
            },
            fields: 'fontSize'
          }
        },
        {
          updateTextStyle: {
            textStyle: {
              fontSize: {
                magnitude: 6,
                unit: 'PT'
              }
            },
            range: {
              segmentId: headerId,
              startIndex: 30,
              endIndex: 31
            },
            fields: 'fontSize'
          }
        },
      ]
    }
  });

  document = await docs.documents.get({documentId: fileId});

  await docs.documents.batchUpdate({
    documentId: fileId,
    requestBody: {
      requests: [
        {
          mergeTableCells: {
            tableRange: {
              columnSpan: 4,
              rowSpan: 1,
              tableCellLocation: {
                columnIndex: 0,
                rowIndex: 1,
                tableStartLocation: {
                  segmentId: headerId,
                  index: 1
                }
              }
            }
          }
        },
        {
          mergeTableCells: {
            tableRange: {
              columnSpan: 4,
              rowSpan: 1,
              tableCellLocation: {
                columnIndex: 0,
                rowIndex: 2,
                tableStartLocation: {
                  segmentId: headerId,
                  index: 1
                }
              }
            }
          }
        },
        {
          updateTableCellStyle: {
            tableCellStyle: {
              contentAlignment: "MIDDLE",
              paddingLeft: {
                magnitude: 2,
                unit: 'PT'
              },
              paddingRight: {
                magnitude: 2,
                unit: 'PT'
              },
              paddingTop: {
                magnitude: 2,
                unit: 'PT'
              },
              paddingBottom: {
                magnitude: 2,
                unit: 'PT'
              },
            },
            tableRange: {
              columnSpan: 4,
              rowSpan: 3,
              tableCellLocation: {
                tableStartLocation: {
                  segmentId: headerId,
                  index: 1
                }
              }
            },
            fields: 'contentAlignment,paddingLeft,paddingRight,paddingTop,paddingBottom'
          }
        },
        {
          updateTableColumnProperties: {
            tableColumnProperties: {
              width: {
                magnitude: (1.5*72),
                unit: "PT"
              },
              widthType: "FIXED_WIDTH"
            },
            fields: 'width,widthType',
            columnIndices: [0],
            tableStartLocation: {
              segmentId: headerId,
              index: 1
            }
          }
        },
        {
          updateTableColumnProperties: {
            tableColumnProperties: {
              width: {
                magnitude: (3*72),
                unit: "PT"
              },
              widthType: "FIXED_WIDTH"
            },
            fields: 'width,widthType',
            columnIndices: [1],
            tableStartLocation: {
              segmentId: headerId,
              index: 1
            }
          }
        },
        {
          updateTableColumnProperties: {
            tableColumnProperties: {
              width: {
                magnitude: (1*72),
                unit: "PT"
              },
              widthType: "FIXED_WIDTH"
            },
            fields: 'width,widthType',
            columnIndices: [2,3],
            tableStartLocation: {
              segmentId: headerId,
              index: 1
            }
          }
        },
        {
          updateTableRowStyle: {
            tableRowStyle: {
              minRowHeight: {
                magnitude: 0,
                unit: 'PT'
              }
            },
            fields: 'minRowHeight',
            rowIndices: [0,1,2],
            tableStartLocation: {
              segmentId: headerId,
              index: 1
            }
          }
        },
        {
          updateTextStyle: {
            textStyle: {
              smallCaps: true,
              fontSize: {
                magnitude: 14,
                unit: 'PT'
              },
              bold: true
            },
            fields: "smallCaps,fontSize,bold",
            range: {
              segmentId: headerId,
              startIndex: document.data.headers[headerId].content.filter((e:Object) => e.hasOwnProperty('table'))[0].table.tableRows[0].tableCells[1].startIndex,
              endIndex: document.data.headers[headerId].content.filter((e:Object) => e.hasOwnProperty('table'))[0].table.tableRows[0].tableCells[1].endIndex
            },
          }
        },
        {
          updateParagraphStyle: {
            paragraphStyle: {
              alignment: "CENTER"
            },
            fields: "alignment",
            range: {
              segmentId: headerId,
              startIndex: document.data.headers[headerId].content.filter((e:Object) => e.hasOwnProperty('table'))[0].table.tableRows[0].tableCells[0].startIndex,
              endIndex: document.data.headers[headerId].content.filter((e:Object) => e.hasOwnProperty('table'))[0].table.tableRows[0].tableCells[3].endIndex
            },
          }
        },
        {
          insertText: {
            text: "Owning Department: Operations",
            location: {
              segmentId: headerId,
              index: document.data.headers[headerId].content.filter((e:Object) => e.hasOwnProperty('table'))[0].table.tableRows[2].tableCells[0].startIndex+1
            }
          }
        },
        {
          updateTextStyle: {
            textStyle: {
              bold: true
            },
            fields: "bold",
            range: {
              segmentId: headerId,
              startIndex: document.data.headers[headerId].content.filter((e:Object) => e.hasOwnProperty('table'))[0].table.tableRows[2].tableCells[0].startIndex+1,
              endIndex: document.data.headers[headerId].content.filter((e:Object) => e.hasOwnProperty('table'))[0].table.tableRows[2].tableCells[0].startIndex+19
            },
          }
        },
        {
          insertText: {
            text: "Title: Study Plan Form",
            location: {
              segmentId: headerId,
              index: document.data.headers[headerId].content.filter((e:Object) => e.hasOwnProperty('table'))[0].table.tableRows[1].tableCells[0].startIndex+1
            }
          }
        },
        {
          updateTextStyle: {
            textStyle: {
              bold: true
            },
            fields: "bold",
            range: {
              segmentId: headerId,
              startIndex: document.data.headers[headerId].content.filter((e:Object) => e.hasOwnProperty('table'))[0].table.tableRows[1].tableCells[0].startIndex+1,
              endIndex: document.data.headers[headerId].content.filter((e:Object) => e.hasOwnProperty('table'))[0].table.tableRows[1].tableCells[0].startIndex+7
            },
          }
        },
        {
          insertText: {
            text: "Effective Date\nMM/DD/YYYY",
            location: {
              segmentId: headerId,
              index: document.data.headers[headerId].content.filter((e:Object) => e.hasOwnProperty('table'))[0].table.tableRows[0].tableCells[3].startIndex+1
            }
          }
        },
        {
          updateTextStyle: {
            textStyle: {
              bold: true
            },
            fields: "bold",
            range: {
              segmentId: headerId,
              startIndex: document.data.headers[headerId].content.filter((e:Object) => e.hasOwnProperty('table'))[0].table.tableRows[0].tableCells[3].startIndex+1,
              endIndex: document.data.headers[headerId].content.filter((e:Object) => e.hasOwnProperty('table'))[0].table.tableRows[0].tableCells[3].startIndex+15
            },
          }
        },
        {
          insertText: {
            text: "Document No.\nF-OP-XXX",
            location: {
              segmentId: headerId,
              index: document.data.headers[headerId].content.filter((e:Object) => e.hasOwnProperty('table'))[0].table.tableRows[0].tableCells[2].startIndex+1
            }
          }
        },
        {
          updateTextStyle: {
            textStyle: {
              bold: true
            },
            fields: "bold",
            range: {
              segmentId: headerId,
              startIndex: document.data.headers[headerId].content.filter((e:Object) => e.hasOwnProperty('table'))[0].table.tableRows[0].tableCells[2].startIndex+1,
              endIndex: document.data.headers[headerId].content.filter((e:Object) => e.hasOwnProperty('table'))[0].table.tableRows[0].tableCells[2].startIndex+13
            },
          }
        },
        {
          insertText: {
            text: "Form",
            location: {
              segmentId: headerId,
              index: document.data.headers[headerId].content.filter((e:Object) => e.hasOwnProperty('table'))[0].table.tableRows[0].tableCells[1].startIndex+1
            }
          }
        },
        {
          insertInlineImage: {
            uri: "https://ops.biosiminnovations.com/documentBranding.png",
            objectSize: {
              width: {
                magnitude: (1.3*72),
                unit: 'PT'
              }
            },
            location: {
              segmentId: headerId,
              index: document.data.headers[headerId].content.filter((e:Object) => e.hasOwnProperty('table'))[0].table.tableRows[0].tableCells[0].startIndex+1
            }
          }
        },
      ]
    }
  });


}

export async function buildFormFooter (fileId:string, auth:any) {
  const docs = google.docs({ version: 'v1', auth });
  let document = await docs.documents.get({ documentId: fileId });
  const footerId = Object.keys(document.data.footers)[0];

  // Set font in footer.
  // Insert table in document footer.
  // Set top border on table cell.
  await docs.documents.batchUpdate({
    documentId: fileId,
    requestBody: {
      requests: [
        {
          updateTextStyle: {
            textStyle: {
              fontSize: {
                magnitude: 6,
                unit: 'PT'
              },
              weightedFontFamily: {
                fontFamily: 'Calibri'
              }
            },
            range: {
              segmentId: footerId,
              startIndex: 0,
              endIndex: 1
            },
            fields: 'fontSize,weightedFontFamily'
          }
        },
        {
          insertTable: {
            columns: 1,
            rows: 1,
            location: {
              segmentId: footerId,
              index: 0
            }
          }
        },
        {
          updateTableCellStyle: {
            tableCellStyle: {
              contentAlignment: "TOP",
              paddingLeft: {
                magnitude: 0,
                unit: 'PT'
              },
              paddingRight: {
                magnitude: 2,
                unit: 'PT'
              },
              paddingTop: {
                magnitude: 2,
                unit: 'PT'
              },
              paddingBottom: {
                magnitude: 2,
                unit: 'PT'
              },
              borderTop: {
                width: {
                  magnitude: 1,
                  unit: 'PT'
                },
                color: {
                  color: {
                    rgbColor: {
                      red: 0,
                      green: 0,
                      blue: 0
                    }
                  }
                },
                dashStyle: 'SOLID'
              },
              borderRight: {
                width: {
                  magnitude: 0,
                  unit: 'PT'
                },
                color: {
                  color: {
                    rgbColor: {
                      red: 0,
                      green: 0,
                      blue: 0
                    }
                  }
                },
                dashStyle: 'SOLID'
              },
              borderBottom: {
                width: {
                  magnitude: 0,
                  unit: 'PT'
                },
                color: {
                  color: {
                    rgbColor: {
                      red: 0,
                      green: 0,
                      blue: 0
                    }
                  }
                },
                dashStyle: 'SOLID'
              },
              borderLeft: {
                width: {
                  magnitude: 0,
                  unit: 'PT'
                },
                color: {
                  color: {
                    rgbColor: {
                      red: 0,
                      green: 0,
                      blue: 0
                    }
                  }
                },
                dashStyle: 'SOLID'
              }
            },
            tableRange: {
              columnSpan: 1,
              rowSpan: 1,
              tableCellLocation: {
                tableStartLocation: {
                  index: 1,
                  segmentId: footerId
                }
              }
            },
            fields: 'contentAlignment,paddingLeft,paddingRight,paddingTop,paddingBottom,borderTop,borderRight,borderBottom,borderLeft'
          }
        },
      ]
    }
  });

  document = await docs.documents.get({documentId: fileId});

  // Insert content.
  await docs.documents.batchUpdate({
    documentId: fileId,
    requestBody: {
      requests: [
        {
          insertText: {
            text: 'Confidential',
            location: {
              segmentId: footerId,
              index: document.data.footers[footerId].content.filter((e:Object) => e.hasOwnProperty('table'))[0].table.tableRows[0].tableCells[0].startIndex+1
            }
          }
        },
      ]
    }
  });

}

export async function buildFormGeneralInfo (fileId:string, auth:any, studyId:string, study: any) {
  // Retrieve document for editing.
  const docs = google.docs({ version: 'v1', auth });
  let document = await docs.documents.get({ documentId: fileId });
  let insertionIndex = document.data.body.content[document.data.body.content.length-1].endIndex-1;

  // Create table for general info.
  await docs.documents.batchUpdate({
    documentId: fileId,
    requestBody: {
      requests: [
        {
          insertTable: {
            columns: 4,
            rows: 1,
            location: {
              index: insertionIndex
            }
          }
        }
      ]
    }
  });

  // Shrink text size on previous line for compactness.
  // Modify padding in table for compactness.
  // Paint the first column grey.
  // Paint the third column grey.
  await docs.documents.batchUpdate({
    documentId: fileId,
    requestBody: {
      requests: [
        {
          updateTextStyle: {
            textStyle: {
              fontSize: {
                magnitude: 6,
                unit: 'PT'
              }
            },
            range: {
              startIndex: insertionIndex,
              endIndex: insertionIndex+1
            },
            fields: 'fontSize'
          }
        },
        {
          updateTableCellStyle: {
            tableCellStyle: {
              contentAlignment: "TOP",
              paddingLeft: {
                magnitude: 2,
                unit: 'PT'
              },
              paddingRight: {
                magnitude: 2,
                unit: 'PT'
              },
              paddingTop: {
                magnitude: 2,
                unit: 'PT'
              },
              paddingBottom: {
                magnitude: 2,
                unit: 'PT'
              },
            },
            tableRange: {
              columnSpan: 4,
              rowSpan: 1,
              tableCellLocation: {
                tableStartLocation: {
                  index: insertionIndex+1
                }
              }
            },
            fields: 'contentAlignment,paddingLeft,paddingRight,paddingTop,paddingBottom'
          }
        },
        {
          updateTableCellStyle: {
            tableCellStyle: {
              backgroundColor: {
                color: {
                  rgbColor: {
                    red: (217/255),
                    green: (217/255),
                    blue: (217/255)
                  }
                }
              }
            },
            tableRange: {
              columnSpan: 1,
              rowSpan: 1,
              tableCellLocation: {
                columnIndex: 0,
                rowIndex: 0,
                tableStartLocation: {
                  index: insertionIndex+1
                }
              }
            },
            fields: 'backgroundColor'
          }
        },
        {
          updateTableCellStyle: {
            tableCellStyle: {
              backgroundColor: {
                color: {
                  rgbColor: {
                    red: (217/255),
                    green: (217/255),
                    blue: (217/255)
                  }
                }
              }
            },
            tableRange: {
              columnSpan: 1,
              rowSpan: 1,
              tableCellLocation: {
                columnIndex: 2,
                rowIndex: 0,
                tableStartLocation: {
                  index: insertionIndex+1
                }
              }
            },
            fields: 'backgroundColor'
          }
        },
        {
          updateTableColumnProperties: {
            tableColumnProperties: {
              width: {
                magnitude: (1.5*72),
                unit: "PT"
              },
              widthType: "FIXED_WIDTH"
            },
            fields: 'width,widthType',
            columnIndices: [0,2],
            tableStartLocation: {
              index: insertionIndex+1
            },
          }
        },
        {
          updateTableColumnProperties: {
            tableColumnProperties: {
              width: {
                magnitude: (1.75*72),
                unit: "PT"
              },
              widthType: "FIXED_WIDTH"
            },
            fields: 'width,widthType',
            columnIndices: [1,3],
            tableStartLocation: {
              index: insertionIndex+1
            },
          }
        },
      ]
    }
  });

  document = await docs.documents.get({documentId: fileId});

  // Insert titles.
  await docs.documents.batchUpdate({
    documentId: fileId,
    requestBody: {
      requests: [
        {
          insertText: {
            text: '(TBD)',
            location: {
              index: document.data.body.content.filter((e:Object) => e.hasOwnProperty('table'))[document.data.body.content.filter((e:Object) => e.hasOwnProperty('table')).length-1].table.tableRows[0].tableCells[3].startIndex+1
            }
          }
        },
        {
          insertText: {
            text: "Study Director",
            location: {
              index: document.data.body.content.filter((e:Object) => e.hasOwnProperty('table'))[document.data.body.content.filter((e:Object) => e.hasOwnProperty('table')).length-1].table.tableRows[0].tableCells[2].startIndex+1
            }
          }
        },
        {
          updateTextStyle: {
            textStyle: {
              bold: true
            },
            fields: "bold",
            range: {
              startIndex: document.data.body.content.filter((e:Object) => e.hasOwnProperty('table'))[document.data.body.content.filter((e:Object) => e.hasOwnProperty('table')).length-1].table.tableRows[0].tableCells[2].startIndex+1,
              endIndex: document.data.body.content.filter((e:Object) => e.hasOwnProperty('table'))[document.data.body.content.filter((e:Object) => e.hasOwnProperty('table')).length-1].table.tableRows[0].tableCells[2].startIndex+1+14
            },
          }
        },
        {
          insertText: {
            text: studyId,
            location: {
              index: document.data.body.content.filter((e:Object) => e.hasOwnProperty('table'))[document.data.body.content.filter((e:Object) => e.hasOwnProperty('table')).length-1].table.tableRows[0].tableCells[1].startIndex+1
            }
          }
        },
        {
          insertText: {
            text: "Study ID",
            location: {
              index: document.data.body.content.filter((e:Object) => e.hasOwnProperty('table'))[document.data.body.content.filter((e:Object) => e.hasOwnProperty('table')).length-1].table.tableRows[0].tableCells[0].startIndex+1
            }
          }
        },
        {
          updateTextStyle: {
            textStyle: {
              bold: true
            },
            fields: "bold",
            range: {
              startIndex: document.data.body.content.filter((e:Object) => e.hasOwnProperty('table'))[document.data.body.content.filter((e:Object) => e.hasOwnProperty('table')).length-1].table.tableRows[0].tableCells[0].startIndex+1,
              endIndex: document.data.body.content.filter((e:Object) => e.hasOwnProperty('table'))[document.data.body.content.filter((e:Object) => e.hasOwnProperty('table')).length-1].table.tableRows[0].tableCells[0].startIndex+1+8
            },
          }
        },
      ]
    }
  });


}

export async function buildFormSection (fileId: string, auth: any, section: any) {
  // Retrieve document for editing.
  const docs = google.docs({ version: 'v1', auth });
  let document = await docs.documents.get({ documentId: fileId });
  // Gather metrics for section creation.
  let insertionIndex = document.data.body.content[document.data.body.content.length-1].endIndex-1;
  const numberOfRows = section.rows.length+1;
  let numberOfColumns = 1;
  for (let row of section.rows) if (row.fields.length > numberOfColumns) numberOfColumns = row.fields.length;

  // Create table for section.
  await docs.documents.batchUpdate({
    documentId: fileId,
    requestBody: {
      requests: [
        {
          insertTable: {
            columns: numberOfColumns,
            rows: numberOfRows,
            location: {
              index: insertionIndex
            }
          }
        }
      ]
    }
  });

  // Shrink text size on previous line for compactness.
  // Modify padding in table for compactness.
  // Paint the first row grey.
  await docs.documents.batchUpdate({
    documentId: fileId,
    requestBody: {
      requests: [
        {
          updateTextStyle: {
            textStyle: {
              fontSize: {
                magnitude: 6,
                unit: 'PT'
              }
            },
            range: {
              startIndex: insertionIndex,
              endIndex: insertionIndex+1
            },
            fields: 'fontSize'
          }
        },
        {
          updateTableCellStyle: {
            tableCellStyle: {
              contentAlignment: "TOP",
              paddingLeft: {
                magnitude: 2,
                unit: 'PT'
              },
              paddingRight: {
                magnitude: 2,
                unit: 'PT'
              },
              paddingTop: {
                magnitude: 2,
                unit: 'PT'
              },
              paddingBottom: {
                magnitude: 2,
                unit: 'PT'
              },
            },
            tableRange: {
              columnSpan: numberOfColumns,
              rowSpan: numberOfRows,
              tableCellLocation: {
                tableStartLocation: {
                  index: insertionIndex+1
                }
              }
            },
            fields: 'contentAlignment,paddingLeft,paddingRight,paddingTop,paddingBottom'
          }
        },
        {
          updateTableCellStyle: {
            tableCellStyle: {
              backgroundColor: {
                color: {
                  rgbColor: {
                    red: (217/255),
                    green: (217/255),
                    blue: (217/255)
                  }
                }
              }
            },
            tableRange: {
              columnSpan: 1,
              rowSpan: 1,
              tableCellLocation: {
                tableStartLocation: {
                  index: insertionIndex+1
                }
              }
            },
            fields: 'backgroundColor'
          }
        },
      ]
    }
  });

  // If necessary, merge the columns of the first row.
  // If necessary, paint the first column of non-first rows grey.
  // If necessary, set the width of the first column of non-first rows to 1.5in.
  if (numberOfColumns > 1) {
    await docs.documents.batchUpdate({
      documentId: fileId,
      requestBody: {
        requests: [
          {
            mergeTableCells: {
              tableRange: {
                columnSpan: numberOfColumns,
                rowSpan: 1,
                tableCellLocation: {
                  columnIndex: 0,
                  rowIndex: 0,
                  tableStartLocation: {
                    index: insertionIndex+1
                  }
                }
              }
            }
          },
          {
            updateTableCellStyle: {
              tableCellStyle: {
                backgroundColor: {
                  color: {
                    rgbColor: {
                      red: (217/255),
                      green: (217/255),
                      blue: (217/255)
                    }
                  }
                },
              },
              tableRange: {
                columnSpan: 1,
                rowSpan: numberOfRows-1,
                tableCellLocation: {
                  tableStartLocation: {
                    index: insertionIndex+1
                  },
                  columnIndex: 0,
                  rowIndex: 1
                }
              },
              fields: 'backgroundColor'
            }
          },
          {
            updateTableColumnProperties: {
              tableColumnProperties: {
                width: {
                  magnitude: (1.5*72),
                  unit: "PT"
                },
                widthType: "FIXED_WIDTH"
              },
              fields: 'width,widthType',
              columnIndices: [0],
              tableStartLocation: {
                index: insertionIndex+1
              },
            }
          },
        ]
      }
    });
  }

  document = await docs.documents.get({documentId: fileId});

  // Insert section titles.
  await docs.documents.batchUpdate({
    documentId: fileId,
    requestBody: {
      requests: [
        {
          insertText: {
            text: section.name,
            location: {
              index: document.data.body.content.filter((e:Object) => e.hasOwnProperty('table'))[document.data.body.content.filter((e:Object) => e.hasOwnProperty('table')).length-1].table.tableRows[0].tableCells[0].startIndex+1
            }
          }
        },
        {
          updateTextStyle: {
            textStyle: {
              bold: true
            },
            fields: "bold",
            range: {
              startIndex: document.data.body.content.filter((e:Object) => e.hasOwnProperty('table'))[document.data.body.content.filter((e:Object) => e.hasOwnProperty('table')).length-1].table.tableRows[0].tableCells[0].startIndex+1,
              endIndex: document.data.body.content.filter((e:Object) => e.hasOwnProperty('table'))[document.data.body.content.filter((e:Object) => e.hasOwnProperty('table')).length-1].table.tableRows[0].tableCells[0].startIndex+1+section.name.length
            },
          }
        },
      ]
    }
  });

  // Insert section data.
  for (let rowIndex = 0; rowIndex < section.rows.length; rowIndex++) {
    const row = section.rows[rowIndex];
    for (let fieldIndex=0; fieldIndex < row.fields.length; fieldIndex++) {
      const field = row.fields[fieldIndex];
      document = await docs.documents.get({documentId: fileId});
      const fieldInsertionIndex = document.data.body.content.filter((e:Object) => e.hasOwnProperty('table'))[document.data.body.content.filter((e:Object) => e.hasOwnProperty('table')).length-1].table.tableRows[1+rowIndex].tableCells[fieldIndex].startIndex+1;
      console.log(`Adding row ${rowIndex}, field ${fieldIndex} at position ${fieldInsertionIndex}...`);

      let cellText = '';
      switch (field.type) {
        case 'label':
          cellText = field.params[0];
          if (row.extensible) {
            cellText += ` ${row.index+1}`;
          }
          break;
        case 'input':
          cellText = field.data[0];
          break;
        case 'textarea':
          cellText = field.data[0];
          break;
        case 'checkbox':
          cellText = `${ field.data[0] === true ? '☒' : '☐' } ${ field.params[0] }`;
          break;
        case 'multicheckbox':
          for (let i = 0; i < field.data.length; i++) {
            cellText += `${ field.data[i] === true ? '☒' : '☐' } ${ field.params[i] }`;
            if (i < field.data.length-1) cellText += '\n';
          }
          break;
        default:
          break; 
      }

      if (cellText !== '') {
        await docs.documents.batchUpdate({
          documentId: fileId,
          requestBody: {
            requests: [
              {
                insertText: {
                  text: cellText,
                  location: {
                    index: fieldInsertionIndex
                  }
                }
              },
            ]
          }
        });
      }
    };
  };

  document = await docs.documents.get({documentId: fileId});
  // console.log(JSON.stringify(document.data));
  console.log(document.data.body.content[document.data.body.content.length-1].endIndex);

}