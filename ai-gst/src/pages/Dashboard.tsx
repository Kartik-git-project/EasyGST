import DashboardLayout from "@/components/DashboardLayout";
import { TrendingUp, TrendingDown, FileText, Shield, Brain, ArrowRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { deleteDoc, doc } from "firebase/firestore";



export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [totalGST, setTotalGST] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const [trendData, setTrendData] = useState<any[]>([]);

  const [pieData,setPieData] = useState<any[]>([]);

  const [insights,setInsights] = useState<any[]>([]);

const [taxTips,setTaxTips] = useState<string>("");

  const [complianceScore,setComplianceScore] = useState(0);

const deleteInvoice = async (fileName:string) => {

  try {

    const snapshot = await getDocs(collection(db,"invoices"));

    const docsToDelete:any[] = [];

    snapshot.forEach((docSnap)=>{
      const data = docSnap.data();

      if(data.fileName === fileName){
        docsToDelete.push(docSnap.id);
      }
    });

    for(const id of docsToDelete){
      await deleteDoc(doc(db,"invoices",id));
    }

    fetchInvoices();

  } catch(error){
    console.error("Delete error:",error);
  }

};

  const stats = [
{
label: "Total GST Payable",
value: `₹${totalGST.toLocaleString()}`,
icon: TrendingUp
},
{
label: "Total Invoice Amount",
value: `₹${totalAmount.toLocaleString()}`,
icon: TrendingDown
},
{
label: "Invoices Processed",
value: invoiceCount,
icon: FileText
},
{
label: "Compliance Score",
value: `${complianceScore}%`,
icon: Shield
}
];


const generateAITaxTips = async (summary:any) => {

try{

console.log("API KEY:", import.meta.env.VITE_OPENROUTER_API_KEY);

const response = await fetch("https://openrouter.ai/api/v1/chat/completions",{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":`Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
"HTTP-Referer": window.location.origin,
"X-Title":"EasyGST"
},
body:JSON.stringify({
model:"anthropic/claude-3-sonnet",
messages:[
{
role:"system",
content:"You are a financial advisor helping Indian businesses reduce expenses and optimize GST."
},
{
role:"user",
content:`
Business Summary:

Total Invoices: ${summary.invoices}
Total GST Paid: ₹${summary.gst}
Total Invoice Amount: ₹${summary.amount}

Give 3 suggestions to reduce expenses and optimize taxes.
`
}
]
})
})


const data = await response.json();

console.log("AI Response:",data);

const aiText = data?.choices?.[0]?.message?.content;

if(aiText){
setTaxTips(aiText);
}else{
setTaxTips("AI suggestion unavailable");
}

}catch(error){

console.error("AI suggestion error",error);
setTaxTips("AI suggestion unavailable");

}

};

const fetchInvoices = async () => {

  // latest 5 invoices for table
  const recentQuery = query(
    collection(db, "invoices"),
    orderBy("uploadedAt", "desc"),
    limit(50)
  );


  const recentSnapshot = await getDocs(recentQuery);

  // all invoices for stats
  const snapshot = await getDocs(collection(db, "invoices"));

  let gst = 0;
  let amount = 0;

  const invoiceList:any[] = [];
  const monthlyData: Record<string, any> = {};


  // calculate totals
const fileMap: any = {};

snapshot.forEach((doc) => {

  const data = doc.data();

  gst += data.totalGST || 0;
  amount += data.totalAmount || 0;

  const file = data.fileName || "unknown";

  if(!fileMap[file]){
    fileMap[file] = {
      count: 0
    };
  }

  fileMap[file].count += 1;

  const date = data.invoiceDate?.seconds
  ? new Date(data.invoiceDate.seconds * 1000)
  : new Date(data.invoiceDate);
  
  if(date){

    const month = date.toLocaleString("default",{month:"short"});

    if(!monthlyData[month]){
      monthlyData[month] = {month, gst:0, itc:0};
    }

    monthlyData[month].gst += data.totalGST || 0;
    monthlyData[month].itc += (data.totalGST || 0) * 0.4;

  }

});

const uniqueInvoiceCount = Object.keys(fileMap).length;



const monthOrder = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

setTrendData(
 Object.values(monthlyData).sort(
  (a:any,b:any)=> monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
 )
);

const cgst = gst * 0.45;
const sgst = gst * 0.45;
const igst = gst * 0.10;

setPieData([
 { name:"CGST", value: cgst, color:"hsl(239, 84%, 67%)"},
 { name:"SGST", value: sgst, color:"hsl(187, 92%, 44%)"},
 { name:"IGST", value: igst, color:"hsl(260, 80%, 60%)"}
])

const aiInsights:any = [];
const taxSuggestions:any = [];

// GST Liability insight
if(gst > 0){
  aiInsights.push({
    text:`Your GST liability is ₹${gst.toLocaleString()}`,
    type:"info"
  });
}


if(gst > amount * 0.25){
taxSuggestions.push("High GST liability detected. Review Input Tax Credit eligibility.");
}

if(uniqueInvoiceCount > 20){
taxSuggestions.push("Large number of invoices detected. Consider batching invoices for better GST management.");
}

if(gst > 50000){
taxSuggestions.push("You may reduce tax liability by maximizing Input Tax Credit claims.");
}

if(amount > 100000){
taxSuggestions.push("Consider splitting large invoices across financial periods to optimize GST payments.");
}

// High GST ratio warning
const gstRatio = amount > 0 ? gst / amount : 0;

if(gstRatio > 0.25){
  aiInsights.push({
    text:"GST ratio is unusually high compared to invoice value",
    type:"warning"
  });
}

// Large invoice activity
if(amount > 1000000){
  aiInsights.push({
    text:"High transaction volume detected this month",
    type:"success"
  });
}

// Many invoices processed
if(uniqueInvoiceCount > 10){
  aiInsights.push({
    text:`You processed ${uniqueInvoiceCount} invoices this period`,
    type:"success"
  });
}

// No invoices warning
if(uniqueInvoiceCount === 0){
  aiInsights.push({
    text:"No invoices uploaded yet",
    type:"warning"
  });
}

// Tax optimization suggestion
if(gst > 50000){
  aiInsights.push({
    text:"Consider reviewing Input Tax Credit opportunities to reduce GST liability",
    type:"info"
  });
}

setInsights(aiInsights);

await generateAITaxTips({
invoices: uniqueInvoiceCount,
gst: gst,
amount: amount
});
// compliance score logic
if(uniqueInvoiceCount === 0){
  setComplianceScore(0);
} else {

  let score = 100;

  const gstRatio = amount > 0 ? gst / amount : 0;

  // abnormal GST ratio
  if(gstRatio > 0.25){
    score -= 20;
  }

  // too few invoices
  if(uniqueInvoiceCount < 3){
    score -= 15;
  }

  // very high GST liability
  if(gst > 100000){
    score -= 10;
  }

  // medium invoice activity bonus
  if(uniqueInvoiceCount >= 5){
    score += 5;
  }

  setComplianceScore(Math.min(Math.max(score,0),100));
}

  // latest invoices for table
const fileMapRecent:any = {};

recentSnapshot.forEach((doc)=>{

  const data = doc.data();
  const file = data.fileName || "unknown";

  if(!fileMapRecent[file]){
    fileMapRecent[file] = {
      id: doc.id,
      invoiceId: file,
      fileType: data.fileType,
      fileSize: data.fileSize,
      uploadedAt: data.uploadedAt
    };
  }

});

setRecentInvoices(Object.values(fileMapRecent).slice(0,5));
  setTotalGST(gst);
  setTotalAmount(amount);
  setInvoiceCount(uniqueInvoiceCount);
  setLoading(false);
};


useEffect(() => {
  fetchInvoices();
}, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Overview of your GST activities</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border/50 bg-card p-5 shadow-card hover:shadow-card-hover transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold">
                {loading ? "..." : stat.value}
              </p>
              <span className="text-xs text-muted-foreground">
                Updated from database
              </span>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-border/50 bg-card p-5 shadow-card">
            <h3 className="font-semibold mb-4">GST Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220, 9%, 46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 9%, 46%)" />
                <Tooltip />
                <Line type="monotone" dataKey="gst" stroke="hsl(239, 84%, 67%)" strokeWidth={2} dot={{ r: 4 }} name="GST Payable" />
                <Line type="monotone" dataKey="itc" stroke="hsl(187, 92%, 44%)" strokeWidth={2} dot={{ r: 4 }} name="Input Tax Credit" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-5 shadow-card">
            <h3 className="font-semibold mb-4">GST Breakdown</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" stroke="none">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium">₹{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Tax Optimization Suggestions */}

        <div className="rounded-xl border border-border/50 bg-card p-5 shadow-card">

        <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">💡</span>
        <h3 className="font-semibold">AI Tax Optimization Suggestions</h3>
        </div>

        <div className="text-sm text-muted-foreground whitespace-pre-line">
        {taxTips || "Generating AI suggestions..."}
        </div>

        </div>

        {/* AI Insights */}
        <div className="rounded-xl border border-border/50 bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">AI Financial Insights</h3>
          </div>
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${
                  insight.type === "success" ? "border-success/30 bg-success/5" :
                  insight.type === "warning" ? "border-warning/30 bg-warning/5" :
                  "border-info/30 bg-info/5"
                }`}
              >
                <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                  insight.type === "success" ? "bg-success" :
                  insight.type === "warning" ? "bg-warning" :
                  "bg-info"
                }`} />
                <span>{insight.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="rounded-xl border border-border/50 bg-card shadow-card overflow-hidden">
          <div className="p-5 border-b border-border/50">
            <h3 className="font-semibold">Recent Invoices</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left py-3 px-5 font-medium text-muted-foreground">File Name</th>
                <th className="text-left py-3 px-5 font-medium text-muted-foreground">File Type</th>
                <th className="text-left py-3 px-5 font-medium text-muted-foreground">Size</th>
                <th className="text-left py-3 px-5 font-medium text-muted-foreground">Upload Date</th>
                <th className="text-left py-3 px-5 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                  {recentInvoices.length === 0 ? (
                  <tr>
                  <td colSpan={5} className="text-center py-6 text-muted-foreground">
                  No invoices uploaded yet
                  </td>
                  </tr>
                  ) : (
                  recentInvoices.map((inv: any) => (

                  <tr
                  key={inv.id}
                  className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                  >

                  <td className="py-3 px-5 font-medium">
                  {inv.invoiceId}
                  </td>

                  <td className="py-3 px-5">
                  {inv.fileType}
                  </td>

                  <td className="py-3 px-5">
                  {inv.fileSize ? (inv.fileSize / 1024).toFixed(1) : "0"} KB
                  </td>

                  <td className="py-3 px-5 text-muted-foreground">
                    {inv.uploadedAt ? inv.uploadedAt.toDate().toLocaleDateString() : "-"}
                  </td>

                  <td className="py-3 px-5 flex gap-3 items-center">

                  <span className="bg-success/10 text-success px-2 py-1 rounded-full text-xs">
                  Uploaded
                  </span>

                  <button
                  onClick={() => deleteInvoice(inv.invoiceId)}
                  className="text-red-500 text-xs hover:underline"
                  >
                  Delete
                  </button>

                  </td>

                  </tr>

                  ))
                )}
                </tbody>

            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
