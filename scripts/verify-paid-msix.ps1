$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$out = Join-Path (Get-Location).Path 'dist-paid-msix-candidate'
$sourceCommit = if ($env:SOURCE_GIT_COMMIT) { $env:SOURCE_GIT_COMMIT } else { $env:GITHUB_SHA }
if ($sourceCommit -notmatch '^[0-9a-fA-F]{40}$') { throw 'Exact source SHA is required' }
$files = @(Get-ChildItem -LiteralPath $out -File | Where-Object { $_.Extension -eq '.msix' })
if ($files.Count -ne 1) { throw "Expected exactly one paid x64 MSIX, got $($files.Count)" }
$records = @()
foreach ($f in $files) {
  $z = [System.IO.Compression.ZipFile]::OpenRead($f.FullName)
  try {
    $names = @($z.Entries | ForEach-Object { $_.FullName })
    if ($names -notcontains 'AppxManifest.xml') { throw 'MSIX missing AppxManifest.xml' }
    if ($names -notcontains 'AppxBlockMap.xml') { throw 'MSIX missing AppxBlockMap.xml' }
    if ($names -contains 'AppxSignature.p7x') { throw 'This is an unsigned review-only workflow; unexpectedly signed package' }
    $entry = $z.GetEntry('AppxManifest.xml')
    $reader = New-Object System.IO.StreamReader($entry.Open())
    try { [xml]$xml = $reader.ReadToEnd() } finally { $reader.Dispose() }
    $identity = $xml.SelectSingleNode("//*[local-name()='Identity']")
    if ($null -eq $identity) { throw 'MSIX Identity element is missing' }
    if ($identity.GetAttribute('Name') -cne $env:NIGHT_PAID_IDENTITY_NAME) { throw 'Identity Name mismatch' }
    if ($identity.GetAttribute('Publisher') -cne $env:NIGHT_PAID_PUBLISHER) { throw 'Publisher mismatch' }
    if ($identity.GetAttribute('Version') -cne $env:NIGHT_PAID_STORE_VERSION) { throw 'Store Version mismatch' }
    $props = $xml.SelectSingleNode("//*[local-name()='Properties']")
    if ($null -eq $props) { throw 'Missing Properties element' }
    $display = $props.SelectSingleNode("*[local-name()='DisplayName']")
    if ($null -eq $display -or $display.InnerText -cne $env:NIGHT_PAID_STORE_DISPLAY_NAME) { throw 'Store DisplayName mismatch' }
    $publisherDisplay = $props.SelectSingleNode("*[local-name()='PublisherDisplayName']")
    if ($null -eq $publisherDisplay -or $publisherDisplay.InnerText -cne $env:NIGHT_PAID_PUBLISHER_DISPLAY_NAME) { throw 'PublisherDisplayName mismatch' }
  } finally { $z.Dispose() }
}
$artifacts = @(Get-ChildItem -LiteralPath $out -File | Where-Object { $_.Extension -in @('.msix','.msixupload') })
foreach ($f in $artifacts) {
  $records += [ordered]@{ name = $f.Name; bytes = $f.Length; sha256 = (Get-FileHash -LiteralPath $f.FullName -Algorithm SHA256).Hash }
}
$ledger = [ordered]@{
 status = 'INTERNAL_QA_UNSIGNED_MSIX_NOT_STORE_APPROVED'
 product = 'Night Office Auditor - 24-case paid edition'
 repository = $env:GITHUB_REPOSITORY
 workBranch = $env:GITHUB_REF_NAME
 sourceCommit = $sourceCommit
 workflowRunId = $env:GITHUB_RUN_ID
 storeId = $env:NIGHT_PAID_STORE_ID
 identityName = $env:NIGHT_PAID_IDENTITY_NAME
 publisher = $env:NIGHT_PAID_PUBLISHER
 publisherDisplayName = $env:NIGHT_PAID_PUBLISHER_DISPLAY_NAME
 storeDisplayName = $env:NIGHT_PAID_STORE_DISPLAY_NAME
 storePackageVersion = $env:NIGHT_PAID_STORE_VERSION
 signed = $false
 realWindowsInstallationTested = $false
 wackCompleted = $false
 storeSubmitted = $false
 brandAssets = 'REVIEW_ONLY_NOT_APPROVED'
 files = $records
 remainingGates = @('Partner Center current-value recheck','Art and content review','Signed install/update/save/uninstall test','WACK','Store certification and human submission approval')
}
$ledger | ConvertTo-Json -Depth 9 | Set-Content -LiteralPath (Join-Path $out 'MSIX_CANDIDATE_HANDOFF.json') -Encoding utf8
Write-Host 'VERIFIED_INDEPENDENT_24_CASE_MSIX_QA_UNSIGNED (not Store approved)'
