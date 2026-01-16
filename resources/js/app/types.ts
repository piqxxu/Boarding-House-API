export interface Room {
  id: string;
  roomNumber: string;
  type: string;
  capacity: number;
  rate: number;
  status: 'Available' | 'Occupied' | 'Maintenance';
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  roomNumber: string;
  moveInDate: string;
  status: 'Active' | 'Inactive';
}

export interface Payment {
  id: string;
  tenantName: string;
  roomNumber: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'Paid' | 'Pending' | 'Overdue';
}

export interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  totalTenants: number;
  monthlyRevenue: number;
}
