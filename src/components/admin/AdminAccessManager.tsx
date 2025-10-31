import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, UserCheck } from "lucide-react";

export const AdminAccessManager = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGrantingAccess, setIsGrantingAccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      // Check if user has admin role
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error checking admin status:', error);
        throw error;
      }

      setIsAdmin(!!userRoles);
    } catch (error: any) {
      console.error('Error checking admin status:', error);
      toast({
        title: "Error checking admin status",
        description: error.message,
        variant: "destructive",
      });
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const grantAdminAccess = async () => {
    try {
      setIsGrantingAccess(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Please log in first");
      }

      // Only allow satvikj570@gmail.com to grant themselves admin access
      if (user.email !== 'satvikj570@gmail.com') {
        throw new Error("Only the site owner can use this feature. Please contact the administrator.");
      }

      // Call the function to make user admin
      const { error } = await supabase.rpc('make_user_admin', {
        _user_id: user.id
      });

      if (error) throw error;

      toast({
        title: "Admin access granted!",
        description: "You now have admin privileges. Please refresh the page.",
      });
      
      // Refresh admin status
      checkAdminStatus();
    } catch (error: any) {
      console.error('Error granting admin access:', error);
      toast({
        title: "Error granting admin access",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGrantingAccess(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <UserCheck className="w-5 h-5" />
            Admin Access Confirmed
          </CardTitle>
          <CardDescription>
            You have admin privileges and can manage events and tickets.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Admin Access Required
        </CardTitle>
        <CardDescription>
          You need admin privileges to access this page. If you're the site owner, click the button below to grant yourself admin access.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={grantAdminAccess} 
          disabled={isGrantingAccess}
          className="w-full"
        >
          {isGrantingAccess ? "Granting Access..." : "Grant Admin Access"}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Note: This is a one-time setup for the site owner. In production, admin access should be granted through proper user management.
        </p>
      </CardContent>
    </Card>
  );
};