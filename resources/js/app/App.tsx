import { useState, useEffect } from 'react';
import { LoginPage } from "./components/login-page"; 
import { Sidebar } from "./components/sidebar"; 
import { Topbar } from './components/topbar';
import { DashboardPage } from './components/dashboard-page';
import { RoomManagementPage } from './components/room-management-page';
import { TenantManagementPage } from './components/tenant-management-page';
import { PaymentManagementPage } from './components/payment-management-page';

export default function App() {
  const [token, setToken] = useState<string | null>(sessionStorage.getItem('auth_token'));
  
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarWidth, setSidebarWidth] = useState(256); 
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      let newWidth = e.clientX;
      if (newWidth < 200) newWidth = 200; 
      if (newWidth > 500) newWidth = 500; 
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default'; 
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize'; 
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);


  const handleLoginSuccess = (newToken: string) => {
    // --- UBAH 2: Simpan ke sessionStorage ---
    sessionStorage.setItem('auth_token', newToken);
    setToken(newToken);
    // Kita gak perlu reload window kalau state udah update, tapi kalau mau reload gapapa
    // window.location.reload(); <--- Hapus aja biar smooth, atau biarin kalau mau refresh
  };

  const handleLogout = () => {
    // --- UBAH 3: Hapus dari sessionStorage ---
    sessionStorage.removeItem('auth_token');
    setToken(null);
    setCurrentPage('dashboard');
  };

  if (!token) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'rooms': return <RoomManagementPage />;
      case 'tenants': return <TenantManagementPage />;
      case 'payments': return <PaymentManagementPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        width={sidebarWidth}
        onStartResize={() => setIsResizing(true)}
      />
      
      <div 
        className="flex-1 flex flex-col transition-none" 
        style={{ paddingLeft: `${sidebarWidth}px` }}
      >
        <Topbar onLogout={handleLogout} />
        
        <main className="flex-1 p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}