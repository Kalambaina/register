import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import IndividualPaymentModal from "./IndividualPaymentModal";
import { supabase } from "@/integrations/supabase/client";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
  "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
  "Yobe", "Zamfara"
];

const formSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  phoneNumber: z.string().regex(/^[0-9]{11}$/, "Phone number must be 11 digits"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  gender: z.enum(["Male", "Female"], { required_error: "Please select your gender" }),
  state: z.string().min(1, "Please select your state"),
  lga: z.string().min(2, "Please enter your local government"),
  comments: z.string().optional()
});

type FormData = z.infer<typeof formSchema>;

const IndividualRegistrationForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [registrationData, setRegistrationData] = useState<{
    trackingNumber: string;
    amount: number;
  } | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      gender: undefined,
      state: "",
      lga: "",
      comments: ""
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // Check for duplicate phone number
      const { data: existingReg, error: checkError } = await supabase
        .from('individual_registrations')
        .select('tracking_number, full_name')
        .eq('phone_number', data.phoneNumber)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingReg) {
        toast({
          title: "Account Already Exists",
          description: `An account with this phone number already exists. Your tracking number is: ${existingReg.tracking_number}`,
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Generate tracking number
      const { data: trackingResult, error: trackingError } = await supabase
        .rpc('generate_tracking_number');

      if (trackingError) {
        throw new Error(`Failed to generate tracking number: ${trackingError.message}`);
      }

      // Create individual registration
      const { data: registration, error: regError } = await supabase
        .from('individual_registrations')
        .insert({
          tracking_number: trackingResult,
          full_name: data.fullName,
          phone_number: data.phoneNumber,
          email: data.email || null,
          gender: data.gender,
          state: data.state,
          lga: data.lga,
          comments: data.comments || null,
          payment_status: 'pending',
          admin_verified: false,
          amount: 3000
        })
        .select()
        .single();

      if (regError) {
        throw new Error(`Failed to create registration: ${regError.message}`);
      }

      toast({
        title: "Registration Successful!",
        description: `Your tracking number is: ${trackingResult}`,
      });

      setRegistrationData({
        trackingNumber: trackingResult,
        amount: 3000
      });
      setShowPaymentModal(true);
      form.reset();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Register as Participant</CardTitle>
          <CardDescription>
            Fill in your details to register for the event. Registration fee: ₦3,000
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="08012345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address (Optional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[200px]">
                        {NIGERIAN_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lga"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local Government *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your LGA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comments (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional information or special requests"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Register Now
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {registrationData && (
        <IndividualPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          trackingNumber={registrationData.trackingNumber}
          amount={registrationData.amount}
        />
      )}
    </>
  );
};

export default IndividualRegistrationForm;
