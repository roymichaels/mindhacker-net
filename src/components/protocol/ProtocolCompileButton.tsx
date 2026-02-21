import { useState } from 'react';
import { Cpu, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface Props {
  protocolId: string;
}

export function ProtocolCompileButton({ protocolId }: Props) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [compiling, setCompiling] = useState(false);

  const handleCompile = async () => {
    setCompiling(true);
    try {
      const { data, error } = await supabase.functions.invoke('compile-life-protocol', {
        body: { protocol_id: protocolId },
      });

      if (error) throw error;

      toast({
        title: isHe ? '✓ פרוטוקול הודר בהצלחה' : '✓ Protocol compiled successfully',
        description: isHe ? `${data?.blocks_created || 0} בלוקים נוצרו` : `${data?.blocks_created || 0} blocks generated`,
      });

      queryClient.invalidateQueries({ queryKey: ['protocol-blocks', protocolId] });
      queryClient.invalidateQueries({ queryKey: ['life-protocol'] });
    } catch (err) {
      toast({
        title: isHe ? 'שגיאה' : 'Error',
        description: err instanceof Error ? err.message : 'Compilation failed',
        variant: 'destructive',
      });
    } finally {
      setCompiling(false);
    }
  };

  return (
    <Button
      onClick={handleCompile}
      disabled={compiling}
      className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80"
      size="lg"
    >
      {compiling ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {isHe ? 'מהדר...' : 'Compiling...'}
        </>
      ) : (
        <>
          <Cpu className="w-4 h-4" />
          {isHe ? 'הרץ קומפילציה' : 'Run Compilation'}
        </>
      )}
    </Button>
  );
}
