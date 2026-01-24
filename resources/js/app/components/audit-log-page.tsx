import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Loader2, RefreshCcw, ShieldAlert, History } from "lucide-react";

interface Log {
  id: number;
  user_name: string;
  action: string;
  target: string;
  description: string;
  created_at: string;
}

export function AuditLogPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("auth_token");
      const res = await fetch("http://127.0.0.1:8000/api/audit-logs", {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
      });
      const data = await res.json();
      if (res.ok) setLogs(data.data);
    } catch (err) { console.error("Gagal load logs"); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, []);

  // Format tanggal biar enak dibaca
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Audit Logs</h2>
          <p className="text-slate-500 text-sm">Rekam jejak aktivitas sistem demi keamanan.</p>
        </div>
        <Button onClick={fetchLogs} variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-50">
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh Log
        </Button>
      </div>

      <Card className="border border-slate-100 shadow-sm bg-white">
        <CardHeader className="border-b border-slate-50 bg-slate-50/30 px-6 py-4 flex flex-row items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-slate-400" />
            <div>
                <CardTitle className="text-base font-semibold text-slate-800">Aktivitas Terakhir</CardTitle>
                <CardDescription className="text-slate-400 text-xs">Menampilkan 50 aktivitas terbaru.</CardDescription>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-500" /></div>
          ) : (
            <Table>
              <TableHeader className="bg-white">
                <TableRow className="border-b border-slate-100 hover:bg-transparent">
                  <TableHead className="w-[180px] font-semibold text-slate-500 text-xs uppercase pl-6">Waktu</TableHead>
                  <TableHead className="w-[150px] font-semibold text-slate-500 text-xs uppercase">Pelaku (Admin)</TableHead>
                  <TableHead className="w-[100px] font-semibold text-slate-500 text-xs uppercase">Aksi</TableHead>
                  <TableHead className="font-semibold text-slate-500 text-xs uppercase">Target</TableHead>
                  <TableHead className="font-semibold text-slate-500 text-xs uppercase pr-6">Deskripsi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-400">Belum ada aktivitas terekam.</TableCell></TableRow>
                ) : logs.map((log) => (
                  <TableRow key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <TableCell className="text-xs text-slate-500 pl-6 flex items-center gap-2 py-4">
                        <History className="h-3 w-3 text-slate-300" />
                        {formatDate(log.created_at)}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-slate-700">{log.user_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`border-0 px-2 py-0.5 text-[10px] font-bold ${
                        log.action === 'CREATE' ? 'bg-blue-50 text-blue-600' :
                        log.action === 'UPDATE' ? 'bg-amber-50 text-amber-600' :
                        log.action === 'DELETE' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-slate-600 bg-slate-50/50 p-1 rounded w-fit h-fit my-auto">
                        {log.target}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 pr-6">{log.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}