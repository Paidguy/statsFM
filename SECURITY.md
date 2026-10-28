# Security Policy

## Supported Versions

We actively maintain the latest release of **statsFM**.

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

The statsFM team takes security seriously. If you discover a security issue or vulnerability, please follow responsible disclosure guidelines rather than creating a public GitHub issue.

### How to report:
1. Send an email to [madgulab69@gmail.com](mailto:madgulab69@gmail.com) with the subject:
   `[SECURITY] statsFM Vulnerability Report`
2. Include detailed steps to reproduce the issue, attack vectors, and proof of concept if available.
3. We will acknowledge receipt of your report within 48 hours and work with you to patch and disclose the fix responsibly.

## Security Architecture & Design

statsFM is architected around privacy and security:
- **Zero Credentials Storage**: No user passwords, session tokens, or private credentials are required or stored.
- **Client-Side Processing**: Analytics, metrics calculations, and poster renderings occur entirely in the user's browser.
- **Strict Method Whitelisting**: The optional Node proxy server restricts queries exclusively to safe read-only Last.fm methods (`user.getinfo`, `user.gettopartists`, `user.gettoptracks`, `user.gettopalbums`, `user.getrecenttracks`).
- **No Telemetry / No Tracking**: No third-party tracking scripts, trackers, or marketing pixels are used.
