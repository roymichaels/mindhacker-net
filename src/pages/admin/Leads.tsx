import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, Calendar, Search, Loader2, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface Lead {
  id: string;
  email: string;
  created_at: string;
  is_contacted: boolean;
  contacted_at: string | null;
  notes: string | null;
}

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from("exit_intent_leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeads(data || []);
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

  const toggleContacted = async (lead: Lead) => {
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

      setLeads((prev) =>
        prev.map((l) =>
          l.id === lead.id
            ? { ...l, is_contacted: newStatus, contacted_at: newStatus ? new Date().toISOString() : null }
            : l
        )
      );

      toast({
        title: newStatus ? "סומן כנוצר קשר" : "סומן כממתין",
      });
    } catch (error) {
      console.error("Error updating lead:", error);
      toast({
        title: "שגיאה בעדכון",
        variant: "destructive",
      });
    }
  };

  const saveNotes = async () => {
    if (!selectedLead) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("exit_intent_leads")
        .update({ notes })
        .eq("id", selectedLead.id);

      if (error) throw error;

      setLeads((prev) =>
        prev.map((l) =>
          l.id === selectedLead.id ? { ...l, notes } : l
        )
      );

      toast({ title: "הערות נשמרו בהצלחה" });
      setSelectedLead(null);
    } catch (error) {
      console.error("Error saving notes:", error);
      toast({
        title: "שגיאה בשמירת הערות",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredLeads = leads.filter((lead) =>
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: leads.length,
    contacted: leads.filter((l) => l.is_contacted).length,
    pending: leads.filter((l) => !l.is_contacted).length,
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
        <p className="text-muted-foreground">לידים מפופאפ יציאה</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-panel border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">סה"כ לידים</p>
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
              </div>
              <Mail className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-panel border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">נוצר קשר</p>
                <p className="text-2xl font-bold text-green-500">{stats.contacted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-panel border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ממתינים</p>
                <p className="text-2xl font-bold text-accent">{stats.pending}</p>
              </div>
              <XCircle className="h-8 w-8 text-accent/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="glass-panel border-primary/20">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="חפש לפי אימייל..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card className="glass-panel border-primary/20">
        <CardHeader>
          <CardTitle>רשימת לידים</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">אימייל</TableHead>
                <TableHead className="text-right">תאריך הרשמה</TableHead>
                <TableHead className="text-right">סטטוס</TableHead>
                <TableHead className="text-right">הערות</TableHead>
                <TableHead className="text-right">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    אין לידים להצגה
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(lead.created_at), "dd/MM/yyyy HH:mm", { locale: he })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={lead.is_contacted ? "default" : "secondary"}>
                        {lead.is_contacted ? "נוצר קשר" : "ממתין"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {lead.notes || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleContacted(lead)}
                        >
                          {lead.is_contacted ? "בטל סימון" : "סמן כנוצר קשר"}
                        </Button>
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Notes Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="glass-panel border-primary/20">
          <DialogHeader>
            <DialogTitle>הערות עבור {selectedLead?.email}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
              <Button onClick={saveNotes} disabled={saving}>
                {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                שמור
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Leads;
