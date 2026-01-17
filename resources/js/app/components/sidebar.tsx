import { LayoutDashboard, BedDouble, Users, Wallet } from "lucide-react";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  width: number;
  onStartResize: () => void;
}

export function Sidebar({ currentPage, onNavigate, width, onStartResize }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "rooms", label: "Manajemen Kamar", icon: BedDouble },
    { id: "tenants", label: "Manajemen Penyewa", icon: Users },
    { id: "payments", label: "Manajemen Pembayaran", icon: Wallet },
  ];

  return (
    <aside 
        className="fixed left-0 top-0 z-40 h-screen bg-white shadow-sm font-sans flex flex-col border-r border-slate-100 group/sidebar"
        style={{ width: `${width}px` }} 
    >
      {/* 1. LOGO AREA */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-50 px-6 overflow-hidden whitespace-nowrap">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-100">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
             <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
             <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
           </svg>
        </div>
        <span className={`text-lg font-bold tracking-tight text-slate-800 transition-opacity duration-200 ${width < 180 ? 'opacity-0' : 'opacity-100'}`}>
            BoardingHub
        </span>
      </div>

      {/* 2. MENU ITEMS */}
      <div className="flex-1 flex flex-col gap-1.5 p-4 mt-2 overflow-y-auto overflow-x-hidden">
        {width > 180 && (
            <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap truncate">
                Menu Utama
            </div>
        )}
        
        {menuItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 overflow-hidden
                ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                    : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
                }`}
                title={item.label}
            >
              <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600"}`} />
              <span className={`transition-opacity duration-200 truncate ${width < 180 ? 'opacity-0 w-0' : 'opacity-100'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t border-slate-50 shrink-0 overflow-hidden">
        {width > 180 ? (
            <a 
                href="https://wa.me/6281234567890" 
                target="_blank" rel="noopener noreferrer"
                className="block rounded-xl bg-slate-50 p-4 border border-slate-100 text-center hover:bg-green-50 hover:border-green-100 transition-colors cursor-pointer group overflow-hidden"
            >
                <p className="text-xs font-semibold text-slate-600 group-hover:text-green-700 whitespace-nowrap truncate">
                    Butuh Bantuan?
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 whitespace-nowrap truncate group-hover:text-green-600">
                    Hubungi developer
                </p>
            </a>
        ) : (
            <div className="flex justify-center text-slate-300 text-[10px] cursor-default">v1.0</div>
        )}
      </div>

      {/* DRAG HANDLE */}
      <div
        onMouseDown={(e) => { e.preventDefault(); onStartResize(); }}
        className="absolute right-0 top-0 h-full w-[2px] cursor-col-resize hover:bg-blue-400/30 active:bg-blue-500 transition-colors z-50"
      />
    </aside>
  );
}