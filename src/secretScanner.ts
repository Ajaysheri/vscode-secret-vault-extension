import { SecretFinding } from './types';

interface PatternDefinition {
  type: string;
  regex: RegExp;
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
}

const SECRET_PATTERNS: PatternDefinition[] = [
  {
    type: 'API Key',
    regex: /(api[_-]?key)\s*[:=]\s*["'`][^"'`]{8,}["'`]/gi,
    severity: 'high',
    suggestion: 'Move API keys into AWS Secrets Manager, Azure Key Vault, or HashiCorp Vault.'
  },
  {
    type: 'Password',
    regex: /(password|pwd)\s*[:=]\s*["'`][^"'`]{6,}["'`]/gi,
    severity: 'high',
    suggestion: 'Store passwords in an enterprise vault and reference through environment variables.'
  },
  {
    type: 'Token',
    regex: /(token|auth[_-]?token|bearer)\s*[:=]\s*["'`][^"'`]{8,}["'`]/gi,
    severity: 'high',
    suggestion: 'Avoid hardcoding tokens. Use secure secret injection at runtime.'
  },
  {
    type: 'AWS Access Key',
    regex: /AKIA[0-9A-Z]{16}/g,
    severity: 'high',
    suggestion: 'Rotate the exposed AWS key immediately and store replacement in AWS Secrets Manager.'
  },
  {
    type: 'Connection String',
    regex: /(jdbc:|mongodb\+srv:\/\/|Server=.*;Database=.*;User Id=.*;Password=.*)/gi,
    severity: 'medium',
    suggestion: 'Move database credentials to secure configuration backed by a vault.'
  }
];

export function scanSecrets(documentText: string): SecretFinding[] {
  const findings: SecretFinding[] = [];
  const lines = documentText.split(/\r?\n/);

  lines.forEach((lineText, index) => {
    SECRET_PATTERNS.forEach((pattern) => {
      pattern.regex.lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = pattern.regex.exec(lineText)) !== null) {
        findings.push({
          type: pattern.type,
          value: match[0],
          line: index,
          start: match.index,
          end: match.index + match[0].length,
          severity: pattern.severity,
          suggestion: pattern.suggestion
        });
      }
    });
  });

  return findings;
}
