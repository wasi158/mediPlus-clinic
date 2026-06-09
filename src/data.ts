/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Patient, Token, LabOrder, Medicine, Invoice, ClinicalPrescription } from './types';

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'MRN-240-581',
    name: 'Muhammad Ahmed',
    cnic: '42201-8898123-1',
    phone: '0300-1112233',
    age: 42,
    gender: 'Male',
    address: 'Street 4, Phase 2, DHA, Karachi',
    registeredDate: '2026-05-12'
  },
  {
    id: 'MRN-240-590',
    name: 'Fatima Zehra',
    cnic: '42101-7761234-2',
    phone: '0333-4455667',
    age: 28,
    gender: 'Female',
    address: 'Apartment 4B, Askary 4, Gulshan, Karachi',
    registeredDate: '2026-06-01'
  },
  {
    id: 'MRN-240-582',
    name: 'Abdul Rehman',
    cnic: '42201-9988112-3',
    phone: '0321-8877665',
    age: 55,
    gender: 'Male',
    address: 'Plot 124, Sector 11-A, North Nazimabad, Karachi',
    registeredDate: '2026-05-24'
  },
  {
    id: 'MRN-240-591',
    name: 'Sara Khan',
    cnic: '42101-2233445-4',
    phone: '0312-9988221',
    age: 31,
    gender: 'Female',
    address: 'House 55/I, Block 6, PECHS, Karachi',
    registeredDate: '2026-06-03'
  },
  {
    id: 'MRN-240-581-22',
    name: 'Muhammad Bilal',
    cnic: '42201-5544332-1',
    phone: '0300-7654321',
    age: 42,
    gender: 'Male',
    address: 'Flat A-15, Block H, North Nazimabad, Karachi',
    registeredDate: '2026-06-08'
  },
  {
    id: 'MRN-240-601-99',
    name: 'Zubair Ahmed',
    cnic: '42301-8877112-5',
    phone: '0300-1239988',
    age: 65,
    gender: 'Male',
    address: 'Street 10, Block 4, Clifton, Karachi',
    registeredDate: '2026-06-08'
  },
  {
    id: 'MRN-240-612-44',
    name: 'Fatima Yusuf',
    cnic: '42201-5544991-6',
    phone: '0334-8877112',
    age: 34,
    gender: 'Female',
    address: 'Askari 5, Malir Cantt, Karachi',
    registeredDate: '2026-06-08'
  },
  {
    id: 'MRN-29384',
    name: 'Ahmed Ali Khan',
    cnic: '42201-2938411-9',
    phone: '+92 300 1234567',
    age: 34,
    gender: 'Male',
    address: 'Plot 45, Commercial Area, Block 2, PECHS, Karachi',
    registeredDate: '2026-04-18'
  },
  {
    id: 'MRN-2023-9941',
    name: 'Ahmed Raza Khan',
    cnic: '42201-1234567-1',
    phone: '0300-1234567',
    age: 45,
    gender: 'Male',
    address: 'Block 2, Khalid Bin Waleed Road, PECHS, Karachi',
    registeredDate: '2026-06-07'
  },
  {
    id: 'MRN-2023-9942',
    name: 'Saira Batool',
    cnic: '42101-9876543-2',
    phone: '0321-9988776',
    age: 29,
    gender: 'Female',
    address: 'Askari XI, Clifton Road, Karachi',
    registeredDate: '2026-06-07'
  }
];

export const INITIAL_TOKENS: Token[] = [
  {
    id: 't-124',
    patientId: 'MRN-240-581-22',
    patientName: 'Muhammad Bilal',
    department: 'General OPD',
    tokenNo: 'G-124',
    fee: 500,
    doctorName: 'Dr. Mansoor Ali',
    timeSlot: '09:45 AM',
    status: 'In Consultation',
    date: '2026-06-08'
  },
  {
    id: 't-125',
    patientId: 'MRN-240-591',
    patientName: 'Sara Khan',
    department: 'General OPD',
    tokenNo: 'G-125',
    fee: 500,
    doctorName: 'Dr. Ahmed Shah',
    timeSlot: '10:15 AM',
    status: 'Waiting',
    date: '2026-06-08'
  },
  {
    id: 't-126',
    patientId: 'MRN-240-601-99',
    patientName: 'Zubair Ahmed',
    department: 'Consultation',
    tokenNo: 'C-042',
    fee: 1500,
    doctorName: 'Dr. Ahmed Shah',
    timeSlot: '10:30 AM',
    status: 'Waiting',
    date: '2026-06-08'
  },
  {
    id: 't-127',
    patientId: 'MRN-240-612-44',
    patientName: 'Fatima Yusuf',
    department: 'Emergency',
    tokenNo: 'E-009',
    fee: 1000,
    doctorName: 'Dr. Omer Shah',
    timeSlot: '10:45 AM',
    status: 'Waiting',
    date: '2026-06-08'
  }
];

export const INITIAL_LAB_ORDERS: LabOrder[] = [
  {
    id: 'ord-9821',
    orderId: '#LB-9821',
    patientId: 'MRN-240-581',
    patientName: 'Muhammad Ahmed',
    age: 42,
    gender: 'Male',
    testType: 'Complete Blood Count (CBC)',
    status: 'PENDING',
    orderDate: '2026-06-08'
  },
  {
    id: 'ord-9819',
    orderId: '#LB-9819',
    patientId: 'MRN-240-590',
    patientName: 'Fatima Zehra',
    age: 28,
    gender: 'Female',
    testType: 'Liver Function Test (LFT)',
    status: 'SAMPLING',
    orderDate: '2026-06-08'
  },
  {
    id: 'ord-9815',
    orderId: '#LB-9815',
    patientId: 'MRN-240-582',
    patientName: 'Abdul Rehman',
    age: 55,
    gender: 'Male',
    testType: 'Lipid Profile',
    status: 'PROCESSING',
    orderDate: '2026-06-08'
  },
  {
    id: 'ord-9810',
    orderId: '#LB-9810',
    patientId: 'MRN-240-591',
    patientName: 'Sara Khan',
    age: 31,
    gender: 'Female',
    testType: 'Glucose Fasting',
    status: 'COMPLETED',
    orderDate: '2026-06-08',
    results: {
      hemoglobin: '14.2',
      tlc: '7,300',
      platelets: '2.8',
      neutrophils: '62',
      comments: 'Patient results are entirely normal. Hemoglobin count is healthy. No sign of pathological stress.'
    }
  }
];

export const INITIAL_MEDICINES: Medicine[] = [
  {
    id: 'med-1',
    name: 'Panadol CF',
    generic: 'Paracetamol, Pseudoephedrine',
    category: 'Tablets',
    stock: 450,
    price: 240,
    isLowStock: false
  },
  {
    id: 'med-2',
    name: 'Augmentin 625mg',
    generic: 'Amoxicillin / Clavulanate',
    category: 'Tablets',
    stock: 12,
    price: 890,
    isLowStock: true
  },
  {
    id: 'med-3',
    name: 'Brufen 400mg',
    generic: 'Ibuprofen',
    category: 'Tablets',
    stock: 120,
    price: 180,
    isLowStock: false
  },
  {
    id: 'med-4',
    name: 'Amoxil Syrup',
    generic: 'Amoxicillin 250mg/5ml',
    category: 'Syrups',
    stock: 82,
    price: 320,
    isLowStock: false
  },
  {
    id: 'med-5',
    name: 'Softin',
    generic: 'Loratadine 10mg',
    category: 'Tablets',
    stock: 215,
    price: 450,
    isLowStock: false
  },
  {
    id: 'med-6',
    name: 'Insulin Lantus',
    generic: 'Insulin Glargine 100 IU',
    category: 'Injections',
    stock: 4,
    price: 4200,
    isLowStock: true
  },
  {
    id: 'med-7',
    name: 'Zantac',
    generic: 'Ranitidine 150mg',
    category: 'Tablets',
    stock: 50,
    price: 120,
    isLowStock: false
  },
  {
    id: 'med-8',
    name: 'Surbex Z',
    generic: 'Multivitamins + Zinc',
    category: 'Tablets',
    stock: 340,
    price: 600,
    isLowStock: false
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'INV-2023-8821',
    patientId: 'MRN-29384',
    patientName: 'Ahmed Ali Khan',
    cnic: '42201-2938411-9',
    phone: '+92 300 1234567',
    age: 34,
    gender: 'Male',
    lastVisit: '24 Oct 2023',
    mrn: 'MRN-29384',
    items: [
      { category: 'OPD', description: 'Consultation - Dr. Faisal (Senior Consultant)', qty: 1, unitPrice: 2500, total: 2500 },
      { category: 'LAB', description: 'Complete Blood Count (CBC) with ESR', qty: 1, unitPrice: 1200, total: 1200 },
      { category: 'LAB', description: 'Blood Sugar (Random)', qty: 1, unitPrice: 350, total: 350 },
      { category: 'PHARMACY', description: 'Tab. Panadol 500mg (Strip of 10)', qty: 2, unitPrice: 45, total: 90 }
    ],
    discount: 0,
    tax: 0,
    totalPayable: 4140,
    paymentMethod: 'Cash Payment',
    status: 'Paid',
    date: '2023-10-24'
  }
];

export const INITIAL_PRESCRIPTIONS: ClinicalPrescription[] = [
  {
    id: 'pres-1',
    patientId: 'MRN-240-581-22',
    patientName: 'Muhammad Bilal',
    age: 42,
    gender: 'Male',
    mrn: 'MRN-240-581-22',
    complaint: 'Chronic Back Pain, Fatigue',
    vitals: {
      bp: '150/95',
      temp: '98.6°F'
    },
    allergies: 'Penicillin',
    previousVisit: '12 Jan 2024 (Fever)',
    notes: 'Patient suffers from postural back discomfort due to long sedentary hours. Advised physical spinal therapy and ergonomic adjustments. Blood panels requested to rule out generic fatigue biomarkers.',
    medications: [
      { name: 'Panadol CF 500mg', dosage: '1 Tab', frequency: '1 + 0 + 1 (After Meal)' }
    ],
    bloodTests: ['CBC (Complete Blood Count)'],
    imagingTests: ['X-Ray Chest (PA View)'],
    otherLabTest: '',
    date: '2026-06-08'
  }
];

// Doctor Avatars references as requested
export const DOCTOR_IMAGES = {
  admin: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsoozx5vI5l-VVGumCMFzAevGHfTZ2MBPUYy1gJ1puYtbPNORxYq0glNmoll64JNNY0hksZnOLuVTRGPaDZpK14JinDHf3VkNefsHEZnmyrJrG2mLsU_tOE2aX1DOPsNru8AfMlOeQt7MQginhCIWO7kYFaV9CTyNOmc4EjRg0UNvam4e24WuBSEP7x3jDValX5mMlSvaF2u5gWOX0EG2FTzOmrkxW1VfTft0YhxBnU461ApUPTvp0HGjkkkvnf-PgYSeQIgfezN8',
  cashier: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4yIUr1Co3fLMl5u8V7ew-3TpucZGqtujuVBr82o-H0wMD3q6jw_yAqi5_hrFpVynBtIAOQ7S4PPXBkzRlALIV18SrHEx7f5y0XXupVoqlsb0S97bTjoIKhIO12ywbGth31bpf1cQ-NQ79Hh7NloSkJQQiQo82FaUvqrt3CGo847r2io3PYGtIWKeAmLSzFRpDJtN01QFuvZ9KgJWsq_1Fz6D9-dPpgZFb8yiSGhn5J83u47McrzuNDOLIWoQnGc7Y6PNFEtII-84',
  ahmedShah: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrliKiHQALYxGqx51SU29LF2EtVWdHOaGCmHjf6PY2a54Npv-h_mhk3E-jqH7TsYSkb3D5cntrsvbJ0XXdhuAqVWTmq3pZYNE4ou7W6Gcfdjqgn5FgO49Ygheb6-OBeNtFEZ_kDmgCrVVg3BdJAP5T3x42eg3cuIPmNaQYQp9Wqh0T7uSBrRP9NEhWSzNG4t2XZBK7R0xB5vVh9oosxVHWoLe60xR9VcHbU4C9yX70n3e4UZO7Lx5oVWFbsRH5znLqM1fTVIK3hA0',
  ahmedAli: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuFpMmX1tJsZdW4gOyXOPKPvdusV_WGgRwxxK0nlqd2fC2Cy5bN8U5ijNzlu-Zyw36krzF-5a6Nl_3gmdd3XRhFnXwojmk73wExmKbpYDKS-Tgw08oqmgUODcFmeEti8HZis7xFvJub8VuSZFxnWZqmhGeRQE9Huuk89rkjEWA9KV7DZh5q3tFtiT7lTfPxuWHQrvtLeSdtWmJi0O7bTfpGJfEX1UhWCgOyoryIs9sgv8UZWalzVQuJlMY3K2XGn-GNjtZ0S1pOeo',
  sarahKhan: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABzbogIt1DOLhJUcuH929serLoBOrRFmq8YMO19j0qBw9JjU6278A3ys7vClsI_zuWvKHKGiHX1TJtmPLhw7yiUuQp8mbNKuFxPXPGLp4AbeZlZ5YR5CDeEWSOU6rbLJZlJNF9mviH-K0DIGnB1ZpNIr-KqMSMmjo8L_XT5QQL9ig1fXsBGtblVIzAZiHyM3sQmsreiWBVrju3yXMVCdmjEV1z-dVDBeKUZDsY_PvJEY0qetG_MTfaZyUhbxMD90s1VAaFSXD-1fQ',
  omerShah: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoTyHREHGklHJ6_Lu38M91gZisrtI2D8roww_Bz7998JqWVNEhJuCNr9vT-xEJ6-VYEPVqoiEXVx9yUjGn3mVzFDiOoNCdCd6XaP-oH3MD7uxlARwUxX2qGn3bBBf3ejWMQJb8QYEohkyeaaC5zTDOrA9rILsIwKw4n8vYyDLEdKATTWDC0zny1c9PooK-pjBTTQoRuI-f9AQ8J9PHMXTOXkIHXNA7KkVIU12PJT2mQUSqzUMfy8y0vPx-ZfhF9IxGLh5LUWzLU1s',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6j2YByUuIqQ3wpLBD169v7bPpksn1Uq73RTBSW2KkfyeEzlRxwYWN2qNrG_JH5JjBnMCYhgKOqmbsbL7FaJRSPQcbQhkDrBSrdckFwv3fiIuB71tF5bxAcNYFyba65UAugdG8FfjT0MrNasMWumILpSMH7hwc9L_CviN_FTfeNeC3OtfP3qcsvJPFZnC-tDcPjVnQAnCiNbeJVQu8zrQ39AhAl9XmDmMnSSi0uKTMeiXpV2eXwKhwx7tTR0WOivC1cij8ydcEFUo'
};
