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

  Local:   http://localhost:8080
  Mobile:  http://${ip}:8080

  Open the Mobile URL on your Pixel 8
  (Make sure both devices are on same WiFi)

  Press Ctrl+C to stop
═══════════════════════════════════════════════
" -ForegroundColor Cyan

# Check if http-server is installed
$httpServerInstalled = $null
try {
    $httpServerInstalled = &npm.cmd list -g http-server 2>$null
} catch {
    $httpServerInstalled = $null
}

if (-not $httpServerInstalled -or $httpServerInstalled -notmatch "http-server@") {
    Write-Host "Installing http-server globally..." -ForegroundColor Yellow
    &npm.cmd install -g http-server
}

# Start server from docs directory
Set-Location docs
&npx.cmd http-server -p 8080 -c-1
