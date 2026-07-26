"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { toast } from "sonner";

interface ApiKey {
  id: number;
  name: string;
  key_prefix: string;
  revoked: number;
  last_used_at: string | null;
  created_at: string;
}

export default function ApiKeysPage() {
  const t = useTranslations("dashboard");
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [name, setName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadKeys() {
    const { data } = await api.get("/api-keys");
    setKeys(data.data);
  }

  useEffect(() => {
    loadKeys();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post("/api-keys", { name });
      setNewKey(data.data.raw_key);
      setName("");
      loadKeys();
    } catch {
      toast.error("No se pudo crear la API key");
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke(id: number) {
    await api.delete(`/api-keys/${id}`);
    loadKeys();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("api_keys_title")}</h1>

      {newKey && (
        <Card className="border-primary">
          <CardContent className="pt-6">
            <p className="text-sm font-medium">Guarda esta key, no se volvera a mostrar:</p>
            <code className="mt-2 block break-all rounded bg-muted p-2 text-sm">{newKey}</code>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("create_key")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex gap-2">
            <Input placeholder={t("key_name_placeholder")} value={name} onChange={(e) => setName(e.target.value)} />
            <Button type="submit" disabled={loading}>
              {t("create_key")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Prefijo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Ultimo uso</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {keys.map((key) => (
            <TableRow key={key.id}>
              <TableCell>{key.name}</TableCell>
              <TableCell><code>{key.key_prefix}...</code></TableCell>
              <TableCell>
                <Badge variant={key.revoked ? "destructive" : "secondary"}>{key.revoked ? "Revocada" : "Activa"}</Badge>
              </TableCell>
              <TableCell>{key.last_used_at ?? "Nunca"}</TableCell>
              <TableCell>
                {!key.revoked && (
                  <Button variant="ghost" size="sm" onClick={() => handleRevoke(key.id)}>
                    {t("revoke")}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
