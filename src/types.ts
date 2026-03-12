export interface SecretFinding {
  type: string;
  value: string;
  line: number;
  start: number;
  end: number;
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
}
