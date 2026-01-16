import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Search, Filter, AlertCircle } from 'lucide-react';
import { Payment } from '@/app/types';
import { mockPayments } from '@/app/data/mock-data';

export function PaymentManagementPage() {
  const [payments] = useState<Payment[]>(mockPayments);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const paidAmount = filteredPayments
    .filter((p) => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = filteredPayments
    .filter((p) => p.status === 'Pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
      case 'Overdue':
        return 'bg-red-100 text-red-700 hover:bg-red-100';
      default:
        return '';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl mb-1">Manajemen Pembayaran</h1>
        <p className="text-sm text-muted-foreground">Lacak dan kelola pembayaran sewa</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-muted-foreground mb-1">Total Jumlah</p>
          <p className="text-2xl">₱{totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-700 mb-1">Lunas</p>
          <p className="text-2xl text-green-700">₱{paidAmount.toLocaleString()}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700 mb-1">Pending</p>
          <p className="text-2xl text-yellow-700">₱{pendingAmount.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari berdasarkan nama penyewa atau nomor kamar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter berdasarkan status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="Paid">Lunas</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Overdue">Terlambat</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Penyewa</TableHead>
              <TableHead>Kamar</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Jatuh Tempo</TableHead>
              <TableHead>Tanggal Bayar</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <AlertCircle className="h-8 w-8" />
                    <p>Tidak ada pembayaran ditemukan</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.tenantName}</TableCell>
                  <TableCell>{payment.roomNumber}</TableCell>
                  <TableCell>₱{payment.amount.toLocaleString()}</TableCell>
                  <TableCell>{new Date(payment.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {payment.paidDate
                      ? new Date(payment.paidDate).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(payment.status)}>
                      {payment.status === 'Paid' ? 'Lunas' : payment.status === 'Pending' ? 'Pending' : 'Terlambat'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}