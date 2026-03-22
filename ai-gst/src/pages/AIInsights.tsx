import DashboardLayout from "@/components/DashboardLayout";
import { Brain, TrendingUp, AlertTriangle, Info, CheckCircle, Lightbulb } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";

const typeStyles = {
  success: { bg: "bg-success/5 border-success/20", iconColor: "text-success" },
  warning: { bg: "bg-warning/5 border-warning/20", iconColor: "text-warning" },
  info: { bg: "bg-info/5 border-info/20", iconColor: "text-info" },
};

export default function AIInsights() {
  const [insights,setInsights] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {

const fetchInsights = async () => {
  let totalGST = 0;
 let totalAmount = 0;
 let invoiceCount = 0;

 const snapshot = await getDocs(collection(db,"invoices"));



 snapshot.forEach((doc)=>{
   const data = doc.data();

   totalGST += data.totalGST || 0;
   totalAmount += data.totalAmount || 0;
   invoiceCount += 1;
 });

 const gstPercent = totalAmount > 0 ? (totalGST / totalAmount) * 100 : 0;
 const avgGST = invoiceCount > 0 ? totalGST / invoiceCount : 0;

 const aiInsights:any[] = [];


aiInsights.push({
  icon: Info,
  type: "info",
  title: "GST Percentage Analysis",
  description: `GST accounts for ${gstPercent.toFixed(2)}% of your total invoice value.`,
  action: "View Analytics"
});

aiInsights.push({
  icon: TrendingUp,
  type:"info",
  title:"Average GST Per Invoice",
  description:`Average GST per invoice is ₹${avgGST.toFixed(0)}.`,
  action:"View Analytics"
});

 // GST liability insight
 if(totalGST > 0){
   aiInsights.push({
     icon: TrendingUp,
     type: "info",
     title: "GST Liability Detected",
     description: `Your current GST liability is ₹${totalGST.toLocaleString()}. Monitor tax planning accordingly.`,
     action: "View Trend"
   });
 }

 // ITC opportunity
 if(totalGST > 50000){
   aiInsights.push({
     icon: CheckCircle,
     type: "success",
     title: "Input Tax Credit Opportunity",
     description: "You may claim additional ITC to reduce GST liability.",
     action: "Review Invoices"
   });
 }

 // GST ratio anomaly
const gstRatio = totalAmount > 0 ? totalGST / totalAmount : 0;

 if(gstRatio > 0.25){
   aiInsights.push({
     icon: AlertTriangle,
     type: "warning",
     title: "GST Ratio Warning",
     description: "GST appears unusually high compared to invoice values.",
     action: "View Details"
   });
 }

 if(aiInsights.length === 0){
 aiInsights.push({
   icon: Info,
   type:"info",
   title:"No AI Insights Yet",
   description:"Upload more invoices to generate AI insights.",
   action:"Upload Invoices"
 });
}

 // high activity
 if(invoiceCount > 10){
   aiInsights.push({
     icon: Lightbulb,
     type: "success",
     title: "High Invoice Activity",
     description: `You processed ${invoiceCount} invoices recently.`,
     action: "View Analysis"
   });
 }

 // filing reminder
 if(invoiceCount > 0){
   aiInsights.push({
     icon: Info,
     type: "info",
     title: "GST Filing Reminder",
     description: "Ensure all invoices are verified before filing GST returns.",
     action: "Prepare Filing"
   });
 }

 setInsights(aiInsights);

};

fetchInsights();

},[]);
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Insights</h1>
            <p className="text-muted-foreground text-sm">Smart recommendations powered by AI</p>
          </div>
        </div>
        <div className="space-y-4">
          {insights.map((insight, i) => {
            const style = typeStyles[insight.type as keyof typeof typeStyles];
            return (
              <div key={i} className={`rounded-xl border p-5 ${style.bg} transition-all hover:shadow-card`}>
                <div className="flex items-start gap-4">
                  <insight.icon className={`h-5 w-5 mt-0.5 shrink-0 ${style.iconColor}`} />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{insight.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
                  </div>
                  <button
                    onClick={()=>{
                     if(insight.action === "View Trend"){
                      navigate("/dashboard/analytics");
                    }

                    if(insight.action === "Review Invoices"){
                      navigate("/dashboard/upload");
                    }

                    if(insight.action === "Prepare Filing"){
                      navigate("/dashboard/reports");
                    }

                    if(insight.action === "View Analysis"){
                      navigate("/dashboard/analytics");
                    }

                    if(insight.action === "Upload Invoices"){
                      navigate("/dashboard/upload");
                    }
                    }}
                    className="text-sm font-medium text-primary hover:underline shrink-0"
                    >
                    {insight.action}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
