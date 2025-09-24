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

// Allowed origin(s) for CORS. Update for production to your site origin(s).
// Use '*' with caution; better to list explicit origins.
const ALLOWED_ORIGINS = [
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'https://script.google.com' // keep script origin as a fallback
];

function _getRequestOrigin(e) {
  try {
    // The origin can be in headers (from fetch) or the Referer param
    if (e && e.postData && e.postData.type === 'application/json' && e.parameter && e.parameter.origin) {
      return e.parameter.origin;
    }
  } catch (e) {}
  try { return (e && e.headers && e.headers.Origin) || (e && e.headers && e.headers.origin); } catch (ex) {}
  try { return (e && e.parameter && e.parameter.origin) || null; } catch (ex) {}
  return null;
}

function _chooseAllowedOrigin(requestOrigin) {
  if (!requestOrigin) return ALLOWED_ORIGINS[0] || '*';
  if (ALLOWED_ORIGINS.indexOf(requestOrigin) !== -1) return requestOrigin;
  // Not explicitly allowed — fall back to first allowed origin
  return ALLOWED_ORIGINS[0] || '*';
}

function _applyCorsHeaders(output, requestOrigin) {
  try {
    const origin = _chooseAllowedOrigin(requestOrigin);
    // Many GAS TextOutput objects don't support appendHeader; attempt when available.
    if (typeof output.appendHeader === 'function') {
      output.appendHeader('Access-Control-Allow-Origin', origin);
      output.appendHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      output.appendHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, X-Api-Key, X-Client-ID');
      output.appendHeader('Access-Control-Allow-Credentials', 'true');
    } else {
      // If appendHeader not available, embed a small JSON wrapper that client can use as fallback
      // (Most browsers require proper headers; this fallback is best-effort.)
      // Note: Apps Script generally supports appendHeader on HTTP responses in published web apps.
    }
  } catch (e) {
    // swallow
  }
}

function doOptions(e) {
  var requestOrigin = _getRequestOrigin(e);
  try { Logger.log('doOptions request headers: %s', JSON.stringify(e && e.headers)); } catch (ex) {}
  try { Logger.log('doOptions chosen origin: %s', requestOrigin); } catch (ex) {}
  var out = ContentService.createTextOutput('');
  out.setMimeType(ContentService.MimeType.TEXT);
  _applyCorsHeaders(out, requestOrigin);
  return out;
}

function doGet(e) {
  const params = e.parameter || {};
  const action = params.action || 'health';
  try { Logger.log('doGet request headers: %s', JSON.stringify(e && e.headers)); } catch (ex) {}
  try { Logger.log('doGet chosen origin: %s', _getRequestOrigin(e)); } catch (ex) {}
  
  if (action === 'health') {
    var out = ContentService.createTextOutput(JSON.stringify({ ok: true, time: new Date().toISOString() }));
    out.setMimeType(ContentService.MimeType.JSON);
    _applyCorsHeaders(out, _getRequestOrigin(e));
    return out;
  }
  
  // Debug endpoint: echo request headers and chosen origin for troubleshooting CORS
  if (action === 'debug') {
    var requestOrigin = _getRequestOrigin(e);
    var payload = {
      timestamp: new Date().toISOString(),
      params: e.parameter || {},
      headers: e && e.headers ? e.headers : null,
      chosenOrigin: requestOrigin,
      allowedOrigins: ALLOWED_ORIGINS
    };
    try { Logger.log('debug payload: %s', JSON.stringify(payload)); } catch (ex) {}
    var outDebug = ContentService.createTextOutput(JSON.stringify(payload));
    outDebug.setMimeType(ContentService.MimeType.JSON);
    _applyCorsHeaders(outDebug, requestOrigin);
    return outDebug;
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
    var out = ContentService.createTextOutput(JSON.stringify({ rows }));
    out.setMimeType(ContentService.MimeType.JSON);
    _applyCorsHeaders(out, _getRequestOrigin(e));
    return out;
  }
  
  var out = ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'unknown action' }));
  out.setMimeType(ContentService.MimeType.JSON);
  _applyCorsHeaders(out, _getRequestOrigin(e));
  return out;
}

function doPost(e) {
  try { Logger.log('doPost request headers: %s', JSON.stringify(e && e.headers)); } catch (ex) {}
  try { Logger.log('doPost chosen origin: %s', _getRequestOrigin(e)); } catch (ex) {}
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
      var out = ContentService.createTextOutput(JSON.stringify({ status: "success", results: results }));
      out.setMimeType(ContentService.MimeType.JSON);
      _applyCorsHeaders(out, _getRequestOrigin(e));
      return out;

  } catch (error) {
    // Return an error response
    var out = ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }));
    out.setMimeType(ContentService.MimeType.JSON);
    _applyCorsHeaders(out, _getRequestOrigin(e));
    return out;
  }
}
