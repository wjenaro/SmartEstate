
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Ban, CheckCircle, Search, Users, UserX, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AdminUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Mock data - in real app, this would come from API
  const users = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      plan: "Professional",
      status: "active",
      properties: 8,
      joinDate: "2024-01-15",
      role: "landlord",
      is_demo: false,
      last_login: "2024-01-25"
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      plan: "Starter",
      status: "trial",
      properties: 3,
      joinDate: "2024-01-20",
      role: "agent",
      is_demo: false,
      last_login: "2024-01-24"
    },
    {
      id: "3",
      name: "Demo User",
      email: "demo@rentease.com",
      plan: "Demo",
      status: "active",
      properties: 2,
      joinDate: "2024-01-10",
      role: "landlord",
      is_demo: true,
      last_login: "2024-01-25"
    }
  ];

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
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
