import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Application } from "@shared/schema";
import { Mail } from "lucide-react";

interface EmailTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  application?: Application;
}

const emailFormSchema = z.object({
  to: z.string().email("Please enter a valid email address"),
  from: z.string().email("Please enter a valid sender email address"),
  emailType: z.enum(["reminder", "interview", "summary"]),
});

type EmailFormData = z.infer<typeof emailFormSchema>;

export function EmailTestModal({ isOpen, onClose, application }: EmailTestModalProps) {
  const { toast } = useToast();
  
  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      to: "",
      from: "",
      emailType: "reminder",
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (data: EmailFormData) => {
      let endpoint = "";
      const emailData = { to: data.to, from: data.from };
      
      switch (data.emailType) {
        case "reminder":
          if (!application) throw new Error("Application required for reminder email");
          endpoint = `/api/emails/reminder/${application.id}`;
          break;
        case "interview":
          if (!application) throw new Error("Application required for interview email");
          endpoint = `/api/emails/interview/${application.id}`;
          break;
        case "summary":
          endpoint = "/api/emails/summary";
          break;
      }
      
      return apiRequest("POST", endpoint, emailData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Email sent successfully!",
      });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send email",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EmailFormData) => {
    sendEmailMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Test Email Integration
          </DialogTitle>
          <DialogDescription>
            Send a test email to verify your SendGrid integration is working.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="from"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="your-verified-email@example.com" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-gray-500">
                    Must be a verified sender address in your SendGrid account
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="recipient@example.com" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emailType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select email type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {application && (
                        <>
                          <SelectItem value="reminder">Application Reminder</SelectItem>
                          <SelectItem value="interview">Interview Reminder</SelectItem>
                        </>
                      )}
                      <SelectItem value="summary">Weekly Summary</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {application && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Selected Application:
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {application.position} at {application.companyName}
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={sendEmailMutation.isPending}
              >
                {sendEmailMutation.isPending ? "Sending..." : "Send Test Email"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}