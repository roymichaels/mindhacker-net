import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, FolderOpen, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import SeriesManager from "./SeriesManager";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ProductsListProps {
  products: any[];
  onEdit: (product: any) => void;
}

const ProductsList = ({ products, onEdit }: ProductsListProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("content_products")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({
        title: "המוצר נמחק בהצלחה",
      });
      setDeleteId(null);
    },
    onError: (error) => {
      toast({
        title: "שגיאה במחיקת המוצר",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const statusColors = {
    draft: "bg-yellow-500/20 text-yellow-300",
    published: "bg-green-500/20 text-green-300",
    archived: "bg-muted/50 text-muted-foreground",
  };

  const accessColors = {
    free: "bg-blue-500/20 text-blue-300",
    basic: "bg-purple-500/20 text-purple-300",
    premium: "bg-pink-500/20 text-pink-300",
    vip: "bg-amber-500/20 text-amber-300",
  };

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 glass-panel rounded-lg border border-primary/20">
        <Package className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-bold mb-2">אין מוצרי תוכן עדיין</h3>
        <p className="text-muted-foreground">התחל ליצור את הקורס הראשון שלך</p>
      </div>
    );
  }

  return (
    <>
      <div className="glass-panel rounded-lg border border-primary/20">
        <Table>
          <TableHeader>
            <TableRow className="border-primary/20">
              <TableHead className="text-right">כותרת</TableHead>
              <TableHead className="text-right">סוג</TableHead>
              <TableHead className="text-right">רמת גישה</TableHead>
              <TableHead className="text-right">סטטוס</TableHead>
              <TableHead className="text-right">מחיר</TableHead>
              <TableHead className="text-right">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="border-primary/20">
                <TableCell className="font-medium">{product.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">{product.content_type}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={accessColors[product.access_level as keyof typeof accessColors]}>
                    {product.access_level}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[product.status as keyof typeof statusColors]}>
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell>₪{product.price || 0}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedProductId(product.id)}
                    >
                      <FolderOpen className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(product)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(product.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק את המוצר לצמיתות. לא ניתן לשחזר את הפעולה.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!selectedProductId} onOpenChange={() => setSelectedProductId(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sr-only">
            <DialogTitle>ניהול סדרות</DialogTitle>
            <DialogDescription>ניהול סדרות ופרקים</DialogDescription>
          </DialogHeader>
          {selectedProductId && (
            <SeriesManager productId={selectedProductId} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductsList;
