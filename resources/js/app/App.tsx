import { useState } from 'react';
// Pake titik (.) artinya: "Cari di folder sebelah saya"
import { LoginPage } from "./components/login-page"; 
import { Sidebar } from "./components/Sidebar";
import { Topbar } from './components/topbar';
import { DashboardPage } from './components/dashboard-page';
import { RoomManagementPage } from './components/room-management-page';
import { TenantManagementPage } from './components/tenant-management-page';
import { PaymentManagementPage } from './components/payment-management-page';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('dashboard');
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'rooms':
        return <RoomManagementPage />;
      case 'tenants':
        return <TenantManagementPage />;
      case 'payments':
        return <PaymentManagementPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 flex flex-col">
        <Topbar onLogout={handleLogout} />
        <main className="flex-1">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
