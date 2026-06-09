/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Patient {
  id: string; // e.g. "MRN-240-581" or "MRN-29384"
  name: string;
  cnic: string;
  phone: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  registeredDate: string;
}

export interface Token {
  id: string;
  patientId: string;
  patientName: string;
  department: 'General OPD' | 'Emergency' | 'Consultation';
  tokenNo: string; // e.g. "G-124", "E-009", "C-042"
  fee: number;
  doctorName: string;
  timeSlot: string; // e.g. "09:45 AM"
  status: 'Waiting' | 'In Consultation' | 'Completed';
  date: string;
}

export interface LabOrder {
  id: string;
  orderId: string; // e.g. "#LB-9821"
  patientId: string;
  patientName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  testType: string; // e.g. "Complete Blood Count (CBC)"
  status: 'PENDING' | 'SAMPLING' | 'PROCESSING' | 'COMPLETED';
  orderDate: string;
  results?: {
    hemoglobin?: string; // Range: 13.5 - 17.5 g/dL
    tlc?: string;        // Range: 4,000 - 11,000 /cmm
    platelets?: string;  // Range: 1.5 - 4.5 L/cmm
    neutrophils?: string;// Range: %
    comments?: string;
  };
}

export interface Medicine {
  id: string;
  name: string;
  generic: string;
  category: 'Tablets' | 'Syrups' | 'Injections';
  stock: number;
  price: number; // in Rs.
  isLowStock: boolean;
}

export interface CartItem {
  medicineId: string;
  quantity: number;
}

export interface BillingItem {
  category: 'OPD' | 'LAB' | 'PHARMACY';
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string; // e.g. "INV-2023-8821"
  patientId: string;
  patientName: string;
  cnic: string;
  phone: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  lastVisit: string;
  mrn: string;
  items: BillingItem[];
  discount: number;
  tax: number;
  totalPayable: number;
  paymentMethod: string;
  status: 'Unpaid' | 'Paid';
  date: string;
}

export interface ClinicalPrescription {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  mrn: string;
  complaint: string;
  vitals: {
    bp: string;
    temp: string;
  };
  allergies: string;
  previousVisit: string;
  notes: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
  bloodTests: string[];
  imagingTests: string[];
  otherLabTest: string;
  date: string;
}
