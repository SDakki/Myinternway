$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add('http://localhost:4173/')

try {
  $listener.Start()
  Write-Host 'MyInternWay disponible en http://localhost:4173'
  Write-Host 'Pulsa Ctrl+C para detener el servidor.'

  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $relativePath = $context.Request.Url.AbsolutePath.TrimStart('/')
    if ([string]::IsNullOrWhiteSpace($relativePath)) { $relativePath = 'index.html' }
    $filePath = Join-Path $root ([Uri]::UnescapeDataString($relativePath))

    if (-not (Test-Path $filePath -PathType Leaf)) {
      $context.Response.StatusCode = 404
      $context.Response.Close()
      continue
    }

    $contentTypes = @{
      '.css' = 'text/css; charset=utf-8'
      '.html' = 'text/html; charset=utf-8'
      '.js' = 'text/javascript; charset=utf-8'
      '.json' = 'application/json; charset=utf-8'
      '.svg' = 'image/svg+xml'
    }
    $extension = [IO.Path]::GetExtension($filePath).ToLowerInvariant()
    $context.Response.ContentType = if ($contentTypes.ContainsKey($extension)) { $contentTypes[$extension] } else { 'application/octet-stream' }
    $bytes = [IO.File]::ReadAllBytes($filePath)
    $context.Response.ContentLength64 = $bytes.Length
    $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $context.Response.Close()
  }
}
finally {
  $listener.Stop()
  $listener.Close()
}