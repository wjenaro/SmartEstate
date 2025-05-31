
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Ban, CheckCircle, Search, Users, UserX, Crown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAdminUsers, useAdminActions } from "@/hooks/useAdminData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export const AdminUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{action: 'ban' | 'activate' | 'promote', userId: string} | null>(null);
  const { toast } = useToast();
  const { users, loading, error } = useAdminUsers();
  const { banUser, activateUser, promoteToAdmin } = useAdminActions();
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle user actions with confirmation
  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    
    const { action, userId } = confirmAction;
    let success = false;
    
    if (action === 'ban') {
      success = await banUser(userId);
    } else if (action === 'activate') {
      success = await activateUser(userId);
    } else if (action === 'promote') {
      success = await promoteToAdmin(userId);
    }
    
    if (success) {
      setConfirmAction(null);
    }
  };
  
  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="py-10">
          <div className="flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading user data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="py-10 text-center text-red-500">
          Error loading user data: {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>User Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8 w-full bg-muted/40"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Properties</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No users found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.plan === 'Professional' ? 'default' : user.plan === 'Demo' ? 'secondary' : 'outline'}>
                          {user.plan}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.properties}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'success' : user.status === 'trial' ? 'warning' : 'destructive'}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">{user.role}</span>
                        {user.is_demo && (
                          <Badge variant="outline" className="ml-2">Demo</Badge>
                        )}
                      </TableCell>
                      <TableCell>{user.joinDate}</TableCell>
                      <TableCell>{user.last_login}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => setViewingUserId(user.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {user.status === 'banned' ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => setConfirmAction({ action: 'activate', userId: user.id })}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => setConfirmAction({ action: 'ban', userId: user.id })}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {user.role !== 'admin' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-purple-600 border-purple-200 hover:bg-purple-50"
                              onClick={() => setConfirmAction({ action: 'promote', userId: user.id })}
                            >
                              <Crown className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Confirmation Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.action === 'ban' && "Ban User"}
              {confirmAction?.action === 'activate' && "Activate User"}
              {confirmAction?.action === 'promote' && "Promote to Admin"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.action === 'ban' && "Are you sure you want to ban this user? They will no longer be able to access the platform."}
              {confirmAction?.action === 'activate' && "Are you sure you want to activate this user?"}
              {confirmAction?.action === 'promote' && "Are you sure you want to promote this user to admin? They will have full access to the admin panel."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button 
              variant={confirmAction?.action === 'ban' ? 'destructive' : 'default'}
              onClick={handleConfirmAction}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* User Details Dialog */}
      <Dialog open={!!viewingUserId} onOpenChange={(open) => !open && setViewingUserId(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {viewingUserId && (
            <div className="space-y-4">
              {(() => {
                const user = users.find(u => u.id === viewingUserId);
                if (!user) return <p>User not found</p>;
                
                return (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                        <p>{user.name}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                        <p>{user.email}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Role</h3>
                        <p className="capitalize">{user.role}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                        <p className="capitalize">{user.status}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Subscription Plan</h3>
                        <p>{user.plan}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Properties</h3>
                        <p>{user.properties}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Join Date</h3>
                        <p>{user.joinDate}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Last Login</h3>
                        <p>{user.last_login}</p>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => setViewingUserId(null)}>Close</Button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
      case "active":
        return "bg-green-100 text-green-800";
      case "trial":
        return "bg-blue-100 text-blue-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    // In real app, this would make API calls
    toast({
      title: "Action Performed",
      description: `User ${action} action has been processed.`,
    });
    console.log(`Performing ${action} on user ${userId}`);
  };

  const handlePromoteUser = async (userId: string) => {
    toast({
      title: "User Promoted",
      description: "User has been promoted to agent role.",
    });
    console.log(`Promoting user ${userId}`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>User Management</span>
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Properties</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <div className="font-medium flex items-center space-x-2">
                      <span>{user.name}</span>
                      {user.is_demo && (
                        <Badge variant="outline" className="text-xs">
                          DEMO
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{user.plan}</TableCell>
                <TableCell>{user.properties}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(user.status)}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {user.last_login}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleUserAction(user.id, 'view')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {user.role === 'landlord' && (
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handlePromoteUser(user.id)}
                        title="Promote to Agent"
                      >
                        <Crown className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {user.status === 'active' ? (
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleUserAction(user.id, 'suspend')}
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleUserAction(user.id, 'activate')}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 text-red-600 hover:text-red-700"
                      onClick={() => handleUserAction(user.id, 'delete')}
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No users found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search criteria
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
