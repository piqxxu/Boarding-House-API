import { Room, Tenant, Payment, DashboardStats } from '@/app/types';

export const mockRooms: Room[] = [
  { id: '1', roomNumber: '101', type: 'Single', capacity: 1, rate: 5000, status: 'Occupied' },
  { id: '2', roomNumber: '102', type: 'Single', capacity: 1, rate: 5000, status: 'Available' },
  { id: '3', roomNumber: '103', type: 'Double', capacity: 2, rate: 8000, status: 'Occupied' },
  { id: '4', roomNumber: '104', type: 'Double', capacity: 2, rate: 8000, status: 'Available' },
  { id: '5', roomNumber: '201', type: 'Single', capacity: 1, rate: 5500, status: 'Occupied' },
  { id: '6', roomNumber: '202', type: 'Triple', capacity: 3, rate: 12000, status: 'Maintenance' },
  { id: '7', roomNumber: '203', type: 'Double', capacity: 2, rate: 8500, status: 'Available' },
  { id: '8', roomNumber: '204', type: 'Single', capacity: 1, rate: 5500, status: 'Occupied' },
];

export const mockTenants: Tenant[] = [
  { id: '1', name: 'John Smith', email: 'john.smith@email.com', phone: '555-0101', roomNumber: '101', moveInDate: '2024-01-15', status: 'Active' },
  { id: '2', name: 'Emma Johnson', email: 'emma.j@email.com', phone: '555-0102', roomNumber: '103', moveInDate: '2024-02-01', status: 'Active' },
  { id: '3', name: 'Michael Brown', email: 'michael.b@email.com', phone: '555-0103', roomNumber: '201', moveInDate: '2024-01-20', status: 'Active' },
  { id: '4', name: 'Sarah Davis', email: 'sarah.d@email.com', phone: '555-0104', roomNumber: '204', moveInDate: '2024-03-05', status: 'Active' },
  { id: '5', name: 'James Wilson', email: 'james.w@email.com', phone: '555-0105', roomNumber: '103', moveInDate: '2024-02-01', status: 'Active' },
];

export const mockPayments: Payment[] = [
  { id: '1', tenantName: 'John Smith', roomNumber: '101', amount: 5000, dueDate: '2026-01-01', paidDate: '2025-12-28', status: 'Paid' },
  { id: '2', tenantName: 'Emma Johnson', roomNumber: '103', amount: 8000, dueDate: '2026-01-01', paidDate: '2025-12-30', status: 'Paid' },
  { id: '3', tenantName: 'Michael Brown', roomNumber: '201', amount: 5500, dueDate: '2026-01-01', status: 'Pending' },
  { id: '4', tenantName: 'Sarah Davis', roomNumber: '204', amount: 5500, dueDate: '2026-01-01', paidDate: '2026-01-02', status: 'Paid' },
  { id: '5', tenantName: 'James Wilson', roomNumber: '103', amount: 8000, dueDate: '2026-01-01', status: 'Pending' },
  { id: '6', tenantName: 'John Smith', roomNumber: '101', amount: 5000, dueDate: '2025-12-01', paidDate: '2025-11-28', status: 'Paid' },
  { id: '7', tenantName: 'Emma Johnson', roomNumber: '103', amount: 8000, dueDate: '2025-12-01', paidDate: '2025-11-30', status: 'Paid' },
];

export const mockDashboardStats: DashboardStats = {
  totalRooms: 8,
  occupiedRooms: 4,
  totalTenants: 5,
  monthlyRevenue: 32000,
};
