/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Printer, Download, X, Check, Heart, Shield, Award } from 'lucide-react';
import { Patient, Token, LabOrder, Invoice, ClinicalPrescription } from '../types';
import { useToast } from '../context/ToastContext';

interface PrintViewerProps {
  type: 'token' | 'prescription' | 'invoice' | 'labReport';
  data: {
    patient?: Patient;
    token?: Token;
    labOrder?: LabOrder;
    invoice?: Invoice;
    prescription?: ClinicalPrescription;
  };
  onClose: () => void;
}

export default function PrintViewer({ type, data, onClose }: PrintViewerProps) {
  const { toast } = useToast();
  const printRef = React.useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = React.useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleSimulatePDF = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      toast(`PDF saved as MED_REPORT_${Date.now()}.pdf`, 'success');
    }, 1500);
  };

  const renderTokenPrint = () => {
    const token = data.token;
    if (!token) return null;
    return (
      <div className="p-8 max-w-sm mx-auto bg-white border border-gray-300 rounded shadow-sm text-center font-mono text-xs print-card">
        {/* Thermal Ticket Format */}
        <h1 className="text-xl font-bold tracking-tight text-blue-900 uppercase">MEDIPLUS CLINIC</h1>
        <p className="text-[10px] text-gray-500">Karachi East Branch • Tel: (021) 345-6789</p>
        <div className="border-b-2 border-dashed border-gray-300 my-4"></div>
        <p className="text-gray-600 uppercase font-bold text-xs">ENTRY TOKEN</p>
        <p className="text-4xl font-extrabold text-blue-800 my-3">{token.tokenNo}</p>
        <div className="text-left space-y-1.5 my-4">
          <div className="flex justify-between"><span>MRN:</span><span className="font-bold">{token.patientId}</span></div>
          <div className="flex justify-between"><span>PATIENT:</span><span className="font-bold">{token.patientName}</span></div>
          <div className="flex justify-between"><span>DEPT:</span><span className="font-bold">{token.department}</span></div>
          <div className="flex justify-between"><span>DOCTOR:</span><span className="font-extrabold">{token.doctorName}</span></div>
          <div className="flex justify-between"><span>FEE:</span><span className="font-bold">Rs. {token.fee}.00</span></div>
          <div className="flex justify-between"><span>TIME SLOT:</span><span>{token.timeSlot}</span></div>
          <div className="flex justify-between"><span>DATE:</span><span>{token.date}</span></div>
        </div>
        <div className="border-b-2 border-dashed border-gray-300 my-4"></div>
        <p className="text-[9px] text-gray-400 italic">Please wait in the common reception lounge. Your token will be announced shortly.</p>
        <p className="text-[8px] text-gray-300 mt-2">MediPlus OS Ticket System v1.4</p>
      </div>
    );
  };

  const renderPrescriptionPrint = () => {
    const prescription = data.prescription;
    if (!prescription) return null;
    return (
      <div className="p-10 max-w-3xl mx-auto bg-white border border-gray-200 mt-2 print-card text-gray-800">
        {/* Letterhead */}
        <div className="flex justify-between items-start border-b-2 border-blue-900 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-blue-900 leading-tight">MEDIPLUS CLINIC</h1>
            <p className="text-xs text-gray-600 font-medium">Providing Quality Clinical Healthcare Services</p>
            <p className="text-[10px] text-gray-500">PECHS Block 2, Shahrah-e-Faisal, Karachi • (021) 111-MEDIPLUS</p>
          </div>
          <div className="text-right text-xs">
            <h2 className="text-sm font-bold text-blue-800">{prescription.patientName}</h2>
            <p className="text-gray-500">General Consultation Dept</p>
            <p className="text-gray-500">Lic No: PMC-29384-A</p>
          </div>
        </div>

        {/* Patient Block */}
        <div className="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded mb-6 text-xs border border-gray-100">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Patient Name</p>
            <p className="font-bold">{prescription.patientName}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">MRN / ID</p>
            <p className="font-mono font-bold">{prescription.mrn}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Age / Gender</p>
            <p className="font-bold">{prescription.age}Y • {prescription.gender}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Date</p>
            <p className="font-bold">{prescription.date}</p>
          </div>
        </div>

        {/* Complaint & Vitals Block */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          <div className="col-span-4 border-r border-gray-200 pr-4 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-blue-900 uppercase border-b border-gray-100 pb-1 mb-2">Vitals</h3>
              <div className="text-xs space-y-1">
                <p><span className="text-gray-500">BP:</span> <span className="font-mono font-medium text-red-600">{prescription.vitals.bp} mmHg</span></p>
                <p><span className="text-gray-500">Temp:</span> <span className="font-mono font-medium">{prescription.vitals.temp}</span></p>
                {prescription.allergies && (
                  <p className="text-xs mt-3 p-1.5 bg-red-50 text-red-700 rounded border border-red-100">
                    <span className="font-bold">Allergies:</span> {prescription.allergies}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-blue-900 uppercase border-b border-gray-100 pb-1 mb-2">Investigations</h3>
              <div className="space-y-1">
                {prescription.bloodTests.map((t, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                    <span>{t}</span>
                  </div>
                ))}
                {prescription.imagingTests.map((t, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                    <span>{t}</span>
                  </div>
                ))}
                {prescription.otherLabTest && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-700 italic">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                    <span>{prescription.otherLabTest}</span>
                  </div>
                )}
                {prescription.bloodTests.length === 0 && prescription.imagingTests.length === 0 && !prescription.otherLabTest && (
                  <p className="text-xs text-gray-400 italic">Nil requested</p>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-8 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-blue-950 mb-2">Rx (Medications)</h3>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-300 text-gray-400">
                    <th className="py-2 font-bold uppercase">Medicine Name</th>
                    <th className="py-2 font-bold uppercase">Dosage</th>
                    <th className="py-2 font-bold uppercase">Frequency / Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {prescription.medications.map((m, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="py-3 font-semibold text-gray-900">{m.name}</td>
                      <td className="py-3 font-mono text-gray-700">{m.dosage || '1 Tab'}</td>
                      <td className="py-3 text-gray-600">{m.frequency}</td>
                    </tr>
                  ))}
                  {prescription.medications.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-gray-400 italic">No medicines added yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {prescription.notes && (
                <div className="mt-6">
                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Clinical Notes & Findings</h4>
                  <p className="text-xs leading-relaxed text-gray-600 bg-gray-50 p-3 border-l-2 border-blue-500">{prescription.notes}</p>
                </div>
              )}
            </div>

            {/* Signature Area */}
            <div className="flex justify-end pt-8">
              <div className="text-center font-mono w-48 border-t border-gray-400 pt-1.5 text-[10px]">
                <p className="font-bold uppercase text-gray-900">Dr. Ahmed Shah</p>
                <p className="text-gray-500">General Physician Block-E</p>
                <p className="text-[8px] text-gray-400 mt-0.5">PMDC No: PMA-29384-0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInvoicePrint = () => {
    const invoice = data.invoice;
    if (!invoice) return null;
    return (
      <div className="p-10 max-w-3xl mx-auto bg-white border border-gray-200 mt-2 print-card text-gray-800">
        {/* Letterhead */}
        <div className="flex justify-between items-start border-b-2 border-blue-900 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-blue-900 leading-tight">MEDIPLUS CLINIC</h1>
            <p className="text-xs text-gray-600 font-medium">Patient Billing & Finance Department</p>
            <p className="text-[10px] text-gray-500">PECHS Block 2, Faisal Cantonment, Karachi • (021) 111-MEDIPLUS</p>
          </div>
          <div className="text-right text-xs">
            <h2 className="text-sm font-bold text-blue-800">OFFICIAL INVOICE</h2>
            <p className="text-gray-500 text-xs font-mono font-bold mt-1">ID: {invoice.id}</p>
            <p className="text-gray-400">Date: {invoice.date}</p>
          </div>
        </div>

        {/* Invoice Summary Data */}
        <div className="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded mb-6 text-xs border border-gray-100">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Billing To</p>
            <p className="font-bold text-gray-900">{invoice.patientName}</p>
            <p className="text-gray-500 font-mono text-[10px] mt-0.5">{invoice.phone}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Patient MRN</p>
            <p className="font-mono font-bold text-indigo-700">{invoice.mrn}</p>
            <p className="text-gray-500 text-[10px] mt-0.5">CNIC: {invoice.cnic}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Age / Gender</p>
            <p className="font-bold text-gray-900">{invoice.age}Y / {invoice.gender}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Payment Mode</p>
            <span className="inline-block mt-0.5 px-2 py-0.5 bg-green-100 text-green-800 font-bold text-[9px] rounded-full uppercase">
              {invoice.paymentMethod}
            </span>
          </div>
        </div>

        {/* Item Breakdown Table */}
        <table className="w-full text-xs text-left border-collapse mb-8">
          <thead>
            <tr className="border-b border-gray-300 text-gray-400 uppercase">
              <th className="py-2.5 font-bold">Category</th>
              <th className="py-2.5 font-bold">Item & Description</th>
              <th className="py-2.5 font-bold text-right w-16">Qty</th>
              <th className="py-2.5 font-bold text-right w-24">Unit Price</th>
              <th className="py-2.5 font-bold text-right w-32">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoice.items.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50">
                <td className="py-3">
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                    item.category === 'OPD' ? 'bg-blue-100 text-blue-700' :
                    item.category === 'LAB' ? 'bg-purple-100 text-purple-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {item.category}
                  </span>
                </td>
                <td className="py-3 text-gray-900 font-medium">{item.description}</td>
                <td className="py-3 text-right font-mono text-gray-600">{item.qty}</td>
                <td className="py-3 text-right font-mono text-gray-600">{item.unitPrice.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</td>
                <td className="py-3 text-right font-mono font-bold text-gray-900">{item.total.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Fiscal Total Area */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2 text-xs border-t-2 border-gray-100 pt-4 text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono">Rs. {(invoice.totalPayable + invoice.discount).toLocaleString('en-PK', { minimumFractionDigits: 2 })}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-red-600 font-bold">
                <span>Discount Applied:</span>
                <span className="font-mono">-Rs. {invoice.discount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Sales Tax (0%):</span>
              <span className="font-mono">Rs. 0.00</span>
            </div>
            <div className="border-t border-gray-300 my-1"></div>
            <div className="flex justify-between text-sm font-bold text-blue-900">
              <span>GRAND TOTAL:</span>
              <span className="font-mono">PKR {invoice.totalPayable.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Footer Audit Message */}
        <div className="mt-12 border-t border-gray-100 pt-4 flex justify-between items-center text-[10px] text-gray-400">
          <div>
            <p className="font-bold text-gray-600">Billing Counter POS-01</p>
            <p>Cashier ID: CAS-KM-28392</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-600">MediPlus Clinic Karachi East</p>
            <p>Thank you for choosing MediPlus. Feel healthy, stay secure.</p>
          </div>
        </div>
      </div>
    );
  };

  const renderLabReportPrint = () => {
    const labOrder = data.labOrder;
    if (!labOrder) return null;
    return (
      <div className="p-10 max-w-3xl mx-auto bg-white border border-gray-200 mt-2 print-card text-gray-800">
        {/* Letterhead */}
        <div className="flex justify-between items-start border-b-2 border-purple-900 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-purple-950 leading-tight">MEDIPLUS CLINIC LABS</h1>
            <p className="text-xs text-purple-700 font-semibold uppercase tracking-wider">Clinical Pathology Laboratories Division</p>
            <p className="text-[10px] text-gray-500">PECHS Block 2, Shahrah-e-Faisal, Karachi • ISO 9001:2015 Accredited Facility</p>
          </div>
          <div className="text-right text-xs">
            <h2 className="text-sm font-bold text-purple-800 uppercase tracking-tight">PATHOLOGY REPORT</h2>
            <p className="text-gray-500 font-mono font-bold mt-1">ID: {labOrder.orderId}</p>
            <p className="text-gray-400">Date: {labOrder.orderDate}</p>
          </div>
        </div>

        {/* Patient Block */}
        <div className="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded mb-6 text-xs border border-gray-100">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Patient Name</p>
            <p className="font-bold text-gray-900">{labOrder.patientName}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Patient MRN</p>
            <p className="font-mono font-bold">{labOrder.patientId}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Age / Gender</p>
            <p className="font-bold">{labOrder.age}Y • {labOrder.gender}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Test Performed</p>
            <p className="font-bold text-purple-950">{labOrder.testType}</p>
          </div>
        </div>

        {/* Results Block columns */}
        {labOrder.results ? (
          <div>
            <h3 className="text-sm font-bold text-purple-950 mb-3 border-b-2 border-purple-100 pb-1 uppercase tracking-wide">Analytical Findings</h3>
            <table className="w-full text-xs text-left border-collapse mb-6">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 uppercase font-bold">
                  <th className="py-2.5">Parameter Checked</th>
                  <th className="py-2.5 text-center">Reference limits</th>
                  <th className="py-2.5 text-right w-36">Observed Values</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {labOrder.results.hemoglobin !== undefined && (
                  <tr className="hover:bg-gray-50/50">
                    <td className="py-3 font-semibold text-gray-900">Hemoglobin (Hb)</td>
                    <td className="py-3 text-center text-gray-500">13.5 - 17.5 g/dL</td>
                    <td className="py-3 text-right font-mono font-bold text-gray-900">{labOrder.results.hemoglobin} g/dL</td>
                  </tr>
                )}
                {labOrder.results.tlc !== undefined && (
                  <tr className="hover:bg-gray-50/50">
                    <td className="py-3 font-semibold text-gray-900">Total Leukocyte Count (TLC)</td>
                    <td className="py-3 text-center text-gray-500">4,000 - 11,000 /cmm</td>
                    <td className="py-3 text-right font-mono font-bold text-gray-900">{labOrder.results.tlc} /cmm</td>
                  </tr>
                )}
                {labOrder.results.platelets !== undefined && (
                  <tr className="hover:bg-gray-50/50">
                    <td className="py-3 font-semibold text-gray-900">Platelets Count</td>
                    <td className="py-3 text-center text-gray-500">1.5 - 4.5 L/cmm</td>
                    <td className="py-3 text-right font-mono font-bold text-gray-900">{labOrder.results.platelets} L/cmm</td>
                  </tr>
                )}
                {labOrder.results.neutrophils !== undefined && (
                  <tr className="hover:bg-gray-50/50">
                    <td className="py-3 font-semibold text-gray-900">Neutrophils</td>
                    <td className="py-3 text-center text-gray-500">40 - 75 %</td>
                    <td className="py-3 text-right font-mono font-bold text-gray-900">{labOrder.results.neutrophils} %</td>
                  </tr>
                )}
              </tbody>
            </table>

            {labOrder.results.comments && (
              <div className="bg-purple-50/30 border border-purple-100 p-4 rounded mt-4">
                <h4 className="text-xs font-bold text-purple-900 uppercase tracking-widest mb-1.5">Consultant Pathologist Remarks</h4>
                <p className="text-xs leading-relaxed text-gray-600 font-medium italic">"{labOrder.results.comments}"</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic py-8 text-center bg-gray-50 rounded">Results for this order are currently blank or processing.</p>
        )}

        {/* Pathologist Doctor Stamp */}
        <div className="flex justify-between items-end mt-12 pt-8 border-t border-gray-100">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-full border-2 border-purple-600 flex items-center justify-center text-purple-700 opacity-60">
              <Check className="w-6 h-6" />
            </div>
            <div className="text-[9px] text-gray-400">
              <p className="uppercase font-bold text-gray-500">Electronic Verification</p>
              <p>Digitally Checked & Verified via MediPlus Laboratory OS</p>
              <p>Security Signature ID: L-VER-29318a-C</p>
            </div>
          </div>

          <div className="text-center font-mono w-48 border-t border-gray-400 pt-1.5 text-[10px]">
            <p className="font-bold uppercase text-gray-900">Dr. Sarah Khan</p>
            <p className="text-purple-800">MBBS, FCPS (Pathology)</p>
            <p className="text-gray-500 font-bold tracking-wider">Sr. Pathologist Coordinator</p>
          </div>
        </div>
      </div>
    );
  };

  const getDocTitle = () => {
    switch (type) {
      case 'token': return 'General Entry Token';
      case 'prescription': return 'Medical Prescription Report';
      case 'invoice': return 'Receipt Payment Invoice';
      case 'labReport': return 'Clinical Pathology Report';
      default: return 'MediPlus Document';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] border border-gray-200">
        {/* Header toolbar */}
        <div className="bg-gray-100 border-b border-gray-200 px-6 py-4 flex justify-between items-center no-print">
          <div>
            <h2 className="font-bold text-gray-800 text-sm tracking-wide uppercase">Print Document Center</h2>
            <p className="text-xs text-gray-500 font-medium">Generate fully certified physical medical documents & PDF records</p>
          </div>
          <button className="text-gray-500 hover:text-gray-800 hover:bg-gray-200 p-2 rounded-full transition-colors" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Clinical Document Canvas */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 flex justify-center items-start custom-scrollbar">
          <div ref={printRef} className="shadow-lg rounded-lg border border-gray-200 bg-white min-h-[500px] w-full max-w-3xl overflow-hidden print-card">
            {type === 'token' && renderTokenPrint()}
            {type === 'prescription' && renderPrescriptionPrint()}
            {type === 'invoice' && renderInvoicePrint()}
            {type === 'labReport' && renderLabReportPrint()}
          </div>
        </div>

        {/* Bottom actionable tray */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center no-print">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>PMC Digitally certified healthcare credentials format</span>
          </div>
          <div className="flex gap-3">
            <button
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-xs font-bold text-gray-700 transition"
              onClick={onClose}
            >
              Close
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-200 rounded-lg text-xs font-bold transition"
              onClick={handlePrint}
            >
              <Printer className="w-4 h-4" />
              Print Paper Slip
            </button>
            <button
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-extrabold shadow transition active:scale-95"
              onClick={handleSimulatePDF}
              disabled={downloading}
            >
              {downloading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></span>
              ) : (
                <Download className="w-4 h-4" />
              )}
              Download Certified PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
