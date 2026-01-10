import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, Calendar, Search, Loader2, CheckCircle, Clock, UserCheck, Users, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  source: string;
  preferred_time: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  contacted_at: string | null;
}

interface ExitLead {
  id: string;
  email: string;
  created_at: string;
  is_contacted: boolean;
  contacted_at: string | null;
  notes: string | null;
}

const sourceLabels: Record<string, string> = {
  hero: "היירו",
  discovery: "שיחת היכרות",
  invitation: "הזמנה אישית",
  exit_popup: "פופאפ יציאה",
  floating: "כפתור צף",
  general: "כללי",
};

const statusLabels: Record<string, string> = {
  new: "חדש",
  contacted: "נוצר קשר",
  scheduled: "נקבעה פגישה",
  converted: "הומר",
};

const statusColors: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-400",
  contacted: "bg-yellow-500/20 text-yellow-400",
  scheduled: "bg-green-500/20 text-green-400",
  converted: "bg-primary/20 text-primary",
};

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [exitLeads, setExitLeads] = useState<ExitLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedExitLead, setSelectedExitLead] = useState<ExitLead | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [exitLeadToDelete, setExitLeadToDelete] = useState<ExitLead | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    fetchAllLeads();
  }, []);

  const fetchAllLeads = async () => {
    try {
      // Fetch new leads table
      const { data: leadsData, error: leadsError } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (leadsError) throw leadsError;

      // Fetch exit intent leads
      const { data: exitData, error: exitError } = await supabase
        .from("exit_intent_leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (exitError) throw exitError;

      setLeads(leadsData || []);
      setExitLeads(exitData || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast({
        title: "שגיאה בטעינת לידים",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (lead: Lead, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("leads")
        .update({
          status: newStatus,
          contacted_at: newStatus !== "new" ? new Date().toISOString() : null,
        })
        .eq("id", lead.id);

      if (error) throw error;

      setLeads((prev) =>
        prev.map((l) =>
          l.id === lead.id
            ? { ...l, status: newStatus, contacted_at: newStatus !== "new" ? new Date().toISOString() : null }
            : l
        )
      );

      // Invalidate sidebar badge cache when status changes
      queryClient.invalidateQueries({ queryKey: ['admin-new-leads'] });
      toast({ title: `סטטוס עודכן ל-${statusLabels[newStatus]}` });
    } catch (error) {
      console.error("Error updating lead:", error);
      toast({ title: "שגיאה בעדכון", variant: "destructive" });
    }
  };

  const saveLeadNotes = async () => {
    if (!selectedLead) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("leads")
        .update({ notes })
        .eq("id", selectedLead.id);

      if (error) throw error;

      setLeads((prev) =>
        prev.map((l) => (l.id === selectedLead.id ? { ...l, notes } : l))
      );

      toast({ title: "הערות נשמרו בהצלחה" });
      setSelectedLead(null);
    } catch (error) {
      console.error("Error saving notes:", error);
      toast({ title: "שגיאה בשמירת הערות", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleExitContacted = async (lead: ExitLead) => {
    try {
      const newStatus = !lead.is_contacted;
      const { error } = await supabase
        .from("exit_intent_leads")
        .update({
          is_contacted: newStatus,
          contacted_at: newStatus ? new Date().toISOString() : null,
        })
        .eq("id", lead.id);

      if (error) throw error;

      setExitLeads((prev) =>
        prev.map((l) =>
          l.id === lead.id
            ? { ...l, is_contacted: newStatus, contacted_at: newStatus ? new Date().toISOString() : null }
            : l
        )
      );

      toast({ title: newStatus ? "סומן כנוצר קשר" : "סומן כממתין" });
    } catch (error) {
      console.error("Error updating lead:", error);
      toast({ title: "שגיאה בעדכון", variant: "destructive" });
    }
  };

  const saveExitNotes = async () => {
    if (!selectedExitLead) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("exit_intent_leads")
        .update({ notes })
        .eq("id", selectedExitLead.id);

      if (error) throw error;

      setExitLeads((prev) =>
        prev.map((l) => (l.id === selectedExitLead.id ? { ...l, notes } : l))
      );

      toast({ title: "הערות נשמרו בהצלחה" });
      setSelectedExitLead(null);
    } catch (error) {
      console.error("Error saving notes:", error);
      toast({ title: "שגיאה בשמירת הערות", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deleteLead = async () => {
    if (!leadToDelete) return;
    setDeleting(true);

    try {
      const { error } = await supabase
        .from("leads")
        .delete()
        .eq("id", leadToDelete.id);

      if (error) throw error;

      setLeads((prev) => prev.filter((l) => l.id !== leadToDelete.id));
      // Invalidate sidebar badge cache
      queryClient.invalidateQueries({ queryKey: ['admin-new-leads'] });
      toast({ title: "ליד נמחק בהצלחה" });
      setLeadToDelete(null);
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast({ title: "שגיאה במחיקת ליד", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const deleteExitLead = async () => {
    if (!exitLeadToDelete) return;
    setDeleting(true);

    try {
      const { error } = await supabase
        .from("exit_intent_leads")
        .delete()
        .eq("id", exitLeadToDelete.id);

      if (error) throw error;

      setExitLeads((prev) => prev.filter((l) => l.id !== exitLeadToDelete.id));
      // Invalidate sidebar badge cache
      queryClient.invalidateQueries({ queryKey: ['admin-new-leads'] });
      toast({ title: "ליד נמחק בהצלחה" });
      setExitLeadToDelete(null);
    } catch (error) {
      console.error("Error deleting exit lead:", error);
      toast({ title: "שגיאה במחיקת ליד", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      (lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesSource && matchesStatus;
  });

  const filteredExitLeads = exitLeads.filter((lead) =>
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalLeads: leads.length,
    newLeads: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    scheduled: leads.filter((l) => l.status === "scheduled").length,
    converted: leads.filter((l) => l.status === "converted").length,
    exitLeads: exitLeads.length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black cyber-glow mb-2">ניהול לידים</h1>
        <p className="text-muted-foreground">כל הלידים מכל המקורות במקום אחד</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="glass-panel border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">סה"כ לידים</p>
                <p className="text-2xl font-bold text-primary">{stats.totalLeads}</p>
              </div>
              <Users className="h-6 w-6 text-primary/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">חדשים</p>
                <p className="text-2xl font-bold text-blue-400">{stats.newLeads}</p>
              </div>
              <Clock className="h-6 w-6 text-blue-400/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-yellow-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">נוצר קשר</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.contacted}</p>
              </div>
              <Phone className="h-6 w-6 text-yellow-400/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">נקבעה פגישה</p>
                <p className="text-2xl font-bold text-green-400">{stats.scheduled}</p>
              </div>
              <Calendar className="h-6 w-6 text-green-400/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">הומרו</p>
                <p className="text-2xl font-bold text-primary">{stats.converted}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-primary/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-panel border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חפש לפי שם, טלפון או אימייל..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="מקור" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל המקורות</SelectItem>
                {Object.entries(sourceLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="סטטוס" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסטטוסים</SelectItem>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="leads" className="space-y-4">
        <TabsList className="glass-panel">
          <TabsTrigger value="leads" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            לידים עם טלפון ({leads.length})
          </TabsTrigger>
          <TabsTrigger value="exit" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            לידים מפופאפ יציאה ({exitLeads.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leads">
          <Card className="glass-panel border-primary/20">
            <CardHeader>
              <CardTitle>לידים עם פרטי התקשרות</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">שם</TableHead>
                    <TableHead className="text-right">טלפון</TableHead>
                    <TableHead className="text-right">מקור</TableHead>
                    <TableHead className="text-right">תאריך</TableHead>
                    <TableHead className="text-right">סטטוס</TableHead>
                    <TableHead className="text-right">פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        אין לידים להצגה
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{lead.name}</p>
                            {lead.email && (
                              <p className="text-xs text-muted-foreground">{lead.email}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <a
                            href={`tel:${lead.phone}`}
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </a>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {sourceLabels[lead.source] || lead.source}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(lead.created_at), "dd/MM HH:mm", { locale: he })}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={lead.status}
                            onValueChange={(value) => updateLeadStatus(lead, value)}
                          >
                            <SelectTrigger className={`w-28 h-8 text-xs ${statusColors[lead.status]}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(statusLabels).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedLead(lead);
                                setNotes(lead.notes || "");
                              }}
                            >
                              הערות
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setLeadToDelete(lead)}
                              aria-label="מחק ליד"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exit">
          <Card className="glass-panel border-primary/20">
            <CardHeader>
              <CardTitle>לידים מפופאפ יציאה (אימייל בלבד)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">אימייל</TableHead>
                    <TableHead className="text-right">תאריך</TableHead>
                    <TableHead className="text-right">סטטוס</TableHead>
                    <TableHead className="text-right">הערות</TableHead>
                    <TableHead className="text-right">פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExitLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        אין לידים להצגה
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExitLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.email}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(lead.created_at), "dd/MM/yyyy HH:mm", { locale: he })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={lead.is_contacted ? "default" : "secondary"}>
                            {lead.is_contacted ? "נוצר קשר" : "ממתין"}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm">
                          {lead.notes || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleExitContacted(lead)}
                            >
                              {lead.is_contacted ? "בטל" : "סמן"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedExitLead(lead);
                                setNotes(lead.notes || "");
                              }}
                            >
                              הערות
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setExitLeadToDelete(lead)}
                              aria-label="מחק ליד"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Lead Notes Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="glass-panel border-primary/20">
          <DialogHeader>
            <DialogTitle>הערות עבור {selectedLead?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>טלפון: {selectedLead?.phone}</p>
              {selectedLead?.email && <p>אימייל: {selectedLead.email}</p>}
              {selectedLead?.preferred_time && <p>זמן מועדף: {selectedLead.preferred_time}</p>}
            </div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="הוסף הערות..."
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedLead(null)}>
                ביטול
              </Button>
              <Button onClick={saveLeadNotes} disabled={saving}>
                {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                שמור
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exit Lead Notes Dialog */}
      <Dialog open={!!selectedExitLead} onOpenChange={() => setSelectedExitLead(null)}>
        <DialogContent className="glass-panel border-primary/20">
          <DialogHeader>
            <DialogTitle>הערות עבור {selectedExitLead?.email}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="הוסף הערות..."
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedExitLead(null)}>
                ביטול
              </Button>
              <Button onClick={saveExitNotes} disabled={saving}>
                {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                שמור
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Lead AlertDialog */}
      <AlertDialog open={!!leadToDelete} onOpenChange={(open) => !open && setLeadToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת ליד</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך למחוק את הליד של {leadToDelete?.name}?
              פעולה זו אינה הפיכה.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteLead}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Exit Lead AlertDialog */}
      <AlertDialog open={!!exitLeadToDelete} onOpenChange={(open) => !open && setExitLeadToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת ליד</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך למחוק את הליד {exitLeadToDelete?.email}?
              פעולה זו אינה הפיכה.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteExitLead}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Leads;
