export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface AttackLog {
  id: number;
  timestamp: string;
  type: string;
  source_ip: string;
  details: string;
  severity: Severity;
  detected: boolean;
}

export interface SecurityAlert {
  id: number;
  timestamp: string;
  attack_id: number;
  alert_name: string;
  description: string;
  severity: Severity;
}

export interface AttackModule {
  id: string;
  name: string;
  description: string;
  category: 'Offensive' | 'Evasion' | 'Post-Exploitation';
  severity: Severity;
}
