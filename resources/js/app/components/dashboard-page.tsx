import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Home, Users, DollarSign, TrendingUp, Loader2, BellRing, CalendarClock } from 'lucide-react';

// Tipe Data
interface Reminder {
  id: number;
  name: string;
  room: string;
  dueDate: string;
  daysLeft: number;
  statusText: string;
}

interface DashboardStats {
  stats: {
    totalRooms: number;
    occupiedRooms: number;
    totalTenants: number;
    monthlyRevenue: number;
  };
  reminders: Reminder[]; 
  recentPayments: any[];
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch('http://127.0.0.1:8000/api/dashboard-stats', {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error("Gagal load dashboard", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;
  if (!data) return <div>Gagal memuat data.</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      
      {/* 1. JUDUL */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Dashboard</h2>
        <p className="text-slate-500 text-sm">Ringkasan performa dan tagihan kosan.</p>
      </div>

      {/* 2. AREA REMINDER (Hanya Muncul kalau ada data) */}
      {data.reminders.length > 0 && (
        <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
                <div className="bg-orange-100 p-1.5 rounded-full">
                    <BellRing className="h-4 w-4 text-orange-600 animate-pulse" />
                </div>
                <h3 className="font-semibold text-orange-800 text-sm">Perlu Ditagih (H-7 Jatuh Tempo)</h3>
            </div>
            
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.reminders.map((item) => (
                    <div key={item.id} className="bg-white p-3 rounded-lg shadow-sm border border-orange-100/50 flex justify-between items-center">
                        <div>
                            <div className="font-medium text-slate-800 text-sm">{item.name}</div>
                            <div className="text-xs text-slate-400">Kamar {item.room}</div>
                        </div>
                        <div className="text-right">
                            <Badge className={`text-[10px] px-2 py-0.5 border-0 ${item.daysLeft < 0 ? "bg-rose-100 text-rose-600" : "bg-orange-100 text-orange-600"}`}>
                                {item.statusText}
                            </Badge>
                            <div className="text-[10px] text-slate-400 mt-1">{item.dueDate}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* 3. KARTU STATISTIK (CLEAN DESIGN) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        {/* TOTAL KAMAR */}
        <Card className="border border-slate-100 shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Kamar</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Home className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{data.stats.totalRooms}</div>
            <p className="text-xs text-slate-400 mt-1">Unit terdaftar</p>
          </CardContent>
        </Card>

        {/* KAMAR TERISI */}
        <Card className="border border-slate-100 shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wider">Kamar Terisi</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Users className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{data.stats.occupiedRooms}</div>
            {/* Progress Bar Tipis */}
            <div className="w-full bg-slate-50 h-1 rounded-full mt-2 overflow-hidden">
                <div 
                    className="bg-emerald-500 h-full rounded-full" 
                    style={{ width: `${(data.stats.occupiedRooms / data.stats.totalRooms) * 100}%` }}
                ></div>
            </div>
          </CardContent>
        </Card>

        {/* TOTAL PENYEWA */}
        <Card className="border border-slate-100 shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Penyewa</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{data.stats.totalTenants}</div>
            <p className="text-xs text-slate-400 mt-1">Orang aktif</p>
          </CardContent>
        </Card>

        {/* PENDAPATAN */}
        <Card className="border border-slate-100 shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pendapatan</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-emerald-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">
                Rp {(data.stats.monthlyRevenue / 1000).toLocaleString('id-ID')}k
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" /> +12% Bulan ini
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 4. TABEL TRANSAKSI TERBARU & SIDEBAR KANAN */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* TABEL */}
        <Card className="col-span-4 border border-slate-100 shadow-sm bg-white">
          <CardHeader className="border-b border-slate-50 px-6 py-4">
            <CardTitle className="text-base font-semibold text-slate-800">Pembayaran Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-slate-100 hover:bg-transparent">
                        <TableHead className="text-xs font-semibold text-slate-500 uppercase w-[30%] pl-6">Penyewa</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 uppercase">Kamar</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 uppercase">Jumlah</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 uppercase text-right pr-6">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.recentPayments.length === 0 ? (
                        <TableRow><TableCell colSpan={4} className="text-center text-slate-400 py-8">Belum ada transaksi</TableCell></TableRow>
                    ) : (
                        data.recentPayments.map((pay: any) => (
                            <TableRow key={pay.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                <TableCell className="font-medium text-slate-700 pl-6 py-4">{pay.tenantName}</TableCell>
                                <TableCell className="text-slate-500 text-xs">{pay.roomNumber}</TableCell>
                                <TableCell className="text-slate-700 font-medium">Rp {Number(pay.amount).toLocaleString('id-ID')}</TableCell>
                                <TableCell className="text-right pr-6">
                                    <Badge variant="outline" className={`border-0 px-2 py-0.5 text-[10px] ${
                                        pay.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                    }`}>
                                        {pay.status === 'Paid' ? 'Lunas' : pay.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* STATISTIK CEPAT (SIDEBAR KANAN) */}
        <Card className="col-span-3 border border-slate-100 shadow-sm bg-white h-fit">
            <CardHeader className="border-b border-slate-50 px-6 py-4">
                <CardTitle className="text-base font-semibold text-slate-800">Statistik Cepat</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Tingkat Hunian</span>
                            <span className="font-bold text-slate-800">{data.stats.totalRooms > 0 ? Math.round((data.stats.occupiedRooms / data.stats.totalRooms) * 100) : 0}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-slate-800 rounded-full transition-all duration-1000" 
                                style={{ width: `${data.stats.totalRooms > 0 ? (data.stats.occupiedRooms / data.stats.totalRooms) * 100 : 0}%` }}
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-50 space-y-3">
                         <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Kamar Tersedia</span>
                            <span className="font-bold text-slate-800">{data.stats.totalRooms - data.stats.occupiedRooms}</span>
                         </div>
                         <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Penyewa Aktif</span>
                            <span className="font-bold text-slate-800">{data.stats.totalTenants}</span>
                         </div>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}