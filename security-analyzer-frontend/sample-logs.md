# Sample Security Event Logs

Use these sample logs to test your security analyzer frontend:

## Sample 1: Failed Login Attempt
```
2024-01-15 14:23:45 [AUTH] Failed login attempt for user 'admin' from IP 192.168.1.100. Password authentication failed. Attempt count: 5 within 2 minutes.
```

## Sample 2: Unusual Network Activity
```
2024-01-15 15:30:12 [NETWORK] Outbound connection detected to suspicious IP 185.220.101.45 on port 443. Process: chrome.exe. User: john.doe. Data transferred: 2.5MB
```

## Sample 3: File System Anomaly
```
2024-01-15 16:45:33 [FILE] Unauthorized file access attempt detected. User 'guest' tried to access /etc/shadow file. Access denied. Previous successful access to this file: Never.
```

## Sample 4: Privilege Escalation
```
2024-01-15 17:12:21 [SYSTEM] Process elevation detected. Process: powershell.exe elevated from user 'standard_user' to Administrator. No UAC prompt recorded. Parent process: cmd.exe
```

## Sample 5: Malware Detection
```
2024-01-15 18:05:44 [ANTIVIRUS] Malware signature detected in file C:\Users\Public\temp_file.exe. Threat name: Trojan.Win32.Generic. File quarantined. Source: Email attachment from external@unknown-domain.com
```

## Testing Instructions

1. Copy any of the above sample logs
2. Paste into the Security Event Analyzer frontend
3. Click "Analyze Security Event"
4. Review the AI-generated analysis including:
   - Threat Score (1-10)
   - Root Cause
   - Remediation Steps
   - MITRE ATT&CK Technique
   - Approach Recommendations
