"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import api from "@/lib/api";

interface UserRow {
  id: number;
  name: string;
  email: string;
  is_admin: number;
  subscription_plan: string;
  subscription_status: string;
  created_at: string;
}

const PLAN_STYLE: Record<string, string> = {
  free: "bg-muted text-muted-foreground",
  pro: "bg-primary/15 text-primary",
  business: "bg-accent/20 text-accent-foreground",
};

export default function UsuariosPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      api.get("/admin/users", { params: { search } }).then(({ data }) => {
        setUsers(data.data.items);
        setTotal(data.data.total);
      });
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Usuarios ({total})</h1>
        <Input placeholder="Buscar por nombre o email..." className="max-w-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Registrado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <Link href={`/usuarios/${u.id}`} className="hover:underline">
                      {u.name} {!!u.is_admin && <Badge variant="secondary" className="ml-1">admin</Badge>}
                    </Link>
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge className={PLAN_STYLE[u.subscription_plan] ?? PLAN_STYLE.free}>{u.subscription_plan}</Badge>
                  </TableCell>
                  <TableCell>{u.subscription_status}</TableCell>
                  <TableCell>{u.created_at}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
