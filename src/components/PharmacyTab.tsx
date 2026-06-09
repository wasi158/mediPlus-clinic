/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Search, Plus, Minus, Trash2, Tag, ArrowRight, Filter, AlertTriangle,
  Check, CreditCard, DollarSign, X, Package, MoreVertical, Eye, Pencil,
  Download, Calendar, ShoppingCart, Pill, Syringe, Droplets,
} from 'lucide-react';
import { Medicine, Invoice } from '../types';
import { useToast } from '../context/ToastContext';
import ConfirmDialog, { DetailModal, DetailRow, ActionButtons } from './ui/RecordActions';

interface CartItem {
  medicine: Medicine;
  qty: number;
}

interface PharmacyTabProps {
  medicines: Medicine[];
  onUpdateMedicineStock: (updated: Medicine[]) => void;
  onAddMedicine: (medicine: Medicine) => void;
  onUpdateMedicine: (medicine: Medicine) => void;
  onDeleteMedicine: (medicineId: string) => void;
  onAddInvoice: (invoice: Invoice) => void;
  setActiveTab: (tab: string) => void;
}

const CATEGORIES = [
  { id: 'All', label: 'All Products', icon: Package, trend: '+5%', trendUp: true },
  { id: 'Tablets', label: 'Tablets', icon: Pill, trend: '+2%', trendUp: true },
  { id: 'Syrups', label: 'Syrups', icon: Droplets, trend: '-1%', trendUp: false },
  { id: 'Injections', label: 'Injections', icon: Syringe, trend: '+3%', trendUp: true },
] as const;

function getStockStatus(stock: number) {
  if (stock === 0) return 'out' as const;
  if (stock <= 15) return 'low' as const;
  return 'in' as const;
}

function getExpiryDate(id: string) {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${10 + (hash % 20)} ${months[hash % 12]}, 2027`;
}

export default function PharmacyTab({
  medicines, onUpdateMedicineStock, onAddMedicine, onUpdateMedicine, onDeleteMedicine,
  onAddInvoice, setActiveTab,
}: PharmacyTabProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<'All' | 'Tablets' | 'Syrups' | 'Injections'>('All');
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [discountPercent, setDiscountPercent] = React.useState(0);
  const [showSettlement, setShowSettlement] = React.useState(false);
  const [showCart, setShowCart] = React.useState(false);
  const [selectedPayment, setSelectedPayment] = React.useState<'Cash' | 'Card' | 'Online'>('Cash');
  const [patientCnic, setPatientCnic] = React.useState('42201-1234567-1');
  const [patientName, setPatientName] = React.useState('Ahmed Ali Khan');
  const [patientPhone, setPatientPhone] = React.useState('0300-1234567');
  const [currentPage, setCurrentPage] = React.useState(1);
  const perPage = 8;

  const [viewMed, setViewMed] = React.useState<Medicine | null>(null);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editMed, setEditMed] = React.useState<Medicine | null>(null);
  const [deleteMedId, setDeleteMedId] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState({
    name: '', generic: '', category: 'Tablets' as Medicine['category'],
    stock: '', price: '',
  });

  const totalProducts = medicines.length;
  const lowStockCount = medicines.filter(m => m.stock > 0 && m.stock <= 15).length;
  const outOfStockCount = medicines.filter(m => m.stock === 0).length;

  const categoryCounts = React.useMemo(() => ({
    All: medicines.length,
    Tablets: medicines.filter(m => m.category === 'Tablets').length,
    Syrups: medicines.filter(m => m.category === 'Syrups').length,
    Injections: medicines.filter(m => m.category === 'Injections').length,
  }), [medicines]);

  const openEditModal = (med?: Medicine) => {
    setEditMed(med ?? null);
    setShowEditModal(true);
    setEditForm({
      name: med?.name ?? '',
      generic: med?.generic ?? '',
      category: med?.category ?? 'Tablets',
      stock: med ? String(med.stock) : '',
      price: med ? String(med.price) : '',
    });
  };

  const handleSaveMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.stock || !editForm.price) {
      toast('Fill all required fields', 'warning');
      return;
    }
    const stock = Number(editForm.stock);
    const price = Number(editForm.price);
    if (editMed) {
      onUpdateMedicine({
        ...editMed,
        name: editForm.name.trim(),
        generic: editForm.generic.trim(),
        category: editForm.category,
        stock,
        price,
        isLowStock: stock <= 15,
      });
      toast(`${editForm.name} updated`, 'success');
    } else {
      onAddMedicine({
        id: `med-${Date.now()}`,
        name: editForm.name.trim(),
        generic: editForm.generic.trim(),
        category: editForm.category,
        stock,
        price,
        isLowStock: stock <= 15,
      });
      toast(`${editForm.name} added`, 'success');
    }
    setShowEditModal(false);
    setEditMed(null);
  };

  const handleDeleteMedicine = () => {
    if (!deleteMedId) return;
    onDeleteMedicine(deleteMedId);
    setCart(prev => prev.filter(i => i.medicine.id !== deleteMedId));
    toast('Product deleted', 'success');
    setDeleteMedId(null);
  };

  const filteredCatalog = medicines.filter(m => {
    const matchesQuery = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.generic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    return matchesQuery && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filteredCatalog.length / perPage));
  const paginatedItems = filteredCatalog.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleAddToCart = (med: Medicine) => {
    const existing = cart.find(item => item.medicine.id === med.id);
    const existingQty = existing ? existing.qty : 0;
    if (existingQty >= med.stock) {
      toast(`Only ${med.stock} units available`, 'warning');
      return;
    }
    if (existing) {
      setCart(cart.map(item =>
        item.medicine.id === med.id ? { ...item, qty: item.qty + 1 } : item
      ));
    } else {
      setCart([...cart, { medicine: med, qty: 1 }]);
    }
    setShowCart(true);
    toast(`${med.name} added to cart`, 'success');
  };

  const handleUpdateQty = (medId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.medicine.id === medId) {
        const nextQty = item.qty + delta;
        if (nextQty <= 0) return null;
        if (nextQty > item.medicine.stock) {
          toast(`Stock limit: ${item.medicine.stock} units`, 'warning');
          return item;
        }
        return { ...item, qty: nextQty };
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const calculatedSubtotal = cart.reduce((t, i) => t + i.medicine.price * i.qty, 0);
  const calculatedDiscount = Math.round(calculatedSubtotal * (discountPercent / 100));
  const calculatedTotal = Math.max(0, calculatedSubtotal - calculatedDiscount);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast('Add items to cart before checkout', 'warning');
      return;
    }

    const updatedStocks = medicines.map(m => {
      const match = cart.find(item => item.medicine.id === m.id);
      if (match) {
        const newStock = Math.max(0, m.stock - match.qty);
        return { ...m, stock: newStock, isLowStock: newStock <= 15 };
      }
      return m;
    });
    onUpdateMedicineStock(updatedStocks);

    const invoiceId = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInvoice: Invoice = {
      id: invoiceId,
      patientId: `MRN-${Math.floor(20000 + Math.random() * 9000)}`,
      patientName,
      cnic: patientCnic,
      phone: patientPhone,
      age: 34,
      gender: 'Male',
      lastVisit: new Date().toLocaleDateString('en-PK'),
      mrn: `MRN-${Math.floor(20000 + Math.random() * 80000)}`,
      items: cart.map(item => ({
        category: 'PHARMACY' as const,
        description: `${item.medicine.name} (${item.medicine.generic})`,
        qty: item.qty,
        unitPrice: item.medicine.price,
        total: item.medicine.price * item.qty,
      })),
      discount: calculatedDiscount,
      tax: 0,
      totalPayable: calculatedTotal,
      paymentMethod: `${selectedPayment} Payment`,
      status: 'Paid',
      date: new Date().toISOString().split('T')[0],
    };

    onAddInvoice(newInvoice);
    setCart([]);
    setShowSettlement(false);
    setShowCart(false);
    toast(`Invoice ${invoiceId} created`, 'success');
    setActiveTab('billing');
  };

  const StatusBadge = ({ stock }: { stock: number }) => {
    const status = getStockStatus(stock);
    if (status === 'in') return <span className="badge-in-stock">In stock</span>;
    if (status === 'low') return <span className="badge-low-stock">Low stock</span>;
    return <span className="badge-out-stock">Out of stock</span>;
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Products', value: totalProducts, icon: Package, iconBg: 'bg-lime/30', iconColor: 'text-forest' },
          { label: 'Low Stock Items', value: lowStockCount, icon: AlertTriangle, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
          { label: 'Out of Stock', value: outOfStockCount, icon: X, iconBg: 'bg-red-100', iconColor: 'text-red-500' },
        ].map(stat => (
          <div key={stat.label} className="pharm-card p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
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

      {/* Category cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {CATEGORIES.map(cat => {
          const isActive = selectedCategory === cat.id;
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); setCurrentPage(1); }}
              className={`p-4 rounded-2xl text-left transition-all ${
                isActive
                  ? 'pharm-card-dark shadow-lg'
                  : 'pharm-card hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isActive ? 'bg-lime/20' : 'bg-gray-100'
                }`}>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-lime' : 'text-gray-500'}`} />
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  cat.trendUp
                    ? isActive ? 'bg-lime/20 text-lime' : 'bg-emerald-50 text-emerald-600'
                    : isActive ? 'bg-red-400/20 text-red-300' : 'bg-red-50 text-red-500'
                }`}>
                  {cat.trend}
                </span>
              </div>
              <p className={`text-sm font-medium ${isActive ? 'text-white/70' : 'text-gray-500'}`}>
                {cat.label}
              </p>
              <p className={`text-2xl font-bold mt-1 ${isActive ? 'text-white' : 'text-gray-900'}`}>
                {categoryCounts[cat.id]}
              </p>
              <p className={`text-xs mt-1 ${isActive ? 'text-white/40' : 'text-gray-400'}`}>
                Since last week
              </p>
            </button>
          );
        })}
      </div>

      {/* Table section */}
      <div className="pharm-card overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 lg:p-5 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between border-b border-gray-100">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="input-pharm text-sm w-full pl-9 pr-4 py-2.5"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => openEditModal()}
              className="btn-lime px-4 py-2.5 text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
            <button
              onClick={() => cart.length > 0 ? setShowCart(true) : toast('Cart is empty', 'info')}
              className="btn-outline-forest px-4 py-2.5 text-sm flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Cart ({cart.reduce((s, i) => s + i.qty, 0)})
            </button>
            <button className="btn-outline-forest px-4 py-2.5 text-sm flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button className="btn-outline-forest px-4 py-2.5 text-sm flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="btn-outline-forest px-4 py-2.5 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              This Month
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                {['Product ID', 'Product Name', 'Quantity', 'Price', 'Expiry Date', 'Status', 'Action'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedItems.map(med => (
                <tr key={med.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs text-gray-500 whitespace-nowrap">{med.id}</td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-900">{med.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{med.generic}</p>
                  </td>
                  <td className="px-5 py-4 font-medium text-gray-700">{med.stock}</td>
                  <td className="px-5 py-4 font-medium text-gray-700">PKR {med.price}</td>
                  <td className="px-5 py-4 text-gray-500 whitespace-nowrap">{getExpiryDate(med.id)}</td>
                  <td className="px-5 py-4"><StatusBadge stock={med.stock} /></td>
                  <td className="px-5 py-4">
                    <ActionButtons
                      onView={() => setViewMed(med)}
                      onEdit={() => openEditModal(med)}
                      onDelete={() => setDeleteMedId(med.id)}
                    />
                  </td>
                </tr>
              ))}
              {paginatedItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                    No products match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 flex items-center justify-end gap-1 border-t border-gray-100">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                currentPage === page
                  ? 'bg-forest text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      </div>

      {/* Cart slide-over */}
      {showCart && (
        <div className="fixed inset-0 z-[110] flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCart(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-[slideIn_0.25s_ease-out]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-forest" />
                <h3 className="font-bold text-gray-900">POS Checkout</h3>
              </div>
              <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {cart.map(item => (
                <div key={item.medicine.id} className="pharm-card p-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.medicine.name}</p>
                    <p className="text-xs text-gray-400">PKR {item.medicine.price} each</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => handleUpdateQty(item.medicine.id, -1)} className="p-1.5 bg-gray-100 rounded-lg">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                    <button onClick={() => handleUpdateQty(item.medicine.id, 1)} className="p-1.5 bg-gray-100 rounded-lg">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <p className="text-center text-gray-400 py-12 text-sm">Cart is empty</p>
              )}
            </div>

            <div className="p-5 border-t border-gray-100 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">PKR {calculatedSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Discount</span>
                  <span className="text-emerald-600 font-semibold">-{discountPercent}%</span>
                </div>
                <input
                  type="range" min="0" max="25" step="5"
                  value={discountPercent}
                  onChange={e => setDiscountPercent(Number(e.target.value))}
                  className="w-full accent-forest"
                />
                <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>PKR {calculatedTotal.toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  if (cart.length === 0) { toast('Cart is empty', 'warning'); return; }
                  setShowSettlement(true);
                }}
                className="w-full py-3.5 btn-lime text-sm font-semibold flex items-center justify-center gap-2"
              >
                Proceed to Settlement
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settlement modal */}
      {showSettlement && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900">POS Settlement</h3>
                <p className="text-xs text-gray-400 mt-0.5">Complete payment details</p>
              </div>
              <button onClick={() => setShowSettlement(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleCheckoutSubmit} className="p-5 space-y-4">
              <div className="space-y-3">
                <input
                  type="text" required value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  placeholder="Patient name"
                  className="input-pharm w-full px-4 py-2.5 text-sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text" required value={patientCnic}
                    onChange={e => setPatientCnic(e.target.value)}
                    placeholder="CNIC"
                    className="input-pharm w-full px-4 py-2.5 text-sm font-mono"
                  />
                  <input
                    type="text" required value={patientPhone}
                    onChange={e => setPatientPhone(e.target.value)}
                    placeholder="Phone"
                    className="input-pharm w-full px-4 py-2.5 text-sm font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['Cash', 'Card', 'Online'] as const).map(method => (
                  <button
                    key={method} type="button"
                    onClick={() => setSelectedPayment(method)}
                    className={`py-3 rounded-xl border text-sm font-semibold flex flex-col items-center gap-1 transition ${
                      selectedPayment === method
                        ? 'border-forest bg-lime/20 text-forest'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {method === 'Cash' && <DollarSign className="w-4 h-4" />}
                    {method === 'Card' && <CreditCard className="w-4 h-4" />}
                    {method === 'Online' && <Check className="w-4 h-4" />}
                    {method}
                  </button>
                ))}
              </div>
              <div className="pharm-card p-4 flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Payable</span>
                <span className="text-lg font-bold text-forest">PKR {calculatedTotal.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setShowSettlement(false)} className="py-3 btn-outline-forest text-sm font-semibold">
                  Cancel
                </button>
                <button type="submit" className="py-3 btn-lime text-sm font-semibold">
                  Confirm &amp; Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DetailModal open={!!viewMed} title="Product Details" onClose={() => setViewMed(null)}>
        {viewMed && (
          <>
            <DetailRow label="Product ID" value={viewMed.id} />
            <DetailRow label="Name" value={viewMed.name} />
            <DetailRow label="Generic" value={viewMed.generic} />
            <DetailRow label="Category" value={viewMed.category} />
            <DetailRow label="Stock" value={viewMed.stock} />
            <DetailRow label="Price" value={`PKR ${viewMed.price}`} />
            <DetailRow label="Expiry" value={getExpiryDate(viewMed.id)} />
            <DetailRow label="Status" value={viewMed.stock === 0 ? 'Out of stock' : viewMed.stock <= 15 ? 'Low stock' : 'In stock'} />
          </>
        )}
      </DetailModal>

      {showEditModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setShowEditModal(false); setEditMed(null); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-gray-900">{editMed ? 'Edit Product' : 'Add Product'}</h3>
            <form onSubmit={handleSaveMedicine} className="space-y-3">
              <input type="text" placeholder="Product name" value={editForm.name}
                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                className="input-pharm w-full px-4 py-2.5 text-sm" required />
              <input type="text" placeholder="Generic name" value={editForm.generic}
                onChange={e => setEditForm(f => ({ ...f, generic: e.target.value }))}
                className="input-pharm w-full px-4 py-2.5 text-sm" />
              <select value={editForm.category}
                onChange={e => setEditForm(f => ({ ...f, category: e.target.value as Medicine['category'] }))}
                className="input-pharm w-full px-4 py-2.5 text-sm">
                <option value="Tablets">Tablets</option>
                <option value="Syrups">Syrups</option>
                <option value="Injections">Injections</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Stock qty" value={editForm.stock}
                  onChange={e => setEditForm(f => ({ ...f, stock: e.target.value }))}
                  className="input-pharm w-full px-4 py-2.5 text-sm" required min="0" />
                <input type="number" placeholder="Price (PKR)" value={editForm.price}
                  onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                  className="input-pharm w-full px-4 py-2.5 text-sm" required min="0" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowEditModal(false); setEditMed(null); }} className="flex-1 py-2.5 btn-outline-forest text-sm font-semibold">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 btn-lime text-sm font-semibold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteMedId}
        title="Delete Product"
        message="Are you sure you want to delete this product from inventory?"
        onConfirm={handleDeleteMedicine}
        onCancel={() => setDeleteMedId(null)}
      />
    </div>
  );
}
