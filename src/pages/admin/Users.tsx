import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Search, Loader2 } from "lucide-react";

interface UserData {
  id: string;
  email: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
  };
  purchases?: {
    id: string;
    sessions_remaining: number;
  }[];
  user_roles?: {
    role: string;
  }[];
}

const Users = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // First get all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          created_at
        `);

      if (profilesError) throw profilesError;

      // Get purchases for each user
      const { data: purchasesData } = await supabase
        .from("purchases")
        .select("user_id, id, sessions_remaining");

      // Get roles for each user
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("user_id, role");

      // Combine the data
      const usersWithData = await Promise.all(
        (profilesData || []).map(async (profile) => {
          // Get user email from auth
          const { data: authData } = await supabase.auth.admin.getUserById(profile.id);
          
          const userPurchases = purchasesData?.filter(p => p.user_id === profile.id) || [];
          const userRoles = rolesData?.filter(r => r.user_id === profile.id) || [];

          return {
            id: profile.id,
            email: authData.user?.email || "לא ידוע",
            created_at: profile.created_at,
            profiles: {
              full_name: profile.full_name,
            },
            purchases: userPurchases,
            user_roles: userRoles,
          };
        })
      );

      setUsers(usersWithData);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון משתמשים",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const userName = user.profiles?.full_name?.toLowerCase() || "";
    const email = user.email.toLowerCase();
    const search = searchTerm.toLowerCase();
    return userName.includes(search) || email.includes(search);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black cyber-glow mb-2">ניהול משתמשים</h1>
        <p className="text-muted-foreground">
          צפה במשתמשים ובפעילותם במערכת
        </p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חפש לפי שם או אימייל..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      <div className="glass-panel rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">שם</TableHead>
              <TableHead className="text-right">אימייל</TableHead>
              <TableHead className="text-right">תאריך הצטרפות</TableHead>
              <TableHead className="text-right">רכישות</TableHead>
              <TableHead className="text-right">מפגשים פעילים</TableHead>
              <TableHead className="text-right">תפקיד</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  לא נמצאו משתמשים
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const totalPurchases = user.purchases?.length || 0;
                const activeSessions = user.purchases?.reduce(
                  (sum, p) => sum + (p.sessions_remaining || 0),
                  0
                ) || 0;
                const isAdmin = user.user_roles?.some(r => r.role === "admin");

                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.profiles?.full_name || "לא מוגדר"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString("he-IL")}
                    </TableCell>
                    <TableCell>{totalPurchases}</TableCell>
                    <TableCell>{activeSessions}</TableCell>
                    <TableCell>
                      {isAdmin ? (
                        <Badge>Admin</Badge>
                      ) : (
                        <Badge variant="secondary">User</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Users;
