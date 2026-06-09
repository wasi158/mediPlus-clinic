/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Stethoscope, AlertTriangle, Pill, Trash2, PlusCircle, Bookmark, ClipboardList, CheckCircle2, ChevronRight, Calendar, ArrowRight } from 'lucide-react';
import { Token, ClinicalPrescription, Medicine, Patient } from '../types';
import { useToast } from '../context/ToastContext';
import ConfirmDialog, { DetailModal, DetailRow, ActionButtons } from './ui/RecordActions';

interface OPDTabProps {
  tokens: Token[];
  patients: Patient[];
  focusPatientId?: string | null;
  onFocusHandled?: () => void;
  onCompleteToken: (tokenId: string) => void;
  onDeleteToken: (tokenId: string) => void;
  prescriptions: ClinicalPrescription[];
  onSavePrescription: (prescription: ClinicalPrescription) => void;
  medicinesList: Medicine[];
  onSelectPrint: (type: 'token' | 'prescription' | 'invoice' | 'labReport', data: any) => void;
}

export default function OPDTab({
  tokens,
  patients,
  focusPatientId,
  onFocusHandled,
  onCompleteToken,
  onDeleteToken,
  prescriptions,
  onSavePrescription,
  medicinesList,
  onSelectPrint
}: OPDTabProps) {
  const { toast } = useToast();
  const [deleteTokenId, setDeleteTokenId] = React.useState<string | null>(null);
  const [viewToken, setViewToken] = React.useState<Token | null>(null);
  // Live queue matching
  const waitingTokens = tokens.filter(t => t.status === 'Waiting' || t.status === 'In Consultation');
  const [activeTokenId, setActiveTokenId] = React.useState<string>('');

  React.useEffect(() => {
    if (focusPatientId) {
      const token = tokens.find(
        t => t.patientId === focusPatientId && (t.status === 'Waiting' || t.status === 'In Consultation')
      );
      if (token) {
        setActiveTokenId(token.id);
      } else {
        const patient = patients.find(p => p.id === focusPatientId);
        toast(
          patient
            ? `${patient.name} has no active OPD token. Register them first.`
            : 'Patient not found in the queue.',
          'warning'
        );
      }
      onFocusHandled?.();
    }
  }, [focusPatientId]);

  React.useEffect(() => {
    if (waitingTokens.length > 0 && !activeTokenId) {
      const current = waitingTokens.find(t => t.status === 'In Consultation') || waitingTokens[0];
      setActiveTokenId(current.id);
    }
  }, [waitingTokens, activeTokenId]);

  const activeToken = tokens.find(t => t.id === activeTokenId);

  // Match or create prescription draft for active patient
  const [complaint, setComplaint] = React.useState('Chronic Back Pain, Fatigue');
  const [bp, setBp] = React.useState('150/95');
  const [temp, setTemp] = React.useState('98.6°F');
  const [allergies, setAllergies] = React.useState('Penicillin');
  const [prevVisit, setPrevVisit] = React.useState('12 Jan 2024 (Fever)');
  const [notes, setNotes] = React.useState('');

  // Medication rows list
  const [meds, setMeds] = React.useState<Array<{ name: string; dosage: string; frequency: string }>>([
    { name: 'Panadol CF 500mg', dosage: '1 Tab', frequency: '1 + 0 + 1 (After Meal)' }
  ]);

  // Adder form fields
  const [newName, setNewName] = React.useState('');
  const [newDosage, setNewDosage] = React.useState('');
  const [newFrequency, setNewFrequency] = React.useState('1 + 0 + 1 (After Meal)');

  // Blood and Imaging states
  const [bloodTests, setBloodTests] = React.useState<string[]>(['CBC (Complete Blood Count)']);
  const [imagingTests, setImagingTests] = React.useState<string[]>(['X-Ray Chest (PA View)']);
  const [otherLab, setOtherLab] = React.useState('');

  const [savingState, setSavingState] = React.useState(false);
  const [medSearchQuery, setMedSearchQuery] = React.useState('');
  const [showMedSuggestions, setShowMedSuggestions] = React.useState(false);

  // Sync state whenever active patient shifts
  React.useEffect(() => {
    if (activeToken) {
      const saved = prescriptions.find(p => p.patientId === activeToken.patientId);
      if (saved) {
        setComplaint(saved.complaint);
        setBp(saved.vitals.bp);
        setTemp(saved.vitals.temp);
        setAllergies(saved.allergies);
        setPrevVisit(saved.previousVisit);
        setNotes(saved.notes);
        setMeds(saved.medications);
        setBloodTests(saved.bloodTests);
        setImagingTests(saved.imagingTests);
        setOtherLab(saved.otherLabTest);
      } else {
        // Standard initial mockup fallback defaults
        setComplaint('Chronic Back Pain, Fatigue');
        setBp('150/95');
        setTemp('98.6°F');
        setAllergies('Penicillin');
        setPrevVisit('12 Jan 2024 (Fever)');
        setNotes('');
        setMeds([{ name: 'Panadol CF 500mg', dosage: '1 Tab', frequency: '1 + 0 + 1 (After Meal)' }]);
        setBloodTests(['CBC (Complete Blood Count)']);
        setImagingTests(['X-Ray Chest (PA View)']);
        setOtherLab('');
      }
    }
  }, [activeTokenId, prescriptions]);

  const handleAddMedRow = () => {
    if (!newName.trim()) return;
    setMeds([...meds, { name: newName, dosage: newDosage || '1 Tab', frequency: newFrequency }]);
    setNewName('');
    setNewDosage('');
    setNewFrequency('1 + 0 + 1 (After Meal)');
    setShowMedSuggestions(false);
  };

  const handleDeleteMedRow = (idx: number) => {
    setMeds(meds.filter((_, i) => i !== idx));
  };

  const handleBloodTestToggle = (test: string) => {
    if (bloodTests.includes(test)) {
      setBloodTests(bloodTests.filter(t => t !== test));
    } else {
      setBloodTests([...bloodTests, test]);
    }
  };

  const handleImagingTestToggle = (test: string) => {
    if (imagingTests.includes(test)) {
      setImagingTests(imagingTests.filter(t => t !== test));
    } else {
      setImagingTests([...imagingTests, test]);
    }
  };

  const handleSelectSuggestion = (medName: string) => {
    setNewName(medName);
    setShowMedSuggestions(false);
  };

  // Switch to next patient in queue
  const handleShiftNextPatient = () => {
    if (waitingTokens.length > 1) {
      const idx = waitingTokens.findIndex(t => t.id === activeTokenId);
      const nextIdx = (idx + 1) % waitingTokens.length;
      setActiveTokenId(waitingTokens[nextIdx].id);
    }
  };

  const handleSaveAndPrint = () => {
    if (!activeToken) return;
    setSavingState(true);

    const prescription: ClinicalPrescription = {
      id: `pres-${activeToken.id}`,
      patientId: activeToken.patientId,
      patientName: activeToken.patientName,
      age: 42, // placeholder
      gender: 'Male', // placeholder
      mrn: activeToken.patientId,
      complaint,
      vitals: { bp, temp },
      allergies,
      previousVisit: prevVisit,
      notes,
      medications: meds,
      bloodTests,
      imagingTests,
      otherLabTest: otherLab,
      date: new Date().toISOString().split('T')[0]
    };

    onSavePrescription(prescription);

    setTimeout(() => {
      setSavingState(false);
      // Open Print Viewer Report
      onSelectPrint('prescription', { prescription });
      // Complete active token so queue advances
      onCompleteToken(activeToken.id);
      // Auto shift
      const index = waitingTokens.findIndex(t => t.id === activeToken.id);
      const nextOnes = waitingTokens.filter(t => t.id !== activeToken.id);
      if (nextOnes.length > 0) {
        setActiveTokenId(nextOnes[0].id);
      }
    }, 1200);
  };

  // Filter medicines for autocomplete recommendations
  const medSuggestions = medicinesList.filter(m =>
    m.name.toLowerCase().includes(newName.toLowerCase())
  ).slice(0, 4);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full items-start">
      {/* Patient Queue Left Sidebar */}
      <aside className="w-full lg:w-80 bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col shrink-0 shadow-sm">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center text-gray-800">
          <h2 className="text-sm font-bold uppercase tracking-tight">Doctor Cabins Queue</h2>
          <span className="bg-lime text-forest text-[10px] px-2.5 py-0.5 rounded-full font-bold">
            {waitingTokens.length} Waiting
          </span>
        </div>

        <div className="divide-y divide-gray-100 max-h-[440px] lg:max-h-[580px] overflow-y-auto custom-scrollbar">
          {waitingTokens.map((token) => (
            <div
              key={token.id}
              onClick={() => setActiveTokenId(token.id)}
              className={`p-4 cursor-pointer transition-colors border-l-4 ${
                activeTokenId === token.id
                  ? 'border-forest bg-lime/10/40'
                  : 'border-transparent hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start mb-1 text-xs">
                <span className={`font-mono font-bold font-label-caps text-[9px] uppercase ${
                  activeTokenId === token.id ? 'text-forest' : 'text-gray-400'
                }`}>
                  {token.tokenNo}
                </span>
                <span className="text-[10px] text-gray-400 font-bold">{token.timeSlot}</span>
              </div>
              <h3 className="text-xs font-bold text-gray-900 leading-tight">{token.patientName}</h3>
              <p className="text-[10px] text-gray-400 mt-1">Ref: {token.patientId} • OPD Slot</p>
              {token.id === activeTokenId ? (
                <div className="mt-2 flex gap-1 items-center">
                  <span className="bg-red-50 text-red-700 text-[8px] font-bold px-1.5 py-0.5 rounded border border-red-100 uppercase animate-pulse">
                    Vitals High
                  </span>
                  <span className="bg-gray-100 text-gray-600 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                    Active File
                  </span>
                </div>
              ) : null}
              <div className="mt-2 flex justify-end" onClick={e => e.stopPropagation()}>
                <ActionButtons
                  onView={() => setViewToken(token)}
                  onDelete={() => setDeleteTokenId(token.id)}
                />
              </div>
            </div>
          ))}

          {waitingTokens.length === 0 && (
            <p className="text-xs text-center text-gray-400 italic py-10">No patients waiting in queue.</p>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50/50">
          <button
            onClick={handleShiftNextPatient}
            disabled={waitingTokens.length <= 1}
            className="w-full py-3 btn-lime font-bold rounded-lg text-xs tracking-wider uppercase transition shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Advance Patient
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Workspace Consultation Form */}
      {activeToken ? (
        <section className="flex-1 space-y-6">
          {/* Patient Header Block */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Chief Complaint</span>
              <input
                type="text"
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                className="font-bold text-xs text-gray-900 bg-transparent border-b border-dashed border-gray-200 focus:outline-none focus:border-forest w-full"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest block">Consultation Vitals</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  className="font-mono text-xs font-bold text-red-600 bg-transparent border-b border-dashed border-gray-200 focus:outline-none focus:border-red-600 w-16"
                  placeholder="BP"
                />
                <input
                  type="text"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  className="font-mono text-xs font-bold text-gray-900 bg-transparent border-b border-dashed border-gray-200 focus:outline-none focus:border-red-600 w-16"
                  placeholder="Temp"
                />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest flex items-center gap-1 block">
                <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" /> Alert Allergy
              </span>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="font-bold text-xs text-red-700 bg-transparent border-b border-dashed border-gray-200 focus:outline-none focus:border-red-600 w-full"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Previous Medical History</span>
              <input
                type="text"
                value={prevVisit}
                onChange={(e) => setPrevVisit(e.target.value)}
                className="font-bold text-xs text-gray-700 bg-transparent border-b border-dashed border-gray-200 focus:outline-none focus:border-forest w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Notes & Prescriptions */}
            <div className="xl:col-span-8 space-y-6">
              {/* Clinical Description Notes */}
              <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4 text-forest" />
                  Physician Diagnostic Findings
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Type doctor observation symptoms, chronic conditions, state physical checks and general pathological remarks here..."
                  className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs leading-relaxed focus:outline-none focus:border-forest focus:bg-white resize-none transition-colors"
                />
              </div>

              {/* Medication Table Form */}
              <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-forest" />
                    Medication / Rx Prescription List
                  </h3>
                </div>

                {/* Table headers */}
                <div className="grid grid-cols-12 gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
                  <div className="col-span-5">Medicine Item</div>
                  <div className="col-span-3">Dosage</div>
                  <div className="col-span-3">Frequency / Duration</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Real-time rows */}
                <div className="space-y-2">
                  {meds.map((m, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-3 items-center bg-gray-50 p-2 rounded-lg border border-gray-100 transition-colors hover:bg-gray-100/50">
                      <div className="col-span-5 font-bold text-xs text-gray-900">{m.name}</div>
                      <div className="col-span-3 font-mono text-xs text-gray-700">{m.dosage}</div>
                      <div className="col-span-3 text-xs text-gray-600">{m.frequency}</div>
                      <div className="col-span-1 flex justify-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteMedRow(idx)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add Medication Row Interactive Fields */}
                  <div className="grid grid-cols-12 gap-2 mt-4 pt-4 border-t border-gray-100 relative items-center">
                    <div className="col-span-5 relative">
                      <input
                        type="text"
                        placeholder="Start typing medicine name..."
                        value={newName}
                        onChange={(e) => {
                          setNewName(e.target.value);
                          setShowMedSuggestions(true);
                        }}
                        onFocus={() => setShowMedSuggestions(true)}
                        className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-forest text-xs font-semibold"
                      />
                      {/* Autocomplete Box suggestions */}
                      {showMedSuggestions && newName.length > 0 && medSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-20 text-xs divide-y divide-gray-50">
                          {medSuggestions.map((s) => (
                            <div
                              key={s.id}
                              onClick={() => handleSelectSuggestion(s.name)}
                              className="px-3 py-2 hover:bg-lime/10/50 cursor-pointer font-bold text-gray-800"
                            >
                              {s.name} <span className="font-normal text-[10px] text-gray-400">({s.generic})</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="1 Tab / 1 Spoon"
                        value={newDosage}
                        onChange={(e) => setNewDosage(e.target.value)}
                        className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-forest text-xs font-semibold"
                      />
                    </div>
                    <div className="col-span-3">
                      <select
                        value={newFrequency}
                        onChange={(e) => setNewFrequency(e.target.value)}
                        className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-forest text-[11px]"
                      >
                        <option>1 + 0 + 1 (After Meal)</option>
                        <option>1 + 1 + 1 (Before Meal)</option>
                        <option>0 + 0 + 1 (Bedtime)</option>
                        <option>As needed (SOS)</option>
                        <option>Once Daily</option>
                      </select>
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={handleAddMedRow}
                        className="p-1.5 bg-lime/20 hover:bg-lime/30 text-forest rounded-full transition-colors"
                      >
                        <PlusCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Lab investigations checklist panel */}
            <div className="xl:col-span-4 space-y-6">
              <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4 text-forest" />
                  Prescribe Diagnostics
                </h3>

                <div className="space-y-4">
                  {/* Blood Tests checklist */}
                  <div className="space-y-1.5 text-xs">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Blood Tests Panel</span>
                    {['CBC (Complete Blood Count)', 'FBS / RBS (Sugar)', 'LFT (Liver Function Test)'].map((t) => (
                      <label key={t} className="flex items-center gap-2 p-2 hover:bg-gray-50 border border-gray-100 rounded-lg cursor-pointer transition">
                        <input
                          type="checkbox"
                          checked={bloodTests.includes(t)}
                          onChange={() => handleBloodTestToggle(t)}
                          className="rounded border-gray-300 text-forest focus:ring-forest/20 w-4 h-4"
                        />
                        <span className="font-semibold text-gray-700">{t}</span>
                      </label>
                    ))}
                  </div>

                  {/* Imaging Tests Block */}
                  <div className="space-y-1.5 text-xs">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Imaging & Scans</span>
                    {['X-Ray Chest (PA View)', 'Ultrasound Abdomen'].map((t) => (
                      <label key={t} className="flex items-center gap-2 p-2 hover:bg-gray-50 border border-gray-100 rounded-lg cursor-pointer transition">
                        <input
                          type="checkbox"
                          checked={imagingTests.includes(t)}
                          onChange={() => handleImagingTestToggle(t)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        <span className="font-semibold text-gray-700">{t}</span>
                      </label>
                    ))}
                  </div>

                  {/* Other Custom write in */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Additional Pathology request</span>
                    <input
                      type="text"
                      value={otherLab}
                      onChange={(e) => setOtherLab(e.target.value)}
                      placeholder="+ Add custom diagnostic test..."
                      className="w-full bg-slate-50 border border-dashed border-gray-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-blue-600 focus:border-forest focus:bg-white transition-all uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Patient Submission Actions */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => toast(`Follow-up scheduled for ${activeToken.patientName} in 14 days`, 'success')}
                  className="w-full py-4 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 rounded-xl font-bold text-xs tracking-wider uppercase transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  Schedule Follow-up
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndPrint}
                  disabled={savingState}
                  className="w-full py-5 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-indigo-900 text-white rounded-xl shadow-lg hover:shadow-blue-200 font-bold text-sm tracking-wide transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {savingState ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></span>
                      <span>PRINTING CERTIFICATION...</span>
                    </>
                  ) : (
                    <>
                      <span>SAVE &amp; CERTIFY PRESCRIPTION</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="flex-1 bg-white border border-gray-200 rounded-xl p-10 shadow-sm text-center">
          <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">OPD Panel Idle</h3>
          <p className="text-gray-400 text-xs mt-2">All waiting patients have been fully consulted. Click Registration to admit queues.</p>
        </section>
      )}

      <DetailModal open={!!viewToken} title="Queue Token" onClose={() => setViewToken(null)}>
        {viewToken && (
          <>
            <DetailRow label="Token" value={viewToken.tokenNo} />
            <DetailRow label="Patient" value={viewToken.patientName} />
            <DetailRow label="MRN" value={viewToken.patientId} />
            <DetailRow label="Department" value={viewToken.department} />
            <DetailRow label="Doctor" value={viewToken.doctorName} />
            <DetailRow label="Fee" value={`PKR ${viewToken.fee}`} />
            <DetailRow label="Status" value={viewToken.status} />
          </>
        )}
      </DetailModal>

      <ConfirmDialog
        open={!!deleteTokenId}
        title="Remove from Queue"
        message="Remove this patient from the OPD queue?"
        onConfirm={() => {
          if (deleteTokenId) {
            onDeleteToken(deleteTokenId);
            if (activeTokenId === deleteTokenId) setActiveTokenId('');
            toast('Removed from queue', 'success');
            setDeleteTokenId(null);
          }
        }}
        onCancel={() => setDeleteTokenId(null)}
      />
    </div>
  );
}
