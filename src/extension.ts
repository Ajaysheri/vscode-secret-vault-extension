import * as vscode from 'vscode';
import { scanSecrets } from './secretScanner';
import { migrateSecretToVault } from './vaultIntegration';
import { SecretDashboardPanel } from './panel';
import { SecretFinding } from './types';

let diagnosticCollection: vscode.DiagnosticCollection;

export function activate(context: vscode.ExtensionContext) {
  diagnosticCollection = vscode.languages.createDiagnosticCollection('secretVault');
  context.subscriptions.push(diagnosticCollection);

  const scanCommand = vscode.commands.registerCommand('secretVault.scanSecrets', async () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      vscode.window.showInformationMessage('Open a file before scanning for secrets.');
      return;
    }

    const document = editor.document;
    const text = document.getText();
    const findings = scanSecrets(text);

    updateDiagnostics(document.uri, findings);
    SecretDashboardPanel.createOrShow(context.extensionUri, findings);

    if (!findings.length) {
      vscode.window.showInformationMessage('No secrets detected in the current file.');
      return;
    }

    const action = await vscode.window.showWarningMessage(
      `Detected ${findings.length} potential secret(s) in ${document.fileName}.`,
      'View Dashboard',
      'Migrate First Secret'
    );

    if (action === 'View Dashboard') {
      SecretDashboardPanel.createOrShow(context.extensionUri, findings);
    }

    if (action === 'Migrate First Secret') {
      await migrateFirstSecret(findings[0], document.fileName);
    }
  });

  const openDashboardCommand = vscode.commands.registerCommand('secretVault.openDashboard', async () => {
    SecretDashboardPanel.createOrShow(context.extensionUri, []);
  });

  context.subscriptions.push(scanCommand, openDashboardCommand);

  vscode.workspace.onDidSaveTextDocument((document) => {
    const findings = scanSecrets(document.getText());
    updateDiagnostics(document.uri, findings);
  });
}

export function deactivate() {
  diagnosticCollection?.dispose();
}

function updateDiagnostics(uri: vscode.Uri, findings: SecretFinding[]) {
  const diagnostics = findings.map((finding) => {
    const range = new vscode.Range(
      new vscode.Position(finding.line, finding.start),
      new vscode.Position(finding.line, finding.end)
    );

    const diagnostic = new vscode.Diagnostic(
      range,
      `${finding.type} detected. ${finding.suggestion}`,
      vscode.DiagnosticSeverity.Warning
    );

    diagnostic.source = 'Secret Vault Extension';
    return diagnostic;
  });

  diagnosticCollection.set(uri, diagnostics);
}

async function migrateFirstSecret(finding: SecretFinding, fileName: string) {
  const result = await migrateSecretToVault({
    secretType: finding.type,
    secretValue: finding.value,
    fileName
  });

  vscode.window.showInformationMessage(result);
}
