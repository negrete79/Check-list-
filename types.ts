
export enum UserRole {
  ADMIN = 'ADMIN',
  RECEPTION = 'RECEPTION'
}

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  CLEANING = 'CLEANING',
  MAINTENANCE = 'MAINTENANCE',
  CHECK_OUT_PENDING = 'CHECK_OUT_PENDING'
}

export type TaskStatus = 'OK' | 'PENDENTE' | 'NAO_OK';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  category: 'CASA SEDE' | 'ÁREA GOURMET' | 'PISCINA' | 'INSPECTION' | 'AI_SUGGESTION';
  assignedTo?: string;
  timestamp?: number;
}

// Added ChecklistItem and ChecklistTemplate interfaces to fix missing export errors in constants.tsx, App.tsx, and AdminPanel.tsx
export interface ChecklistItem {
  title: string;
  category: 'CASA SEDE' | 'ÁREA GOURMET' | 'PISCINA' | 'INSPECTION' | 'AI_SUGGESTION';
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  items: ChecklistItem[];
}

export interface GuestInfo {
  name: string;
  documentId: string;
  documentPhotoUri?: string;
  facePhotoUri?: string;
  checkInDate: number;
  checkInTime: string;
  checkOutDate?: number;
  checkOutTime?: string;
}

export interface Room {
  id: string;
  number: string;
  type: string;
  status: RoomStatus;
  tasks: Task[];
  lastCleaned?: number;
  currentGuest?: GuestInfo;
}

export interface AppState {
  user: {
    name: string;
    role: UserRole;
  } | null;
  rooms: Room[];
  isDarkMode: boolean;
}
