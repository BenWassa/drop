# Quick Start Local Server for Mobile Testing

## Method 1: Python (Recommended - Fast & Simple)

### If you have Python 3:
```powershell
cd docs
python -m http.server 8000
```

Then on your Pixel 8, open browser and go to:
```
http://YOUR_PC_IP:8000
```

To find your PC's IP address:
```powershell
ipconfig
# Look for "IPv4 Address" under your active network adapter (usually starts with 192.168.x.x)
```

---

## Method 2: Node.js (If you have Node installed)

### Install http-server globally (one-time):
```powershell
npm install -g http-server
```

### Then run from docs folder:
```powershell
cd docs
http-server -p 8000
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

Copy this into a file called `start-dev-server.ps1` in your drop folder:

```powershell
# Start development server for mobile testing
Write-Host "Starting development server..." -ForegroundColor Green

# Get local IP
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*"}).IPAddress | Select-Object -First 1

Write-Host "
═══════════════════════════════════════════════
  Drop Development Server
═══════════════════════════════════════════════

  Local:   http://localhost:8000
  Mobile:  http://$ip:8000

  Press Ctrl+C to stop
═══════════════════════════════════════════════
" -ForegroundColor Cyan

# Start server
Set-Location docs
python -m http.server 8000
```

Then run:
```powershell
.\start-dev-server.ps1
```
