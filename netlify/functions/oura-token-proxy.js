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
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
    });

    const data = await response.json();

    if (!response.ok) {
      // Forward Oura's error message
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
