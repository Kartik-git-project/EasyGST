import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, Brain, FileText, Shield, Zap, CheckCircle } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description: "Get intelligent recommendations to optimize your GST filings and maximize Input Tax Credit.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Track GST trends, compliance scores, and financial health with interactive dashboards.",
  },
  {
    icon: FileText,
    title: "Invoice Processing",
    description: "Upload invoices in any format. Our AI extracts and categorizes GST data automatically.",
  },
  {
    icon: Shield,
    title: "Compliance Assurance",
    description: "Stay compliant with automated checks, mismatch detection, and filing reminders.",
  },
];

const stats = [
  { value: "10,000+", label: "Invoices Processed" },
  { value: "₹2.5Cr", label: "Tax Credit Claimed" },
  { value: "99.8%", label: "Accuracy Rate" },
  { value: "500+", label: "Businesses Trust Us" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Easy GST</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#stats" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Why Us</a>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
              Log in
            </Button>
            <Button variant="hero" size="sm" onClick={() => navigate("/login")}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(239_84%_67%/0.08),transparent_60%)]" />
        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-8 animate-fade-in">
              <Zap className="h-3.5 w-3.5" />
              AI-Powered GST Management
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Simplify GST with{" "}
              <span className="gradient-text">Easy GST</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              Automate GST return management, process invoices with AI, and gain actionable tax insights — all in one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <Button variant="hero" size="xl" onClick={() => navigate("/login")}>
                Get Started Free <ArrowRight className="ml-1 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need for GST</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              From invoice processing to compliance reports, Easy GST handles it all.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border/50 bg-card p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg gradient-primary mb-4">
                  <feature.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(239_84%_67%/0.08),transparent_60%)]" />
        <div className="container mx-auto px-6 relative text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to simplify your GST?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
            Join hundreds of businesses already using Easy GST to save time and maximize tax credits.
          </p>
          <Button variant="hero" size="xl" onClick={() => navigate("/login")}>
            Start <ArrowRight className="ml-1 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md gradient-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">Easy GST</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Easy GST. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
