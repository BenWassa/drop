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
    sh.appendRow(['Timestamp', 'LocalId', 'ClientId', 'Date', 'Domain', 'Aspect', 'Completed', 'Streak', 'Type', 'Mood', 'Note']);
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
    const data = lr > 1 ? sh.getRange(Math.max(2, lr - last + 1), 1, Math.min(last, lr - 1), 11).getValues() : [];
    const rows = data.map(r => ({
      timestamp: r[0],
      localId: r[1],
      clientId: r[2],
      date: r[3],
      domain: r[4],
      aspect: r[5],
      completed: r[6],
      streak: r[7],
      type: r[8],
      mood: r[9],
      note: r[10]
    }));
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
      const entries = body.entries || [];
      if (!Array.isArray(entries) || !entries.length) throw new Error('no entries');
      const sh = sheet();
      const now = new Date();
      const rows = entries.map(entry => [
        new Date(entry.timestamp || now),
        entry.id,
        entry.clientId,
        entry.date,
        entry.domain || '',
        entry.aspect || '',
        entry.completed || false,
        entry.streak || 0,
        entry.type || 'practice',
        entry.mood || '',
        entry.note || ''
      ]);
      if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
      // Return the inserted row numbers so client can mark "synced"
      const startRow = sh.getLastRow() - rows.length + 1;
      const results = entries.map((entry, i) => ({ localId: entry.id, row: startRow + i }));
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
