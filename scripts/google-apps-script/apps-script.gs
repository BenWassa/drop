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
    // The sheet where you want to save the data
    var sh = sheet();
    
    // Parse the JSON data sent from the app
    var data = JSON.parse(e.postData.contents);
    var clientId = data.clientId;
    var ops = data.ops; // ops is the array you are sending

    var results = [];

    // Loop through the operations and append rows to the sheet
    for (var i = 0; i < ops.length; i++) {
      var op = ops[i];
      // Append a row. Adjust the columns as needed to match headers.
      sh.appendRow([
        new Date(), // Timestamp
        op.id, // LocalId
        clientId, // ClientId
        op.date,
        op.domain,
        op.aspect,
        op.completed,
        op.streak,
        op.type || 'practice',
        op.mood || '',
        op.note || ''
      ]);
      
      results.push({
        localId: op.id,
        row: sh.getLastRow() // Send back the new row number
      });
    }
    
    // Return a success response with the results
    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", results: results }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Return an error response
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
