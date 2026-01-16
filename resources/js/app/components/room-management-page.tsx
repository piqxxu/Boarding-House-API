import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { Room } from '@/app/types';
import { mockRooms } from '@/app/data/mock-data';
import { ConfirmDialog } from '@/app/components/confirm-dialog';

export function RoomManagementPage() {
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    roomNumber: '',
    type: '',
    capacity: '',
    rate: '',
    status: 'Available' as Room['status'],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAdd = () => {
    setEditingRoom(null);
    setFormData({
      roomNumber: '',
      type: '',
      capacity: '',
      rate: '',
      status: 'Available',
    });
    setErrors({});
    setIsAddEditOpen(true);
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      type: room.type,
      capacity: room.capacity.toString(),
      rate: room.rate.toString(),
      status: room.status,
    });
    setErrors({});
    setIsAddEditOpen(true);
  };

  const handleDelete = (room: Room) => {
    setDeletingRoom(room);
    setIsDeleteOpen(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.roomNumber.trim()) {
      newErrors.roomNumber = 'Nomor kamar wajib diisi';
    }
    if (!formData.type.trim()) {
      newErrors.type = 'Tipe kamar wajib diisi';
    }
    if (!formData.capacity || parseInt(formData.capacity) < 1) {
      newErrors.capacity = 'Kapasitas yang valid wajib diisi';
    }
    if (!formData.rate || parseFloat(formData.rate) < 0) {
      newErrors.rate = 'Tarif yang valid wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const roomData: Room = {
      id: editingRoom?.id || Date.now().toString(),
      roomNumber: formData.roomNumber,
      type: formData.type,
      capacity: parseInt(formData.capacity),
      rate: parseFloat(formData.rate),
      status: formData.status,
    };

    if (editingRoom) {
      setRooms(rooms.map((r) => (r.id === editingRoom.id ? roomData : r)));
    } else {
      setRooms([...rooms, roomData]);
    }

    setIsAddEditOpen(false);
  };

  const confirmDelete = () => {
    if (deletingRoom) {
      setRooms(rooms.filter((r) => r.id !== deletingRoom.id));
      setIsDeleteOpen(false);
      setDeletingRoom(null);
    }
  };

  const getStatusColor = (status: Room['status']) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'Occupied':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
      default:
        return '';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl mb-1">Manajemen Kamar</h1>
          <p className="text-sm text-muted-foreground">Kelola kamar rumah kos</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Kamar
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nomor Kamar</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Kapasitas</TableHead>
              <TableHead>Tarif (₱/bulan)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <AlertCircle className="h-8 w-8" />
                    <p>Tidak ada kamar ditemukan</p>
                    <Button variant="outline" onClick={handleAdd} className="mt-2">
                      Tambah kamar pertama Anda
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell>{room.roomNumber}</TableCell>
                  <TableCell>{room.type}</TableCell>
                  <TableCell>{room.capacity}</TableCell>
                  <TableCell>₱{room.rate.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(room.status)}>
                      {room.status === 'Available' ? 'Tersedia' : room.status === 'Occupied' ? 'Terisi' : 'Maintenance'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(room)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(room)}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRoom ? 'Edit Kamar' : 'Tambah Kamar Baru'}</DialogTitle>
            <DialogDescription>
              {editingRoom ? 'Perbarui informasi kamar' : 'Masukkan detail untuk kamar baru'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
              <Label htmlFor="type">Tipe Kamar</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="contoh: Single, Double, Triple"
                className={errors.type ? 'border-destructive' : ''}
              />
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Kapasitas</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="contoh: 2"
                className={errors.capacity ? 'border-destructive' : ''}
              />
              {errors.capacity && (
                <p className="text-sm text-destructive">{errors.capacity}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Tarif (₱/bulan)</Label>
              <Input
                id="rate"
                type="number"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                placeholder="contoh: 5000"
                className={errors.rate ? 'border-destructive' : ''}
              />
              {errors.rate && (
                <p className="text-sm text-destructive">{errors.rate}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as Room['status'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Tersedia</SelectItem>
                  <SelectItem value="Occupied">Terisi</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEditOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave}>
              {editingRoom ? 'Perbarui' : 'Tambah'} Kamar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        title="Hapus Kamar"
        description={`Apakah Anda yakin ingin menghapus kamar ${deletingRoom?.roomNumber}? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}