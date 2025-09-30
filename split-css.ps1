# Skrypt do podziału style.css na moduły
$styleContent = Get-Content "styles/style.css" -Raw

# Przygotuj moduły z ich zakresami linii
$modules = @{
    "reset.css" = @{start=1; end=20}
    "variables.css" = @{start=22; end=72}
    "base.css" = @{start=74; end=92}
    "utilities.css" = @{start=94; end=154}
    "backgrounds.css" = @{start=156; end=184}
    "navigation.css" = @{start=186; end=250; extra=@(1039..1169)}  # NAV + BURGER + LANG
    "hero.css" = @{start=252; end=322}
    "about.css" = @{start=324; end=501}
    "skills.css" = @{start=503; end=542}
    "portfolio.css" = @{start=544; end=743; extra=@(1963..2410)}  # PORTFOLIO + optymalizacje
    "contact.css" = @{start=744; end=801}
    "footer.css" = @{start=802; end=811}
    "forms.css" = @{start=813; end=870; extra=@(1855..1910)}  # FORMS + spinner/messages
    "animations.css" = @{lines=@()}  # Będzie zawierać @keyframes
    "performance.css" = @{start=872; end=1037}  # REDUCED MOTION + PERFORMANCE + FALLBACKS
    "responsive.css" = @{start=1171; end=1853}  # Media queries
}

Write-Host "Podział style.css na moduły..." -ForegroundColor Cyan

# Wczytaj plik jako tablicę linii
$lines = Get-Content "styles/style.css"

# Funkcja do wyciągnięcia linii z zakresu
function Get-LinesRange {
    param($lines, $start, $end)
    if ($start -gt 0 -and $end -le $lines.Count) {
        return $lines[($start-1)..($end-1)] -join "`n"
    }
    return ""
}

# Wyciągnij animacje (@keyframes)
$animationsContent = @"
/* ==========================================================================
   ANIMATIONS & KEYFRAMES
   ========================================================================== */

"@

$lines | ForEach-Object {
    if ($_ -match '@keyframes|animation:') {
        $animationsContent += $_ + "`n"
    }
}

# Zapisz moduły (pomiń reset i variables - już istnieją)
foreach ($moduleName in $modules.Keys | Where-Object { $_ -notin @("reset.css", "variables.css") }) {
    $module = $modules[$moduleName]
    $content = ""
    
    if ($module.start -and $module.end) {
        $content = Get-LinesRange -lines $lines -start $module.start -end $module.end
    }
    
    if ($module.extra) {
        foreach ($range in $module.extra) {
            if ($range -is [System.Array] -and $range.Count -eq 2) {
                $content += "`n`n" + (Get-LinesRange -lines $lines -start $range[0] -end $range[1])
            }
        }
    }
    
    if ($moduleName -eq "animations.css") {
        $content = $animationsContent
    }
    
    $outputPath = "styles/modules/css/$moduleName"
    $content | Out-File -FilePath $outputPath -Encoding UTF8
    Write-Host "✓ Utworzono $moduleName" -ForegroundColor Green
}

Write-Host "`nGotowe!" -ForegroundColor Green

