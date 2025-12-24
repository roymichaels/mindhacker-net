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
import { Button } from "@/components/ui/button";
import { Search, Loader2, Gift } from "lucide-react";
import { handleError, generateErrorId } from "@/lib/errorHandling";
import AdminGrantPurchaseDialog from "@/components/admin/AdminGrantPurchaseDialog";

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
  const [grantDialogOpen, setGrantDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    email: string;
    full_name: string | null;
  } | null>(null);

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

      // Function to get user email via Edge Function
      const getUserEmail = async (userId: string) => {
        try {
          const { data, error } = await supabase.functions.invoke('get-user-data', {
            body: { userId }
          });

          if (error) throw error;
          return data.user?.email || "Unknown";
        } catch (error) {
          console.error("Error fetching user email - ID:", generateErrorId());
          return "Unknown";
        }
      };

      // Combine the data
      const usersWithData = await Promise.all(
        (profilesData || []).map(async (profile) => {
          // Get user email via Edge Function
          const email = await getUserEmail(profile.id);
          const userPurchases = purchasesData?.filter(p => p.user_id === profile.id) || [];
          const userRoles = rolesData?.filter(r => r.user_id === profile.id) || [];

          return {
            id: profile.id,
            email,
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
    } catch (error: unknown) {
      handleError(error, "לא ניתן לטעון משתמשים", "Users");
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

  const handleGrantClick = (user: UserData) => {
    setSelectedUser({
      id: user.id,
      email: user.email,
      full_name: user.profiles?.full_name || null,
    });
    setGrantDialogOpen(true);
  };

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
              <TableHead className="text-right">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
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
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGrantClick(user)}
                        className="gap-1"
                      >
                        <Gift className="h-4 w-4" />
                        הענק רכישה
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AdminGrantPurchaseDialog
        open={grantDialogOpen}
        onOpenChange={setGrantDialogOpen}
        user={selectedUser}
        onSuccess={fetchUsers}
      />
    </div>
  );
};

export default Users;
