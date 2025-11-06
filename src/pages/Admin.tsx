import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, 
  Download, 
  Users, 
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  ScanLine,
  UserCheck
} from "lucide-react";
import QRScanner from "@/components/QRScanner";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface IndividualRegistration {
  id: string;
  tracking_number: string;
  full_name: string;
  phone_number: string;
  email: string;
  gender: string;
  state: string;
  lga: string;
  payment_status: string;
  admin_verified: boolean;
  amount: number;
  created_at: string;
  checked_in?: boolean;
  checked_in_at?: string;
  checked_in_by?: string;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [individualRegistrations, setIndividualRegistrations] = useState<IndividualRegistration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<IndividualRegistration[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    paid: 0,
    totalRevenue: 0,
    checkedIn: 0
  });

  useEffect(() => {
    fetchIndividualRegistrations();
  }, []);

  useEffect(() => {
    filterRegistrations();
  }, [individualRegistrations, searchQuery]);

  useEffect(() => {
    calculateStats();
  }, [individualRegistrations]);

  // Auto-open scanner if coming from ticket validation
  useEffect(() => {
    if (location.state?.openScanner) {
      setShowScanner(true);
    }
  }, [location.state]);

  const fetchIndividualRegistrations = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('individual_registrations')
        .select(`
          *,
          individual_tickets (
            checked_in,
            checked_in_at,
            checked_in_by
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Flatten the data structure
      const flattenedData = (data || []).map(reg => ({
        ...reg,
        checked_in: reg.individual_tickets?.[0]?.checked_in || false,
        checked_in_at: reg.individual_tickets?.[0]?.checked_in_at,
        checked_in_by: reg.individual_tickets?.[0]?.checked_in_by,
        individual_tickets: undefined // Remove nested object
      }));

      setIndividualRegistrations(flattenedData);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch registrations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterRegistrations = () => {
    let filtered = individualRegistrations;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(reg => 
        reg.full_name.toLowerCase().includes(query) ||
        reg.tracking_number.toLowerCase().includes(query) ||
        reg.phone_number.includes(query)
      );
    }

    setFilteredRegistrations(filtered);
  };

  const calculateStats = () => {
    const total = individualRegistrations.length;
    const verified = individualRegistrations.filter(r => r.admin_verified).length;
    const pending = individualRegistrations.filter(r => r.payment_status === 'awaiting_verification').length;
    const paid = individualRegistrations.filter(r => r.payment_status === 'paid').length;
    const checkedIn = individualRegistrations.filter(r => r.checked_in === true).length;
    const totalRevenue = individualRegistrations
      .filter(r => r.payment_status === 'paid')
      .reduce((sum, r) => sum + r.amount, 0);

    setStats({ total, verified, pending, paid, totalRevenue, checkedIn });
  };

  const exportToCSV = (statusFilter?: string) => {
    let dataToExport = filteredRegistrations;
    
    // Apply status filter if provided
    if (statusFilter === 'verified') {
      dataToExport = dataToExport.filter(r => r.admin_verified && r.payment_status === 'paid');
    } else if (statusFilter === 'pending') {
      dataToExport = dataToExport.filter(r => r.payment_status === 'awaiting_verification');
    } else if (statusFilter === 'unpaid') {
      dataToExport = dataToExport.filter(r => r.payment_status === 'pending');
    }

    const headers = [
      'Tracking Number',
      'Full Name',
      'Phone Number',
      'Email',
      'Gender',
      'State',
      'LGA',
      'Payment Status',
      'Admin Verified',
      'Amount',
      'Registration Date',
      'Checked In',
      'Check-In Time',
      'Checked In By'
    ];

    const csvData = dataToExport.map(reg => [
      reg.tracking_number,
      reg.full_name,
      reg.phone_number,
      reg.email || 'N/A',
      reg.gender,
      reg.state,
      reg.lga,
      reg.payment_status,
      reg.admin_verified ? 'Yes' : 'No',
      reg.amount,
      new Date(reg.created_at).toLocaleDateString(),
      reg.checked_in ? 'Yes' : 'No',
      reg.checked_in_at ? new Date(reg.checked_in_at).toLocaleString() : 'N/A',
      reg.checked_in_by || 'N/A'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filterLabel = statusFilter ? `-${statusFilter}` : '';
    link.download = `chaf-individual-registrations${filterLabel}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `${dataToExport.length} registrations exported to CSV`,
    });
  };

  const verifyPayment = async (registrationId: string, verify: boolean) => {
    try {
      const { error } = await supabase
        .from('individual_registrations')
        .update({ 
          payment_status: verify ? 'paid' : 'pending',
          admin_verified: verify
        })
        .eq('id', registrationId);

      if (error) throw error;

      await fetchIndividualRegistrations();
      
      toast({
        title: verify ? "Payment Verified" : "Payment Rejected",
        description: verify 
          ? "Participant can now download their ticket" 
          : "Participant has been notified of rejection",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update payment status",
        variant: "destructive"
      });
    }
  };

  const getPaymentStatusBadge = (reg: IndividualRegistration) => {
    if (reg.admin_verified && reg.payment_status === 'paid') {
      return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
    } else if (reg.payment_status === 'awaiting_verification') {
      return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    } else {
      return <Badge variant="secondary">Not Paid</Badge>;
    }
  };

  const getCheckInBadge = (reg: IndividualRegistration) => {
    if (reg.checked_in) {
      return (
        <Badge className="bg-green-500">
          <CheckCircle className="w-3 h-3 mr-1" />
          Checked In
        </Badge>
      );
    } else {
      return <Badge variant="secondary">Not Checked In</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="border-b border-border bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-primary">CHAF Admin Dashboard</h1>
              <p className="text-muted-foreground text-sm md:text-base">Manage event registrations and verifications</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button onClick={() => setShowScanner(!showScanner)} variant="outline" size="sm">
                <ScanLine className="w-4 h-4 mr-2" />
                {showScanner ? 'Hide Scanner' : 'Scan Ticket'}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => exportToCSV()}>
                    All Registrations
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportToCSV('verified')}>
                    Verified Payments Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportToCSV('pending')}>
                    Pending Verifications
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportToCSV('unpaid')}>
                    Unpaid Only
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={fetchIndividualRegistrations} disabled={isLoading} size="sm">
                Refresh Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 overflow-x-hidden">
        {/* QR Scanner */}
        {showScanner && (
          <div className="mb-6">
            <QRScanner onScan={(data) => console.log('Scanned:', data)} />
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Verified</p>
                  <p className="text-2xl font-bold">{stats.verified}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Clock className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Paid</p>
                  <p className="text-2xl font-bold">{stats.paid}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">₦{stats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <UserCheck className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Checked In</p>
                  <p className="text-2xl font-bold">{stats.checkedIn}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, phone, or tracking number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registrations Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking #</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead className="hidden md:table-cell">Phone</TableHead>
                    <TableHead className="hidden lg:table-cell">State</TableHead>
                    <TableHead className="hidden lg:table-cell">LGA</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check-In</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        Loading registrations...
                      </TableCell>
                    </TableRow>
                  ) : filteredRegistrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        No registrations found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRegistrations.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell className="font-mono text-sm">{reg.tracking_number}</TableCell>
                        <TableCell className="font-medium">{reg.full_name}</TableCell>
                        <TableCell className="hidden md:table-cell">{reg.phone_number}</TableCell>
                        <TableCell className="hidden lg:table-cell">{reg.state}</TableCell>
                        <TableCell className="hidden lg:table-cell">{reg.lga}</TableCell>
                        <TableCell>₦{reg.amount.toLocaleString()}</TableCell>
                        <TableCell>{getPaymentStatusBadge(reg)}</TableCell>
                        <TableCell>{getCheckInBadge(reg)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {reg.payment_status === 'awaiting_verification' && !reg.admin_verified && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => verifyPayment(reg.id, true)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Verify
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => verifyPayment(reg.id, false)}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </>
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
      </div>
    </div>
  );
};

export default AdminDashboard;
