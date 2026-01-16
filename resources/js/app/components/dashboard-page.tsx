import { useEffect, useState } from 'react'; // Tambah useEffect & useState
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Home, Users, DollarSign, TrendingUp, Loader2 } from 'lucide-react';

export function DashboardPage() {
  // 1. Siapkan State buat nampung data dari Laravel
  const [stats, setStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    totalTenants: 0,
    monthlyRevenue: 0
  });
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Ambil data pas halaman dibuka
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('auth_token'); // Ambil token login
        const response = await fetch('http://127.0.0.1:8000/api/dashboard-stats', {
          headers: {
            'Authorization': `Bearer ${token}`, 
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
          setRecentPayments(data.recentPayments);
        }
      } catch (error) {
        console.error("Gagal ambil data dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Hitung Occupancy Rate 
  const occupancyRate = stats.totalRooms > 0 
    ? ((stats.occupiedRooms / stats.totalRooms) * 100).toFixed(0) 
    : 0;

  const statCards = [
    {
      title: 'Total Kamar',
      value: stats.totalRooms,
      icon: Home,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Kamar Terisi',
      value: stats.occupiedRooms,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Penyewa',
      value: stats.totalTenants,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Pendapatan Bulanan',
      // Format ke Rupiah
      value: `Rp ${stats.monthlyRevenue.toLocaleString('id-ID')}`, 
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Memuat data kost...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl mb-1 font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Ringkasan rumah kos Anda</p>
      </div>

      {/* Cards Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabel Pembayaran */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pembayaran Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Penyewa</TableHead>
                  <TableHead>Kamar</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Jatuh Tempo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      Belum ada data pembayaran
                    </TableCell>
                  </TableRow>
                ) : (
                  recentPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.tenantName}</TableCell>
                      <TableCell>{payment.roomNumber}</TableCell>
                      <TableCell>Rp {Number(payment.amount).toLocaleString('id-ID')}</TableCell>
                      <TableCell>{payment.dueDate}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.status === 'Paid' ? 'default' : 
                            payment.status === 'Pending' ? 'secondary' : 'destructive'
                          }
                          className={
                            payment.status === 'Paid' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 
                            payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' : ''
                          }
                        >
                          {payment.status === 'Paid' ? 'Lunas' : 
                           payment.status === 'Pending' ? 'Pending' : 'Terlambat'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Statistik Cepat */}
        <Card>
          <CardHeader>
            <CardTitle>Statistik Cepat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Tingkat Hunian</span>
                <span className="text-sm font-medium">{occupancyRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${occupancyRate}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Kamar Tersedia</span>
                <span className="text-sm font-bold">{stats.totalRooms - stats.occupiedRooms}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Penyewa Aktif</span>
                <span className="text-sm font-bold">{stats.totalTenants}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">Pendapatan</span>
                </div>
                <span className="text-sm text-green-700 font-bold">+12%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}