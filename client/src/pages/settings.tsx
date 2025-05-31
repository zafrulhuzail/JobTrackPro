import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Database, Download, Mail } from "lucide-react";
import { EmailTestModal } from "@/components/applications/email-test-modal";

export default function Settings() {
  const [emailModalOpen, setEmailModalOpen] = useState(false);

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
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Current Title</Label>
              <Input id="title" placeholder="e.g., Software Engineer" />
            </div>
            <Button className="w-full">Update Profile</Button>
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
              <Button variant="outline" className="w-full">
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

        {/* Email Integration */}
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Email Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>SendGrid Integration</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Test your SendGrid email configuration with various email types
              </p>
              <Button 
                onClick={() => setEmailModalOpen(true)}
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                Test Email Integration
              </Button>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Email Features Available</Label>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Application follow-up reminders</li>
                <li>• Interview scheduling notifications</li>
                <li>• Weekly progress summaries</li>
              </ul>
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
            <Button className="w-full">Save Preferences</Button>
          </CardContent>
        </Card>
      </div>

      <EmailTestModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
      />
    </div>
  );
}