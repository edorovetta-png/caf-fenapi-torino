# Analytics Operator View + Admin Dashboard Pagination & Search

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-operator appointment listing in Analytics, and add search + pagination to AdminDashboard lists (documents, appointments) — purely frontend, no backend/edge function changes.

**Architecture:** All changes are client-side filtering/pagination on data already fetched. New `OperatorAppointmentsTable` component for Analytics. Search + pagination added inline to `AdminDocuments` and the appointments table in `AdminDashboard`. No new API calls, no Supabase changes, no edge function changes.

**Tech Stack:** React 18, TypeScript, shadcn/ui (existing components: Input, Select, Table, Card, Badge, Button), Lucide icons, date-fns with Italian locale.

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `src/components/analytics/OperatorAppointmentsTable.tsx` | Per-operator appointment list with select + paginated table |
| Modify | `src/pages/Analytics.tsx:586-598` | Import and render `OperatorAppointmentsTable` |
| Modify | `src/components/AdminDocuments.tsx` | Add search bar + pagination |
| Modify | `src/pages/AdminDashboard.tsx:214-248` | Add search bar to appointments table |

---

### Task 1: Create OperatorAppointmentsTable component

**Files:**
- Create: `src/components/analytics/OperatorAppointmentsTable.tsx`

This component receives the same props as `DailyAppointmentsTable` (appointments, categoryMap, profileMap), renders a Select to pick an operator, filters appointments by that operator, and shows them in a paginated table (10 per page).

- [ ] **Step 1: Create the component file**

Create `caffenapi/src/components/analytics/OperatorAppointmentsTable.tsx` with:

```tsx
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Users, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Appointment = {
  id: string;
  service: string;
  appointment_date: string;
  appointment_time: string;
  operator_id: string | null;
  first_name: string;
  last_name: string;
  created_at: string;
};

type Props = {
  appointments: Appointment[];
  categoryMap: Record<string, { name: string; icon: string }>;
  profileMap: Record<string, string>;
};

const PAGE_SIZE = 10;

const OperatorAppointmentsTable = ({ appointments, categoryMap, profileMap }: Props) => {
  const [selectedOperator, setSelectedOperator] = useState<string>("__all");
  const [page, setPage] = useState(0);

  // Build operator options from the data
  const operatorOptions = useMemo(() => {
    const ops = new Map<string, string>();
    appointments.forEach((a) => {
      if (a.operator_id && !ops.has(a.operator_id)) {
        ops.set(a.operator_id, profileMap[a.operator_id] || "Operatore");
      }
    });
    return Array.from(ops.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [appointments, profileMap]);

  // Filter by selected operator
  const filtered = useMemo(() => {
    const list = selectedOperator === "__all"
      ? appointments
      : selectedOperator === "__unassigned"
        ? appointments.filter((a) => !a.operator_id)
        : appointments.filter((a) => a.operator_id === selectedOperator);
    return list.slice().sort((a, b) => {
      const dateCmp = a.appointment_date.localeCompare(b.appointment_date);
      return dateCmp !== 0 ? dateCmp : a.appointment_time.localeCompare(b.appointment_time);
    });
  }, [appointments, selectedOperator]);

  // Reset page when operator changes
  const handleOperatorChange = (value: string) => {
    setSelectedOperator(value);
    setPage(0);
  };

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Per-service breakdown for selected operator
  const serviceBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach((a) => { counts[a.service] = (counts[a.service] || 0) + 1; });
    return Object.entries(counts)
      .map(([slug, count]) => ({
        slug,
        name: categoryMap[slug]?.name || slug,
        icon: categoryMap[slug]?.icon || "\u{1F4CB}",
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filtered, categoryMap]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Appuntamenti per Operatore
          </CardTitle>
          <Select value={selectedOperator} onValueChange={handleOperatorChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Seleziona operatore" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Tutti gli operatori</SelectItem>
              <SelectItem value="__unassigned">Indifferente</SelectItem>
              {operatorOptions.map((op) => (
                <SelectItem key={op.id} value={op.id}>{op.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {filtered.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <Badge variant="outline">{filtered.length} appuntamenti</Badge>
            {serviceBreakdown.map((s) => (
              <Badge key={s.slug} variant="secondary" className="text-xs">
                {s.icon} {s.name}: {s.count}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {selectedOperator === "__all" ? "Nessun appuntamento nel periodo selezionato" : "Nessun appuntamento per questo operatore"}
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Data</TableHead>
                  <TableHead className="text-xs">Ora</TableHead>
                  <TableHead className="text-xs">Servizio</TableHead>
                  <TableHead className="text-xs">Cliente</TableHead>
                  {selectedOperator === "__all" && (
                    <TableHead className="text-xs">Operatore</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-sm">
                      {format(new Date(a.appointment_date + "T12:00:00"), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="text-sm font-medium">{a.appointment_time}</TableCell>
                    <TableCell className="text-sm">
                      <span className="mr-1">{categoryMap[a.service]?.icon || "\u{1F4CB}"}</span>
                      {categoryMap[a.service]?.name || a.service}
                    </TableCell>
                    <TableCell className="text-sm">{a.first_name} {a.last_name}</TableCell>
                    {selectedOperator === "__all" && (
                      <TableCell className="text-sm text-muted-foreground">
                        {a.operator_id ? (profileMap[a.operator_id] || "Operatore") : "Indifferente"}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} di {filtered.length}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground px-2">
                    {page + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default OperatorAppointmentsTable;
```

- [ ] **Step 2: Verify file compiles**

Run: `cd /Users/edoardorovetta/Desktop/Antigravity/fenapi/caffenapi && npx tsc --noEmit src/components/analytics/OperatorAppointmentsTable.tsx 2>&1 | head -20`

Expected: no errors (or only errors about missing module resolution which is fine for isolated check)

- [ ] **Step 3: Commit**

```bash
cd /Users/edoardorovetta/Desktop/Antigravity/fenapi/caffenapi
git add src/components/analytics/OperatorAppointmentsTable.tsx
git commit -m "feat(analytics): add OperatorAppointmentsTable component with operator select + pagination"
```

---

### Task 2: Wire OperatorAppointmentsTable into Analytics page

**Files:**
- Modify: `src/pages/Analytics.tsx`

Add the import at line ~16 and render the component between the "Provenienza Prenotazioni" card and the "Trend Prenotazioni Effettuate" card (before the bookingsByCreationDay chart — around line 556).

- [ ] **Step 1: Add import**

In `Analytics.tsx`, add after line 16 (`import CreationDayBookingsTable`):

```tsx
import OperatorAppointmentsTable from "@/components/analytics/OperatorAppointmentsTable";
```

- [ ] **Step 2: Render the component**

In `Analytics.tsx`, insert the component between the "Provenienza Prenotazioni" `</Card>` (line 555) and the bookings by creation date `<Card>` (line 558). Find the line:

```tsx
        {/* Bookings by creation date — chart + detail */}
```

And insert before it:

```tsx
        {/* Appointments per operator — filterable table */}
        <OperatorAppointmentsTable
          appointments={appointments}
          categoryMap={categoryMap}
          profileMap={profileMap}
        />

```

- [ ] **Step 3: Verify build**

Run: `cd /Users/edoardorovetta/Desktop/Antigravity/fenapi/caffenapi && npm run build 2>&1 | tail -5`

Expected: build succeeds

- [ ] **Step 4: Commit**

```bash
cd /Users/edoardorovetta/Desktop/Antigravity/fenapi/caffenapi
git add src/pages/Analytics.tsx
git commit -m "feat(analytics): wire OperatorAppointmentsTable into Analytics page"
```

---

### Task 3: Add search + pagination to AdminDocuments

**Files:**
- Modify: `src/components/AdminDocuments.tsx`

Add a search bar that filters by client name or file name, and pagination (10 per page). The data is already fetched in a single query — we filter client-side.

- [ ] **Step 1: Update AdminDocuments.tsx**

Replace the entire content of `AdminDocuments.tsx` with:

```tsx
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface DocRow {
  id: string;
  file_name: string;
  file_path: string;
  uploaded_at: string;
  appointment_id: string;
  appointments: {
    first_name: string;
    last_name: string;
    service: string;
    appointment_date: string;
  };
}

interface AdminDocumentsProps {
  serviceFilter?: string;
}

const PAGE_SIZE = 10;

const AdminDocuments = ({ serviceFilter }: AdminDocumentsProps) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["admin-documents", serviceFilter],
    queryFn: async () => {
      let query = supabase
        .from("document_uploads")
        .select("*, appointments!inner(first_name, last_name, service, appointment_date)")
        .order("uploaded_at", { ascending: false });

      if (serviceFilter) {
        query = query.eq("appointments.service", serviceFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as DocRow[];
    },
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return documents;
    const q = search.toLowerCase().trim();
    return documents.filter((doc) => {
      const clientName = `${doc.appointments.first_name} ${doc.appointments.last_name}`.toLowerCase();
      const fileName = doc.file_name.toLowerCase();
      return clientName.includes(q) || fileName.includes(q);
    });
  }, [documents, search]);

  // Reset page when search changes
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleDownload = async (filePath: string, fileName: string) => {
    const { data, error } = await supabase.storage
      .from("appointment-documents")
      .download(filePath);
    if (error) return;
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documenti caricati
          </CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca per nome o file..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <p className="p-6 text-center text-muted-foreground">Caricamento...</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-center text-muted-foreground">
            {search ? "Nessun documento trovato per questa ricerca" : "Nessun documento caricato"}
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome e Cognome</TableHead>
                  <TableHead>Data Appuntamento</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Caricato il</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      {doc.appointments.first_name} {doc.appointments.last_name}
                    </TableCell>
                    <TableCell>
                      {format(new Date(doc.appointments.appointment_date), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{doc.file_name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(doc.uploaded_at), "dd/MM/yyyy HH:mm", { locale: it })}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDownload(doc.file_path, doc.file_name)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-xs text-muted-foreground">
                  {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} di {filtered.length}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground px-2">
                    {page + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminDocuments;
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/edoardorovetta/Desktop/Antigravity/fenapi/caffenapi && npm run build 2>&1 | tail -5`

Expected: build succeeds

- [ ] **Step 3: Commit**

```bash
cd /Users/edoardorovetta/Desktop/Antigravity/fenapi/caffenapi
git add src/components/AdminDocuments.tsx
git commit -m "feat(admin): add search and pagination to AdminDocuments"
```

---

### Task 4: Add search to AdminDashboard appointments table

**Files:**
- Modify: `src/pages/AdminDashboard.tsx`

Add an `Input` search field above the appointments table that filters by name, email, phone, or notes. This filters the already-fetched `appointments` array client-side.

- [ ] **Step 1: Add imports**

In `AdminDashboard.tsx`, add `Search` to the lucide-react import (currently just `BarChart3`):

Change:
```tsx
import { BarChart3 } from "lucide-react";
```
To:
```tsx
import { BarChart3, Search } from "lucide-react";
```

Also add `useMemo` to the React import:

Change:
```tsx
import { useEffect, useState } from "react";
```
To:
```tsx
import { useEffect, useMemo, useState } from "react";
```

Add `Input` import:

After the `import { Card, ...` line, add:
```tsx
import { Input } from "@/components/ui/input";
```

- [ ] **Step 2: Add search state and filtered list**

Inside the `AdminDashboard` component, after the line:
```tsx
  const [bookingOpen, setBookingOpen] = useState(false);
```

Add:
```tsx
  const [appointmentSearch, setAppointmentSearch] = useState("");
```

After the `appointments` query (after line ~112, after the `enabled: !!activeTab,` closing `});`), add:

```tsx
  const filteredAppointments = useMemo(() => {
    if (!appointmentSearch.trim()) return appointments;
    const q = appointmentSearch.toLowerCase().trim();
    return appointments.filter((apt: any) => {
      const name = `${apt.first_name} ${apt.last_name}`.toLowerCase();
      const email = (apt.email || "").toLowerCase();
      const phone = (apt.phone || "").toLowerCase();
      const notes = (apt.notes || "").toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q) || notes.includes(q);
    });
  }, [appointments, appointmentSearch]);
```

- [ ] **Step 3: Add search input in the UI**

Find the line:
```tsx
            <Tabs value={activeTab} onValueChange={setActiveTab}>
```

Insert just before it:
```tsx
            {/* Search appointments */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca per nome, email, telefono..."
                value={appointmentSearch}
                onChange={(e) => setAppointmentSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>

```

- [ ] **Step 4: Use filteredAppointments instead of appointments in the table**

In the `TabsContent` section, find:
```tsx
                      ) : appointments.length === 0 ? (
```
Replace with:
```tsx
                      ) : filteredAppointments.length === 0 ? (
```

Find:
```tsx
                          Nessun appuntamento per questa data
```
Replace with:
```tsx
                          {appointmentSearch ? "Nessun appuntamento trovato" : "Nessun appuntamento per questa data"}
```

Find:
```tsx
                        {appointments.map((apt: any) => (
```
Replace with:
```tsx
                        {filteredAppointments.map((apt: any) => (
```

- [ ] **Step 5: Reset search when tab or date changes**

In the `setActiveTab` handler inside `Tabs`, we need to reset the search. Find:
```tsx
            <Tabs value={activeTab} onValueChange={setActiveTab}>
```
Replace with:
```tsx
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setAppointmentSearch(""); }}>
```

- [ ] **Step 6: Verify build**

Run: `cd /Users/edoardorovetta/Desktop/Antigravity/fenapi/caffenapi && npm run build 2>&1 | tail -5`

Expected: build succeeds

- [ ] **Step 7: Commit**

```bash
cd /Users/edoardorovetta/Desktop/Antigravity/fenapi/caffenapi
git add src/pages/AdminDashboard.tsx
git commit -m "feat(admin): add search bar to appointments table in AdminDashboard"
```

---

## Summary of changes

| Component | What changed |
|-----------|-------------|
| `OperatorAppointmentsTable` (new) | Select operatore + tabella paginata (10/pag) + breakdown servizi |
| `Analytics.tsx` | Importa e renderizza `OperatorAppointmentsTable` |
| `AdminDocuments.tsx` | Cerca per nome/file + paginazione 10/pag |
| `AdminDashboard.tsx` | Cerca per nome/email/telefono/note sugli appuntamenti |

**Zero backend changes.** Nessuna modifica a edge function, Supabase, Google Drive, email.
