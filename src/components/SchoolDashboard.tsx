import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Download, 
  Users, 
  Ticket, 
  School, 
  Plus,
  BookOpen,
  UserPlus,
  Trophy,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTicket } from "@/hooks/useTicket";

interface Registration {
  id: string;
  tracking_number: string;
  school_name: string;
  contact_name: string;
  contact_phone: string;
  total_amount: number;
  participants: Array<{ name: string; class: string; category_id: string }>;
  registration_categories: Array<{ category_id: string; categories: { name: string; max_participants: number } }>;
}

interface CustomTicket {
  name: string;
  role: 'Teacher' | 'Visitor';
  category_id: string;
}

interface SchoolDashboardProps {
  trackingNumber: string;
}

const SchoolDashboard = ({ trackingNumber }: SchoolDashboardProps) => {
  const { toast } = useToast();
  const { downloadTicket, generateTicketPDF, isGenerating } = useTicket();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [customTickets, setCustomTickets] = useState<CustomTicket[]>([]);
  const [newTicketName, setNewTicketName] = useState("");
  const [newTicketRole, setNewTicketRole] = useState<'Teacher' | 'Visitor'>('Teacher');
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRegistrationData();
    fetchCategories();
  }, [trackingNumber]);

  const fetchRegistrationData = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          participants (*),
          registration_categories (
            category_id,
            categories (name, max_participants)
          )
        `)
        .eq('tracking_number', trackingNumber.toUpperCase())
        .single();

      if (error) throw error;
      setRegistration(data);
    } catch (error) {
      console.error('Error fetching registration:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const getRegisteredCategories = () => {
    if (!registration) return [];
    return registration.registration_categories.map(rc => ({
      id: rc.category_id,
      name: rc.categories.name,
      max_participants: rc.categories.max_participants,
      registered_participants: registration.participants.filter(p => p.category_id === rc.category_id)
    }));
  };

  const getAvailableTicketsForCategory = (categoryId: string) => {
    const registeredParticipants = registration?.participants.filter(p => p.category_id === categoryId).length || 0;
    const customTicketsForCategory = customTickets.filter(t => t.category_id === categoryId).length;
    const totalUsed = registeredParticipants + customTicketsForCategory;
    return Math.max(0, 8 - totalUsed);
  };

  const addCustomTicket = () => {
    if (!newTicketName.trim() || !selectedCategory) {
      toast({
        title: "Invalid Input",
        description: "Please enter a name and select a category",
        variant: "destructive"
      });
      return;
    }

    if (getAvailableTicketsForCategory(selectedCategory) <= 0) {
      toast({
        title: "No Tickets Available",
        description: "Maximum 8 tickets per category reached",
        variant: "destructive"
      });
      return;
    }

    setCustomTickets([...customTickets, {
      name: newTicketName.trim(),
      role: newTicketRole,
      category_id: selectedCategory
    }]);

    setNewTicketName("");
    setNewTicketRole('Teacher');
    
    toast({
      title: "Ticket Added",
      description: `Added ${newTicketRole} ticket for ${newTicketName}`,
    });
  };

  const removeCustomTicket = (index: number) => {
    setCustomTickets(customTickets.filter((_, i) => i !== index));
  };

  const downloadCustomTicket = async (ticket: CustomTicket, index: number) => {
    try {
      // Create custom ticket data
      const customTicketData = {
        ticket_number: `${trackingNumber}-${ticket.role.toUpperCase()}-${index + 1}`,
        qr_code: JSON.stringify({
          ticket_number: `${trackingNumber}-${ticket.role.toUpperCase()}-${index + 1}`,
          participant_name: ticket.name,
          role: ticket.role,
          school_name: registration?.school_name || '',
          tracking_number: trackingNumber,
          event_date: "November 1st, 2025",
          check_in: false
        }),
        registration: {
          tracking_number: trackingNumber,
          school_name: registration?.school_name || '',
          contact_name: registration?.contact_name || '',
          contact_phone: registration?.contact_phone || '',
          total_amount: registration?.total_amount || 0,
          participants: [{ name: ticket.name, class: ticket.role }]
        }
      };

      const pdfUrl = await generateTicketPDF(customTicketData);
      
      // Create download link
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `CHAF-Ticket-${ticket.role}-${ticket.name.replace(/\s+/g, '-')}-${trackingNumber}.pdf`;
      link.click();
      
      // Clean up URL
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);
      
      toast({
        title: "Ticket Downloaded",
        description: `${ticket.role} ticket for ${ticket.name} has been downloaded.`,
      });
    } catch (error) {
      console.error('Download custom ticket error:', error);
      toast({
        title: "Download Failed",
        description: `Failed to download ticket for ${ticket.name}`,
        variant: "destructive"
      });
    }
  };

  const downloadIndividualTicket = async (participant: any, registrationData: Registration) => {
    try {
      // Create individual ticket data for this participant
      const individualTicketData = {
        ticket_number: `${trackingNumber}-${participant.name.replace(/\s+/g, '').toUpperCase()}`,
        qr_code: JSON.stringify({
          ticket_number: `${trackingNumber}-${participant.name.replace(/\s+/g, '').toUpperCase()}`,
          participant_name: participant.name,
          school_name: registrationData.school_name,
          tracking_number: trackingNumber,
          event_date: "November 1st, 2025",
          check_in: false
        }),
        registration: {
          tracking_number: registrationData.tracking_number,
          school_name: registrationData.school_name,
          contact_name: registrationData.contact_name,
          contact_phone: registrationData.contact_phone,
          total_amount: registrationData.total_amount,
          participants: [participant] // Only this participant
        }
      };

      const pdfUrl = await generateTicketPDF(individualTicketData);
      
      // Create download link
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `CHAF-Ticket-${participant.name.replace(/\s+/g, '-')}-${trackingNumber}.pdf`;
      link.click();
      
      // Clean up URL
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);
      
      toast({
        title: "Ticket Downloaded",
        description: `Individual ticket for ${participant.name} has been downloaded.`,
      });
    } catch (error) {
      console.error('Download individual ticket error:', error);
      toast({
        title: "Download Failed",
        description: `Failed to download ticket for ${participant.name}`,
        variant: "destructive"
      });
    }
  };

  const getTotalTicketsForCategory = (categoryId: string) => {
    const studentTickets = registration?.participants.filter(p => p.category_id === categoryId).length || 0;
    const customTicketsForCategory = customTickets.filter(t => t.category_id === categoryId).length;
    return studentTickets + customTicketsForCategory;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-destructive">Access Denied</h3>
            <p className="text-muted-foreground mt-2">Registration not found or payment not verified.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const registeredCategories = getRegisteredCategories();

  return (
    <div className="min-h-screen overflow-x-hidden max-w-full">
      <div className="container mx-auto px-4 py-8 max-w-6xl overflow-x-hidden">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <School className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-primary">{registration.school_name}</h1>
              <p className="text-muted-foreground">Dashboard - {registration.tracking_number}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Categories</p>
                    <p className="font-semibold">{registeredCategories.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Students</p>
                    <p className="font-semibold">{registration.participants.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Ticket className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Tickets</p>
                    <p className="font-semibold">{registeredCategories.length * 8}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tickets">Ticket Management</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6">
              {/* Competition Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Registered Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {registeredCategories.map((category) => (
                      <div key={category.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-lg">{category.name}</h4>
                          <Badge variant="outline">
                            {category.registered_participants.length}/{category.max_participants} participants
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Student Tickets:</span>
                            <span>{category.registered_participants.length}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Teacher Tickets (Default):</span>
                            <span>2</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Additional/Visitor Tickets:</span>
                            <span>{8 - category.registered_participants.length - 2}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm font-semibold border-t pt-2">
                            <span>Total Tickets:</span>
                            <span>8</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Event Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-semibold">Event Date</div>
                        <div className="text-sm text-muted-foreground">November 1st, 2025</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>• Venue and time details will be announced soon</p>
                      <p>• Download individual tickets for each participant below</p>
                      <p>• Keep your tracking number for reference</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tickets">
            <div className="grid gap-6">
              {/* Custom Ticket Creation */}
              <Card>
                <CardHeader>
                  <CardTitle>Create Additional Tickets</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Add tickets for teachers and visitors (2 teachers + remaining as visitors per category)
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="w-full">
                      <Label htmlFor="ticketName" className="text-sm">Name</Label>
                      <Input
                        id="ticketName"
                        value={newTicketName}
                        onChange={(e) => setNewTicketName(e.target.value)}
                        placeholder="Enter name"
                        className="w-full"
                      />
                    </div>
                    
                    <div className="w-full">
                      <Label htmlFor="ticketRole" className="text-sm">Role</Label>
                      <Select value={newTicketRole} onValueChange={(value: 'Teacher' | 'Visitor') => setNewTicketRole(value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Teacher">Teacher</SelectItem>
                          <SelectItem value="Visitor">Visitor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="w-full">
                      <Label htmlFor="ticketCategory" className="text-sm">Category</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {registeredCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name} ({getAvailableTicketsForCategory(category.id)} left)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="w-full flex items-end">
                      <Button onClick={addCustomTicket} className="w-full" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Ticket
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Custom Tickets List */}
              {customTickets.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Custom Tickets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {customTickets.map((ticket, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <div>
                              <p className="font-medium">{ticket.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {ticket.role} • {categories.find(c => c.id === ticket.category_id)?.name}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => downloadCustomTicket(ticket, index)}
                              disabled={isGenerating}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeCustomTicket(index)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Ticket Summary by Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Ticket Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {registeredCategories.map((category) => (
                      <div key={category.id} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-3">{category.name}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Student participants:</span>
                            <span>{category.registered_participants.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Custom tickets:</span>
                            <span>{customTickets.filter(t => t.category_id === category.id).length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Available tickets:</span>
                            <span>{getAvailableTicketsForCategory(category.id)}</span>
                          </div>
                          <div className="flex justify-between font-semibold border-t pt-2">
                            <span>Total used:</span>
                            <span>{getTotalTicketsForCategory(category.id)} / 8</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="participants">
            <Card>
              <CardHeader>
                <CardTitle>Registered Participants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {registeredCategories.map((category) => (
                    <div key={category.id}>
                      <h4 className="font-semibold text-lg mb-3 flex items-center">
                        <BookOpen className="w-5 h-5 mr-2" />
                        {category.name}
                        <Badge variant="outline" className="ml-2">
                          {category.registered_participants.length} participants
                        </Badge>
                      </h4>
                      
                      <div className="grid gap-2">
                        {category.registered_participants.map((participant, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <UserPlus className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{participant.name}</p>
                                <p className="text-sm text-muted-foreground">{participant.class}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary">Student</Badge>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => downloadIndividualTicket(participant, registration)}
                                disabled={isGenerating}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download Ticket
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SchoolDashboard;