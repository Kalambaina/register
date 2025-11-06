import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Minus, Users, School, Award, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRegistration } from "@/hooks/useRegistration";
import { supabase } from "@/integrations/supabase/client";

interface Participant {
  name: string;
  class: string;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  fee: number;
  max_participants: number;
  description: string;
}

interface RegistrationFormProps {
  onRegistrationComplete?: (data: { trackingNumber: string; totalAmount: number; registrationId: string }) => void;
}

const RegistrationForm = ({ onRegistrationComplete }: RegistrationFormProps) => {
  const { toast } = useToast();
  const { submitRegistration, isSubmitting } = useRegistration();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [participants, setParticipants] = useState<Record<string, Participant[]>>({});
  const [formData, setFormData] = useState({
    schoolName: "",
    contactName: "",
    contactPhone: "",
    comments: "",
  });
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<{
    trackingNumber?: string;
    totalAmount?: number;
  } | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      toast({
        title: "Error loading categories",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setCategories(data || []);
    }
  };

  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryId]);
      // Initialize participants array for this category
      setParticipants(prev => ({
        ...prev,
        [categoryId]: [{ name: "", class: "", categoryId }]
      }));
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
      // Remove participants for this category
      setParticipants(prev => {
        const newParticipants = { ...prev };
        delete newParticipants[categoryId];
        return newParticipants;
      });
    }
  };

  const addParticipant = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const currentParticipants = participants[categoryId] || [];
    if (currentParticipants.length >= category.max_participants) {
      toast({
        title: "Maximum participants reached",
        description: `${category.name} allows maximum ${category.max_participants} participants.`,
        variant: "destructive"
      });
      return;
    }

    setParticipants(prev => ({
      ...prev,
      [categoryId]: [
        ...(prev[categoryId] || []),
        { name: "", class: "", categoryId }
      ]
    }));
  };

  const removeParticipant = (categoryId: string, index: number) => {
    setParticipants(prev => ({
      ...prev,
      [categoryId]: prev[categoryId].filter((_, i) => i !== index)
    }));
  };

  const updateParticipant = (categoryId: string, index: number, field: keyof Participant, value: string) => {
    setParticipants(prev => ({
      ...prev,
      [categoryId]: prev[categoryId].map((p, i) => 
        i === index ? { ...p, [field]: value } : p
      )
    }));
  };

  const getTotalAmount = () => {
    return selectedCategories.length * 100000;
  };

  const getAllParticipants = () => {
    return Object.values(participants).flat();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.schoolName || !formData.contactName || !formData.contactPhone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (selectedCategories.length === 0) {
      toast({
        title: "No Categories Selected",
        description: "Please select at least one competition category.",
        variant: "destructive"
      });
      return;
    }

    // Validate participants for each category
    for (const categoryId of selectedCategories) {
      const categoryParticipants = participants[categoryId] || [];
      const category = categories.find(c => c.id === categoryId);
      
      if (categoryParticipants.length === 0) {
        toast({
          title: "Missing Participants",
          description: `Please add at least one participant for ${category?.name}.`,
          variant: "destructive"
        });
        return;
      }

      const incompleteParticipants = categoryParticipants.some(p => !p.name.trim() || !p.class.trim());
      if (incompleteParticipants) {
        toast({
          title: "Incomplete Participant Information",
          description: `Please fill in all participant names and classes for ${category?.name}.`,
          variant: "destructive"
        });
        return;
      }
    }

    // Submit registration
    const allParticipants = getAllParticipants();
    const result = await submitRegistration({
      ...formData,
      participants: allParticipants,
      selectedCategories,
      paymentMethod: 'bank_transfer' as const
    });
    
    if (result.success) {
      if (onRegistrationComplete) {
        onRegistrationComplete({
          trackingNumber: result.trackingNumber!,
          totalAmount: result.totalAmount!,
          registrationId: result.registrationId!
        });
      } else {
        // Fallback for when used standalone
        setRegistrationResult({
          trackingNumber: result.trackingNumber,
          totalAmount: result.totalAmount
        });
        setIsRegistrationComplete(true);
      }
    }
  };

  const handleRegisterAgain = () => {
    setIsRegistrationComplete(false);
    setRegistrationResult(null);
    setSelectedCategories([]);
    setParticipants({});
    setFormData({
      schoolName: "",
      contactName: "",
      contactPhone: "",
      comments: "",
    });
  };

  if (isRegistrationComplete && registrationResult) {
    return (
      <section id="register" className="py-20 bg-gradient-to-b from-background to-accent/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 text-center">
                <CardTitle className="flex items-center justify-center space-x-2 text-2xl text-primary">
                  <Award className="w-6 h-6" />
                  <span>Registration Successful!</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-primary mb-2">Your Tracking Number</h3>
                  <div className="bg-accent/30 p-4 rounded-lg">
                    <code className="text-2xl font-bold text-primary">{registrationResult.trackingNumber}</code>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Save this number to track your registration status
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-primary mb-2">Total Amount</h3>
                  <div className="text-3xl font-bold text-primary">₦{registrationResult.totalAmount?.toLocaleString()}</div>
                </div>

                <div className="bg-accent/30 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-primary mb-2">Next Steps:</h4>
                  <p className="text-sm text-muted-foreground">
                    Please make your payment using bank transfer and then use the tracking section above to check your payment status.
                  </p>
                </div>

                <Button 
                  onClick={handleRegisterAgain}
                  className="bg-primary hover:bg-primary-light text-primary-foreground"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Register Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="register" className="py-20 bg-gradient-to-b from-background to-accent/20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">Register Your School</h2>
            <p className="text-xl text-muted-foreground">
              Complete the registration form below to secure your school's participation in this prestigious event.
            </p>
          </div>

          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardTitle className="flex items-center space-x-2 text-2xl text-primary">
                <School className="w-6 h-6" />
                <span>School Registration Form</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* School Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-primary border-b border-border pb-2">
                    School Information
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="schoolName">School Name *</Label>
                      <Input
                        id="schoolName"
                        value={formData.schoolName}
                        onChange={(e) => setFormData(prev => ({ ...prev, schoolName: e.target.value }))}
                        placeholder="Enter your school name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Contact Person Name *</Label>
                      <Input
                        id="contactName"
                        value={formData.contactName}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                        placeholder="Contact person's full name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="contactPhone">Contact Phone Number *</Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                        placeholder="+234 XXX XXX XXXX"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Competition Categories */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-primary border-b border-border pb-2">
                    Competition Categories
                  </h3>
                  
                  <div className="grid md:grid-cols-1 gap-4">
                    {categories.map((category) => (
                      <Card key={category.id} className="p-4 bg-accent/30">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={(checked) => handleCategoryToggle(category.id, !!checked)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <Label htmlFor={`category-${category.id}`} className="text-lg font-semibold text-primary">
                                {category.name}
                              </Label>
                              <span className="text-lg font-bold text-primary">₦{category.fee.toLocaleString()}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {category.description}
                            </p>
                            <p className="text-sm text-primary mt-1 font-medium">
                              Maximum {category.max_participants} participants • 8 tickets included per category
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {selectedCategories.length > 0 && (
                    <div className="bg-accent/30 p-4 rounded-lg">
                      <div className="flex justify-between items-center text-lg font-semibold">
                        <span>Total for {selectedCategories.length} categor{selectedCategories.length !== 1 ? 'ies' : 'y'}:</span>
                        <span className="text-2xl text-primary">₦{getTotalAmount().toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Participants for each selected category */}
                {selectedCategories.map((categoryId) => {
                  const category = categories.find(c => c.id === categoryId);
                  if (!category) return null;

                  return (
                    <div key={categoryId} className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-primary border-b border-border pb-2 flex-1">
                          {category.name} Participants
                        </h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addParticipant(categoryId)}
                          className="ml-4"
                          disabled={(participants[categoryId] || []).length >= category.max_participants}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Participant
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        {(participants[categoryId] || []).map((participant, index) => (
                          <Card key={index} className="p-4 bg-accent/50">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-primary" />
                                <span className="font-medium text-primary">Participant {index + 1}</span>
                              </div>
                              {(participants[categoryId] || []).length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeParticipant(categoryId, index)}
                                  className="text-destructive hover:bg-destructive/10"
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`participant-name-${categoryId}-${index}`}>Student Name</Label>
                                <Input
                                  id={`participant-name-${categoryId}-${index}`}
                                  value={participant.name}
                                  onChange={(e) => updateParticipant(categoryId, index, 'name', e.target.value)}
                                  placeholder="Enter student's full name"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`participant-class-${categoryId}-${index}`}>Class</Label>
                                <Input
                                  id={`participant-class-${categoryId}-${index}`}
                                  value={participant.class}
                                  onChange={(e) => updateParticipant(categoryId, index, 'class', e.target.value)}
                                  placeholder="e.g., SS2, JS3, Primary 5"
                                />
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Additional Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-primary border-b border-border pb-2">
                    Additional Information
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="comments">Comments (Optional)</Label>
                    <Textarea
                      id="comments"
                      value={formData.comments}
                      onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                      placeholder="Any special requirements or additional information..."
                      rows={4}
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={isSubmitting || selectedCategories.length === 0}
                    className="w-full bg-primary hover:bg-primary-light text-primary-foreground py-3 text-lg font-semibold disabled:opacity-50"
                  >
                    {isSubmitting ? "Processing Registration..." : "Complete Registration"}
                  </Button>
                  
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    After submitting this form, you'll receive your tracking number and payment instructions.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default RegistrationForm;