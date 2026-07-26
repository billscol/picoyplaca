"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { toast } from "sonner";

interface Proposal {
  id: number;
  city_id: number;
  city_name: string;
  country_name: string;
  diff_summary: string;
  source_url: string;
  confidence_score: string;
  status: string;
  created_at: string;
  proposed_payload: Record<string, unknown>;
}

export default function RevisionReglasPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function load() {
    const { data } = await api.get("/admin/rule-proposals");
    setProposals(data.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDecision(id: number, decision: "approve" | "reject") {
    setBusyId(id);
    try {
      await api.post(`/admin/rule-proposals/${id}/${decision}`);
      toast.success(decision === "approve" ? "Propuesta aprobada y publicada" : "Propuesta rechazada");
      load();
    } catch {
      toast.error("No se pudo procesar la decision");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cola de revision</h1>
        <p className="text-sm text-muted-foreground">
          Cambios detectados por el agente semanal. Nada se publica sin aprobacion aqui.
        </p>
      </div>

      {proposals.length === 0 && <p className="text-sm text-muted-foreground">Sin propuestas pendientes.</p>}

      <div className="space-y-4">
        {proposals.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {p.city_name}, {p.country_name}
                </CardTitle>
                <Badge variant="outline">confianza {(Number(p.confidence_score) * 100).toFixed(0)}%</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">{p.diff_summary}</p>
              <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
                {JSON.stringify(p.proposed_payload, null, 2)}
              </pre>
              {p.source_url && (
                <a href={p.source_url} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
                  Ver fuente
                </a>
              )}
            </CardContent>
            <CardFooter className="gap-2">
              <Button size="sm" disabled={busyId === p.id} onClick={() => handleDecision(p.id, "approve")}>
                Aprobar y publicar
              </Button>
              <Button size="sm" variant="outline" disabled={busyId === p.id} onClick={() => handleDecision(p.id, "reject")}>
                Rechazar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
