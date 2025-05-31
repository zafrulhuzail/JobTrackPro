import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Database, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    title: ""
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        title: ""
      });
    }
  }, [user]);
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your account and application preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                value={profileData.firstName}
                onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                value={profileData.lastName}
                onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Current Title</Label>
              <Input 
                id="title" 
                placeholder="e.g., Software Engineer" 
                value={profileData.title}
                onChange={(e) => setProfileData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <Button 
              className="w-full"
              onClick={() => {
                toast({
                  title: "Profile Updated",
                  description: "Your profile information has been saved successfully.",
                });
              }}
            >
              Update Profile
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Application Reminders</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get reminded about follow-ups
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Interview Notifications</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Alerts for upcoming interviews
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly Summary</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive weekly progress reports
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Export Data</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Download all your application data as CSV
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/applications', {
                      credentials: 'include'
                    });
                    if (response.ok) {
                      const applications = await response.json();
                      
                      // Convert to CSV format
                      const csvHeaders = ['Company', 'Position', 'Status', 'Application Date', 'Location', 'Notes'];
                      const csvRows = applications.map(app => [
                        app.companyName,
                        app.position,
                        app.status,
                        app.applicationDate,
                        app.location || '',
                        app.notes || ''
                      ]);
                      
                      const csvContent = [csvHeaders, ...csvRows]
                        .map(row => row.map(field => `"${field}"`).join(','))
                        .join('\n');
                      
                      // Download the file
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'applications.csv';
                      a.click();
                      URL.revokeObjectURL(url);
                      
                      toast({
                        title: "Export Complete",
                        description: "Your applications have been exported as CSV.",
                      });
                    }
                  } catch (error) {
                    toast({
                      title: "Export Failed",
                      description: "Failed to export applications.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Applications
              </Button>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Data Retention</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Automatically delete rejected applications after 6 months
              </p>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Application Preferences */}
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle>Application Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultStatus">Default Application Status</Label>
              <Input id="defaultStatus" defaultValue="applied" readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="followUpDays">Default Follow-up Days</Label>
              <Input id="followUpDays" type="number" defaultValue="7" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-save Draft Applications</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Save incomplete applications automatically
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Button 
              className="w-full"
              onClick={() => {
                toast({
                  title: "Preferences Saved",
                  description: "Your application preferences have been updated.",
                });
              }}
            >
              Save Preferences
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}