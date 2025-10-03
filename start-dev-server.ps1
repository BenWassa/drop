# Start development server for mobile testing
Write-Host "Starting development server..." -ForegroundColor Green

# Get local IP
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*"}).IPAddress | Select-Object -First 1

if (-not $ip) {
    Write-Host "Could not find local IP address. Using localhost only." -ForegroundColor Yellow
    $ip = "localhost"
}

Write-Host "
═══════════════════════════════════════════════
  Drop Development Server
═══════════════════════════════════════════════

  Local:   http://localhost:8000
  Mobile:  http://${ip}:8000

  Open the Mobile URL on your Pixel 8
  (Make sure both devices are on same WiFi)

  Press Ctrl+C to stop
═══════════════════════════════════════════════
" -ForegroundColor Cyan

# Start server
Set-Location docs
python -m http.server 8000
