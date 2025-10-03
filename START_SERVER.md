# Quick Start Local Server for Mobile Testing

## Easiest Method: Use the Provided Script

```powershell
.\start-dev-server.ps1
```

This will automatically:
- Install http-server if needed (using npm)
- Show your local IP address
- Start the server on port 8080
- Display the mobile URL to use on your Pixel 8

---

## Method 1: Node.js / NPM (Recommended)

### Using npx (no installation needed):
```powershell
cd docs
&npx.cmd http-server -p 8080 -c-1
```

### Or install globally first:
```powershell
&npm.cmd install -g http-server
cd docs
&npx.cmd http-server -p 8080 -c-1
```

Then on your Pixel 8, open browser and go to:
```
http://YOUR_PC_IP:8080
```

The `-c-1` flag disables caching for development.

---

## Method 2: Python (Alternative)

### If you have Python 3:
```powershell
cd docs
python -m http.server 8000
```

Access at: `http://YOUR_PC_IP:8000`

---

## Method 3: PHP (If you have PHP installed)

```powershell
cd docs
php -S 0.0.0.0:8000
```

Access at: `http://YOUR_PC_IP:8000`

---

## Method 4: VS Code Live Server Extension

1. Install "Live Server" extension in VS Code
2. Right-click on `docs/index.html`
3. Select "Open with Live Server"
4. Access at: `http://YOUR_PC_IP:5500`

---

## Finding Your PC's Local IP Address

### Windows PowerShell:
```powershell
(Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*"}).IPAddress
```

### Or simple command:
```powershell
ipconfig | findstr /i "IPv4"
```

Look for something like: `192.168.1.x` or `192.168.0.x`

---

## Testing on Your Pixel 8

1. Make sure your Pixel and PC are on the **same Wi-Fi network**
2. Start server on PC (using any method above)
3. Find your PC's IP address (e.g., `192.168.1.100`)
4. On your Pixel, open Chrome and go to: `http://192.168.1.100:8000`

---

## Troubleshooting

### Can't connect from phone?
- **Windows Firewall**: May need to allow port 8000
  ```powershell
  New-NetFirewallRule -DisplayName "HTTP Dev Server" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
  ```

- **Same Network**: Ensure both devices are on the same Wi-Fi
- **IP Address**: Double-check the IP address is correct
- **Port**: Make sure the port number matches (8000 or 5500)

### App not loading properly?
- **Hard Refresh**: On mobile Chrome, tap menu → Settings → Clear browsing data
- **Service Worker**: Go to `chrome://serviceworker-internals/` and unregister old workers
- **Cache**: Clear cache in Dev Tools (Chrome on desktop while debugging)

---

## Quick Test Script (PowerShell)

The provided `start-dev-server.ps1` script handles everything:

```powershell
# Start development server for mobile testing
Write-Host "Starting development server..." -ForegroundColor Green

# Get local IP
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*"}).IPAddress | Select-Object -First 1

Write-Host "
═══════════════════════════════════════════════
  Drop Development Server
═══════════════════════════════════════════════

  Local:   http://localhost:8080
  Mobile:  http://$ip:8080

  Press Ctrl+C to stop
═══════════════════════════════════════════════
" -ForegroundColor Cyan

# Auto-install http-server if needed
if (-not (npm list -g http-server)) {
    &npm.cmd install -g http-server
}

# Start server
Set-Location docs
&npx.cmd http-server -p 8080 -c-1
```

Just run:
```powershell
.\start-dev-server.ps1
```
