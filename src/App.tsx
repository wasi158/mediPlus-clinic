/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  UserPlus,
  Stethoscope,
  Microscope,
  ShoppingCart,
  Receipt,
  Activity,
  Search,
  HelpCircle,
  Settings,
  ChevronRight,
  Menu,
  X,
  Bell,
  LogOut,
  Sparkles,
} from 'lucide-react';

import { DOCTOR_IMAGES } from './data';
import { Patient, Token, LabOrder, Medicine, Invoice, ClinicalPrescription } from './types';
import { loadAppData, saveAppData } from './lib/storage';
import { useToast } from './context/ToastContext';

import DashboardTab from './components/DashboardTab';
import RegistrationTab from './components/RegistrationTab';
import OPDTab from './components/OPDTab';
import LabTab from './components/LabTab';
import PharmacyTab from './components/PharmacyTab';
import BillingTab from './components/BillingTab';
import AdminTab from './components/AdminTab';
import PrintViewer from './components/PrintViewer';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'registration', label: 'Registration', icon: UserPlus },
  { id: 'opd', label: 'Consultation', icon: Stethoscope },
  { id: 'lab', label: 'Laboratory', icon: Microscope },
  { id: 'pharmacy', label: 'Pharmacy', icon: ShoppingCart },
  { id: 'billing', label: 'Billing', icon: Receipt },
  { id: 'admin', label: 'Analytics', icon: Activity },
] as const;

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Overview', subtitle: 'Monitor your clinic operations at a glance' },
  registration: { title: 'Patient Registration', subtitle: 'Register new patients and issue OPD tokens' },
  opd: { title: 'OPD Consultation', subtitle: 'Manage physician consultations and prescriptions' },
  lab: { title: 'Laboratory', subtitle: 'Process pathology orders and enter results' },
  pharmacy: { title: 'Product List', subtitle: 'Manage your pharmacy inventory and sales' },
  billing: { title: 'Billing & Accounts', subtitle: 'Manage invoices, payments and settlements' },
  admin: { title: 'Analytics', subtitle: 'Track clinic performance and inventory alerts' },
};

export default function App() {
  const { toast } = useToast();
  const initialData = React.useMemo(() => loadAppData(), []);

  const [activeTab, setActiveTab] = React.useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const [patients, setPatients] = React.useState<Patient[]>(initialData.patients);
  const [tokens, setTokens] = React.useState<Token[]>(initialData.tokens);
  const [labOrders, setLabOrders] = React.useState<LabOrder[]>(initialData.labOrders);
  const [medicines, setMedicines] = React.useState<Medicine[]>(initialData.medicines);
  const [invoices, setInvoices] = React.useState<Invoice[]>(initialData.invoices);
  const [prescriptions, setPrescriptions] = React.useState<ClinicalPrescription[]>(initialData.prescriptions);

  const [globalQuery, setGlobalQuery] = React.useState('');
  const [showSearchResults, setShowSearchResults] = React.useState(false);
  const [focusPatientId, setFocusPatientId] = React.useState<string | null>(null);

  const [printDoc, setPrintDoc] = React.useState<{
    type: 'token' | 'prescription' | 'invoice' | 'labReport';
    data: any;
  } | null>(null);

  React.useEffect(() => {
    saveAppData({ patients, tokens, labOrders, medicines, invoices, prescriptions });
  }, [patients, tokens, labOrders, medicines, invoices, prescriptions]);

  React.useEffect(() => {
    const handleClick = () => setShowSearchResults(false);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleAddPatient = (patient: Patient) => setPatients(prev => [...prev, patient]);
  const handleUpdatePatient = (updated: Patient) => {
    setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
    setTokens(prev => prev.map(t =>
      t.patientId === updated.id ? { ...t, patientName: updated.name } : t
    ));
  };
  const handleDeletePatient = (patientId: string) => {
    setPatients(prev => prev.filter(p => p.id !== patientId));
    setTokens(prev => prev.filter(t => t.patientId !== patientId));
    setPrescriptions(prev => prev.filter(p => p.patientId !== patientId));
    setLabOrders(prev => prev.filter(o => o.patientId !== patientId));
  };

  const handleAddToken = (token: Token) => setTokens(prev => [...prev, token]);
  const handleUpdateToken = (updated: Token) => {
    setTokens(prev => prev.map(t => t.id === updated.id ? updated : t));
  };
  const handleDeleteToken = (tokenId: string) => {
    setTokens(prev => prev.filter(t => t.id !== tokenId));
  };

  const handleCompleteToken = (tokenId: string) => {
    setTokens(prev => prev.map(t => t.id === tokenId ? { ...t, status: 'Completed' } : t));
  };
  const handleUpdateLabOrder = (updated: LabOrder) => {
    setLabOrders(prev => prev.map(order => order.id === updated.id ? updated : order));
  };
  const handleDeleteLabOrder = (orderId: string) => {
    setLabOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const handleUpdateMedicineStock = (updatedStocks: Medicine[]) => setMedicines(updatedStocks);
  const handleAddMedicine = (medicine: Medicine) => setMedicines(prev => [...prev, medicine]);
  const handleUpdateMedicine = (updated: Medicine) => {
    setMedicines(prev => prev.map(m => m.id === updated.id ? updated : m));
  };
  const handleDeleteMedicine = (medicineId: string) => {
    setMedicines(prev => prev.filter(m => m.id !== medicineId));
  };

  const handleAddInvoice = (invoice: Invoice) => setInvoices(prev => [invoice, ...prev]);
  const handleUpdateInvoice = (updated: Invoice) => {
    setInvoices(prev => prev.map(inv => inv.id === updated.id ? updated : inv));
  };
  const handleDeleteInvoice = (invoiceId: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
  };

  const handleSavePrescription = (prescription: ClinicalPrescription) => {
    setPrescriptions(prev => {
      const idx = prev.findIndex(p => p.patientId === prescription.patientId);
      if (idx >= 0) {
        const replace = [...prev];
        replace[idx] = prescription;
        return replace;
      }
      return [...prev, prescription];
    });

    const activeDetails = tokens.find(t => t.patientId === prescription.patientId);
    const patient = patients.find(p => p.id === prescription.patientId);
    if (prescription.bloodTests.length > 0 || prescription.imagingTests.length > 0) {
      const requestedTests = [...prescription.bloodTests, ...prescription.imagingTests].join(' + ');
      const newLabOrder: LabOrder = {
        id: `ord-${Date.now()}`,
        orderId: `#LB-${Math.floor(9000 + Math.random() * 1000)}`,
        patientId: prescription.patientId,
        patientName: prescription.patientName,
        age: patient?.age ?? activeDetails?.fee === 1500 ? 55 : 42,
        gender: patient?.gender ?? 'Male',
        testType: requestedTests || 'General Pathology Check',
        status: 'PENDING',
        orderDate: new Date().toISOString().split('T')[0],
      };
      setLabOrders(prev => [newLabOrder, ...prev]);
    }
  };

  const handleTriggerPrint = (type: 'token' | 'prescription' | 'invoice' | 'labReport', data: any) => {
    setPrintDoc({ type, data });
  };

  const matchedPatients = patients.filter(p =>
    p.name.toLowerCase().includes(globalQuery.toLowerCase()) ||
    p.cnic.includes(globalQuery) ||
    p.id.toLowerCase().includes(globalQuery.toLowerCase())
  ).slice(0, 5);

  const handleSelectSearchPatient = (p: Patient) => {
    setGlobalQuery('');
    setShowSearchResults(false);
    setFocusPatientId(p.id);
    setActiveTab('opd');
    setSidebarOpen(false);
    toast(`Opened consultation for ${p.name}`, 'success');
  };

  const navigateTo = (tab: string) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const page = PAGE_TITLES[activeTab] ?? { title: 'MediPlus', subtitle: '' };

  const sidebarContent = (
    <>
      <div className="p-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-lime flex items-center justify-center text-forest font-bold text-lg">
          M
        </div>
        <span className="text-white font-bold text-lg tracking-tight">MediPlus</span>
        <button
          onClick={() => setSidebarOpen(false)}
          className="ml-auto lg:hidden p-1.5 text-white/50 hover:text-white rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => navigateTo(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm ${
              activeTab === id ? 'nav-active' : 'nav-inactive'
            }`}
          >
            <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={activeTab === id ? 2.5 : 2} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="px-4 pb-3 space-y-1">
        <button className="w-full flex items-center gap-3 px-4 py-2.5 nav-inactive text-sm">
          <Settings className="w-[18px] h-[18px]" />
          <span>Settings</span>
        </button>
        <button
          onClick={() => toast('Support ticket submitted. Our team will respond within 2 hours.', 'info')}
          className="w-full flex items-center gap-3 px-4 py-2.5 nav-inactive text-sm"
        >
          <HelpCircle className="w-[18px] h-[18px]" />
          <span>Help &amp; Support</span>
        </button>
      </div>

      <div className="mx-4 mb-4 p-4 rounded-2xl bg-forest-light border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-lime" />
          <span className="text-white text-sm font-semibold">Upgrade Pro</span>
        </div>
        <p className="text-white/50 text-xs leading-relaxed mb-3">
          Unlock advanced analytics, multi-branch support and priority support.
        </p>
        <button className="w-full py-2.5 btn-lime text-sm font-semibold">
          Upgrade Now
        </button>
      </div>

      <div className="px-4 pb-5">
        <button className="w-full flex items-center gap-3 px-4 py-2.5 nav-inactive text-sm">
          <LogOut className="w-[18px] h-[18px]" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex text-gray-900 bg-page">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden no-print"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-[240px] bg-forest
        flex flex-col shrink-0 no-print
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {sidebarContent}
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-page px-4 lg:px-8 pt-5 pb-4 shrink-0 no-print relative z-30">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mt-1 p-2 text-gray-500 hover:text-forest hover:bg-white rounded-xl transition"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{page.title}</h1>
                <p className="text-sm text-gray-500 mt-0.5">{page.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div
                className="relative hidden md:block w-64 lg:w-80"
                onClick={e => e.stopPropagation()}
              >
                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={globalQuery}
                  onChange={e => {
                    setGlobalQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  className="input-pharm text-sm w-full pl-10 pr-4 py-2.5 font-medium"
                />
                {showSearchResults && globalQuery.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 pharm-card shadow-lg z-50 p-1.5 overflow-hidden">
                    {matchedPatients.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleSelectSearchPatient(p)}
                        className="w-full p-3 hover:bg-lime/20 cursor-pointer rounded-xl flex items-center justify-between text-left transition"
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{p.id}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                    ))}
                    {matchedPatients.length === 0 && (
                      <p className="p-4 text-sm text-gray-400 text-center">No patients found</p>
                    )}
                  </div>
                )}
              </div>

              <button className="p-2.5 rounded-xl bg-white border border-gray-100 text-gray-500 hover:text-forest transition shadow-sm">
                <Bell className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 pl-1">
                <img
                  src={DOCTOR_IMAGES.admin}
                  alt="Administrator"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-lime/40"
                  referrerPolicy="no-referrer"
                />
                <div className="text-right hidden sm:block">
                  <span className="text-sm font-semibold text-gray-900 block leading-tight">Dr. Faisal</span>
                  <span className="text-xs text-gray-400">@faisal.admin</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-8 no-print custom-scrollbar">
          {activeTab === 'dashboard' && (
            <DashboardTab
              patients={patients}
              tokens={tokens}
              labOrders={labOrders}
              invoices={invoices}
              setActiveTab={navigateTo}
              onQuickAddPatient={() => navigateTo('registration')}
              onDeleteToken={handleDeleteToken}
            />
          )}
          {activeTab === 'registration' && (
            <RegistrationTab
              patients={patients}
              onAddPatient={handleAddPatient}
              onUpdatePatient={handleUpdatePatient}
              onDeletePatient={handleDeletePatient}
              tokens={tokens}
              onAddToken={handleAddToken}
              onUpdateToken={handleUpdateToken}
              onDeleteToken={handleDeleteToken}
              onSelectPrint={handleTriggerPrint}
            />
          )}
          {activeTab === 'opd' && (
            <OPDTab
              tokens={tokens}
              patients={patients}
              focusPatientId={focusPatientId}
              onFocusHandled={() => setFocusPatientId(null)}
              onCompleteToken={handleCompleteToken}
              onDeleteToken={handleDeleteToken}
              prescriptions={prescriptions}
              onSavePrescription={handleSavePrescription}
              medicinesList={medicines}
              onSelectPrint={handleTriggerPrint}
            />
          )}
          {activeTab === 'lab' && (
            <LabTab
              labOrders={labOrders}
              onUpdateLabOrder={handleUpdateLabOrder}
              onDeleteLabOrder={handleDeleteLabOrder}
              onSelectPrint={handleTriggerPrint}
            />
          )}
          {activeTab === 'pharmacy' && (
            <PharmacyTab
              medicines={medicines}
              onUpdateMedicineStock={handleUpdateMedicineStock}
              onAddMedicine={handleAddMedicine}
              onUpdateMedicine={handleUpdateMedicine}
              onDeleteMedicine={handleDeleteMedicine}
              onAddInvoice={handleAddInvoice}
              setActiveTab={navigateTo}
            />
          )}
          {activeTab === 'billing' && (
            <BillingTab
              invoices={invoices}
              onUpdateInvoice={handleUpdateInvoice}
              onDeleteInvoice={handleDeleteInvoice}
              onSelectPrint={handleTriggerPrint}
            />
          )}
          {activeTab === 'admin' && (
            <AdminTab medicines={medicines} tokens={tokens} />
          )}
        </div>
      </main>

      {printDoc && (
        <PrintViewer type={printDoc.type} data={printDoc.data} onClose={() => setPrintDoc(null)} />
      )}
    </div>
  );
}
