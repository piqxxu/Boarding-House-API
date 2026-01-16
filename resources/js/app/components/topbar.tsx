import { Bell, LogOut, User } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface TopbarProps {
  onLogout: () => void;
}

export function Topbar({ onLogout }: TopbarProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl">Manajemen Rumah Kos</h2>
          <p className="text-sm text-muted-foreground">Selamat datang kembali, Admin</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-destructive rounded-full"></span>
          </Button>
          
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50">
            <div className="p-1.5 bg-primary rounded-full">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm">Admin</span>
          </div>
          
          <Button variant="ghost" size="icon" onClick={onLogout} title="Keluar">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}