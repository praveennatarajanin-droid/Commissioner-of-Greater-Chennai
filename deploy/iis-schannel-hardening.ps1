<#
==============================================================================
GREATER CHENNAI POLICE COMMISSIONER PORTAL ("CHENNAI GUARDIAN")
IIS / WINDOWS SERVER SCHANNEL TLS HARDENING SCRIPT
Remediates: POC-07 (Deprecated TLS 1.0/1.1 Protocols Identified)
==============================================================================
#>

Write-Host "Configuring Windows SCHANNEL Security Protocols for TLS 1.2 & TLS 1.3..." -ForegroundColor Cyan

# 1. Disable Legacy Protocols: SSL 2.0, SSL 3.0, TLS 1.0, TLS 1.1
$protocolsToDisable = @("SSL 2.0", "SSL 3.0", "TLS 1.0", "TLS 1.1")
foreach ($proto in $protocolsToDisable) {
    $serverPath = "HKLM:\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Protocols\$proto\Server"
    $clientPath = "HKLM:\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Protocols\$proto\Client"
    
    New-Item -Path $serverPath -Force | Out-Null
    New-Item -Path $clientPath -Force | Out-Null
    
    Set-ItemProperty -Path $serverPath -Name "Enabled" -Value 0 -Type DWord
    Set-ItemProperty -Path $serverPath -Name "DisabledByDefault" -Value 1 -Type DWord
    Set-ItemProperty -Path $clientPath -Name "Enabled" -Value 0 -Type DWord
    Set-ItemProperty -Path $clientPath -Name "DisabledByDefault" -Value 1 -Type DWord
    
    Write-Host "  [DISABLED] $proto" -ForegroundColor Yellow
}

# 2. Enable Modern Protocols: TLS 1.2 and TLS 1.3
$protocolsToEnable = @("TLS 1.2", "TLS 1.3")
foreach ($proto in $protocolsToEnable) {
    $serverPath = "HKLM:\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Protocols\$proto\Server"
    $clientPath = "HKLM:\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Protocols\$proto\Client"
    
    New-Item -Path $serverPath -Force | Out-Null
    New-Item -Path $clientPath -Force | Out-Null
    
    Set-ItemProperty -Path $serverPath -Name "Enabled" -Value 1 -Type DWord
    Set-ItemProperty -Path $serverPath -Name "DisabledByDefault" -Value 0 -Type DWord
    Set-ItemProperty -Path $clientPath -Name "Enabled" -Value 1 -Type DWord
    Set-ItemProperty -Path $clientPath -Name "DisabledByDefault" -Value 0 -Type DWord
    
    Write-Host "  [ENABLED] $proto" -ForegroundColor Green
}

# 3. Disable Insecure Ciphers (NULL, DES, 3DES, RC4)
$ciphersToDisable = @("DES 56/56", "NULL", "RC2 128/128", "RC2 40/128", "RC2 56/128", "RC4 128/128", "RC4 40/128", "RC4 56/128", "RC4 64/128", "Triple DES 168")
foreach ($cipher in $ciphersToDisable) {
    $cipherPath = "HKLM:\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Ciphers\$cipher"
    New-Item -Path $cipherPath -Force | Out-Null
    Set-ItemProperty -Path $cipherPath -Name "Enabled" -Value 0 -Type DWord
    Write-Host "  [DISABLED CIPHER] $cipher" -ForegroundColor Yellow
}

# 4. Enforce Strong .NET Cryptography
$netPaths = @(
    "HKLM:\SOFTWARE\Microsoft\.NETFramework\v4.0.30319",
    "HKLM:\SOFTWARE\Wow6432Node\Microsoft\.NETFramework\v4.0.30319"
)
foreach ($np in $netPaths) {
    if (Test-Path $np) {
        Set-ItemProperty -Path $np -Name "SchUseStrongCrypto" -Value 1 -Type DWord
        Set-ItemProperty -Path $np -Name "SystemDefaultTlsVersions" -Value 1 -Type DWord
    }
}

Write-Host "`nSCHANNEL TLS configuration complete. Only TLS 1.2 and TLS 1.3 are accepted." -ForegroundColor Green
