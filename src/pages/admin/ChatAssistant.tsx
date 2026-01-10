import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Settings, BookOpen, MessageSquare, Plus, Pencil, Trash2, Save, RotateCcw, GripVertical } from "lucide-react";

interface ChatSetting {
  id: string;
  setting_key: string;
  setting_value: string | null;
}

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  order_index: number;
}

const AI_MODELS = [
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash (Fast)" },
  { value: "google/gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite (Fastest)" },
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro (Best Quality)" },
  { value: "openai/gpt-5-mini", label: "GPT-5 Mini (Balanced)" },
  { value: "openai/gpt-5", label: "GPT-5 (Premium)" },
];

const DEFAULT_SYSTEM_PROMPT = `אתה עוזר אישי של דין אושר אזולאי, מייסד מיינד-האקר.

## תפקידך
- לעזור למבקרים להבין את השירותים והתכנים
- להכווין אותם לתוכן המתאים להם
- לענות על שאלות נפוצות
- להיות חם, אכפתי ולא מכירתי

## השירותים העיקריים
1. מסע התבוננות פנימית - שאלון חינמי להכרות עצמית
2. סרטון היפנוזה אישי - ₪297 - הקלטה מותאמת אישית
3. קפיצה לתודעה חדשה - ₪1,997 - תהליך טרנספורמציה מעמיק

## הנחיות התנהגות
- דבר בעברית בברירת מחדל, אלא אם המבקר פונה באנגלית
- היה תמציתי וממוקד
- הפנה לשיחת ייעוץ חינמית כשמתאים
- אל תלחץ למכירה - הצע ערך`;

const ChatAssistant = () => {
  const { t, isRTL } = useTranslation();
  const queryClient = useQueryClient();
  
  // Settings state
  const [enabled, setEnabled] = useState(true);
  const [model, setModel] = useState("google/gemini-2.5-flash");
  const [greetingHe, setGreetingHe] = useState("");
  const [greetingEn, setGreetingEn] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [maxMessages, setMaxMessages] = useState("20");
  const [maxContentLength, setMaxContentLength] = useState("2000");
  
  // Knowledge base state
  const [knowledgeDialogOpen, setKnowledgeDialogOpen] = useState(false);
  const [editingKnowledge, setEditingKnowledge] = useState<KnowledgeEntry | null>(null);
  const [knowledgeTitle, setKnowledgeTitle] = useState("");
  const [knowledgeContent, setKnowledgeContent] = useState("");
  const [deleteKnowledgeId, setDeleteKnowledgeId] = useState<string | null>(null);

  // Fetch settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["chat-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_assistant_settings")
        .select("*");
      if (error) throw error;
      return data as ChatSetting[];
    },
  });

  // Fetch knowledge base
  const { data: knowledgeBase, isLoading: knowledgeLoading } = useQuery({
    queryKey: ["chat-knowledge"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_knowledge_base")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data as KnowledgeEntry[];
    },
  });

  // Load settings into state
  useEffect(() => {
    if (settings) {
      const settingsMap = new Map(settings.map(s => [s.setting_key, s.setting_value]));
      setEnabled(settingsMap.get("enabled") === "true");
      setModel(settingsMap.get("model") || "google/gemini-2.5-flash");
      setGreetingHe(settingsMap.get("greeting_he") || "");
      setGreetingEn(settingsMap.get("greeting_en") || "");
      setSystemPrompt(settingsMap.get("system_prompt") || DEFAULT_SYSTEM_PROMPT);
      setMaxMessages(settingsMap.get("max_messages") || "20");
      setMaxContentLength(settingsMap.get("max_content_length") || "2000");
    }
  }, [settings]);

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (updates: { key: string; value: string }[]) => {
      for (const { key, value } of updates) {
        const { error } = await supabase
          .from("chat_assistant_settings")
          .update({ setting_value: value })
          .eq("setting_key", key);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-settings"] });
      toast.success(t("admin.saved"));
    },
    onError: () => {
      toast.error(t("admin.updateError"));
    },
  });

  // Knowledge base mutations
  const saveKnowledgeMutation = useMutation({
    mutationFn: async (entry: { id?: string; title: string; content: string }) => {
      if (entry.id) {
        const { error } = await supabase
          .from("chat_knowledge_base")
          .update({ title: entry.title, content: entry.content })
          .eq("id", entry.id);
        if (error) throw error;
      } else {
        const maxOrder = knowledgeBase?.reduce((max, kb) => Math.max(max, kb.order_index), 0) || 0;
        const { error } = await supabase
          .from("chat_knowledge_base")
          .insert({ title: entry.title, content: entry.content, order_index: maxOrder + 1 });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-knowledge"] });
      toast.success(t("admin.saved"));
      setKnowledgeDialogOpen(false);
      resetKnowledgeForm();
    },
    onError: () => {
      toast.error(t("admin.updateError"));
    },
  });

  const toggleKnowledgeMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("chat_knowledge_base")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-knowledge"] });
    },
  });

  const deleteKnowledgeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("chat_knowledge_base")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-knowledge"] });
      toast.success(t("admin.deleted"));
      setDeleteKnowledgeId(null);
    },
    onError: () => {
      toast.error(t("admin.deleteError"));
    },
  });

  const resetKnowledgeForm = () => {
    setEditingKnowledge(null);
    setKnowledgeTitle("");
    setKnowledgeContent("");
  };

  const handleEditKnowledge = (entry: KnowledgeEntry) => {
    setEditingKnowledge(entry);
    setKnowledgeTitle(entry.title);
    setKnowledgeContent(entry.content);
    setKnowledgeDialogOpen(true);
  };

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate([
      { key: "enabled", value: enabled ? "true" : "false" },
      { key: "model", value: model },
      { key: "greeting_he", value: greetingHe },
      { key: "greeting_en", value: greetingEn },
      { key: "max_messages", value: maxMessages },
      { key: "max_content_length", value: maxContentLength },
    ]);
  };

  const handleSaveSystemPrompt = () => {
    saveSettingsMutation.mutate([{ key: "system_prompt", value: systemPrompt }]);
  };

  const handleResetPrompt = () => {
    setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
  };

  const handleSaveKnowledge = () => {
    saveKnowledgeMutation.mutate({
      id: editingKnowledge?.id,
      title: knowledgeTitle,
      content: knowledgeContent,
    });
  };

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("admin.chatAssistant.title")}</h1>
          <p className="text-muted-foreground">{t("admin.chatAssistant.subtitle")}</p>
        </div>
      </div>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {t("admin.chatAssistant.settingsTab")}
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {t("admin.chatAssistant.knowledgeTab")}
          </TabsTrigger>
          <TabsTrigger value="prompt" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {t("admin.chatAssistant.promptTab")}
          </TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.chatAssistant.generalSettings")}</CardTitle>
              <CardDescription>{t("admin.chatAssistant.generalSettingsDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("admin.chatAssistant.enableAssistant")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.chatAssistant.enableAssistantDesc")}
                  </p>
                </div>
                <Switch checked={enabled} onCheckedChange={setEnabled} />
              </div>

              <div className="space-y-2">
                <Label>{t("admin.chatAssistant.aiModel")}</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_MODELS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("admin.chatAssistant.maxMessages")}</Label>
                  <Input
                    type="number"
                    value={maxMessages}
                    onChange={(e) => setMaxMessages(e.target.value)}
                    min="1"
                    max="50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("admin.chatAssistant.maxContentLength")}</Label>
                  <Input
                    type="number"
                    value={maxContentLength}
                    onChange={(e) => setMaxContentLength(e.target.value)}
                    min="100"
                    max="10000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("admin.chatAssistant.greetings")}</CardTitle>
              <CardDescription>{t("admin.chatAssistant.greetingsDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("admin.chatAssistant.greetingHe")}</Label>
                <Textarea
                  value={greetingHe}
                  onChange={(e) => setGreetingHe(e.target.value)}
                  placeholder="היי! אני העוזר האישי של דין..."
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("admin.chatAssistant.greetingEn")}</Label>
                <Textarea
                  value={greetingEn}
                  onChange={(e) => setGreetingEn(e.target.value)}
                  placeholder="Hi! I'm Dean's personal assistant..."
                  dir="ltr"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={saveSettingsMutation.isPending}>
              <Save className="h-4 w-4 me-2" />
              {t("common.save")}
            </Button>
          </div>
        </TabsContent>

        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("admin.chatAssistant.knowledgeBase")}</CardTitle>
                <CardDescription>{t("admin.chatAssistant.knowledgeBaseDesc")}</CardDescription>
              </div>
              <Button onClick={() => { resetKnowledgeForm(); setKnowledgeDialogOpen(true); }}>
                <Plus className="h-4 w-4 me-2" />
                {t("common.add")}
              </Button>
            </CardHeader>
            <CardContent>
              {knowledgeLoading ? (
                <div className="text-center py-4">{t("common.loading")}</div>
              ) : !knowledgeBase?.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t("admin.chatAssistant.noKnowledge")}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>{t("admin.chatAssistant.knowledgeTitle")}</TableHead>
                      <TableHead>{t("admin.chatAssistant.knowledgeContent")}</TableHead>
                      <TableHead className="w-20">{t("admin.chatAssistant.active")}</TableHead>
                      <TableHead className="w-24">{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {knowledgeBase.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </TableCell>
                        <TableCell className="font-medium">{entry.title}</TableCell>
                        <TableCell className="max-w-xs truncate">{entry.content}</TableCell>
                        <TableCell>
                          <Switch
                            checked={entry.is_active}
                            onCheckedChange={(checked) => 
                              toggleKnowledgeMutation.mutate({ id: entry.id, is_active: checked })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditKnowledge(entry)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => setDeleteKnowledgeId(entry.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Prompt Tab */}
        <TabsContent value="prompt" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.chatAssistant.systemPrompt")}</CardTitle>
              <CardDescription>{t("admin.chatAssistant.systemPromptDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
                dir="auto"
              />
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {systemPrompt.length} {t("admin.chatAssistant.characters")}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleResetPrompt}>
                    <RotateCcw className="h-4 w-4 me-2" />
                    {t("admin.chatAssistant.resetDefault")}
                  </Button>
                  <Button onClick={handleSaveSystemPrompt} disabled={saveSettingsMutation.isPending}>
                    <Save className="h-4 w-4 me-2" />
                    {t("common.save")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Knowledge Base Preview */}
          {knowledgeBase?.filter(k => k.is_active).length ? (
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.chatAssistant.injectedKnowledge")}</CardTitle>
                <CardDescription>{t("admin.chatAssistant.injectedKnowledgeDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm max-h-48 overflow-y-auto">
                  {knowledgeBase
                    .filter(k => k.is_active)
                    .map(k => `## ${k.title}\n${k.content}`)
                    .join("\n\n")}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>
      </Tabs>

      {/* Knowledge Entry Dialog */}
      <Dialog open={knowledgeDialogOpen} onOpenChange={setKnowledgeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingKnowledge ? t("admin.chatAssistant.editKnowledge") : t("admin.chatAssistant.addKnowledge")}
            </DialogTitle>
            <DialogDescription>
              {t("admin.chatAssistant.knowledgeDialogDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("admin.chatAssistant.knowledgeTitle")}</Label>
              <Input
                value={knowledgeTitle}
                onChange={(e) => setKnowledgeTitle(e.target.value)}
                placeholder={t("admin.chatAssistant.knowledgeTitlePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("admin.chatAssistant.knowledgeContent")}</Label>
              <Textarea
                value={knowledgeContent}
                onChange={(e) => setKnowledgeContent(e.target.value)}
                placeholder={t("admin.chatAssistant.knowledgeContentPlaceholder")}
                className="min-h-[200px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setKnowledgeDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button 
              onClick={handleSaveKnowledge} 
              disabled={!knowledgeTitle || !knowledgeContent || saveKnowledgeMutation.isPending}
            >
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteKnowledgeId} onOpenChange={() => setDeleteKnowledgeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.deleteConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>{t("admin.deleteDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteKnowledgeId && deleteKnowledgeMutation.mutate(deleteKnowledgeId)}
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ChatAssistant;