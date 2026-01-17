import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { Loader2, Building2, AlertCircle, Eye, EyeOff } from "lucide-react"; // Tambah Icon Eye

interface LoginPageProps {
  onLoginSuccess: (token: string) => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // State buat toggle intip password
  const [showPassword, setShowPassword] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const token = data.data.token; 
        onLoginSuccess(token); 
      } else {
        setError(data.message || "Email atau password salah!");
      }
    } catch (err) {
      setError("Gagal koneksi ke server. Pastikan backend Laravel nyala!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md shadow-lg border-0 sm:border">
        
        {/* HEADER */}
        <CardHeader className="space-y-1 flex flex-col items-center justify-center pb-6">
          <div className="bg-primary/10 p-3 rounded-full bg-gray-100 mb-2">
            <Building2 className="h-8 w-8 text-black" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-center">
            BoardingHub
          </CardTitle>
          <CardDescription className="text-center text-gray-500">
            Masuk untuk mengelola manajemen kos
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="grid gap-6">
            
            {/* ALERT ERROR */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {/* INPUT EMAIL */}
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium leading-none">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="admin@kost.com"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* INPUT PASSWORD DENGAN TOMBOL MATA */}
            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-medium leading-none">
                Password
              </label>
              
              <div className="relative"> {/* Container Relative biar icon bisa absolute */}
                <input
                  id="password"
                  // Logika Toggle: Kalau showPassword true jadi text, kalau false jadi password
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                
                {/* Tombol Mata */}
                <button
                  type="button" // PENTING: type button biar gak submit form pas diklik
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" /> // Ikon mata dicoret (Hide)
                  ) : (
                    <Eye className="h-5 w-5" /> // Ikon mata melek (Show)
                  )}
                </button>
              </div>
            </div>

          </CardContent>

          {/* FOOTER BUTTON */}
          <CardFooter className="pt-2">
            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium bg-black text-white hover:bg-gray-800 h-11 px-4 py-2 transition-colors disabled:opacity-50 shadow-sm"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? "Memproses..." : "Masuk ke Dashboard"}
            </button>
          </CardFooter>
        </form>
      </Card>

      <div className="absolute bottom-4 text-xs text-gray-400">
        &copy; 2026 BoardingHub Management System
      </div>
    </div>
  );
}