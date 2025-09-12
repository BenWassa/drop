// Netlify function: oura-token-proxy.js
// Acts as a tiny secure middleman to exchange Oura authorization codes for tokens.
// The Oura client_id is read from the environment variable VITE_OURA_CLIENT_ID (set in Netlify site settings).

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, body: 'Invalid JSON body' };
  }

  // DEBUG: log payload (safe-ish) and whether CLIENT_ID is available.
  // These logs appear in Netlify's Function logs and help diagnose 400s.
  try {
    console.log('oura-token-proxy: received payload keys =', Object.keys(payload));
    // Log presence of critical fields without printing secrets
    console.log('oura-token-proxy: has code=', !!payload.code, 'code_len=', payload.code ? payload.code.length : 0,
                'has verifier=', !!payload.verifier, 'verifier_len=', payload.verifier ? payload.verifier.length : 0,
                'redirect_uri=', payload.redirect_uri);
  } catch (e) {
    console.log('oura-token-proxy: error logging payload', e && e.message);
  }

  const { code, verifier, redirect_uri } = payload;
  // Get the Client ID from the environment variables for security
  const CLIENT_ID = process.env.VITE_OURA_CLIENT_ID;

  if (!code || !verifier || !CLIENT_ID || !redirect_uri) {
    return { statusCode: 400, body: 'Missing required parameters.' };
  }

  const TOKEN_URL = 'https://api.ouraring.com/oauth/token';

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirect_uri,
    client_id: CLIENT_ID,
    code_verifier: verifier
  });

  try {
    // Log whether the CLIENT_ID is present (don't print the secret itself)
    console.log('oura-token-proxy: CLIENT_ID present=', !!CLIENT_ID);
    // Log the exact body we will send to Oura, but redact the client_id value for safety
    const bodyString = body.toString();
    const redacted = bodyString.replace(/(client_id=)[^&]+/, '$1[REDACTED]');
    console.log('oura-token-proxy: posting to Oura body (redacted)=', redacted);
  } catch (e) {
    console.log('oura-token-proxy: error preparing logs', e && e.message);
  }

  try {
    let response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
    });

    // Read response text and attempt to parse JSON (so we can log raw text on errors)
    let text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch (e) { data = { raw: text }; }

    console.log('oura-token-proxy: Oura token endpoint status=', response.status, 'response=', data);

    if (!response.ok) {
      // If Oura returned 400 Bad Request, try again WITHOUT redirect_uri (some apps are configured with a single redirect)
      if (response.status === 400) {
        try {
          console.log('oura-token-proxy: first attempt 400 — retrying without redirect_uri');
          const bodyNoRedirect = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            client_id: CLIENT_ID,
            code_verifier: verifier
          });

          const retryResp = await fetch(TOKEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: bodyNoRedirect
          });

          const retryText = await retryResp.text();
          let retryData;
          try { retryData = JSON.parse(retryText); } catch (e) { retryData = { raw: retryText }; }
          console.log('oura-token-proxy: retry status=', retryResp.status, 'response=', retryData);

          if (retryResp.ok) {
            return { statusCode: 200, body: JSON.stringify(retryData) };
          }

          // If retry also failed, return the retry response (more recent)
          return { statusCode: retryResp.status, body: JSON.stringify(retryData) };

        } catch (retryErr) {
          console.log('oura-token-proxy: retry error', retryErr && retryErr.message);
          // Fall through to return original error below
        }
      }

      // Forward Oura's original error message
      return { statusCode: response.status, body: JSON.stringify(data) };
    }

    // Success! Return the token data to our front-end app
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
