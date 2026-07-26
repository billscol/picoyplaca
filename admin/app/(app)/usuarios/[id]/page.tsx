"use client";

import { useEffect, useState, use as usePromise } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import api from "@/lib/api";
import { toast } from "sonner";

interface UserDetail {
  id: number;
  name: string;
  email: string;
  subscription_plan: string;
  subscription_status: string;
  subscription_ends_at: string | null;
}

interface SubLog {
  action: string;
  from_plan: string | null;
  to_plan: string | null;
  status: string;
  created_at: string;
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const [user, setUser] = useState<UserDetail | null>(null);
  const [logs, setLogs] = useState<SubLog[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await api.get(`/admin/users/${id}`);
    setUser(data.data.user);
    setLogs(data.data.subscription_history);
    setSelectedPlan(data.data.user.subscription_plan);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleAssignPlan() {
    setSaving(true);
    try {
      await api.post(`/admin/subscriptions/${id}`, { plan_code: selectedPlan });
      toast.success("Plan actualizado");
      load();
    } catch {
      toast.error("No se pudo actualizar el plan");
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{user.name}</h1>
      <p className="text-muted-foreground">{user.email}</p>

      <Card>
        <CardHeader>
          <CardTitle>Plan y suscripcion</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Select value={selectedPlan} onValueChange={setSelectedPlan}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="business">Business</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAssignPlan} disabled={saving || selectedPlan === user.subscription_plan}>
            Asignar plan
          </Button>
          <Badge variant="secondary">{user.subscription_status}</Badge>
          {user.subscription_ends_at && <span className="text-sm text-muted-foreground">Vence: {user.subscription_ends_at}</span>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de suscripcion</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Accion</TableHead>
                <TableHead>De</TableHead>
                <TableHead>A</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log, i) => (
                <TableRow key={i}>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.from_plan ?? "-"}</TableCell>
                  <TableCell>{log.to_plan ?? "-"}</TableCell>
                  <TableCell>{log.status}</TableCell>
                  <TableCell>{log.created_at}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
