export enum Tipas {
  DNSB = 'DNSB',
  GYV = 'GYV',
  PV = 'PV',
  REM = 'REM',
  'STOG-FAS' = 'STOG-FAS',
  INZIN = 'INZIN',
  'LAIDA-A' = 'LAIDA-A',
  KITA = 'KITA'
}

export interface Worker {
  user: {
    _id: string;
    userName: string;
  };
  ikainis: number;
  progress: number;
  pateikta?: string;
  patvirtinta?: string;
  history: { progress: number; date: string }[];
}

export enum ProjectStatus {
  Live = 'Live',
  Uzbaigtas = 'Uzbaigtas',
  Pakibes = 'Pakibes',
  Nuluzes = 'Nuluzes'
}

export type DocCategory = 'RUOSINIAI' | 'FOTO' | 'PRIDAVIMO_DOC' | 'SALYGOS' | 'TOPO' | 'PROJEKTAS' | 'KITA';
export type DocCategoryEng = 'PIRMINIAI_SPREND' | 'EKSPERTIZEI' | 'GALUTINIS_PROJEKTAS';

export const dalysTypes = [
  'BD',
  'SP',
  'SA',
  'SK',
  'VN',
  'ŠT',
  'ŠG',
  'ŠVOK',
  'D',
  'E',
  'LER',
  'ER',
  'AS',
  'GASS',
  'PVA',
  'GS',
  'SO'
];

// -----------------------------------------------------
// ------------------------IO---------------------------
// -----------------------------------------------------

export interface TransportData<T> {
  type: TransportType;
  data: T;
}

export enum TransportType {
  BeNotification,
  FeUserConnected
}

export interface BeNotification {
  title: string;
  text: string;
}

export interface FeUserConnected {
  userId: string;
}
