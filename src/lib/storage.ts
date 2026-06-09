import {
  INITIAL_PATIENTS,
  INITIAL_TOKENS,
  INITIAL_LAB_ORDERS,
  INITIAL_MEDICINES,
  INITIAL_INVOICES,
  INITIAL_PRESCRIPTIONS,
} from '../data';
import { Patient, Token, LabOrder, Medicine, Invoice, ClinicalPrescription } from '../types';

const STORAGE_KEY = 'mediplus-clinic-os-data';

export interface AppData {
  patients: Patient[];
  tokens: Token[];
  labOrders: LabOrder[];
  medicines: Medicine[];
  invoices: Invoice[];
  prescriptions: ClinicalPrescription[];
}

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as AppData;
    }
  } catch {
    /* fall through to defaults */
  }
  return {
    patients: INITIAL_PATIENTS,
    tokens: INITIAL_TOKENS,
    labOrders: INITIAL_LAB_ORDERS,
    medicines: INITIAL_MEDICINES,
    invoices: INITIAL_INVOICES,
    prescriptions: INITIAL_PRESCRIPTIONS,
  };
}

export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* storage full or unavailable */
  }
}
