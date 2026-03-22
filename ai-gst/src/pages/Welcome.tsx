import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Upload, Database, BarChart3, ArrowRight } from "lucide-react";


const options = [
  {
    icon: Upload,
    title: "Upload GST Invoices",
    description: "Start by uploading your invoices for AI analysis",
    route: "/dashboard/upload",
  },
  {
    icon: Database,
    title: "Import Previous Data",
    description: "Bring in your existing GST data and records",
    route: "/dashboard/upload",
  },
  {
    icon: BarChart3,
    title: "Explore Demo Dashboard",
    description: "See Easy GST in action with sample data",
    route: "/dashboard",
  },
];

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">Welcome to Easy GST! 🎉</h1>
        <p className="text-muted-foreground text-lg mb-10">What would you like to do?</p>

        <div className="grid gap-4">
          {options.map((option) => (
            <button
              key={option.title}
              onClick={() => navigate(option.route)}
              className="group flex items-center gap-4 rounded-xl border border-border/50 bg-card p-5 text-left shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all duration-200"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg gradient-primary">
                <option.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{option.title}</h3>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
