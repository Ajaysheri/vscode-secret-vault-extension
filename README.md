# vscode-secret-vault-extension
# VSCode Secret Vault Extension

A sample Visual Studio Code extension built with TypeScript to detect hardcoded secrets in source code and simulate secure migration to an enterprise vault solution.

## Features

- Scans open files for hardcoded secrets like API keys, passwords, tokens, and connection strings
- Highlights findings using VSCode diagnostics
- Opens a dashboard-style UI inside VSCode
- Simulates migration of detected secrets to an enterprise vault API
- Demonstrates secure coding and developer-tooling concepts relevant to enterprise environments

## Technologies Used

- VSCode Extension API
- TypeScript
- Node.js
- React-style webview dashboard concepts
- Secure coding patterns
- Vault / Secrets Manager integration simulation

## Commands

- `Secret Vault: Scan Current File`
- `Secret Vault: Open Dashboard`

## Why this project matters

This project demonstrates:

- VSCode extension development
- Security tooling for developers
- Secret detection logic
- Quick remediation workflow ideas
- Integration patterns for Vault / Secrets Manager platforms

## How to Run

1. Clone the repository
2. Run `npm install`
3. Run `npm run compile`
4. Open the project in VSCode
5. Press `F5` to launch the Extension Development Host
6. Open any file containing a hardcoded secret and run `Secret Vault: Scan Current File`

## Sample test input

```js
const apiKey = "my-secret-api-key-12345";
const password = "superSecurePassword";
const token = "bearer-123456789";
Future enhancements
•	Replace regex-only detection with entropy-based scanning
•	Add CodeAction / Quick Fix support directly in the editor
•	Integrate with AWS Secrets Manager, Azure Key Vault, or HashiCorp Vault
•	Add IAM / RBAC-aware approval workflows
•	Add telemetry and audit logging