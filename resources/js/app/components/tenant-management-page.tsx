import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { Tenant } from '@/app/types';
import { mockTenants } from '@/app/data/mock-data';
import { ConfirmDialog } from '@/app/components/confirm-dialog';

export function TenantManagementPage() {
  const [tenants, setTenants] = useState<Tenant[]>(mockTenants);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    roomNumber: '',
    moveInDate: '',
    status: 'Active' as Tenant['status'],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAdd = () => {
    setEditingTenant(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      roomNumber: '',
      moveInDate: '',
      status: 'Active',
    });
    setErrors({});
    setIsAddEditOpen(true);
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      roomNumber: tenant.roomNumber,
      moveInDate: tenant.moveInDate,
      status: tenant.status,
    });
    setErrors({});
    setIsAddEditOpen(true);
  };

  const handleDelete = (tenant: Tenant) => {
    setDeletingTenant(tenant);
    setIsDeleteOpen(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama wajib diisi';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telepon wajib diisi';
    }
    if (!formData.roomNumber.trim()) {
      newErrors.roomNumber = 'Nomor kamar wajib diisi';
    }
    if (!formData.moveInDate) {
      newErrors.moveInDate = 'Tanggal masuk wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const tenantData: Tenant = {
      id: editingTenant?.id || Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      roomNumber: formData.roomNumber,
      moveInDate: formData.moveInDate,
      status: formData.status,
    };

    if (editingTenant) {
      setTenants(tenants.map((t) => (t.id === editingTenant.id ? tenantData : t)));
    } else {
      setTenants([...tenants, tenantData]);
    }

    setIsAddEditOpen(false);
  };

  const confirmDelete = () => {
    if (deletingTenant) {
      setTenants(tenants.filter((t) => t.id !== deletingTenant.id));
      setIsDeleteOpen(false);
      setDeletingTenant(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl mb-1">Manajemen Penyewa</h1>
          <p className="text-sm text-muted-foreground">Kelola penyewa rumah kos</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Penyewa
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telepon</TableHead>
              <TableHead>Kamar</TableHead>
              <TableHead>Tanggal Masuk</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <AlertCircle className="h-8 w-8" />
                    <p>Tidak ada penyewa ditemukan</p>
                    <Button variant="outline" onClick={handleAdd} className="mt-2">
                      Tambah penyewa pertama Anda
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>{tenant.name}</TableCell>
                  <TableCell>{tenant.email}</TableCell>
                  <TableCell>{tenant.phone}</TableCell>
                  <TableCell>{tenant.roomNumber}</TableCell>
                  <TableCell>{new Date(tenant.moveInDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        tenant.status === 'Active'
                          ? 'bg-green-100 text-green-700 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                      }
                    >
                      {tenant.status === 'Active' ? 'Aktif' : 'Tidak Aktif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(tenant)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(tenant)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAddEditOpen} onOpenChange={setIsAddEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTenant ? 'Edit Penyewa' : 'Tambah Penyewa Baru'}</DialogTitle>
            <DialogDescription>
              {editingTenant ? 'Perbarui informasi penyewa' : 'Masukkan detail untuk penyewa baru'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="contoh: John Smith"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contoh: john@email.com"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telepon</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="contoh: 555-0101"
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="roomNumber">Nomor Kamar</Label>
              <Input
                id="roomNumber"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                placeholder="contoh: 101"
                className={errors.roomNumber ? 'border-destructive' : ''}
              />
              {errors.roomNumber && (
                <p className="text-sm text-destructive">{errors.roomNumber}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="moveInDate">Tanggal Masuk</Label>
              <Input
                id="moveInDate"
                type="date"
                value={formData.moveInDate}
                onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                className={errors.moveInDate ? 'border-destructive' : ''}
              />
              {errors.moveInDate && (
                <p className="text-sm text-destructive">{errors.moveInDate}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as Tenant['status'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Aktif</SelectItem>
                  <SelectItem value="Inactive">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEditOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave}>
              {editingTenant ? 'Perbarui' : 'Tambah'} Penyewa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        title="Hapus Penyewa"
        description={`Apakah Anda yakin ingin menghapus ${deletingTenant?.name}? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}