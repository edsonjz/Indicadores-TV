export interface Operator {
  id: string;
  name: string;
  photo: string; // URL string
  photoFile?: File; // For internal upload handling
  tma: string;
  nps: string;
  monitoria: string;
}

export interface AppSettings {
  font: string;
  slideDuration: number; // in seconds
}

export type ViewMode = 'admin' | 'presentation';

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