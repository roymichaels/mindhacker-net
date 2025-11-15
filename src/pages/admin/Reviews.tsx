import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DemoPurchase {
  id: string;
  packageType: "single" | "package_4";
  sessions: 1 | 4;
  price: 250 | 800;
  customerName?: string;
  customerEmail?: string;
  purchaseDate: string;
  demo: boolean;
}

const Reviews = () => {
  const [purchases, setPurchases] = useState<DemoPurchase[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const storedPurchases = localStorage.getItem("demo_purchases");
    if (storedPurchases) {
      setPurchases(JSON.parse(storedPurchases));
    }
  }, []);

  const filteredPurchases = purchases.filter(
    (purchase) =>
      purchase.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black cyber-glow mb-2">רכישות דמו</h1>
        <p className="text-muted-foreground">צפה ברכישות הדמו שבוצעו באתר</p>
      </div>

      <div className="glass-panel p-6 rounded-lg border border-primary/20">
        <div className="flex items-center gap-4 mb-6">
          <ShoppingBag className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">סך הכל רכישות: {purchases.length}</h2>
        </div>

        <Input
          placeholder="חפש לפי שם או אימייל..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-6 text-right"
        />

        {filteredPurchases.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>אין רכישות דמו עדיין</p>
            <p className="text-sm mt-2">רכישות דמו יופיעו כאן אחרי שמשתמשים יבצעו רכישה באתר</p>
          </div>
        ) : (
          <div className="glass-panel rounded-lg border border-primary/20">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">תאריך</TableHead>
                  <TableHead className="text-right">שם לקוח</TableHead>
                  <TableHead className="text-right">אימייל</TableHead>
                  <TableHead className="text-right">סוג חבילה</TableHead>
                  <TableHead className="text-right">מפגשים</TableHead>
                  <TableHead className="text-right">מחיר</TableHead>
                  <TableHead className="text-right">סטטוס</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="text-right">
                      {new Date(purchase.purchaseDate).toLocaleDateString("he-IL")}
                    </TableCell>
                    <TableCell className="text-right">{purchase.customerName || "-"}</TableCell>
                    <TableCell className="text-right">{purchase.customerEmail || "-"}</TableCell>
                    <TableCell className="text-right">
                      {purchase.packageType === "single" ? "מפגש בודד" : "חבילת 4 מפגשים"}
                    </TableCell>
                    <TableCell className="text-right">{purchase.sessions}</TableCell>
                    <TableCell className="text-right">₪{purchase.price}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">
                        דמו
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
