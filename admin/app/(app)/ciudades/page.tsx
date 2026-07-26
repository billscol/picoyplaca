"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import api from "@/lib/api";
import { toast } from "sonner";

interface City {
  id: number;
  country_code: string;
  country_name: string;
  city_name: string;
  slug: string;
  timezone: string;
  restriction_model: string;
  is_active: number;
}

const RESTRICTION_MODELS = [
  { value: "plate_digit_day", label: "Pico y placa (digito de placa)" },
  { value: "emission_label_zone", label: "Zona de bajas emisiones" },
  { value: "congestion_charge", label: "Peaje de congestion" },
];

export default function CiudadesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [form, setForm] = useState({
    country_code: "",
    country_name: "",
    city_name: "",
    slug: "",
    timezone: "",
    restriction_model: "plate_digit_day",
  });
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await api.get("/admin/cities");
    setCities(data.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/admin/cities", form);
      toast.success("Ciudad agregada");
      setForm({ country_code: "", country_name: "", city_name: "", slug: "", timezone: "", restriction_model: "plate_digit_day" });
      load();
    } catch {
      toast.error("No se pudo agregar la ciudad. Revisa los campos.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(city: City) {
    await api.patch(`/admin/cities/${city.id}/active`, { active: !city.is_active });
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ciudades monitoreadas</h1>

      <Card>
        <CardHeader>
          <CardTitle>Agregar ciudad</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Pais (ISO-2)</Label>
              <Input maxLength={2} value={form.country_code} onChange={(e) => setForm({ ...form, country_code: e.target.value.toUpperCase() })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Nombre del pais</Label>
              <Input value={form.country_name} onChange={(e) => setForm({ ...form, country_name: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Ciudad</Label>
              <Input value={form.city_name} onChange={(e) => setForm({ ...form, city_name: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Timezone</Label>
              <Input placeholder="America/Bogota" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Modelo de restriccion</Label>
              <Select value={form.restriction_model} onValueChange={(v) => setForm({ ...form, restriction_model: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RESTRICTION_MODELS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-3">
              <Button type="submit" disabled={saving}>Agregar ciudad</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ciudad</TableHead>
                <TableHead>Pais</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {cities.map((city) => (
                <TableRow key={city.id}>
                  <TableCell>{city.city_name}</TableCell>
                  <TableCell>{city.country_name}</TableCell>
                  <TableCell>{RESTRICTION_MODELS.find((m) => m.value === city.restriction_model)?.label ?? city.restriction_model}</TableCell>
                  <TableCell>
                    <Badge variant={city.is_active ? "secondary" : "outline"}>{city.is_active ? "Activa" : "Inactiva"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => toggleActive(city)}>
                      {city.is_active ? "Desactivar" : "Activar"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
