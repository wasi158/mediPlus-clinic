/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, TrendingUp, AlertTriangle, Users, BookOpen, User, ArrowRight, Activity, Calendar } from 'lucide-react';
import { Medicine, Token } from '../types';

interface AdminTabProps {
  medicines: Medicine[];
  tokens: Token[];
}

export default function AdminTab({ medicines, tokens }: AdminTabProps) {
  // Extract low stock alerts from medicines array dynamically
  const outOfStockItems = medicines.filter(m => m.stock <= 0);
  const lowStockItems = medicines.filter(m => m.stock > 0 && m.stock <= 15);

  const seenOPDCount = tokens.filter(t => t.status === 'Completed').length;
  const pendingOPDCount = tokens.filter(t => t.status !== 'Completed').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Title Grid */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-base font-extrabold text-[#003d9b] uppercase tracking-wider">Hospital Performance Admin Panel</h2>
          <p className="text-xs text-gray-500 font-medium font-sans">Active Monitoring metrics for PECHS Faisal Branch, Karachi</p>
        </div>
        <div className="flex bg-white border border-gray-200 py-1 px-3.5 rounded-lg text-xs font-bold text-gray-600 items-center gap-1.5 shadow-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>Duty Log Shifts: Morning Shift 08:00 AM - 04:00 PM</span>
        </div>
      </div>

      {/* Main grids layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doctor Output Seen Rates bar charts */}
        <section className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <div>
              <h3 className="text-xs font-extrabold text-forest uppercase tracking-wider">Physicians Patient Volume (Today)</h3>
              <p className="text-[11px] text-gray-500 font-medium">Completed OPD Triages by Dr. Signature License</p>
            </div>
            <span className="text-[10px] bg-lime/20 text-blue-800 px-2 py-0.5 rounded font-black">
              {seenOPDCount + 126} SEEN TOTAL
            </span>
          </div>

          <div className="space-y-4 pt-1">
            {/* Dr. Ahmed Shah */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <span>Dr. Ahmed Shah (Senior Consultant Specialist)</span>
                <span>48 Patients</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden w-full">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>

            {/* Dr. Mansoor Ali */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <span>Dr. Mansoor Ali (General OPD Cabin A)</span>
                <span>28 Patients</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden w-full">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '51%' }}></div>
              </div>
            </div>

            {/* Dr. Sarah Khan */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <span>Dr. Sarah Khan (Specialist Pathologist Coordinator)</span>
                <span>32 Patients</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden w-full">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: '62%' }}></div>
              </div>
            </div>

            {/* Dr. Omer Shah */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <span>Dr. Omer Shah (Emergency Unit Attending)</span>
                <span>18 Patients</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden w-full">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '33%' }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Reagents & Diagnostics Level Monitors */}
        <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-forest uppercase tracking-wider pb-2 border-b border-gray-100 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-forest" />
            Pathology Laboratory Chemical Reagents
          </h3>

          <div className="space-y-3.5 text-xs">
            {/* CBC Reagents */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-gray-700">
                <span>CBC Haematology Reagent pack</span>
                <span className="font-mono text-forest font-extrabold">75% Capacity</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 w-3/4 rounded-full"></div>
              </div>
            </div>

            {/* Glucose Reagents */}
            <div className="space-y-1 text-amber-950 bg-amber-50/20 border border-amber-100 p-2 rounded-lg">
              <div className="flex justify-between font-bold">
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  Glucose fasting control kit
                </span>
                <span className="font-mono font-black text-amber-600">12% CRITICAL</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1.5">
                <div className="h-full bg-amber-500 w-[12%] rounded-full"></div>
              </div>
              <p className="text-[9px] text-amber-600 font-bold mt-1 uppercase tracking-wider">Purchase catalog order recommended directly</p>
            </div>

            {/* LFT Reagents */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-gray-700">
                <span>Liver panel enzyme kits</span>
                <span className="font-mono text-purple-700 font-extrabold">45% Capacity</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 w-2/5 rounded-full"></div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Low Stock Medicine inventories warnings row alerts */}
      <section className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase text-gray-800 tracking-wider pb-2 border-b border-gray-100 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          Critical Stock Inventory Outage warning alerts
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Out of stock medicine warnings list */}
          <div className="space-y-2">
            <h4 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Out of Stock Inventory Item (0 caps left)</h4>
            {outOfStockItems.length === 0 ? (
              <p className="text-xs text-gray-400 italic bg-gray-50 rounded p-4 border border-gray-100">Zero medicine files are empty. Stock is fully balanced.</p>
            ) : (
              <div className="space-y-1.5">
                {outOfStockItems.map(m => (
                  <div key={m.id} className="p-3 bg-red-50 text-red-900 border border-red-200 rounded-lg flex justify-between items-center text-xs font-bold">
                    <span>{m.name} ({m.generic})</span>
                    <span className="font-mono uppercase text-[9px] bg-red-600 text-white px-2 py-0.5 rounded">RESTOCK NOW</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low stock medicines warning levels */}
          <div className="space-y-2">
            <h4 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Low Stock Warnings items (under 15 tablets remaining)</h4>
            <div className="space-y-1.5">
              {lowStockItems.map(m => (
                <div key={m.id} className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg flex justify-between items-center text-xs font-bold">
                  <span>{m.name} ({m.generic})</span>
                  <span className="font-mono text-[9px] bg-amber-500 text-white px-2 py-0.5 rounded">ONLY {m.stock} LEFT</span>
                </div>
              ))}
              {lowStockItems.length === 0 && (
                <p className="text-xs text-gray-400 italic bg-gray-50 rounded p-4 border border-gray-100">No medicine items have critical low counts.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
