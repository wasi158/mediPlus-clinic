/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserPlus, Ticket, Users, Printer, AlertCircle, User } from 'lucide-react';
import { Patient, Token } from '../types';
import { useToast } from '../context/ToastContext';
import ConfirmDialog, { DetailModal, DetailRow, ActionButtons } from './ui/RecordActions';

interface RegistrationTabProps {
  patients: Patient[];
  onAddPatient: (patient: Patient) => void;
  onUpdatePatient: (patient: Patient) => void;
  onDeletePatient: (patientId: string) => void;
  tokens: Token[];
  onAddToken: (token: Token) => void;
  onUpdateToken: (token: Token) => void;
  onDeleteToken: (tokenId: string) => void;
  onSelectPrint: (type: 'token' | 'prescription' | 'invoice' | 'labReport', data: any) => void;
}

export default function RegistrationTab({
  patients, onAddPatient, onUpdatePatient, onDeletePatient,
  tokens, onAddToken, onUpdateToken, onDeleteToken, onSelectPrint,
}: RegistrationTabProps) {
  const { toast } = useToast();
  const [cnic, setCnic] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [name, setName] = React.useState('');
  const [age, setAge] = React.useState('');
  const [gender, setGender] = React.useState<'Male' | 'Female' | 'Other'>('Male');
  const [address, setAddress] = React.useState('');
  const [selectedDept, setSelectedDept] = React.useState<'General OPD' | 'Emergency' | 'Consultation'>('General OPD');
  const [errorText, setErrorText] = React.useState('');
  const [editingPatientId, setEditingPatientId] = React.useState<string | null>(null);
  const [viewPatient, setViewPatient] = React.useState<Patient | null>(null);
  const [viewToken, setViewToken] = React.useState<Token | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<{ type: 'patient' | 'token'; id: string; name: string } | null>(null);
  const [listSearch, setListSearch] = React.useState('');

  const loadPatientIntoForm = (p: Patient) => {
    setEditingPatientId(p.id);
    setCnic(p.cnic);
    setPhone(p.phone.replace('+92 ', ''));
    setName(p.name);
    setAge(p.age.toString());
    setGender(p.gender);
    setAddress(p.address);
    setErrorText('');
    toast(`Editing ${p.name}`, 'info');
  };

  const handleFormReset = () => {
    setCnic(''); setPhone(''); setName(''); setAge('');
    setGender('Male'); setAddress(''); setErrorText('');
    setEditingPatientId(null);
  };

  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9-]/g, '');
    if (val.length === 5 && !val.endsWith('-')) val += '-';
    else if (val.length === 13 && val.lastIndexOf('-') === 5) val += '-';
    if (val.length <= 15) setCnic(val);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 10) setPhone(val);
  };

  const handleGenerateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setErrorText('Please enter the patient\'s full name.'); return; }
    if (!age || isNaN(Number(age)) || Number(age) <= 0) { setErrorText('Please enter a valid age.'); return; }
    if (!cnic || cnic.length < 15) { setErrorText('Please enter a valid CNIC.'); return; }
    if (!phone || phone.length < 10) { setErrorText('Please enter a valid phone number.'); return; }
    setErrorText('');

    const cleanPhone = `+92 ${phone}`;
    let patient = patients.find(p => p.id === editingPatientId) ?? patients.find(p => p.cnic === cnic);

    if (editingPatientId && patient) {
      const updated: Patient = {
        ...patient, name, cnic, phone: cleanPhone,
        age: Number(age), gender, address: address || 'Karachi, Pakistan',
      };
      onUpdatePatient(updated);
      patient = updated;
      toast(`Patient ${name} updated`, 'success');
      handleFormReset();
      return;
    }

    if (!patient) {
      patient = {
        id: `MRN-240-${Math.floor(100 + Math.random() * 900)}`,
        name, cnic, phone: cleanPhone, age: Number(age), gender,
        address: address || 'Karachi, Pakistan',
        registeredDate: new Date().toISOString().split('T')[0],
      };
      onAddPatient(patient);
    }

    let fee = 500, docName = 'Dr. Mansoor Ali', tokenLetter = 'G';
    if (selectedDept === 'Emergency') { fee = 1000; docName = 'Dr. Omer Shah'; tokenLetter = 'E'; }
    else if (selectedDept === 'Consultation') { fee = 1500; docName = 'Dr. Ahmed Shah'; tokenLetter = 'C'; }

    const deptTokensCount = tokens.filter(t => t.department === selectedDept).length;
    const tokenNo = `${tokenLetter}-${String(100 + deptTokensCount + 1).slice(1)}`;
    const now = new Date();
    const formattedTime = `${String(now.getHours() % 12 || 12).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;

    const newToken: Token = {
      id: `t-${Date.now()}`, patientId: patient.id, patientName: patient.name,
      department: selectedDept, tokenNo, fee, doctorName: docName,
      timeSlot: formattedTime, status: 'Waiting',
      date: new Date().toISOString().split('T')[0],
    };

    onAddToken(newToken);
    toast(`Token ${tokenNo} generated`, 'success');
    onSelectPrint('token', { token: newToken });
    handleFormReset();
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'patient') {
      onDeletePatient(deleteTarget.id);
      toast(`Patient ${deleteTarget.name} deleted`, 'success');
      if (editingPatientId === deleteTarget.id) handleFormReset();
    } else {
      onDeleteToken(deleteTarget.id);
      toast(`Token deleted`, 'success');
    }
    setDeleteTarget(null);
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(listSearch.toLowerCase()) ||
    p.cnic.includes(listSearch) ||
    p.id.toLowerCase().includes(listSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <section className="pharm-card p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5 text-forest">
                <UserPlus className="w-5 h-5" />
                <h2 className="text-lg font-bold">
                  {editingPatientId ? 'Edit Patient' : 'Patient Registration'}
                </h2>
              </div>
              {editingPatientId && (
                <button onClick={handleFormReset} className="text-xs text-gray-500 hover:text-forest font-semibold">
                  Cancel Edit
                </button>
              )}
            </div>

            {errorText && (
              <div className="p-3.5 bg-red-50 text-red-700 rounded-xl text-xs font-medium flex items-center gap-2 border border-red-100">
                <AlertCircle className="w-4 h-4 shrink-0" />{errorText}
              </div>
            )}

            <form onSubmit={handleGenerateToken} id="patient-reg-form" className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">CNIC Number</label>
                <input type="text" value={cnic} onChange={handleCnicChange} placeholder="42201-XXXXXXX-X"
                  className="input-pharm px-4 py-2.5 text-sm" required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">Mobile Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-xs">+92</span>
                  <input type="text" value={phone} onChange={handlePhoneChange} placeholder="3001234567"
                    className="input-pharm w-full rounded-l-none px-4 py-2.5 text-sm" required />
                </div>
              </div>
              <div className="md:col-span-2 flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Patient full name"
                  className="input-pharm px-4 py-2.5 text-sm" required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">Age</label>
                <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="35"
                  className="input-pharm px-4 py-2.5 text-sm" required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">Gender</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Male', 'Female', 'Other'] as const).map(g => (
                    <button key={g} type="button" onClick={() => setGender(g)}
                      className={`py-2 text-xs border rounded-xl font-semibold transition ${
                        gender === g ? 'bg-lime/30 border-forest text-forest' : 'bg-gray-50 border-gray-200 text-gray-600'
                      }`}>{g}</button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2 flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">Address</label>
                <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Street, Area, City" rows={2}
                  className="input-pharm px-4 py-2.5 text-sm resize-none" />
              </div>
            </form>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="pharm-card p-5 space-y-4 border-2 border-lime/30">
            <div className="flex items-center gap-2 text-forest border-b border-gray-100 pb-2">
              <Ticket className="w-5 h-5" />
              <h3 className="text-sm font-bold">Generate Token</h3>
            </div>
            <div className="space-y-2">
              {(['General OPD', 'Emergency', 'Consultation'] as const).map(dept => (
                <button key={dept} type="button" onClick={() => setSelectedDept(dept)}
                  className={`w-full p-3 rounded-xl border text-left text-sm font-semibold transition ${
                    selectedDept === dept ? 'border-forest bg-lime/20 text-forest' : 'border-gray-200 hover:border-gray-300'
                  }`}>{dept}</button>
              ))}
            </div>
            <button type="submit" form="patient-reg-form"
              className="w-full py-3.5 btn-lime font-semibold text-sm flex items-center justify-center gap-2">
              <Printer className="w-4 h-4" />
              {editingPatientId ? 'Save Patient' : 'Register & Print Token'}
            </button>
          </div>
          <div className="pharm-card p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Registered</p>
              <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
            </div>
            <div className="w-10 h-10 bg-lime/20 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-forest" />
            </div>
          </div>
        </div>
      </div>

      {/* Patient registry table */}
      <div className="pharm-card overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-gray-900">Patient Registry</h3>
          <input type="text" placeholder="Search patients..." value={listSearch}
            onChange={e => setListSearch(e.target.value)} className="input-pharm px-4 py-2 text-sm max-w-xs" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                {['MRN', 'Name', 'CNIC', 'Phone', 'Age/Gender', 'Registered', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPatients.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/60">
                  <td className="px-5 py-3.5 font-mono text-xs text-forest">{p.id}</td>
                  <td className="px-5 py-3.5 font-semibold">{p.name}</td>
                  <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">{p.cnic}</td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs">{p.phone}</td>
                  <td className="px-5 py-3.5 text-gray-600">{p.age}Y / {p.gender}</td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">{p.registeredDate}</td>
                  <td className="px-5 py-3.5">
                    <ActionButtons
                      onView={() => setViewPatient(p)}
                      onEdit={() => loadPatientIntoForm(p)}
                      onDelete={() => setDeleteTarget({ type: 'patient', id: p.id, name: p.name })}
                    />
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">No patients found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tokens table */}
      <div className="pharm-card overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Today's Tokens</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                {['Token', 'Patient', 'Department', 'Doctor', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tokens.map(t => (
                <tr key={t.id} className="hover:bg-gray-50/60">
                  <td className="px-5 py-3.5 font-mono font-bold text-forest">{t.tokenNo}</td>
                  <td className="px-5 py-3.5 font-semibold">{t.patientName}</td>
                  <td className="px-5 py-3.5 text-gray-600">{t.department}</td>
                  <td className="px-5 py-3.5 text-gray-500">{t.doctorName}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      t.status === 'Completed' ? 'badge-in-stock' :
                      t.status === 'In Consultation' ? 'badge-low-stock' : 'bg-gray-100 text-gray-600 rounded-full px-2.5 py-1'
                    }`}>{t.status}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <ActionButtons
                      onView={() => setViewToken(t)}
                      onEdit={() => { onUpdateToken({ ...t, status: t.status === 'Waiting' ? 'In Consultation' : 'Waiting' }); toast('Token status updated', 'success'); }}
                      onDelete={() => setDeleteTarget({ type: 'token', id: t.id, name: t.tokenNo })}
                    />
                  </td>
                </tr>
              ))}
              {tokens.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">No tokens issued today.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DetailModal open={!!viewPatient} title="Patient Details" onClose={() => setViewPatient(null)}>
        {viewPatient && (
          <>
            <DetailRow label="MRN" value={viewPatient.id} />
            <DetailRow label="Name" value={viewPatient.name} />
            <DetailRow label="CNIC" value={viewPatient.cnic} />
            <DetailRow label="Phone" value={viewPatient.phone} />
            <DetailRow label="Age / Gender" value={`${viewPatient.age}Y / ${viewPatient.gender}`} />
            <DetailRow label="Address" value={viewPatient.address} />
            <DetailRow label="Registered" value={viewPatient.registeredDate} />
          </>
        )}
      </DetailModal>

      <DetailModal open={!!viewToken} title="Token Details" onClose={() => setViewToken(null)}>
        {viewToken && (
          <>
            <DetailRow label="Token No" value={viewToken.tokenNo} />
            <DetailRow label="Patient" value={viewToken.patientName} />
            <DetailRow label="Department" value={viewToken.department} />
            <DetailRow label="Doctor" value={viewToken.doctorName} />
            <DetailRow label="Fee" value={`PKR ${viewToken.fee}`} />
            <DetailRow label="Time Slot" value={viewToken.timeSlot} />
            <DetailRow label="Status" value={viewToken.status} />
          </>
        )}
      </DetailModal>

      <ConfirmDialog
        open={!!deleteTarget}
        title={deleteTarget?.type === 'patient' ? 'Delete Patient' : 'Delete Token'}
        message={`Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone.${
          deleteTarget?.type === 'patient' ? ' Related tokens and records will also be removed.' : ''
        }`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
