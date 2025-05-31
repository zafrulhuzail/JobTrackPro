import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { StatsCards } from "@/components/applications/stats-cards";
import { ApplicationTable } from "@/components/applications/application-table";
import { AddApplicationModal } from "@/components/applications/add-application-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

export default function Dashboard() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="ml-64">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Track your job applications and progress
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input 
                  type="text" 
                  className="w-64 pl-10" 
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Add Button */}
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Application
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          <StatsCards />
          <ApplicationTable searchQuery={searchQuery} />
        </main>
      </div>

      <AddApplicationModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}
