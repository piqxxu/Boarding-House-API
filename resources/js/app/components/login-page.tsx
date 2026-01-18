import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Loader2, Building2, Eye, EyeOff, Lock, Mail } from "lucide-react";

interface LoginPageProps {
  onLoginSuccess: (token: string) => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState(""); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json" 
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Cek mana yang ada isi tokennya
        const token = data.token || data.data?.token; 
        
        if (token) {
            console.log("Login Sukses! Token:", token); 
            onLoginSuccess(token);
        } else {
            setError("Token tidak ditemukan di response server.");
            console.error("Response aneh:", data);
        }
      } else {
        setError(data.message || "Login gagal. Periksa email/password.");
      }
    } catch (err) {
      setError("Gagal terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 font-sans relative">
      
      {/* BACKGROUND DECORATION */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/40 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[10%] -right-[5%] w-[30%] h-[30%] rounded-full bg-blue-50/60 blur-3xl"></div>
      </div>

      <div className="w-full max-w-md z-10 space-y-6">
        
        {/* LOGO & TITLE */}
        <div className="text-center space-y-3">
            <div className="flex items-center justify-center">
                <div className="h-14 w-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 ring-4 ring-white">
                    <Building2 className="h-7 w-7 text-white" />
                </div>
            </div>
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-800">BoardingHub</h1>
                <p className="text-slate-500 text-sm mt-1">Masuk untuk mengelola manajemen kos.</p>
            </div>
        </div>

        {/* LOGIN CARD */}
        <Card className="border-0 shadow-xl ring-1 ring-slate-200 bg-white/90 backdrop-blur-sm rounded-2xl">
          <CardHeader className="pb-0" />
          
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-5">
              
              {/* ERROR MESSAGE */}
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium flex items-center justify-center text-center animate-in fade-in slide-in-from-top-2">
                    {error}
                </div>
              )}

              {/* EMAIL INPUT */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[11px] font-bold uppercase text-slate-500 tracking-wider ml-1">Email / Username</Label>
                <div className="relative group">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                        id="email"
                        type="email"
                        placeholder="Masukkan username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 h-11 bg-white border-slate-200 text-slate-700 placeholder:text-slate-300 placeholder:font-light focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all rounded-xl"
                    />
                </div>
              </div>

              {/* PASSWORD INPUT */}
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                    <Label htmlFor="password" className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Password</Label>
                </div>
                <div className="relative group">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Masukkan password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10 pr-10 h-11 bg-white border-slate-200 text-slate-700 placeholder:text-slate-300 placeholder:font-light focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all rounded-xl"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-300 hover:text-slate-600 transition-colors focus:outline-none"
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all duration-200 mt-2"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Masuk ke Dashboard"}
              </Button>

            </form>
          </CardContent>
          <CardFooter className="justify-center pb-8 pt-2">
            <p className="text-xs text-slate-400 font-medium">
                Lupa password? <span className="text-blue-600 hover:text-blue-700 hover:underline cursor-pointer transition-colors">Hubungi Developer</span>
            </p>
          </CardFooter>
        </Card>

        {/* FOOTER */}
        <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium opacity-60 hover:opacity-100 transition-opacity">
                © 2026 BoardingHub System
            </p>
        </div>

      </div>
    </div>
  );
}