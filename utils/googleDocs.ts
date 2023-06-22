const {google} = require('googleapis');

export async function createAndSetupDocument (documentName:string, parentFolderId:string, auth:any) {
  
  const drive = google.drive({ version: 'v3', auth });
  const docs = google.docs({ version: 'v1', auth });

  const resource = {
    name: documentName,
    mimeType: 'application/vnd.google-apps.document',
    parents: [parentFolderId]
  };
  const createdFile = await drive.files.create({
    requestBody: resource
  });
  const fileId = createdFile.data.id;

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
  let document = await docs.documents.get({ documentId: fileId });
  console.log(Object.keys(document.data.headers)[0])
  const headerId = Object.keys(document.data.headers)[0];

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
            endOfSegmentLocation: {
              segmentId: headerId
            }
          }
        }
      ]
    }
  });

  document = await docs.documents.get({documentId: fileId});
  console.log(document.data.headers[headerId].content.filter((e:Object) => e.hasOwnProperty('table'))[0].table.tableRows[0].tableCells[1].startIndex);

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