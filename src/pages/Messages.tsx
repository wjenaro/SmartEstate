
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Send, 
  Search, 
  Plus,
  Phone,
  MoreVertical,
  CheckCheck,
  Check
} from "lucide-react";

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>("1");
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for conversations
  const conversations = [
    {
      id: "1",
      tenant: "John Doe",
      property: "Sunrise Apartments",
      unit: "101",
      lastMessage: "Thank you for fixing the plumbing issue so quickly!",
      timestamp: "2 hours ago",
      unread: 0,
      status: "online"
    },
    {
      id: "2", 
      tenant: "Jane Smith",
      property: "Green Valley Complex",
      unit: "205",
      lastMessage: "When will the maintenance team arrive?",
      timestamp: "1 day ago", 
      unread: 2,
      status: "offline"
    },
    {
      id: "3",
      tenant: "Mike Johnson", 
      property: "Downtown Plaza",
      unit: "305",
      lastMessage: "I need to discuss the lease renewal",
      timestamp: "3 days ago",
      unread: 1,
      status: "online"
    }
  ];

  // Mock data for messages
  const messages = [
    {
      id: "1",
      senderId: "tenant",
      senderName: "John Doe",
      content: "Hi, there's a plumbing issue in my bathroom. The sink is not draining properly.",
      timestamp: "10:30 AM",
      status: "read"
    },
    {
      id: "2", 
      senderId: "landlord",
      senderName: "You",
      content: "Hi John, I'll send a plumber to check it out today. What time works best for you?",
      timestamp: "10:45 AM",
      status: "read"
    },
    {
      id: "3",
      senderId: "tenant", 
      senderName: "John Doe",
      content: "Anytime after 2 PM works for me. Thanks!",
      timestamp: "11:00 AM",
      status: "read"
    },
    {
      id: "4",
      senderId: "landlord",
      senderName: "You", 
      content: "Perfect, I've scheduled the plumber for 3 PM today.",
      timestamp: "11:15 AM",
      status: "delivered"
    },
    {
      id: "5",
      senderId: "tenant",
      senderName: "John Doe",
      content: "Thank you for fixing the plumbing issue so quickly!",
      timestamp: "2 hours ago",
      status: "read"
    }
  ];

  const filteredConversations = conversations.filter(conv => 
    conv.tenant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.unit.includes(searchTerm)
  );

  const selectedConv = conversations.find(conv => conv.id === selectedConversation);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Here you would normally send the message to your backend
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "read":
        return <CheckCheck className="h-4 w-4 text-blue-500" />;
      case "delivered":
        return <Check className="h-4 w-4 text-gray-500" />;
      default:
        return <Check className="h-4 w-4 text-gray-300" />;
    }
  };

  return (
    <MainLayout>
      <div className="h-[calc(100vh-8rem)] flex">
        {/* Conversations sidebar */}
        <div className="w-1/3 border-r bg-card">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Messages</h2>
              <Button size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="overflow-y-auto h-full">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 border-b cursor-pointer hover:bg-accent transition-colors ${
                  selectedConversation === conversation.id ? "bg-accent" : ""
                }`}
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback>
                        {conversation.tenant.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                      conversation.status === "online" ? "bg-green-500" : "bg-gray-400"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{conversation.tenant}</p>
                      {conversation.unread > 0 && (
                        <Badge variant="default" className="bg-blue-500 text-white text-xs">
                          {conversation.unread}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {conversation.property} - Unit {conversation.unit}
                    </p>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {conversation.lastMessage}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {conversation.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {selectedConv ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {selectedConv.tenant.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedConv.tenant}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedConv.property} - Unit {selectedConv.unit}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === "landlord" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === "landlord"
                          ? "bg-blue-500 text-white"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className={`flex items-center justify-between mt-1 ${
                        message.senderId === "landlord" ? "text-blue-100" : "text-muted-foreground"
                      }`}>
                        <span className="text-xs">{message.timestamp}</span>
                        {message.senderId === "landlord" && (
                          <div className="ml-2">
                            {getStatusIcon(message.status)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message input */}
              <div className="p-4 border-t bg-card">
                <div className="flex items-center space-x-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 min-h-[40px] max-h-32 resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
