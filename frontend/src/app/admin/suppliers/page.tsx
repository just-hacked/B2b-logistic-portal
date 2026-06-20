'use client';
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { suppliersApi, type ApiSupplier } from '@/lib/api/suppliers.api';
import { Star, X, Search, Plus } from 'lucide-react';

interface LocalSupplier {
  id: string;
  name: string;
  city: string;
  province: string;
  contactPerson: string;
  phone: string;
  email: string;
  categories: string[];
  rating: number;
  status: 'Active' | 'Inactive';
  joined: string;
  productsCount: number;
}

function Stars({ rating }: { rating: number }) {
  return <span className="inline-flex items-center gap-0.5">{Array.from({length:5}).map((_,i) => <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />)}<span className="text-xs text-muted-foreground ml-1">{rating.toFixed(1)}</span></span>;
}

function apiToSupplier(s: ApiSupplier): LocalSupplier {
  return {
    id: s.id,
    name: s.companyName,
    city: s.city ?? '',
    province: s.province ?? '',
    contactPerson: s.contactPerson ?? '—',
    phone: s.phone ?? '—',
    email: s.email ?? '',
    categories: [],
    rating: s.rating ?? 0,
    status: s.isVerified ? 'Active' : 'Inactive',
    joined: new Date(s.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    productsCount: s._count?.products ?? 0,
  };
}

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<LocalSupplier[]>([]);
  const [viewing, setViewing] = useState<LocalSupplier | null>(null);
  const [q, setQ] = useState('');
  
  const [adding, setAdding] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    companyName: '',
    country: 'China',
    city: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    notes: '',
    isVerified: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    suppliersApi.getSuppliers({ limit: 100 })
      .then(r => {
        const apiData = r.data?.data ?? [];
        setSuppliers(apiData.map(apiToSupplier));
      })
      .catch(() => {});
  }, []);

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.companyName.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const response = await suppliersApi.createSupplier({
        ...newSupplier,
        companyName: newSupplier.companyName.trim()
      });
      const added = response.data?.data;
      if (added) {
        setSuppliers(prev => [...prev, apiToSupplier(added)]);
        setAdding(false);
        setNewSupplier({
          companyName: '',
          country: 'China',
          city: '',
          contactName: '',
          contactEmail: '',
          contactPhone: '',
          notes: '',
          isVerified: true
        });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create supplier');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = suppliers.filter(s => !q || [s.name, s.city, s.contactPerson, ...s.categories].join(' ').toLowerCase().includes(q.toLowerCase()));

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
        <div><h1 className="text-2xl font-700">Supplier Management</h1><p className="text-sm text-muted-foreground mt-1">China-based suppliers • {suppliers.length} total</p></div>
        <button onClick={() => { setError(''); setAdding(true); }} className="btn-primary flex items-center gap-1.5 self-start sm:self-auto"><Plus className="w-4 h-4" /> Add Supplier</button>
      </div>
      <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, city, category..." className="input-field !pl-10 max-w-md" /></div>
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-sm min-w-[900px]">
          <thead className="bg-muted/40 border-b border-border"><tr className="text-[11px] uppercase text-muted-foreground">
            <th className="px-3 py-3 text-left font-600">Supplier</th><th className="px-3 py-3 text-left font-600">Location</th><th className="px-3 py-3 text-left font-600">Contact</th><th className="px-3 py-3 text-left font-600">Categories</th><th className="px-3 py-3 text-left font-600">Rating</th><th className="px-3 py-3 text-right font-600">Products</th><th className="px-3 py-3 text-left font-600">Status</th><th className="px-3 py-3 text-right font-600">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center text-muted-foreground py-10 text-sm">No suppliers found</td></tr>
            ) : filtered.map(s => (
              <tr key={s.id} className="table-row-hover">
                <td className="px-3 py-3"><p className="font-600">{s.name}</p><p className="text-[11px] text-muted-foreground font-tabular">{s.id}</p></td>
                <td className="px-3 py-3 text-xs">{s.city}, {s.province}</td>
                <td className="px-3 py-3"><p className="text-sm">{s.contactPerson}</p><p className="text-[11px] text-muted-foreground font-tabular">{s.phone}</p></td>
                <td className="px-3 py-3"><div className="flex flex-wrap gap-1">{s.categories.slice(0,2).map(c => <span key={c} className="badge bg-muted text-muted-foreground text-[10px]">{c}</span>)}{s.categories.length > 2 && <span className="badge bg-muted text-muted-foreground text-[10px]">+{s.categories.length-2}</span>}</div></td>
                <td className="px-3 py-3"><Stars rating={s.rating} /></td>
                <td className="px-3 py-3 text-right font-tabular font-600">{s.productsCount}</td>
                <td className="px-3 py-3"><span className={`badge ${s.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{s.status}</span></td>
                <td className="px-3 py-3 text-right"><button onClick={() => setViewing(s)} className="text-[11px] font-600 text-[#4A3B52] hover:underline">View</button></td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>

      {viewing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto pt-4 md:pt-8" onClick={() => setViewing(null)}><div onClick={e => e.stopPropagation()} className="bg-card rounded-2xl w-full max-w-lg p-5 mb-4 mx-4">
          <div className="flex items-center justify-between mb-3"><h3 className="font-700">{viewing.name}</h3><button onClick={() => setViewing(null)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"><X className="w-4 h-4" /></button></div>
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            <div><p className="text-[10px] uppercase text-muted-foreground">Location</p><p className="font-500">{viewing.city}, {viewing.province}</p></div>
            <div><p className="text-[10px] uppercase text-muted-foreground">Contact</p><p className="font-500">{viewing.contactPerson}</p></div>
            <div><p className="text-[10px] uppercase text-muted-foreground">Phone</p><p className="font-tabular font-500">{viewing.phone}</p></div>
            <div><p className="text-[10px] uppercase text-muted-foreground">Email</p><p className="font-500 truncate">{viewing.email}</p></div>
            <div><p className="text-[10px] uppercase text-muted-foreground">Rating</p><Stars rating={viewing.rating} /></div>
            <div><p className="text-[10px] uppercase text-muted-foreground">Products</p><p className="font-tabular font-700">{viewing.productsCount}</p></div>
          </div>
        </div></div>
      )}

      {adding && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto pt-4 md:pt-8" onClick={() => setAdding(false)}><div onClick={e => e.stopPropagation()} className="bg-card rounded-2xl w-full max-w-lg p-5 mb-4 mx-4">
          <div className="flex items-center justify-between mb-3"><h3 className="font-700 text-lg">Add New Supplier</h3><button onClick={() => setAdding(false)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"><X className="w-4 h-4" /></button></div>
          <form onSubmit={handleAddSupplier}>
            {error && <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 mb-3">{error}</div>}
            <div className="flex flex-col gap-3 text-sm mb-4">
              <div>
                <label className="text-[10px] uppercase text-muted-foreground font-600">Company Name *</label>
                <input required value={newSupplier.companyName} onChange={e => setNewSupplier(prev => ({ ...prev, companyName: e.target.value }))} className="input-field mt-1" placeholder="e.g. Shanghai Textiles" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase text-muted-foreground font-600">City</label>
                  <input value={newSupplier.city} onChange={e => setNewSupplier(prev => ({ ...prev, city: e.target.value }))} className="input-field mt-1" placeholder="e.g. Shanghai" />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-muted-foreground font-600">Country</label>
                  <input value={newSupplier.country} onChange={e => setNewSupplier(prev => ({ ...prev, country: e.target.value }))} className="input-field mt-1" placeholder="e.g. China" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase text-muted-foreground font-600">Contact Person</label>
                  <input value={newSupplier.contactName} onChange={e => setNewSupplier(prev => ({ ...prev, contactName: e.target.value }))} className="input-field mt-1" placeholder="Name" />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-muted-foreground font-600">Phone</label>
                  <input value={newSupplier.contactPhone} onChange={e => setNewSupplier(prev => ({ ...prev, contactPhone: e.target.value }))} className="input-field mt-1" placeholder="Phone number" />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase text-muted-foreground font-600">Email</label>
                <input type="email" value={newSupplier.contactEmail} onChange={e => setNewSupplier(prev => ({ ...prev, contactEmail: e.target.value }))} className="input-field mt-1" placeholder="Email address" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-muted-foreground font-600">Notes</label>
                <textarea value={newSupplier.notes} onChange={e => setNewSupplier(prev => ({ ...prev, notes: e.target.value }))} className="input-field mt-1 min-h-[60px]" placeholder="Additional supplier notes..." />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <input type="checkbox" id="isVerified" checked={newSupplier.isVerified} onChange={e => setNewSupplier(prev => ({ ...prev, isVerified: e.target.checked }))} className="rounded border-border text-[#4A3B52]" />
                <label htmlFor="isVerified" className="text-xs font-500 cursor-pointer">Mark as Verified Supplier</label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setAdding(false)} className="btn-secondary text-xs px-4 py-2">Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary text-xs px-4 py-2 disabled:opacity-50">{submitting ? 'Creating...' : 'Create Supplier'}</button>
            </div>
          </form>
        </div></div>
      )}
    </AdminLayout>
  );
}
