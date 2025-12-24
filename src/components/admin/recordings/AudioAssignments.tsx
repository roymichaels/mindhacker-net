import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Copy, Link, Trash2, UserPlus, Check, X } from "lucide-react";
import { AssignAudioDialog } from "./AssignAudioDialog";
import { format } from "date-fns";
import { he } from "date-fns/locale";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AudioAccess {
  id: string;
  user_id: string;
  audio_id: string;
  access_token: string;
  notes: string | null;
  granted_at: string;
  expires_at: string | null;
  is_active: boolean;
  hypnosis_audios: {
    id: string;
    title: string;
  };
  profiles: {
    id: string;
    full_name: string | null;
  } | null;
}

export const AudioAssignments = () => {
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: assignments, isLoading } = useQuery({
    queryKey: ["audio-assignments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_audio_access")
        .select(`
          *,
          hypnosis_audios (id, title),
          profiles:user_id (id, full_name)
        `)
        .order("granted_at", { ascending: false });
      if (error) throw error;
      return data as unknown as AudioAccess[];
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("user_audio_access")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audio-assignments"] });
      toast({ title: "הסטטוס עודכן בהצלחה" });
    },
    onError: () => {
      toast({ title: "שגיאה בעדכון הסטטוס", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("user_audio_access")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audio-assignments"] });
      toast({ title: "ההקצאה נמחקה בהצלחה" });
      setDeletingId(null);
    },
    onError: () => {
      toast({ title: "שגיאה במחיקת ההקצאה", variant: "destructive" });
    },
  });

  const copyLink = async (token: string) => {
    const link = `${window.location.origin}/audio/${token}`;
    await navigator.clipboard.writeText(link);
    setCopiedToken(token);
    toast({ title: "הקישור הועתק ללוח" });
    setTimeout(() => setCopiedToken(null), 2000);
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="h-64" />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">הקצאות ({assignments?.length || 0})</h2>
        <Button onClick={() => setIsAssignOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          הקצה הקלטה למשתמש
        </Button>
      </div>

      {assignments?.length === 0 ? (
        <Card className="p-12 text-center">
          <Link className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">אין הקצאות עדיין</h3>
          <p className="text-muted-foreground mt-2">
            הקצה הקלטות למשתמשים כדי שיוכלו לגשת אליהן
          </p>
          <Button onClick={() => setIsAssignOpen(true)} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            הקצה הקלטה
          </Button>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">משתמש</TableHead>
                <TableHead className="text-right">הקלטה</TableHead>
                <TableHead className="text-right">תאריך הקצאה</TableHead>
                <TableHead className="text-right">סטטוס</TableHead>
                <TableHead className="text-right">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments?.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>
                    <span className="font-medium">
                      {assignment.profiles?.full_name || "משתמש לא ידוע"}
                    </span>
                    {assignment.notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {assignment.notes}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>{assignment.hypnosis_audios?.title}</TableCell>
                  <TableCell>
                    {format(new Date(assignment.granted_at), "d MMM yyyy", {
                      locale: he,
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={assignment.is_active ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() =>
                        toggleActiveMutation.mutate({
                          id: assignment.id,
                          is_active: !assignment.is_active,
                        })
                      }
                    >
                      {assignment.is_active ? (
                        <>
                          <Check className="h-3 w-3 ml-1" />
                          פעיל
                        </>
                      ) : (
                        <>
                          <X className="h-3 w-3 ml-1" />
                          לא פעיל
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => copyLink(assignment.access_token)}
                      >
                        {copiedToken === assignment.access_token ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setDeletingId(assignment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <AssignAudioDialog
        open={isAssignOpen}
        onOpenChange={setIsAssignOpen}
      />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>האם למחוק את ההקצאה?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תבטל את גישת המשתמש להקלטה. ניתן להקצות מחדש בכל עת.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
