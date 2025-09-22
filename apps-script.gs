// ====== Configure these ======
const SPREADSHEET_ID = '1XaRrwasutKZFvkNnEkLtsXWfIxe-pBD1MyQek-ElUYs';
const SHEET_NAME = 'Entries';
const API_KEY = '1QnI2H56tNySDZjLAKsiAAvkp7RzzvAUnfs-Hcsf6Z4S1PLgX5_HXTkQk'; // must match client

// ====== Helpers ======
function sheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  // Ensure headers
  if (sh.getLastRow() === 0) {
    sh.appendRow(['Timestamp', 'LocalId', 'ClientId', 'Title', 'Note']);
  }
  return sh;
}

function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doGet(e) {
  const params = e.parameter || {};
  const action = params.action || 'health';
  
  if (action === 'health') {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: true, time: new Date().toISOString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'list') {
    const sh = sheet();
    const last = Math.min(200, Math.max(0, Number(params.limit || 100)));
    const lr = sh.getLastRow();
    const data = lr > 1 ? sh.getRange(Math.max(2, lr - last + 1), 1, Math.min(last, lr - 1), 5).getValues() : [];
    const rows = data.map(r => ({ timestamp: r[0], localId: r[1], clientId: r[2], title: r[3], note: r[4] }));
    return ContentService.createTextOutput(JSON.stringify({ rows }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(
    JSON.stringify({ ok: false, error: 'unknown action' })
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const headers = e.headers || {};
    const key = headers['X-Api-Key'] || headers['x-api-key'] || '';
    if (API_KEY && key !== API_KEY) {
      return ContentService.createTextOutput(
        JSON.stringify({ ok: false, error: 'unauthorized' })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const params = e.parameter || {};
    const action = params.action || 'append';
    const body = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};

    if (action === 'append') {
      const ops = body.ops || [];
      if (!Array.isArray(ops) || !ops.length) throw new Error('no ops');
      const sh = sheet();
      const now = new Date();
      const rows = ops.map(op => [new Date(op.payload.createdAt || now), op.payload.id, op.payload.clientId, op.payload.title || '', op.payload.note || '']);
      if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
      // Return the inserted row numbers so client can mark "synced"
      const startRow = sh.getLastRow() - rows.length + 1;
      const results = ops.map((op, i) => ({ localId: op.payload.id, row: startRow + i }));
      return ContentService.createTextOutput(
        JSON.stringify({ ok: true, results })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: 'unknown action' })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
