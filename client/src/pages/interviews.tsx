import { useQuery } from "@tanstack/react-query";
import { Application } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Building, MapPin } from "lucide-react";
import { format } from "date-fns";

export default function Interviews() {
  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  // Filter applications with interview status
  const interviews = applications.filter(app => 
    app.status === "interview" || app.status === "screening"
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Interviews</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your upcoming interviews and screenings
          </p>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Interviews</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track your upcoming interviews and screenings
        </p>
      </div>

      {interviews.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No interviews scheduled
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              When you have interviews or screenings scheduled, they'll appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {interviews.map((interview) => (
            <Card key={interview.id} className="bg-white dark:bg-gray-800">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mr-4">
                      <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                        {interview.position}
                      </CardTitle>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        at {interview.companyName}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    className={
                      interview.status === "interview" 
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                    }
                  >
                    {interview.status === "interview" ? "Interview Scheduled" : "Phone Screening"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Location */}
                  {interview.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {interview.location}
                      </span>
                    </div>
                  )}

                  {/* Department */}
                  {interview.department && (
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {interview.department}
                      </span>
                    </div>
                  )}

                  {/* Application Date */}
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Applied {format(new Date(interview.applicationDate), "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                {interview.notes && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {interview.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}