import { useState, useEffect, useRef } from 'react';
import { LoginPage } from "./components/login-page"; 
import { Sidebar } from "./components/Sidebar"; // Pastikan nama file/folder sesuai (Sidebar vs sidebar)
import { Topbar } from './components/topbar';
import { DashboardPage } from './components/dashboard-page';
import { RoomManagementPage } from './components/room-management-page';
import { TenantManagementPage } from './components/tenant-management-page';
import { PaymentManagementPage } from './components/payment-management-page';

export default function App() {
  // --- 1. STATE AUTHENTICATION ---
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  
  // --- 2. STATE NAVIGASI ---
  const [currentPage, setCurrentPage] = useState('dashboard');

  // --- 3. STATE RESIZABLE SIDEBAR (BARU) ---
  const [sidebarWidth, setSidebarWidth] = useState(256); // Default 256px (setara w-64)
  const [isResizing, setIsResizing] = useState(false);

  // --- LOGIC RESIZING SIDEBAR ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      // Hitung lebar baru berdasarkan posisi mouse X
      let newWidth = e.clientX;
      
      // Batasi biar gak terlalu kecil atau kegedean
      if (newWidth < 200) newWidth = 200; // Minimal
      if (newWidth > 500) newWidth = 500; // Maksimal
      
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default'; // Balikin kursor normal
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize'; // Ubah kursor jadi ikon geser
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);


  // --- LOGIC LOGIN / LOGOUT ---
  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem('auth_token', newToken);
    setToken(newToken);
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setCurrentPage('dashboard');
  };

  // Render Login Page kalau Token gak ada
  if (!token) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Logic pindah halaman 
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
      {/* SIDEBAR:
        - Kita kirim props 'width' biar dia tau ukurannya.
        - Kita kirim 'onStartResize' biar dia bisa ngabarin kalau lagi ditarik.
      */}
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        width={sidebarWidth}
        onStartResize={() => setIsResizing(true)}
      />
      
      {/* KONTEN UTAMA:
        - style paddingLeft diset DINAMIS sesuai sidebarWidth.
        - Ini kuncinya biar konten "minggir" pas sidebar digedein.
        - class 'transition-none' penting biar gesernya realtime & smooth tanpa lag animasi.
      */}
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