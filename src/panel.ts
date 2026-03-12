import * as vscode from 'vscode';
import { SecretFinding } from './types';

export class SecretDashboardPanel {
  public static currentPanel: SecretDashboardPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private readonly extensionUri: vscode.Uri;

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this.panel = panel;
    this.extensionUri = extensionUri;

    this.panel.onDidDispose(() => {
      SecretDashboardPanel.currentPanel = undefined;
    });
  }

  public static createOrShow(extensionUri: vscode.Uri, findings: SecretFinding[] = []): SecretDashboardPanel {
    const column = vscode.ViewColumn.Beside;

    if (SecretDashboardPanel.currentPanel) {
      SecretDashboardPanel.currentPanel.panel.reveal(column);
      SecretDashboardPanel.currentPanel.update(findings);
      return SecretDashboardPanel.currentPanel;
    }

    const panel = vscode.window.createWebviewPanel(
      'secretDashboard',
      'Secret Vault Dashboard',
      column,
      {
        enableScripts: true
      }
    );

    SecretDashboardPanel.currentPanel = new SecretDashboardPanel(panel, extensionUri);
    SecretDashboardPanel.currentPanel.update(findings);
    return SecretDashboardPanel.currentPanel;
  }

  public update(findings: SecretFinding[]) {
    this.panel.webview.html = this.getHtml(findings);
  }

  private getHtml(findings: SecretFinding[]): string {
    const rows = findings.length
      ? findings.map((f) => `
        <tr>
          <td>${f.type}</td>
          <td>${f.line + 1}</td>
          <td>${escapeHtml(f.severity)}</td>
          <td>${escapeHtml(f.suggestion)}</td>
        </tr>
      `).join('')
      : '<tr><td colspan="4">No secrets detected.</td></tr>';

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Secret Vault Dashboard</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 16px; color: #ddd; background: #1e1e1e; }
          h1 { font-size: 20px; }
          .card { background: #252526; border-radius: 8px; padding: 16px; margin-top: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #444; padding: 10px; text-align: left; }
          th { background: #333; }
          .note { margin-top: 12px; color: #9cdcfe; }
        </style>
      </head>
      <body>
        <h1>Secret Vault Dashboard</h1>
        <div class="card">
          <p>This VSCode extension scans code for potential secrets and guides developers toward secure vault migration.</p>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Line</th>
                <th>Severity</th>
                <th>Recommendation</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <p class="note">Demo note: In production, findings could be linked to Quick Fix actions and enterprise policy engines.</p>
        </div>
      </body>
      </html>
    `;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
