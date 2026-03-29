# ============================================================
# AGENTE CLAUDE - Ejecutor automatico de cambios
# Uso: powershell -ExecutionPolicy Bypass -File .\agente-claude.ps1
# ============================================================

$PROJECT_PATH = "C:\Users\Jesús\Downloads\cot-dashboard\cot-dashboard"
$VERCEL_TOKEN = "vcp_2xXMVNONeYtjVtG4mt0ml7w3foxqV0yHiynfEmUBH66gr67pk90hgWhH"
$GITHUB_TOKEN = "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"
$GITHUB_USER  = "COTrep"
$REPO_NAME    = "cot-dashboard"

function Write-Ok($msg)    { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Info($msg)  { Write-Host "  [..] $msg" -ForegroundColor Cyan }
function Write-Err($msg)   { Write-Host "  [ERROR] $msg" -ForegroundColor Red }
function Write-Title($msg) { Write-Host "`n$msg" -ForegroundColor Yellow }

function Show-Menu {
    Clear-Host
    Write-Host "============================================" -ForegroundColor Magenta
    Write-Host "      AGENTE CLAUDE - COT Dashboard         " -ForegroundColor Magenta
    Write-Host "============================================" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "  [1] Aplicar cambio de Claude"
    Write-Host "  [2] Hacer deploy a Vercel"
    Write-Host "  [3] Ver errores del build"
    Write-Host "  [4] Abrir en VS Code"
    Write-Host "  [5] Ver URL de produccion"
    Write-Host "  [Q] Salir"
    Write-Host ""
}

function Apply-Patch {
    Write-Title "APLICAR CAMBIO DE CLAUDE"
    Write-Host "  Pega el bloque que te dio Claude."
    Write-Host "  Cuando termines escribe FIN en una linea nueva y pulsa Enter:" -ForegroundColor Gray
    Write-Host ""

    $lines = [System.Collections.Generic.List[string]]::new()
    while ($true) {
        $line = Read-Host
        if ($line -eq "FIN") { break }
        $lines.Add($line)
    }

    $currentFile = $null
    $contentLines = [System.Collections.Generic.List[string]]::new()
    $inContent = $false
    $fileList = [System.Collections.Generic.List[hashtable]]::new()

    foreach ($l in $lines) {
        if ($l -match '^FILE:\s*(.+)$') {
            $currentFile = $matches[1].Trim()
            $inContent = $false
            $contentLines = [System.Collections.Generic.List[string]]::new()
        } elseif ($l -eq "CONTENT_START") {
            $inContent = $true
        } elseif ($l -eq "CONTENT_END") {
            if ($currentFile) {
                $fileList.Add(@{ Path = $currentFile; Content = ($contentLines -join "`n") })
            }
            $inContent = $false
            $currentFile = $null
        } elseif ($inContent) {
            $contentLines.Add($l)
        }
    }

    if ($fileList.Count -eq 0) {
        Write-Err "No encontre ningun archivo. El formato correcto es:"
        Write-Host "  FILE: ruta/archivo.tsx" -ForegroundColor Gray
        Write-Host "  CONTENT_START" -ForegroundColor Gray
        Write-Host "  ...codigo..." -ForegroundColor Gray
        Write-Host "  CONTENT_END" -ForegroundColor Gray
        Write-Host "  FIN" -ForegroundColor Gray
        Read-Host "`n  Pulsa Enter para volver"
        return
    }

    foreach ($f in $fileList) {
        $fullPath = Join-Path $PROJECT_PATH $f.Path
        $dir = Split-Path $fullPath -Parent
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
        [System.IO.File]::WriteAllText($fullPath, $f.Content, [System.Text.Encoding]::UTF8)
        Write-Ok "Actualizado: $($f.Path)"
    }

    Write-Host ""
    $deploy = Read-Host "  Hacer deploy ahora? (s/N)"
    if ($deploy -eq "s" -or $deploy -eq "S") {
        Deploy-Vercel
    }
}

function Deploy-Vercel {
    Write-Title "DESPLEGANDO EN VERCEL..."
    Set-Location $PROJECT_PATH

    Write-Info "Haciendo commit..."
    git add . 2>&1 | Out-Null
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    git commit -m "update: cambios via agente Claude ($timestamp)" 2>&1 | Out-Null

    $remoteUrl = "https://$GITHUB_TOKEN@github.com/$GITHUB_USER/$REPO_NAME.git"
    $remotes = git remote 2>&1
    if ($remotes -contains "origin") {
        git remote set-url origin $remoteUrl 2>&1 | Out-Null
    } else {
        git remote add origin $remoteUrl 2>&1 | Out-Null
    }

    Write-Info "Subiendo a GitHub..."
    git push origin main 2>&1 | Out-Null
    Write-Ok "Codigo en GitHub"

    Write-Info "Desplegando en Vercel (tarda ~2 min)..."
    $result = vercel --prod --token $VERCEL_TOKEN --yes 2>&1

    $urlLine = $result | Where-Object { $_ -match "https://.+\.vercel\.app" } | Select-Object -Last 1

    if ($urlLine) {
        $url = [regex]::Match($urlLine, 'https://[^\s]+').Value
        Write-Ok "Deploy completado!"
        Write-Host ""
        Write-Host "  URL: $url" -ForegroundColor Green
        Write-Host ""
        $open = Read-Host "  Abrir en navegador? (s/N)"
        if ($open -eq "s" -or $open -eq "S") { Start-Process $url }
    } else {
        Write-Err "Revisa: https://vercel.com/dashboard"
        $result | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    }

    Read-Host "`n  Pulsa Enter para volver"
}

function Show-BuildErrors {
    Write-Title "BUILD LOCAL..."
    Set-Location $PROJECT_PATH
    npm run build 2>&1
    Write-Host ""
    Write-Host "  Copia los errores y pegalos a Claude." -ForegroundColor Yellow
    Read-Host "  Pulsa Enter para volver"
}

function Show-Url {
    Write-Title "URL DE PRODUCCION"
    $url = "https://$REPO_NAME.vercel.app"
    Write-Host "  $url" -ForegroundColor Green
    Start-Process $url
    Read-Host "  Pulsa Enter para volver"
}

function Open-VSCode {
    code $PROJECT_PATH
    Write-Ok "Abriendo VS Code..."
    Start-Sleep 1
}

function Init-Git {
    Set-Location $PROJECT_PATH
    if (-not (Test-Path ".git")) {
        Write-Info "Inicializando git..."
        git init -q
        git add .
        git commit -q -m "init: COT dashboard"
        $remoteUrl = "https://$GITHUB_TOKEN@github.com/$GITHUB_USER/$REPO_NAME.git"
        git remote add origin $remoteUrl
        git branch -M main
        git push -u origin main -f -q
        Write-Ok "Git inicializado"
    }
}

if (-not (Test-Path $PROJECT_PATH)) {
    Write-Host ""
    Write-Host "  [ERROR] No encuentro el proyecto en: $PROJECT_PATH" -ForegroundColor Red
    Write-Host "  Edita la variable PROJECT_PATH al inicio del script." -ForegroundColor Yellow
    Read-Host "Pulsa Enter para salir"
    exit
}

Init-Git

$running = $true
while ($running) {
    Show-Menu
    $choice = Read-Host "  Elige una opcion"
    switch ($choice.ToUpper()) {
        "1" { Apply-Patch }
        "2" { Deploy-Vercel }
        "3" { Show-BuildErrors }
        "4" { Open-VSCode }
        "5" { Show-Url }
        "Q" { $running = $false }
        default { Write-Err "Opcion no valida"; Start-Sleep 1 }
    }
}

Write-Host "`nAgente cerrado. Hasta luego!" -ForegroundColor Magenta
