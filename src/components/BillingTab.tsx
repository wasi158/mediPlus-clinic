/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Search, Plus, Trash2, Printer, Smartphone, AlertCircle,
  Receipt, Wallet, CheckCircle2, User, Phone, CreditCard, Banknote,
  FileText, Calendar,
} from 'lucide-react';
import { Invoice, BillingItem } from '../types';
import { useToast } from '../context/ToastContext';
import ConfirmDialog, { DetailModal, DetailRow, ActionButtons } from './ui/RecordActions';

interface BillingTabProps {
  invoices: Invoice[];
  onUpdateInvoice: (updated: Invoice) => void;
  onDeleteInvoice: (invoiceId: string) => void;
  onSelectPrint: (type: 'token' | 'prescription' | 'invoice' | 'labReport', data: any) => void;
}

function categoryBadge(category: BillingItem['category']) {
  const styles = {
    OPD: 'bg-lime/25 text-forest',
    LAB: 'bg-purple-100 text-purple-700',
    PHARMACY: 'bg-emerald-100 text-emerald-700',
  };
  return styles[category];
}

function statusBadge(status: Invoice['status']) {
  return status === 'Paid'
    ? 'badge-in-stock'
    : 'badge-low-stock';
}

export default function BillingTab({ invoices, onUpdateInvoice, onDeleteInvoice, onSelectPrint }: BillingTabProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeInvoiceId, setActiveInvoiceId] = React.useState('');

  const [itemCategory, setItemCategory] = React.useState<'OPD' | 'LAB' | 'PHARMACY'>('OPD');
  const [itemDesc, setItemDesc] = React.useState('');
  const [itemQty, setItemQty] = React.useState('1');
  const [itemPrice, setItemPrice] = React.useState('');

  const [discountVal, setDiscountVal] = React.useState(0);
  const [payMethod, setPayMethod] = React.useState<'Cash' | 'Card' | 'Bank Online'>('Cash');
  const [sendSms, setSendSms] = React.useState(true);
  const [viewInvoice, setViewInvoice] = React.useState<Invoice | null>(null);
  const [editInvoice, setEditInvoice] = React.useState<Invoice | null>(null);
  const [deleteInvoiceId, setDeleteInvoiceId] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState({
    patientName: '', phone: '', cnic: '', status: 'Unpaid' as Invoice['status'],
  });

  React.useEffect(() => {
    if (invoices.length > 0 && !activeInvoiceId) {
      setActiveInvoiceId(invoices[0].id);
    }
  }, [invoices, activeInvoiceId]);

  const activeInvoice = invoices.find(i => i.id === activeInvoiceId);

  React.useEffect(() => {
    if (activeInvoice) {
      setDiscountVal(activeInvoice.discount);
      const method = activeInvoice.paymentMethod.replace(' Payment', '') as typeof payMethod;
      setPayMethod(method === 'Bank Online' || method === 'Card' || method === 'Cash' ? method : 'Cash');
    }
  }, [activeInvoiceId, activeInvoice]);

  const paidCount = invoices.filter(i => i.status === 'Paid').length;
  const unpaidCount = invoices.filter(i => i.status === 'Unpaid').length;
  const totalRevenue = invoices
    .filter(i => i.status === 'Paid')
    .reduce((sum, i) => sum + i.totalPayable, 0);

  const subtotal = activeInvoice?.items.reduce((acc, curr) => acc + curr.total, 0) ?? 0;

  const handleAddNewCharge = () => {
    if (!activeInvoice || !itemDesc.trim() || !itemPrice || isNaN(Number(itemPrice))) {
      toast('Enter a description and valid price', 'warning');
      return;
    }
    const priceNum = Number(itemPrice);
    const qtyNum = isNaN(Number(itemQty)) ? 1 : Number(itemQty);
    const newCharge: BillingItem = {
      category: itemCategory,
      description: itemDesc,
      qty: qtyNum,
      unitPrice: priceNum,
      total: priceNum * qtyNum,
    };
    const updatedItems = [...activeInvoice.items, newCharge];
    onUpdateInvoice({
      ...activeInvoice,
      items: updatedItems,
      totalPayable: Math.max(0, updatedItems.reduce((a, c) => a + c.total, 0) - discountVal),
    });
    setItemDesc('');
    setItemQty('1');
    setItemPrice('');
    toast('Charge added', 'success');
  };

  const handleDeleteCharge = (idx: number) => {
    if (!activeInvoice) return;
    const updatedItems = activeInvoice.items.filter((_, i) => i !== idx);
    onUpdateInvoice({
      ...activeInvoice,
      items: updatedItems,
      totalPayable: Math.max(0, updatedItems.reduce((a, c) => a + c.total, 0) - discountVal),
    });
  };

  const handleUpdateDiscount = (val: number) => {
    if (!activeInvoice) return;
    setDiscountVal(val);
    onUpdateInvoice({
      ...activeInvoice,
      discount: val,
      totalPayable: Math.max(0, subtotal - val),
    });
  };

  const handleUpdatePaymentMethod = (method: typeof payMethod) => {
    if (!activeInvoice) return;
    setPayMethod(method);
    onUpdateInvoice({ ...activeInvoice, paymentMethod: `${method} Payment` });
  };

  const handleSaveAndPrintBill = () => {
    if (!activeInvoice) return;
    if (sendSms) toast(`Receipt SMS sent to ${activeInvoice.phone}`, 'success');
    onSelectPrint('invoice', { invoice: activeInvoice });
  };

  const openEditInvoice = (inv: Invoice) => {
    setEditInvoice(inv);
    setEditForm({ patientName: inv.patientName, phone: inv.phone, cnic: inv.cnic, status: inv.status });
  };

  const handleSaveInvoiceEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editInvoice) return;
    onUpdateInvoice({ ...editInvoice, ...editForm });
    toast('Invoice updated', 'success');
    setEditInvoice(null);
  };

  const handleDeleteInvoice = () => {
    if (!deleteInvoiceId) return;
    onDeleteInvoice(deleteInvoiceId);
    if (activeInvoiceId === deleteInvoiceId) setActiveInvoiceId('');
    toast('Invoice deleted', 'success');
    setDeleteInvoiceId(null);
  };

  const filteredInvoices = invoices.filter(inv =>
    inv.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.mrn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paymentIcons = {
    Cash: Banknote,
    Card: CreditCard,
    'Bank Online': Wallet,
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="pharm-card p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-lime/30 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-forest" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Invoices</p>
            <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
          </div>
        </div>
        <div className="pharm-card p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Paid · Unpaid</p>
            <p className="text-2xl font-bold text-gray-900">
              {paidCount} <span className="text-base font-medium text-gray-400">/ {unpaidCount}</span>
            </p>
          </div>
        </div>
        <div className="pharm-card-dark p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-lime/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-lime" />
          </div>
          <div>
            <p className="text-sm text-white/60">Total Collected</p>
            <p className="text-2xl font-bold text-white">PKR {totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Invoice List — top section */}
      <div className="pharm-card overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-gray-900">Invoice List</h2>
            <p className="text-sm text-gray-500 mt-0.5">{filteredInvoices.length} records</p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, name, or MRN..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-pharm w-full pl-9 pr-4 py-2.5 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="bg-gray-50 text-left">
                {['Invoice ID', 'Patient', 'Amount', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredInvoices.map(inv => (
                <tr
                  key={inv.id}
                  onClick={() => setActiveInvoiceId(inv.id)}
                  className={`cursor-pointer transition-colors ${
                    activeInvoiceId === inv.id ? 'bg-lime/15' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-forest whitespace-nowrap">{inv.id}</td>
                  <td className="px-5 py-3.5 font-semibold text-gray-900">{inv.patientName}</td>
                  <td className="px-5 py-3.5 font-semibold text-gray-800 whitespace-nowrap">
                    PKR {inv.totalPayable.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{inv.date}</td>
                  <td className="px-5 py-3.5">
                    <span className={statusBadge(inv.status)}>{inv.status}</span>
                  </td>
                  <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                    <ActionButtons
                      onView={() => setViewInvoice(inv)}
                      onEdit={() => openEditInvoice(inv)}
                      onDelete={() => setDeleteInvoiceId(inv.id)}
                    />
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-sm">
                    No invoices match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected invoice header — separate section */}
      {activeInvoice ? (
        <>
          <div className="pharm-card p-5 lg:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Selected Invoice</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl font-bold text-gray-900 font-mono">{activeInvoice.id}</h2>
                  <span className={statusBadge(activeInvoice.status)}>{activeInvoice.status}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Issued {activeInvoice.date}
                </p>
              </div>
              <div className="md:text-right bg-forest/5 rounded-2xl px-5 py-4 border border-forest/10">
                <p className="text-sm text-gray-500">Amount Due</p>
                <p className="text-3xl font-bold text-forest mt-0.5">
                  PKR {activeInvoice.totalPayable.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: User, label: 'Patient', value: activeInvoice.patientName },
                { icon: FileText, label: 'MRN', value: activeInvoice.mrn },
                { icon: Phone, label: 'Phone', value: activeInvoice.phone },
                { icon: CreditCard, label: 'CNIC', value: activeInvoice.cnic },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 mb-1.5">
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-medium">{label}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 truncate" title={value}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: Line Items + Payment Summary — separate sections */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Line Items */}
            <div className="lg:col-span-8 pharm-card overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-lg">Line Items</h3>
                <p className="text-sm text-gray-500 mt-0.5">{activeInvoice.items.length} charges on this invoice</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      {['Category', 'Description', 'Qty', 'Unit Price', 'Total', ''].map(h => (
                        <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {activeInvoice.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/80">
                        <td className="px-5 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryBadge(item.category)}`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-medium text-gray-900">{item.description}</td>
                        <td className="px-5 py-4 text-gray-600 text-center">{item.qty}</td>
                        <td className="px-5 py-4 text-gray-600 text-right font-mono">{item.unitPrice.toLocaleString()}</td>
                        <td className="px-5 py-4 font-semibold text-gray-900 text-right font-mono">{item.total.toLocaleString()}</td>
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteCharge(idx)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Remove charge"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {activeInvoice.items.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-sm">
                          No charges on this invoice yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-5 bg-gray-50/80 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Add New Charge</p>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">Category</label>
                    <select
                      value={itemCategory}
                      onChange={e => setItemCategory(e.target.value as BillingItem['category'])}
                      className="input-pharm w-full px-3 py-2.5 text-sm"
                    >
                      <option value="OPD">OPD</option>
                      <option value="LAB">Lab</option>
                      <option value="PHARMACY">Pharmacy</option>
                    </select>
                  </div>
                  <div className="sm:col-span-4">
                    <label className="text-xs text-gray-500 mb-1 block">Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Consultation fee"
                      value={itemDesc}
                      onChange={e => setItemDesc(e.target.value)}
                      className="input-pharm w-full px-3 py-2.5 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={itemQty}
                      onChange={e => setItemQty(e.target.value)}
                      className="input-pharm w-full px-3 py-2.5 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-xs text-gray-500 mb-1 block">Price (PKR)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={itemPrice}
                      onChange={e => setItemPrice(e.target.value)}
                      className="input-pharm w-full px-3 py-2.5 text-sm font-mono"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <button
                      type="button"
                      onClick={handleAddNewCharge}
                      className="w-full py-2.5 btn-lime flex items-center justify-center"
                      title="Add charge"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Summary — separate section */}
            <div className="lg:col-span-4 pharm-card p-5 lg:p-6 space-y-5 lg:sticky lg:top-4">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Payment Summary</h3>
                <p className="text-sm text-gray-500 mt-0.5">Settlement for {activeInvoice.id}</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600 py-2 border-b border-gray-50">
                  <span>Subtotal</span>
                  <span className="font-mono font-medium">PKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="py-2 border-b border-gray-50">
                  <div className="flex justify-between text-gray-600 mb-2">
                    <span>Discount</span>
                    <span className="font-mono text-red-600">− PKR {discountVal.toLocaleString()}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    placeholder="Enter discount amount"
                    value={discountVal || ''}
                    onChange={e => handleUpdateDiscount(Number(e.target.value) || 0)}
                    className="input-pharm w-full px-3 py-2.5 text-sm font-mono"
                  />
                </div>
                <div className="flex justify-between items-center py-3 bg-lime/10 rounded-xl px-4">
                  <span className="font-semibold text-gray-900">Total Payable</span>
                  <span className="text-xl font-bold text-forest font-mono">
                    PKR {activeInvoice.totalPayable.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">Payment Method</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['Cash', 'Card', 'Bank Online'] as const).map(m => {
                    const Icon = paymentIcons[m];
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleUpdatePaymentMethod(m)}
                        className={`py-3 px-2 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                          payMethod === m
                            ? 'border-forest bg-lime/20 text-forest'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {m === 'Bank Online' ? 'Online' : m}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendSms}
                  onChange={() => setSendSms(!sendSms)}
                  className="rounded border-gray-300 text-forest focus:ring-forest/20 w-4 h-4"
                />
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Smartphone className="w-4 h-4 text-forest" />
                  <span>Send SMS receipt</span>
                </div>
              </label>

              <button
                type="button"
                onClick={handleSaveAndPrintBill}
                className="w-full py-3.5 btn-lime text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Receipt
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="pharm-card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">No Invoice Selected</h3>
          <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
            Select an invoice from the list above, or create one from the Pharmacy checkout.
          </p>
        </div>
      )}

      <DetailModal open={!!viewInvoice} title="Invoice Details" onClose={() => setViewInvoice(null)}>
        {viewInvoice && (
          <>
            <DetailRow label="Invoice ID" value={viewInvoice.id} />
            <DetailRow label="Patient" value={viewInvoice.patientName} />
            <DetailRow label="MRN" value={viewInvoice.mrn} />
            <DetailRow label="Phone" value={viewInvoice.phone} />
            <DetailRow label="CNIC" value={viewInvoice.cnic} />
            <DetailRow label="Date" value={viewInvoice.date} />
            <DetailRow label="Subtotal" value={`PKR ${viewInvoice.items.reduce((a, i) => a + i.total, 0).toLocaleString()}`} />
            <DetailRow label="Discount" value={`PKR ${viewInvoice.discount.toLocaleString()}`} />
            <DetailRow label="Total" value={`PKR ${viewInvoice.totalPayable.toLocaleString()}`} />
            <DetailRow label="Payment" value={viewInvoice.paymentMethod} />
            <DetailRow label="Status" value={viewInvoice.status} />
          </>
        )}
      </DetailModal>

      {editInvoice && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditInvoice(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Edit Invoice</h3>
            <form onSubmit={handleSaveInvoiceEdit} className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Patient Name</label>
                <input type="text" value={editForm.patientName}
                  onChange={e => setEditForm(f => ({ ...f, patientName: e.target.value }))}
                  className="input-pharm w-full px-4 py-2.5 text-sm" required />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Phone</label>
                <input type="text" value={editForm.phone}
                  onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                  className="input-pharm w-full px-4 py-2.5 text-sm" required />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">CNIC</label>
                <input type="text" value={editForm.cnic}
                  onChange={e => setEditForm(f => ({ ...f, cnic: e.target.value }))}
                  className="input-pharm w-full px-4 py-2.5 text-sm" required />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Status</label>
                <select value={editForm.status}
                  onChange={e => setEditForm(f => ({ ...f, status: e.target.value as Invoice['status'] }))}
                  className="input-pharm w-full px-4 py-2.5 text-sm">
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditInvoice(null)} className="flex-1 py-2.5 btn-outline-forest text-sm font-semibold">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 btn-lime text-sm font-semibold">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteInvoiceId}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? This cannot be undone."
        onConfirm={handleDeleteInvoice}
        onCancel={() => setDeleteInvoiceId(null)}
      />
    </div>
  );
}
