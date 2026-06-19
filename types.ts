// ── Text Style ───────────────────────────────────────────────────────────────
export interface TextStyle {
  font: string;
  size: string;   // 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl'
  weight: string; // 'normal' | 'semibold' | 'bold' | 'black'
  align: string;  // 'left' | 'center' | 'right'
}

// ── Operator ─────────────────────────────────────────────────────────────────
export interface Operator {
  id: string;
  name: string;
  photo: string;
  photoFile?: File;
  tma: string;
  nps: string;
  monitoria: string;
  abs: string;
  resumo: string;
}

// ── App Settings ─────────────────────────────────────────────────────────────
export interface AppSettings {
  slideDuration: number;  // kept for DB compat (no longer used for auto-advance)
  nameStyle: TextStyle;
  resumoStyle: TextStyle;
}

// ── View Mode ────────────────────────────────────────────────────────────────
export type ViewMode = 'admin' | 'presentation';

// ── Component Props ──────────────────────────────────────────────────────────
export interface AdminPanelProps {
  operators: Operator[];
  settings: AppSettings;
  onAddOperator: (operator: Operator) => void;
  onEditOperator: (operator: Operator) => void;
  onRemoveOperator: (id: string) => void;
  onUpdateSettings: (settings: AppSettings) => void;
  onSwitchMode: () => void;
}

export interface PresentationModeProps {
  operators: Operator[];
  settings: AppSettings;
  onSwitchMode: () => void;
}