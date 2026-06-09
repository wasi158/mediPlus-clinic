/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Microscope, ShieldCheck, X, ChevronRight } from 'lucide-react';
import { LabOrder } from '../types';
import { useToast } from '../context/ToastContext';
import ConfirmDialog, { DetailModal, DetailRow, ActionButtons } from './ui/RecordActions';

interface LabTabProps {
  labOrders: LabOrder[];
  onUpdateLabOrder: (updated: LabOrder) => void;
  onDeleteLabOrder: (orderId: string) => void;
  onSelectPrint: (type: 'token' | 'prescription' | 'invoice' | 'labReport', data: any) => void;
}

export default function LabTab({ labOrders, onUpdateLabOrder, onDeleteLabOrder, onSelectPrint }: LabTabProps) {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = React.useState<'ALL' | 'STAT'>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');

  // active selected order for diagnostic results entry modal
  const [activeOrder, setActiveOrder] = React.useState<LabOrder | null>(null);

  // modal fields
  const [hb, setHb] = React.useState('14.2');
  const [tlc, setTlc] = React.useState('7,300');
  const [platelets, setPlatelets] = React.useState('2.8');
  const [neutrophils, setNeutrophils] = React.useState('62');
  const [comments, setComments] = React.useState('');
  const [viewOrder, setViewOrder] = React.useState<LabOrder | null>(null);
  const [editOrder, setEditOrder] = React.useState<LabOrder | null>(null);
  const [deleteOrderId, setDeleteOrderId] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState({ testType: '', status: 'PENDING' as LabOrder['status'], patientName: '' });

  const handleOpenResultsModal = (order: LabOrder) => {
    setActiveOrder(order);
    if (order.results) {
      setHb(order.results.hemoglobin || '14.2');
      setTlc(order.results.tlc || '7,300');
      setPlatelets(order.results.platelets || '2.8');
      setNeutrophils(order.results.neutrophils || '62');
      setComments(order.results.comments || '');
    } else {
      setHb('14.2');
      setTlc('');
      setPlatelets('');
      setNeutrophils('');
      setComments('');
    }
  };

  const handleCloseModal = () => {
    setActiveOrder(null);
  };

  // Status cycles for SAMPLING or PROCESSING rows
  const handleToggleStatus = (order: LabOrder) => {
    const nextStatusMap: Record<LabOrder['status'], LabOrder['status']> = {
      'PENDING': 'SAMPLING',
      'SAMPLING': 'PROCESSING',
      'PROCESSING': 'COMPLETED',
      'COMPLETED': 'PENDING'
    };
    const updated: LabOrder = {
      ...order,
      status: nextStatusMap[order.status]
    };
    onUpdateLabOrder(updated);
  };

  // Compile pathology measurements and certify
  const handleSaveDraft = () => {
    if (!activeOrder) return;
    const updated: LabOrder = {
      ...activeOrder,
      results: {
        hemoglobin: hb,
        tlc,
        platelets,
        neutrophils,
        comments
      }
    };
    onUpdateLabOrder(updated);
    toast('Lab results saved as draft', 'success');
  };

  const handleCertifyReport = () => {
    if (!activeOrder) return;
    const updated: LabOrder = {
      ...activeOrder,
      status: 'COMPLETED',
      results: {
        hemoglobin: hb || '14.2',
        tlc: tlc || '7,000',
        platelets: platelets || '2.5',
        neutrophils: neutrophils || '65',
        comments: comments || 'Analysis findings are healthy and conform to control ranges.'
      }
    };
    onUpdateLabOrder(updated);
    setActiveOrder(null);
    onSelectPrint('labReport', { labOrder: updated });
  };

  const openEditOrder = (order: LabOrder) => {
    setEditOrder(order);
    setEditForm({ testType: order.testType, status: order.status, patientName: order.patientName });
  };

  const handleSaveOrderEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editOrder) return;
    onUpdateLabOrder({ ...editOrder, ...editForm });
    toast('Lab order updated', 'success');
    setEditOrder(null);
  };

  const handleDeleteOrder = () => {
    if (!deleteOrderId) return;
    onDeleteLabOrder(deleteOrderId);
    toast('Lab order deleted', 'success');
    setDeleteOrderId(null);
  };

  // Filter orders by tab
  const filteredOrders = labOrders.filter((order) => {
    const matchesSearch =
      order.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedTab === 'STAT') {
      return matchesSearch && (order.testType.toLowerCase().includes('cb') || order.status === 'PENDING');
    }
    return matchesSearch;
  });

  return (
    <div className="flex flex-col xl:flex-row gap-6 items-start h-full pb-10">
      {/* Left Column: Orders Table */}
      <section className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#003d9b]">Pathology Triage Queue</h2>
            <div className="flex bg-gray-200 p-0.5 rounded-lg text-[10px]">
              <button
                onClick={() => setSelectedTab('ALL')}
                className={`px-3 py-1 font-bold rounded-md ${
                  selectedTab === 'ALL' ? 'bg-white text-forest shadow-sm' : 'text-gray-500'
                }`}
              >
                ALL ORDERS
              </button>
              <button
                onClick={() => setSelectedTab('STAT')}
                className={`px-3 py-1 font-bold rounded-md ${
                  selectedTab === 'STAT' ? 'bg-white text-forest shadow-sm' : 'text-gray-500'
                }`}
              >
                STAT
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Filter list by ID or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-forest bg-white"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-100 text-gray-500 font-bold uppercase tracking-widest">
                <th className="px-4 py-3.5 w-24">Order ID</th>
                <th className="px-4 py-3.5">Patient Name</th>
                <th className="px-4 py-3.5">Test Type</th>
                <th className="px-4 py-3.5 w-32">Status Check</th>
                <th className="px-4 py-3.5 text-right w-44">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-lime/10/20 transition-colors duration-150">
                  <td className="px-4 py-4 font-mono font-bold text-gray-900">{order.orderId}</td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-gray-900 text-xs">{order.patientName}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{order.age}Y • {order.gender}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-xs rounded text-gray-700 inline-block font-semibold">
                      {order.testType}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      order.status === 'PENDING' ? 'bg-red-50 text-red-700 font-black border border-red-100' :
                      order.status === 'SAMPLING' ? 'bg-lime/10 text-forest font-bold border border-lime/30' :
                      order.status === 'PROCESSING' ? 'bg-purple-100 text-purple-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {order.status === 'PENDING' && <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping shrink-0"></span>}
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <ActionButtons
                        onView={() => setViewOrder(order)}
                        onEdit={() => openEditOrder(order)}
                        onDelete={() => setDeleteOrderId(order.id)}
                      />
                      {order.status !== 'COMPLETED' ? (
                        <button
                          onClick={() => handleOpenResultsModal(order)}
                          className="px-3 py-1.5 text-xs btn-lime font-semibold"
                        >
                          Results
                        </button>
                      ) : (
                        <button
                          onClick={() => onSelectPrint('labReport', { labOrder: order })}
                          className="px-3 py-1.5 text-xs btn-outline-forest font-semibold"
                        >
                          Print
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 italic">No laboratory files matched filter limits.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Right Column: Statistics & Operational TATs */}
      <aside className="w-full xl:w-80 space-y-6 shrink-0">
        <div className="bg-blue-600 p-5 rounded-2xl text-white shadow-md relative overflow-hidden">
          <p className="text-[10px] uppercase tracking-widest font-bold opacity-75">Today's Lab Throughput</p>
          <div className="flex items-end justify-between mt-2">
            <span className="text-3xl font-black">142</span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-bold uppercase tracking-wide">
              +12% vs yesterday
            </span>
          </div>
          <div className="mt-4 h-1.5 w-full bg-white/25 rounded-full overflow-hidden">
            <div className="h-full bg-white w-4/5 rounded-full"></div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase text-gray-800 tracking-wider border-b border-gray-100 pb-2">
            Turnaround time (TAT)
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs text-gray-600">
              <span className="font-medium">Routine Tests</span>
              <span className="font-mono font-bold text-forest">2.4h</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-600">
              <span className="font-medium">Urgent STAT Markers</span>
              <span className="font-mono font-bold text-red-600">45m</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-600">
              <span className="font-medium">Bacterial Cultures</span>
              <span className="font-mono font-bold text-forest">48h</span>
            </div>
          </div>
        </div>

        {/* Action Quick links links */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase text-gray-800 tracking-wider">Operational shortcuts</h3>
          <div className="divide-y divide-gray-100 text-xs font-semibold">
            <button
              onClick={() => toast('Reagent stock verified — all levels normal', 'success')}
              className="w-full text-left py-2.5 text-gray-600 hover:text-forest flex justify-between items-center"
            >
              <span>Reagent Stock Inventory</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => toast('Loading historic records...', 'info')}
              className="w-full text-left py-2.5 text-gray-600 hover:text-forest flex justify-between items-center"
            >
              <span>Archived Pathology Logs</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => toast('Calibration check passed', 'success')}
              className="w-full text-left py-2.5 text-gray-600 hover:text-forest flex justify-between items-center"
            >
              <span>Machine Precision Calibration</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </aside>

      {/* Enter Laboratory results Modal Overlay */}
      {activeOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-200">
            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Enter Laboratory Results</h2>
                <p className="text-[11px] text-gray-500 font-medium">
                  Patient: {activeOrder.patientName} | Test: {activeOrder.testType} • Order ID: {activeOrder.orderId}
                </p>
              </div>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 p-2 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body scroll area */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 max-h-[64vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Hemoglobin Block */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Hemoglobin (Hb)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={hb}
                      onChange={(e) => setHb(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-forest"
                    />
                    <span className="text-xs font-bold text-gray-500 w-12 text-center bg-gray-100 py-2 rounded">g/dL</span>
                  </div>
                  <p className="text-[9px] text-gray-400">Normal Diagnostic Range: 13.5 - 17.5 g/dL</p>
                </div>

                {/* Total Leukocyte Count */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Total Leukocyte Count (TLC)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 7,300"
                      value={tlc}
                      onChange={(e) => setTlc(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-forest"
                    />
                    <span className="text-xs font-bold text-gray-500 w-12 text-center bg-gray-100 py-2 rounded">/cmm</span>
                  </div>
                  <p className="text-[9px] text-gray-400">Normal Range: 4,000 - 11,000 /cmm</p>
                </div>

                {/* Platelets */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Platelets Count</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 2.8"
                      value={platelets}
                      onChange={(e) => setPlatelets(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-forest"
                    />
                    <span className="text-xs font-bold text-gray-500 w-12 text-center bg-gray-100 py-2 rounded">L/cmm</span>
                  </div>
                  <p className="text-[9px] text-gray-400">Normal Range: 1.5 - 4.5 L/cmm</p>
                </div>

                {/* Neutrophils */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Neutrophils Percentage</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 62"
                      value={neutrophils}
                      onChange={(e) => setNeutrophils(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-forest"
                    />
                    <span className="text-xs font-bold text-gray-500 w-12 text-center bg-gray-100 py-2 rounded">%</span>
                  </div>
                  <p className="text-[9px] text-gray-400">Normal Range: 40% - 75%</p>
                </div>
              </div>

              {/* Pathologist Remarks */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Pathologist Consultant Comments</label>
                <textarea
                  placeholder="Enter medical cell counts observations, micro-findings, or general diagnostics advice..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs leading-relaxed focus:outline-none focus:border-forest focus:bg-white resize-none"
                />
              </div>
            </div>

            {/* Footer triggers */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center flex-wrap gap-3">
              <div className="flex gap-2.5">
                <button
                  onClick={handleSaveDraft}
                  className="px-4 py-2 text-xs border border-gray-300 font-bold hover:bg-white rounded-lg text-gray-600 transition"
                >
                  SAVE DRAFT
                </button>
                <button
                  onClick={() => toast('Draft sent to thermal printer', 'success')}
                  className="px-4 py-2 text-xs border border-blue-200 text-forest font-bold hover:bg-lime/10/50 rounded-lg transition"
                >
                  PRINT INTERMEDIATE
                </button>
              </div>

              <button
                onClick={handleCertifyReport}
                className="px-5 py-2.5 font-bold uppercase text-xs btn-lime rounded-lg shadow-md transition active:scale-95 flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-blue-200" />
                GENERATE CERTIFIED REPORT
              </button>
            </div>
          </div>
        </div>
      )}

      <DetailModal open={!!viewOrder} title="Lab Order Details" onClose={() => setViewOrder(null)}>
        {viewOrder && (
          <>
            <DetailRow label="Order ID" value={viewOrder.orderId} />
            <DetailRow label="Patient" value={viewOrder.patientName} />
            <DetailRow label="MRN" value={viewOrder.patientId} />
            <DetailRow label="Test" value={viewOrder.testType} />
            <DetailRow label="Status" value={viewOrder.status} />
            <DetailRow label="Date" value={viewOrder.orderDate} />
            {viewOrder.results && (
              <>
                <DetailRow label="Hb" value={viewOrder.results.hemoglobin ?? '—'} />
                <DetailRow label="TLC" value={viewOrder.results.tlc ?? '—'} />
                <DetailRow label="Comments" value={viewOrder.results.comments ?? '—'} />
              </>
            )}
          </>
        )}
      </DetailModal>

      {editOrder && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditOrder(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Edit Lab Order</h3>
            <form onSubmit={handleSaveOrderEdit} className="space-y-3">
              <input type="text" value={editForm.patientName}
                onChange={e => setEditForm(f => ({ ...f, patientName: e.target.value }))}
                className="input-pharm w-full px-4 py-2.5 text-sm" placeholder="Patient name" required />
              <input type="text" value={editForm.testType}
                onChange={e => setEditForm(f => ({ ...f, testType: e.target.value }))}
                className="input-pharm w-full px-4 py-2.5 text-sm" placeholder="Test type" required />
              <select value={editForm.status}
                onChange={e => setEditForm(f => ({ ...f, status: e.target.value as LabOrder['status'] }))}
                className="input-pharm w-full px-4 py-2.5 text-sm">
                <option value="PENDING">Pending</option>
                <option value="SAMPLING">Sampling</option>
                <option value="PROCESSING">Processing</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditOrder(null)} className="flex-1 py-2.5 btn-outline-forest text-sm font-semibold">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 btn-lime text-sm font-semibold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteOrderId}
        title="Delete Lab Order"
        message="Are you sure you want to delete this lab order?"
        onConfirm={handleDeleteOrder}
        onCancel={() => setDeleteOrderId(null)}
      />
    </div>
  );
}
