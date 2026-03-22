import DashboardLayout from "@/components/DashboardLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

const monthlyData = [
  { month: "Jan", cgst: 12000, sgst: 12000, igst: 5000 },
  { month: "Feb", cgst: 14000, sgst: 14000, igst: 6000 },
  { month: "Mar", cgst: 11000, sgst: 11000, igst: 4500 },
  { month: "Apr", cgst: 16000, sgst: 16000, igst: 7000 },
  { month: "May", cgst: 15000, sgst: 15000, igst: 6500 },
  { month: "Jun", cgst: 18500, sgst: 18500, igst: 8230 },
];

const complianceData = [
  { month: "Jan", score: 88 },
  { month: "Feb", score: 90 },
  { month: "Mar", score: 87 },
  { month: "Apr", score: 92 },
  { month: "May", score: 91 },
  { month: "Jun", score: 94 },
];

export default function Analytics() {
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [complianceData, setComplianceData] = useState<any[]>([]);

  useEffect(() => {

  const fetchAnalytics = async () => {

    const snapshot = await getDocs(collection(db,"invoices"));

    const monthMap:any = {};
    const complianceTrend:any[] = [];

    snapshot.forEach((doc) => {

      const data = doc.data();

      const date = data.uploadedAt ? data.uploadedAt.toDate() : null;

      if(!date) return;

      const month = date.toLocaleString("default",{month:"short"});

      if(!monthMap[month]){
        monthMap[month] = {month,cgst:0,sgst:0,igst:0};
      }

      const gst = data.totalGST || 0;

      monthMap[month].cgst += gst * 0.5;
      monthMap[month].sgst += gst * 0.5;
      monthMap[month].igst += gst * 0.1;

    });

    const monthly = Object.values(monthMap);

    setMonthlyData(
    monthly.sort(
    (a:any,b:any)=> new Date(a.month+" 1").getMonth() - new Date(b.month+" 1").getMonth()
    )
  );

    const compliance = monthly.map((m:any,index:number)=>({
      month:m.month,
      score:90 + index
    }));

    setComplianceData(compliance);

  };

  fetchAnalytics();

},[]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm">Detailed GST analytics and trends</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border/50 bg-card p-5 shadow-card">
            <h3 className="font-semibold mb-4">Monthly GST Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220, 9%, 46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 9%, 46%)" />
                <Tooltip />
                <Bar dataKey="cgst" fill="hsl(239, 84%, 67%)" radius={[4, 4, 0, 0]} name="CGST" />
                <Bar dataKey="sgst" fill="hsl(187, 92%, 44%)" radius={[4, 4, 0, 0]} name="SGST" />
                <Bar dataKey="igst" fill="hsl(260, 80%, 60%)" radius={[4, 4, 0, 0]} name="IGST" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-5 shadow-card">
            <h3 className="font-semibold mb-4">Compliance Score Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={complianceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220, 9%, 46%)" />
                <YAxis domain={[80, 100]} tick={{ fontSize: 12 }} stroke="hsl(220, 9%, 46%)" />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="hsl(152, 69%, 41%)" fill="hsl(152, 69%, 41%)" fillOpacity={0.1} strokeWidth={2} name="Score" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
