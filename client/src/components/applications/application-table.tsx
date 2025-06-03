import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Application } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building, List, LayoutGrid } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { EditApplicationModal } from "./edit-application-modal";

const STATUS_COLORS = {
  applied: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  screening: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  interview: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
  offer: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
};

const STATUS_LABELS = {
  applied: "Applied",
  screening: "Phone Screening",
  interview: "Interview Scheduled",
  offer: "Offer Received",
  rejected: "Rejected",
};

interface ApplicationTableProps {
  searchQuery: string;
}

export function ApplicationTable({ searchQuery }: ApplicationTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "cards">(
    typeof window !== 'undefined' && window.innerWidth < 768 ? "cards" : "table"
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const { toast } = useToast();

  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const deleteApplicationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/applications/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Application deleted",
        description: "The application has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete application",
        variant: "destructive",
      });
    },
  });

  // Update application status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: number; newStatus: string }) => {
      const response = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Application status has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this application?")) {
      deleteApplicationMutation.mutate(id);
    }
  };

  const handleStatusUpdate = (id: number, newStatus: string) => {
    updateStatusMutation.mutate({ id, newStatus });
  };

  const handleEdit = (application: Application) => {
    setSelectedApplication(application);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedApplication(null);
  };

  // Filter applications based on search query and status
  const filteredApplications = applications.filter((application) => {
    const matchesSearch = !searchQuery || 
      application.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      application.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (application.location && application.location.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = !statusFilter || statusFilter === "all" || application.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800">
      {/* Table Header */}
      <div className="px-4 md:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Applications
          </h3>
          <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-3">
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="screening">Phone Screening</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 w-full md:w-auto">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="flex-1 md:flex-none px-3 py-1"
              >
                <List className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Table</span>
              </Button>
              <Button
                variant={viewMode === "cards" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("cards")}
                className="flex-1 md:flex-none px-3 py-1"
              >
                <LayoutGrid className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Cards</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-0">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No applications found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery || statusFilter 
                ? "Try adjusting your search or filter criteria"
                : "Get started by adding your first job application"
              }
            </p>
          </div>
        ) : viewMode === "table" ? (
          // Desktop Table View Only - force cards on mobile
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Last Update</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow key={application.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center mr-3">
                          <Building className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {application.companyName}
                          </div>
                          {application.location && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {application.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {application.position}
                      </div>
                      {application.department && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {application.department}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="p-0 h-auto">
                            <Badge className={STATUS_COLORS[application.status as keyof typeof STATUS_COLORS]}>
                              {STATUS_LABELS[application.status as keyof typeof STATUS_LABELS]}
                            </Badge>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(application.id, "applied")}>
                            Applied
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(application.id, "screening")}>
                            Phone Screening
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(application.id, "interview")}>
                            Interview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(application.id, "offer")}>
                            Offer
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(application.id, "rejected")}>
                            Rejected
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                      {application.applicationDate ? format(new Date(application.applicationDate), "MMM dd, yyyy") : "N/A"}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                      {application.lastUpdated ? format(new Date(application.lastUpdated), "MMM dd, yyyy") : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(application)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(application.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}

        {/* Mobile automatically uses cards OR when cards view is selected */}
        {(viewMode === "cards" || (viewMode === "table" && typeof window !== 'undefined' && window.innerWidth < 768)) && (
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredApplications.map((application) => (
                <Card key={application.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center mr-3">
                          <Building className="h-5 w-5 md:h-6 md:w-6 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white">
                            {application.companyName}
                          </h3>
                          {application.location && (
                            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                              {application.location}
                            </p>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="p-0 h-auto">
                            <Badge className={STATUS_COLORS[application.status as keyof typeof STATUS_COLORS]}>
                              {STATUS_LABELS[application.status as keyof typeof STATUS_LABELS]}
                            </Badge>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(application.id, "applied")}>
                            Applied
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(application.id, "screening")}>
                            Phone Screening
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(application.id, "interview")}>
                            Interview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(application.id, "offer")}>
                            Offer
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(application.id, "rejected")}>
                            Rejected
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm md:text-base font-medium text-gray-900 dark:text-white">
                          {application.position}
                        </h4>
                        {application.department && (
                          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                            {application.department}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex justify-between text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        <span>Applied: {application.applicationDate ? format(new Date(application.applicationDate), "MMM dd") : "N/A"}</span>
                        <span>Updated: {application.lastUpdated ? format(new Date(application.lastUpdated), "MMM dd") : "N/A"}</span>
                      </div>
                      
                      {application.notes && (
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {application.notes}
                        </p>
                      )}
                      
                      <div className="flex space-x-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEdit(application)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(application.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <EditApplicationModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        application={selectedApplication}
      />
    </Card>
  );
}