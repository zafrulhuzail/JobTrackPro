import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Briefcase, 
  Building, 
  Calendar, 
  Settings, 
  User 
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3, current: true },
  { name: "Applications", href: "/applications", icon: Briefcase, current: false },
  { name: "Companies", href: "/companies", icon: Building, current: false },
  { name: "Interviews", href: "/interviews", icon: Calendar, current: false },
  { name: "Settings", href: "/settings", icon: Settings, current: false },
];

export function Sidebar() {
  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">JobTracker</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  item.current
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </a>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">John Doe</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">john@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
