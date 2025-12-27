import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye,
  Loader2
} from "lucide-react";

interface Application {
  id: string;
  lead_id: string;
  current_life_situation: string;
  what_feels_stuck: string;
  what_to_understand: string;
  why_now: string;
  openness_to_process: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  lead: {
    name: string;
    email: string;
    what_resonated: string | null;
    created_at: string;
  };
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  reviewed: "bg-blue-500/20 text-blue-400",
  approved: "bg-green-500/20 text-green-400",
  rejected: "bg-red-500/20 text-red-400",
};

const statusLabels: Record<string, string> = {
  pending: "ממתין",
  reviewed: "נבדק",
  approved: "אושר",
  rejected: "נדחה",
};

const ConsciousnessLeap = () => {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const queryClient = useQueryClient();

  const { data: applications, isLoading } = useQuery({
    queryKey: ["consciousness-leap-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consciousness_leap_applications")
        .select(`
          *,
          lead:consciousness_leap_leads(name, email, what_resonated, created_at)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Application[];
    },
  });

  const { data: leadsCount } = useQuery({
    queryKey: ["consciousness-leap-leads-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("consciousness_leap_leads")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return count || 0;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes: string }) => {
      const { error } = await supabase
        .from("consciousness_leap_applications")
        .update({ 
          status, 
          admin_notes: notes,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consciousness-leap-applications"] });
      toast.success("הבקשה עודכנה בהצלחה");
      setSelectedApplication(null);
    },
    onError: () => {
      toast.error("שגיאה בעדכון הבקשה");
    },
  });

  const handleOpenApplication = (app: Application) => {
    setSelectedApplication(app);
    setAdminNotes(app.admin_notes || "");
    setNewStatus(app.status);
  };

  const handleUpdate = () => {
    if (!selectedApplication) return;
    updateMutation.mutate({
      id: selectedApplication.id,
      status: newStatus,
      notes: adminNotes,
    });
  };

  const pendingCount = applications?.filter(a => a.status === "pending").length || 0;
  const approvedCount = applications?.filter(a => a.status === "approved").length || 0;

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-6">קפיצה לתודעה חדשה</h1>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{leadsCount}</p>
                  <p className="text-sm text-muted-foreground">לידים</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <FileText className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold">{applications?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">בקשות</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <Clock className="h-8 w-8 text-yellow-400" />
                <div>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                  <p className="text-sm text-muted-foreground">ממתינות</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold">{approvedCount}</p>
                  <p className="text-sm text-muted-foreground">אושרו</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Applications List */}
          <Card>
            <CardHeader>
              <CardTitle>בקשות</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : !applications?.length ? (
                <p className="text-center text-muted-foreground py-8">
                  אין בקשות עדיין
                </p>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div 
                      key={app.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border/50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-medium">{app.lead?.name}</span>
                          <Badge className={statusColors[app.status]}>
                            {statusLabels[app.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {app.lead?.email}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(app.created_at), "dd/MM/yyyy HH:mm", { locale: he })}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenApplication(app)}
                      >
                        <Eye className="h-4 w-4 ml-2" />
                        צפייה
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Application Detail Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              בקשה מאת {selectedApplication?.lead?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              {/* Lead Info */}
              <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                <h3 className="font-medium mb-2">פרטי הליד</h3>
                <p className="text-sm"><strong>אימייל:</strong> {selectedApplication.lead?.email}</p>
                <p className="text-sm"><strong>נרשם:</strong> {format(new Date(selectedApplication.lead?.created_at), "dd/MM/yyyy HH:mm", { locale: he })}</p>
                {selectedApplication.lead?.what_resonated && (
                  <p className="text-sm mt-2">
                    <strong>מה גרם להרגיש שזה מדבר אליו:</strong>
                    <br />
                    {selectedApplication.lead.what_resonated}
                  </p>
                )}
              </div>

              {/* Application Answers */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-primary mb-1">איפה נמצא עכשיו בחיים?</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedApplication.current_life_situation}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-primary mb-1">מה מרגיש תקוע או לא ברור?</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedApplication.what_feels_stuck}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-primary mb-1">מה רוצה להבין או לשנות?</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedApplication.what_to_understand}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-primary mb-1">למה זה עולה עכשיו?</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedApplication.why_now}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-primary mb-1">פתיחות לתהליך</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedApplication.openness_to_process}
                  </p>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-4">
                  <label className="font-medium">סטטוס:</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">ממתין</SelectItem>
                      <SelectItem value="reviewed">נבדק</SelectItem>
                      <SelectItem value="approved">אושר</SelectItem>
                      <SelectItem value="rejected">נדחה</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="font-medium block mb-2">הערות אדמין:</label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="הערות פנימיות..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 ml-2" />
                    )}
                    שמור שינויים
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedApplication(null)}>
                    סגור
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConsciousnessLeap;
