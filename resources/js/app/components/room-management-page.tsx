import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Loader2, Plus, RefreshCcw, Trash2, Pencil, X, Search } from "lucide-react";

interface Room {
  id: number;
  room_number: string;
  price: number;
  status: 'available' | 'occupied' | 'maintenance';
  floor: number;
  facilities: string;
}

export function RoomManagementPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // STATE MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // STATE EDIT
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    room_number: "",
    price: "", 
    floor: "",
    status: "available",
    facilities: "",
  });

  // --- HELPER FORMAT RUPIAH ---
  const formatRupiah = (value: string | number) => {
    if (!value) return "";
    const rawValue = value.toString().replace(/\D/g, ""); 
    return new Intl.NumberFormat("id-ID").format(Number(rawValue));
  };

  const parseRupiah = (formattedValue: string) => {
    return formattedValue.replace(/\./g, ""); 
  };

  // --- 1. GET DATA ---
  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("http://127.0.0.1:8000/api/rooms", {
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) setRooms(data.data);
    } catch (err) { console.error("Error fetching rooms"); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchRooms(); }, []);

  // --- HANDLE INPUT ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (room: Room) => {
    setEditingId(room.id);
    setFormData({
      room_number: room.room_number,
      price: formatRupiah(room.price), 
      floor: room.floor.toString(),
      status: room.status,
      facilities: room.facilities || "",
    });
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({ room_number: "", price: "", floor: "", status: "available", facilities: "" });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const cleanPrice = Number(parseRupiah(formData.price));

    try {
      const token = localStorage.getItem("auth_token");
      const url = editingId 
        ? `http://127.0.0.1:8000/api/rooms/${editingId}`
        : "http://127.0.0.1:8000/api/rooms";  
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, price: cleanPrice }),
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchRooms(); 
        alert(editingId ? "Kamar berhasil diupdate!" : "Kamar berhasil ditambahkan!");
      } else {
        alert("Gagal menyimpan data.");
      }
    } catch (err) { alert("Error koneksi."); } 
    finally { setIsSubmitting(false); }
  };

  const handleDeleteClick = async (id: number) => {
    if (!window.confirm("Yakin hapus kamar ini?")) return;
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`http://127.0.0.1:8000/api/rooms/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (response.ok) fetchRooms();
    } catch (err) { alert("Error koneksi."); }
  };

  return (
    <div className="space-y-6 relative font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Manajemen Kamar</h2>
          <p className="text-muted-foreground text-sm">Daftar seluruh kamar dan status ketersediaan.</p>
        </div>
        <div className="flex gap-2">
            <Button onClick={fetchRooms} variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-50">
                <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button onClick={handleAddClick} className="bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-100">
                <Plus className="mr-2 h-4 w-4" /> Tambah Kamar
            </Button>
        </div>
      </div>

      {/* CARD UTAMA (TABLE) */}
      <Card className="border border-slate-100 shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-50 bg-slate-50/30 px-6 py-4">
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-base font-semibold text-slate-800">Daftar Unit</CardTitle>
                    <CardDescription className="text-slate-400 text-xs">Total {rooms.length} kamar terdaftar</CardDescription>
                </div>
                {/* Search Dummy (Visual aja) */}
                <div className="relative w-48 hidden sm:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-300" />
                    <input 
                        placeholder="Cari kamar..." 
                        className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 text-xs outline-none focus:border-blue-400 transition-all placeholder:text-slate-300"
                    />
                </div>
            </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-500" /></div>
          ) : (
            <Table>
              <TableHeader className="bg-white">
                <TableRow className="border-b border-slate-100 hover:bg-transparent">
                  <TableHead className="w-[100px] font-semibold text-slate-500">No. Kamar</TableHead>
                  <TableHead className="font-semibold text-slate-500">Lantai</TableHead>
                  <TableHead className="font-semibold text-slate-500">Harga</TableHead>
                  <TableHead className="font-semibold text-slate-500">Status</TableHead>
                  <TableHead className="font-semibold text-slate-500 hidden md:table-cell">Fasilitas</TableHead>
                  <TableHead className="text-right font-semibold text-slate-500">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow key={room.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium text-slate-700">{room.room_number}</TableCell>
                    <TableCell className="text-slate-600">{room.floor}</TableCell>
                    <TableCell className="text-slate-700 font-medium">Rp {Number(room.price).toLocaleString('id-ID')}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`border-0 px-2 py-0.5 text-xs font-medium ${
                        room.status === 'available' ? 'bg-emerald-50 text-emerald-600' :
                        room.status === 'occupied' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {room.status === 'available' ? 'Available' : room.status === 'occupied' ? 'Occupied' : 'Maintenance'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-400 truncate max-w-[150px] hidden md:table-cell">
                        {room.facilities}
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => handleEditClick(room)}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleDeleteClick(room.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* MODAL / POPUP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-[2px] p-4 animate-in fade-in zoom-in duration-200">
          <Card className="w-full max-w-lg shadow-xl border-0 ring-1 ring-slate-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4 bg-white rounded-t-lg">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-800">{editingId ? "Edit Kamar" : "Tambah Kamar Baru"}</CardTitle>
                <CardDescription className="text-slate-400 text-xs">Isi detail informasi kamar di bawah ini.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-full" onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5 pt-6 bg-white">
                
                <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Nomor Kamar</label>
                        <input 
                            name="room_number" required placeholder="Cth: A-101"
                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm placeholder:text-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            value={formData.room_number} onChange={handleInputChange}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Lantai</label>
                        <input 
                            name="floor" type="number" required placeholder="1"
                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm placeholder:text-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            value={formData.floor} onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Harga per Bulan (Rp)</label>
                    <div className="relative">
                        <input 
                            name="price" type="text" required placeholder="1.500.000"
                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm placeholder:text-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            value={formData.price} 
                            onChange={(e) => {
                                const formatted = formatRupiah(e.target.value);
                                setFormData({...formData, price: formatted});
                            }}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Status</label>
                    <select 
                        name="status" 
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none"
                        value={formData.status} onChange={handleInputChange}
                    >
                        <option value="available">Tersedia (Available)</option>
                        <option value="occupied">Terisi (Occupied)</option>
                        <option value="maintenance">Perbaikan (Maintenance)</option>
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Fasilitas</label>
                    <textarea 
                        name="facilities" placeholder="Cth: AC, WiFi, KM Dalam..."
                        className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all min-h-[80px]"
                        value={formData.facilities} onChange={handleInputChange}
                    />
                </div>
              </CardContent>

              <CardFooter className="flex justify-end gap-3 border-t border-slate-100 pt-4 pb-4 px-6 bg-slate-50/50 rounded-b-lg">
                <Button type="button" variant="ghost" className="text-slate-500 hover:text-slate-700 hover:bg-slate-100" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm px-6">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : editingId ? "Update" : "Simpan"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
}