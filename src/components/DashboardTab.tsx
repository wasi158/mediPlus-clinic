/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Activity, Clock, Users, ShieldCheck, Stethoscope, ArrowRight, Package, Receipt, MoreVertical } from 'lucide-react';
import { Patient, Token, LabOrder, Invoice } from '../types';
import { useToast } from '../context/ToastContext';
import ConfirmDialog, { ActionButtons } from './ui/RecordActions';

interface DashboardTabProps {
  patients: Patient[];
  tokens: Token[];
  labOrders: LabOrder[];
  invoices: Invoice[];
  setActiveTab: (tab: string) => void;
  onQuickAddPatient: () => void;
  onDeleteToken: (tokenId: string) => void;
}

export default function DashboardTab({ patients, tokens, labOrders, invoices, setActiveTab, onDeleteToken }: DashboardTabProps) {
  const { toast } = useToast();
  const [deleteTokenId, setDeleteTokenId] = React.useState<string | null>(null);
  const waitingTokens = tokens.filter(t => t.status === 'Waiting').length;
  const inConsultationTokens = tokens.filter(t => t.status === 'In Consultation').length;
  const pendingLabs = labOrders.filter(l => l.status !== 'COMPLETED').length;
  const unpaidInvoices = invoices.filter(i => i.status === 'Unpaid').length;

  const quickLinks = [
    { id: 'registration', label: 'Registration', count: patients.length, icon: Users, trend: '+12%', up: true },
    { id: 'opd', label: 'OPD Queue', count: waitingTokens + inConsultationTokens, icon: Stethoscope, trend: '+5%', up: true },
    { id: 'pharmacy', label: 'Pharmacy', count: pendingLabs, icon: Package, trend: '-2%', up: false },
    { id: 'billing', label: 'Billing', count: unpaidInvoices, icon: Receipt, trend: '+8%', up: true },
  ];

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Patients Registered', value: patients.length, icon: Users, bg: 'bg-lime/30', color: 'text-forest' },
          { label: 'OPD Waiting', value: waitingTokens, icon: Clock, bg: 'bg-amber-100', color: 'text-amber-600' },
          { label: 'Lab Processing', value: pendingLabs, icon: Activity, bg: 'bg-purple-100', color: 'text-purple-600' },
          { label: 'Unpaid Bills', value: unpaidInvoices, icon: Receipt, bg: 'bg-red-100', color: 'text-red-500' },
        ].map(stat => (
          <div key={stat.label} className="pharm-card p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{stat.value}</p>
              </div>
            </div>
            <button className="p-1.5 text-gray-300 hover:text-gray-500 rounded-lg">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Quick access category cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link, idx) => {
          const Icon = link.icon;
          const isFirst = idx === 0;
          return (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`p-4 rounded-2xl text-left transition-all ${
                isFirst ? 'pharm-card-dark shadow-lg' : 'pharm-card hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isFirst ? 'bg-lime/20' : 'bg-gray-100'
                }`}>
                  <Icon className={`w-4 h-4 ${isFirst ? 'text-lime' : 'text-gray-500'}`} />
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  link.up
                    ? isFirst ? 'bg-lime/20 text-lime' : 'bg-emerald-50 text-emerald-600'
                    : 'bg-red-50 text-red-500'
                }`}>
                  {link.trend}
                </span>
              </div>
              <p className={`text-sm font-medium ${isFirst ? 'text-white/70' : 'text-gray-500'}`}>{link.label}</p>
              <p className={`text-2xl font-bold mt-1 ${isFirst ? 'text-white' : 'text-gray-900'}`}>{link.count}</p>
              <p className={`text-xs mt-1 ${isFirst ? 'text-white/40' : 'text-gray-400'}`}>Since last week</p>
            </button>
          );
        })}
      </div>

      {/* OPD queue table */}
      <div className="pharm-card overflow-hidden">
        <div className="p-5 flex justify-between items-center border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">Today's OPD Queue</h3>
            <p className="text-sm text-gray-500 mt-0.5">{tokens.length} active tokens</p>
          </div>
          <button
            onClick={() => setActiveTab('opd')}
            className="btn-lime px-4 py-2 text-sm flex items-center gap-1.5"
          >
            Manage OPD
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                {['Token', 'Patient', 'Department', 'Doctor', 'Time', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tokens.map(token => (
                <tr key={token.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-forest">{token.tokenNo}</td>
                  <td className="px-5 py-3.5 font-semibold text-gray-900">{token.patientName}</td>
                  <td className="px-5 py-3.5 text-gray-600">{token.department}</td>
                  <td className="px-5 py-3.5 text-gray-500">{token.doctorName}</td>
                  <td className="px-5 py-3.5 text-gray-500">{token.timeSlot}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                      token.status === 'In Consultation' ? 'badge-low-stock' :
                      token.status === 'Completed' ? 'badge-in-stock' :
                      'bg-gray-100 text-gray-600 rounded-full px-3 py-1'
                    }`}>
                      {token.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <ActionButtons
                      onView={() => setActiveTab('opd')}
                      onDelete={() => setDeleteTokenId(token.id)}
                    />
                  </td>
                </tr>
              ))}
              {tokens.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-gray-400">No patients in queue today.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTokenId}
        title="Remove from Queue"
        message="Remove this token from the OPD queue?"
        onConfirm={() => {
          if (deleteTokenId) {
            onDeleteToken(deleteTokenId);
            toast('Token removed from queue', 'success');
            setDeleteTokenId(null);
          }
        }}
        onCancel={() => setDeleteTokenId(null)}
      />

      {/* Tip card */}
      <div className="pharm-card-dark p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-lime/20 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-lime" />
        </div>
        <div>
          <h4 className="font-semibold text-white">Pro Tip</h4>
          <p className="text-sm text-white/60 mt-1 leading-relaxed">
            Use the search bar to find patients instantly. All clinic data is saved automatically between sessions.
          </p>
        </div>
      </div>
    </div>
  );
}
