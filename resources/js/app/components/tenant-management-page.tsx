import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Loader2, Trash2, UserPlus, RefreshCcw, X, Check, CalendarClock } from "lucide-react";

interface Tenant {
  id: number;
  start_date: string;
  due_date: number;
  user: { name: string; email: string; phone_number: string; };
  room: { room_number: string; };
}

interface RoomOption {
  id: number;
  room_number: string;
  status: string;
}

export function TenantManagementPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // STATE MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    room_id: "",
    start_date: new Date().toISOString().split('T')[0],
    due_date: "5",
  });

  const fetchTenants = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("http://127.0.0.1:8000/api/tenants", {
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setTenants(data.data);
    } catch (err) { console.error("Gagal load tenant"); } 
    finally { setIsLoading(false); }
  };

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("http://127.0.0.1:8000/api/rooms", {
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const availableRooms = data.data.filter((r: any) => r.status === 'available');
        setRooms(availableRooms);
      }
    } catch (err) { console.error("Gagal ambil kamar"); }
  };

  useEffect(() => { fetchTenants(); }, []);

  const openCheckinModal = () => {
    fetchRooms();
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("http://127.0.0.1:8000/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ name: "", email: "", phone_number: "", room_id: "", start_date: new Date().toISOString().split('T')[0], due_date: "5" });
        fetchTenants();
        alert("Check-in Berhasil!");
      } else {
        const result = await res.json();
        alert("Gagal: " + result.message);
      }
    } catch (err) { alert("Error koneksi"); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Checkout penyewa ini?")) return;
    try {
        const token = localStorage.getItem("auth_token");
        const res = await fetch(`http://127.0.0.1:8000/api/tenants/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` },
        });
        if (res.ok) fetchTenants();
    } catch (err) { alert("Gagal delete"); }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Manajemen Penyewa</h2>
          <p className="text-slate-500 text-sm">Daftar penghuni aktif di kosan.</p>
        </div>
        <div className="flex gap-2">
            <Button onClick={fetchTenants} variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-50">
                <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button onClick={openCheckinModal} className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm">
                <UserPlus className="mr-2 h-4 w-4" /> Check-in Baru
            </Button>
        </div>
      </div>

      <Card className="border border-slate-100 shadow-sm bg-white">
        <CardHeader className="border-b border-slate-50 bg-slate-50/30 px-6 py-4">
            <CardTitle className="text-base font-semibold text-slate-800">Daftar Penghuni</CardTitle>
            <CardDescription className="text-slate-400 text-xs">{tenants.length} orang sedang menyewa.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-500" /></div>
          ) : (
            <Table>
              <TableHeader className="bg-white">
                <TableRow className="border-b border-slate-100 hover:bg-transparent">
                  <TableHead className="font-semibold text-slate-500 text-xs uppercase pl-6">Nama Penyewa</TableHead>
                  <TableHead className="font-semibold text-slate-500 text-xs uppercase">Kamar</TableHead>
                  <TableHead className="font-semibold text-slate-500 text-xs uppercase">Mulai Ngekos</TableHead>
                  <TableHead className="font-semibold text-slate-500 text-xs uppercase">Tagihan</TableHead>
                  <TableHead className="font-semibold text-slate-500 text-xs uppercase">Status</TableHead>
                  <TableHead className="text-right font-semibold text-slate-500 text-xs uppercase pr-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => {
                  const today = new Date();
                  const currentDay = today.getDate();
                  const nextBillMonth = currentDay <= tenant.due_date ? today.getMonth() : today.getMonth() + 1;
                  const nextBillDate = new Date(today.getFullYear(), nextBillMonth, tenant.due_date);

                  return (
                    <TableRow key={tenant.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <TableCell className="pl-6 py-4">
                          <div className="font-medium text-slate-700">{tenant.user?.name}</div>
                          <div className="text-xs text-slate-400">{tenant.user?.phone_number}</div>
                      </TableCell>
                      <TableCell className="font-bold text-slate-700 text-base">{tenant.room?.room_number}</TableCell>
                      <TableCell className="text-slate-600 text-sm">{tenant.start_date}</TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                            <CalendarClock className="h-4 w-4 text-slate-400" />
                            <div>
                                <div className="font-medium text-slate-700 text-sm">Tgl {tenant.due_date}</div>
                                <div className="text-[10px] text-slate-400">
                                    Next: {nextBillDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                </div>
                            </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-0 px-2.5 py-0.5 text-xs font-medium">
                            Aktif
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 h-8" onClick={() => handleDelete(tenant.id)}>
                              <Trash2 className="h-4 w-4 mr-2" /> Checkout
                          </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* MODAL CHECK-IN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-[2px] p-4 animate-in fade-in zoom-in duration-200">
          <Card className="w-full max-w-lg shadow-xl border-0 ring-1 ring-slate-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4 bg-white rounded-t-lg">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-800">Check-in Penghuni</CardTitle>
                <CardDescription className="text-slate-400 text-xs">Masukkan data diri dan pilih kamar.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-full" onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5 pt-6 bg-white">
                
                {/* SECTION DATA DIRI */}
                <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-100 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Data Penghuni</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-600">Nama Lengkap</label>
                            <input name="name" required className="flex h-9 w-full rounded-md border border-slate-200 px-3 text-sm focus:border-blue-500 outline-none transition-all" 
                                value={formData.name} onChange={handleInputChange} placeholder="Nama..." />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-600">No. HP</label>
                            <input name="phone_number" required className="flex h-9 w-full rounded-md border border-slate-200 px-3 text-sm focus:border-blue-500 outline-none transition-all" 
                                value={formData.phone_number} onChange={handleInputChange} placeholder="08..." />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-600">Email (Untuk Login)</label>
                        <input name="email" type="email" required className="flex h-9 w-full rounded-md border border-slate-200 px-3 text-sm focus:border-blue-500 outline-none transition-all" 
                            value={formData.email} onChange={handleInputChange} placeholder="email@contoh.com" />
                    </div>
                </div>

                {/* SECTION SEWA */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Detail Sewa</h3>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-600">Pilih Kamar (Available)</label>
                        <select name="room_id" required className="flex h-10 w-full rounded-md border border-slate-200 px-3 text-sm bg-white focus:border-blue-500 outline-none transition-all"
                            value={formData.room_id} onChange={handleInputChange}>
                            <option value="">-- Pilih Kamar Kosong --</option>
                            {rooms.length === 0 ? <option disabled>Semua kamar penuh!</option> : rooms.map((room) => (
                                <option key={room.id} value={room.id}>Kamar {room.room_number} (Available)</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-600">Tanggal Masuk</label>
                            <input type="date" name="start_date" required className="flex h-9 w-full rounded-md border border-slate-200 px-3 text-sm focus:border-blue-500 outline-none transition-all" 
                                value={formData.start_date} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-600">Tgl Jatuh Tempo</label>
                            <input type="number" min="1" max="31" name="due_date" required className="flex h-9 w-full rounded-md border border-slate-200 px-3 text-sm focus:border-blue-500 outline-none transition-all" 
                                value={formData.due_date} onChange={handleInputChange} />
                        </div>
                    </div>
                </div>

              </CardContent>

              <CardFooter className="flex justify-end gap-3 border-t border-slate-100 pt-4 pb-4 px-6 bg-slate-50/50 rounded-b-lg">
                <Button type="button" variant="ghost" className="text-slate-500 hover:text-slate-700" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm px-6">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                    Proses Check-in
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}