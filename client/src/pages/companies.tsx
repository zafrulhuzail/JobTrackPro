import { useQuery } from "@tanstack/react-query";
import { Application } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building, MapPin, Briefcase } from "lucide-react";

export default function Companies() {
  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  // Group applications by company
  const companiesData = applications.reduce((acc, app) => {
    if (!acc[app.companyName]) {
      acc[app.companyName] = {
        name: app.companyName,
        applications: [],
        locations: new Set<string>(),
        departments: new Set<string>(),
      };
    }
    acc[app.companyName].applications.push(app);
    if (app.location) acc[app.companyName].locations.add(app.location);
    if (app.department) acc[app.companyName].departments.add(app.department);
    return acc;
  }, {} as Record<string, any>);

  const companies = Object.values(companiesData);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Companies</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overview of companies you've applied to
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Companies</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Overview of companies you've applied to
        </p>
      </div>

      {companies.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No companies yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Start by adding your first job application to see companies here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Card key={company.name} className="bg-white dark:bg-gray-800">
              <CardHeader className="pb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-4">
                    <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                      {company.name}
                    </CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {company.applications.length} application{company.applications.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Locations */}
                {company.locations.size > 0 && (
                  <div className="flex items-center mb-3">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {Array.from(company.locations).join(", ")}
                    </span>
                  </div>
                )}

                {/* Departments */}
                {company.departments.size > 0 && (
                  <div className="flex items-center mb-4">
                    <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {Array.from(company.departments).join(", ")}
                    </span>
                  </div>
                )}

                {/* Application Status Badges */}
                <div className="flex flex-wrap gap-2">
                  {company.applications.map((app: Application) => (
                    <Badge
                      key={app.id}
                      variant="outline"
                      className="text-xs"
                    >
                      {app.position} - {app.status}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}