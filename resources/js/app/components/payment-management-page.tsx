import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Loader2, Plus, RefreshCcw, Trash2, DollarSign, X, Pencil, AlertCircle, CheckCircle2 } from "lucide-react";

interface Payment {
  id: number;
  amount: number;
  status: string;
  due_date: string;
  paid_at: string | null;
  tenant: { id: number; user: { name: string }; room: { room_number: string; price: number }; } | null;
}

interface TenantOption {
  id: number;
  user: { name: string };
  room: { room_number: string; price: number };
}

export function PaymentManagementPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // STATE MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    tenant_id: "",
    amount: "", 
    due_date: new Date().toISOString().split('T')[0],
  });

  const formatRupiah = (value: string | number) => {
    if (!value) return "";
    const rawValue = value.toString().replace(/\D/g, ""); 
    return new Intl.NumberFormat("id-ID").format(Number(rawValue));
  };

  const parseRupiah = (formattedValue: string) => {
    return formattedValue.replace(/\./g, ""); 
  };

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("http://127.0.0.1:8000/api/payments", {
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setPayments(data.data);
    } catch (err) { console.error("Gagal load payment"); } 
    finally { setIsLoading(false); }
  };

  const fetchTenants = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("http://127.0.0.1:8000/api/tenants", {
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setTenants(data.data);
    } catch (err) { console.error("Gagal load tenant"); }
  };

  useEffect(() => { fetchPayments(); }, []);

  const handleAddClick = () => {
    fetchTenants();
    setEditingId(null);
    setFormData({ tenant_id: "", amount: "", due_date: new Date().toISOString().split('T')[0] });
    setIsModalOpen(true);
  };

  const handleEditClick = (payment: Payment) => {
    fetchTenants();
    setEditingId(payment.id);
    setFormData({
      tenant_id: payment.tenant?.id.toString() || "",
      amount: formatRupiah(payment.amount), 
      due_date: payment.due_date,
    });
    setIsModalOpen(true);
  };

  const handleTenantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tenantId = e.target.value;
    const selectedTenant = tenants.find(t => t.id === Number(tenantId));
    setFormData(prev => ({
        ...prev,
        tenant_id: tenantId,
        amount: (!editingId && selectedTenant) ? formatRupiah(selectedTenant.room.price) : prev.amount
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const cleanAmount = Number(parseRupiah(formData.amount));
    const selectedTenant = tenants.find(t => t.id === Number(formData.tenant_id));
    const roomPrice = selectedTenant ? selectedTenant.room.price : 0;
    const autoStatus = cleanAmount >= roomPrice ? 'paid' : 'pending';

    try {
      const token = localStorage.getItem("auth_token");
      const url = editingId ? `http://127.0.0.1:8000/api/payments/${editingId}` : "http://127.0.0.1:8000/api/payments";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ...formData, amount: cleanAmount, status: autoStatus }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchPayments();
        alert(editingId ? "Data Updated!" : "Transaksi Berhasil!");
      } else {
        alert("Gagal menyimpan data.");
      }
    } catch (err) { alert("Error koneksi"); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Hapus data pembayaran ini?")) return;
    const token = localStorage.getItem("auth_token");
    await fetch(`http://127.0.0.1:8000/api/payments/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
    fetchPayments();
  };

  const getAutoStatusPreview = () => {
     const selectedTenant = tenants.find(t => t.id === Number(formData.tenant_id));
     if (!selectedTenant) return null;
     const roomPrice = selectedTenant.room.price;
     const inputAmount = Number(parseRupiah(formData.amount));
     const isLunas = inputAmount >= roomPrice;
     return { isLunas, roomPrice, inputAmount };
  };
  const statusPreview = getAutoStatusPreview();

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Keuangan</h2>
          <p className="text-slate-500 text-sm">Kelola pembayaran dan cicilan sewa.</p>
        </div>
        <div className="flex gap-2">
            <Button onClick={fetchPayments} variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-50">
                <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button onClick={handleAddClick} className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm">
                <Plus className="mr-2 h-4 w-4" /> Catat Baru
            </Button>
        </div>
      </div>

      <Card className="border border-slate-100 shadow-sm bg-white">
        <CardHeader className="border-b border-slate-50 bg-slate-50/30 px-6 py-4">
            <CardTitle className="text-base font-semibold text-slate-800">Riwayat Transaksi</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-500" /></div>
          ) : (
            <Table>
              <TableHeader className="bg-white">
                <TableRow className="border-b border-slate-100 hover:bg-transparent">
                  <TableHead className="font-semibold text-slate-500 text-xs uppercase pl-6">Penyewa</TableHead>
                  <TableHead className="font-semibold text-slate-500 text-xs uppercase">Tagihan</TableHead>
                  <TableHead className="font-semibold text-slate-500 text-xs uppercase">Sudah Bayar</TableHead>
                  <TableHead className="font-semibold text-slate-500 text-xs uppercase">Sisa / Status</TableHead>
                  <TableHead className="font-semibold text-slate-500 text-xs uppercase">Tanggal</TableHead>
                  <TableHead className="text-right font-semibold text-slate-500 text-xs uppercase pr-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => {
                    const roomPrice = payment.tenant?.room?.price || 0;
                    const remaining = roomPrice - payment.amount;
                    const isLunas = remaining <= 0;

                    return (
                    <TableRow key={payment.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <TableCell className="pl-6 py-4">
                            <div className="font-medium text-slate-700">{payment.tenant?.user?.name || "Mantan Penghuni"}</div>
                            <div className="text-xs text-slate-400">Kamar {payment.tenant?.room?.room_number}</div>
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">Rp {Number(roomPrice).toLocaleString('id-ID')}</TableCell>
                        <TableCell className="font-bold text-slate-700 text-sm">Rp {Number(payment.amount).toLocaleString('id-ID')}</TableCell>
                        <TableCell>
                            {isLunas ? (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-0 px-2.5 py-0.5 text-xs font-medium">LUNAS</Badge>
                            ) : (
                                <div className="flex flex-col items-start gap-1">
                                    <Badge variant="outline" className="bg-amber-50 text-amber-600 border-0 px-2.5 py-0.5 text-xs font-medium">
                                        - Rp {Number(remaining).toLocaleString('id-ID')}
                                    </Badge>
                                </div>
                            )}
                        </TableCell>
                        <TableCell className="text-slate-500 text-xs">{payment.due_date}</TableCell>
                        <TableCell className="text-right pr-6">
                            <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => handleEditClick(payment)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(payment.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                    );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* MODAL INPUT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-[2px] p-4 animate-in fade-in zoom-in duration-200">
          <Card className="w-full max-w-md shadow-xl border-0 ring-1 ring-slate-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4 bg-white rounded-t-lg">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-800">{editingId ? "Edit Pembayaran" : "Catat Pembayaran"}</CardTitle>
                <CardDescription className="text-slate-400 text-xs">Input total uang yang diterima.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-full" onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5 pt-6 bg-white">
                
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Penyewa</label>
                    <select 
                        required disabled={!!editingId}
                        className="flex h-10 w-full rounded-md border border-slate-200 px-3 text-sm bg-white disabled:bg-slate-50 focus:border-blue-500 outline-none transition-all"
                        value={formData.tenant_id} onChange={handleTenantChange}
                    >
                        <option value="">-- Pilih Penyewa --</option>
                        {tenants.map((t) => (
                            <option key={t.id} value={t.id}>{t.user.name} (Tagihan: Rp {Number(t.room.price).toLocaleString('id-ID')})</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Total Uang Diterima (Rp)</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input 
                            name="amount" type="text" required placeholder="0"
                            className="flex h-10 w-full rounded-md border border-slate-200 pl-9 px-3 text-sm focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                            value={formData.amount} 
                            onChange={(e) => {
                                const formatted = formatRupiah(e.target.value);
                                setFormData({...formData, amount: formatted});
                            }}
                        />
                    </div>
                </div>

                {statusPreview && (
                    <div className={`p-3 rounded-lg border text-sm flex items-start gap-2 ${statusPreview.isLunas ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-amber-50 border-amber-100 text-amber-800'}`}>
                        {statusPreview.isLunas ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" /> : <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />}
                        <div>
                            <span className="font-semibold block mb-0.5 text-xs uppercase tracking-wide">Status Otomatis: {statusPreview.isLunas ? "LUNAS" : "BELUM LUNAS"}</span>
                            {!statusPreview.isLunas && (
                                <span className="text-xs opacity-90">
                                    Kurang: Rp {(statusPreview.roomPrice - statusPreview.inputAmount).toLocaleString('id-ID')} lagi.
                                </span>
                            )}
                        </div>
                    </div>
                )}

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Tanggal Transaksi</label>
                    <input 
                        type="date" required 
                        className="flex h-10 w-full rounded-md border border-slate-200 px-3 text-sm focus:border-blue-500 outline-none transition-all"
                        value={formData.due_date} 
                        onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    />
                </div>

              </CardContent>
              <CardFooter className="flex justify-end gap-3 border-t border-slate-100 pt-4 pb-4 px-6 bg-slate-50/50 rounded-b-lg">
                <Button type="button" variant="ghost" className="text-slate-500 hover:text-slate-700" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm px-6">
                    {isSubmitting ? "Menyimpan..." : "Simpan Transaksi"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}