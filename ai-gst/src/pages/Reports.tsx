import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { FileText, Download, FileSpreadsheet } from "lucide-react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";



export default function Reports() {
  const [reports,setReports] = useState<any[]>([]);
  const downloadCSV = async () => {

  const snapshot = await getDocs(collection(db,"invoices"));

  const rows:any[] = [];

  snapshot.forEach((doc)=>{
    const data = doc.data();

    rows.push({
      fileName: data.fileName,
      totalAmount: data.totalAmount,
      totalGST: data.totalGST,
      uploadedAt: data.uploadedAt ? data.uploadedAt.toDate().toLocaleDateString() : "-"
    });
  });

  const totalAmount = rows.reduce((sum,r)=>sum + (r.totalAmount || 0),0);
  const totalGST = rows.reduce((sum,r)=>sum + (r.totalGST || 0),0);
  const invoiceCount = rows.length;
  const gstPercent = totalAmount > 0 ? (totalGST/totalAmount)*100 : 0;

  const csvContent =
  `Metric,Value
  Total Invoices,${invoiceCount}
  Total Amount,${totalAmount}
  Total GST,${totalGST}
  GST Percentage,${gstPercent.toFixed(2)}%
  `;

  const blob = new Blob([csvContent], {type:"text/csv"});
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "gst-report.csv";
  document.body.appendChild(a);
  a.click();
  await addDoc(collection(db,"reports"),{
  name:"GST Summary Report",
  period:"All Data",
  generatedAt:new Date(),
  type:"csv"
  });
  await generateReports();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

const downloadPDF = async () => {
  const snapshot = await getDocs(collection(db,"invoices"));

let totalGST = 0;
let totalAmount = 0;
let invoiceCount = 0;

let highestInvoice = 0;
let lowestInvoice = Number.MAX_VALUE;

snapshot.forEach((doc)=>{
  const data = doc.data();

  const amount = data.totalAmount || 0;
  const gst = data.totalGST || 0;

  totalAmount += amount;
  totalGST += gst;
  invoiceCount += 1;

  if(amount > highestInvoice) highestInvoice = amount;
  if(amount < lowestInvoice) lowestInvoice = amount;
});

const avgInvoice = invoiceCount > 0 ? totalAmount / invoiceCount : 0;

const cgst = totalGST * 0.45;
const sgst = totalGST * 0.45;
const igst = totalGST * 0.10;


const insights:string[] = [];

if(totalGST > totalAmount * 0.25){
  insights.push("GST ratio is higher than normal.");
}

if(invoiceCount > 20){
  insights.push("High invoice activity detected.");
}

if(totalAmount > 100000){
  insights.push("Large transaction volume processed.");
}

if(insights.length === 0){
  insights.push("GST activity appears normal.");
}

const pdf = new jsPDF("p","mm","a4");

// HEADER
pdf.setFont("helvetica","bold");
pdf.setFontSize(22);
pdf.text("GST Analytics Report",105,15,{align:"center"});

pdf.setFont("helvetica","normal");
pdf.setFontSize(12);
pdf.text("Generated from uploaded GST invoices",105,22,{align:"center"});

pdf.setDrawColor(200);
pdf.line(10,26,200,26);

let y = 30;

pdf.setFont("helvetica","bold");
pdf.setFontSize(16);
pdf.text("GST Breakdown",10,y);

y += 6;
pdf.setDrawColor(180);
pdf.line(10,y,200,y);
y += 6;

pdf.setFont("helvetica","normal");
pdf.setFontSize(13);

y += 8;

pdf.setFontSize(11);
pdf.text(`CGST Collected : ₹${cgst.toLocaleString()}`,10,y);
y += 7;
pdf.text(`SGST Collected : ₹${sgst.toLocaleString()}`,10,y);
y += 7;
pdf.text(`IGST Collected : ₹${igst.toLocaleString()}`,10,y);

y += 12;

pdf.setFont("helvetica","bold");
pdf.setFontSize(16);
pdf.text("Invoice Activity Summary",10,y);

y += 6;
pdf.line(10,y,200,y);
y += 6;

pdf.setFont("helvetica","normal");
pdf.setFontSize(13);
y += 8;

pdf.setFontSize(11);
pdf.text(`Total Invoices: ${invoiceCount}`,10,y);
y += 6;
pdf.text(`Average Invoice Value: ₹${avgInvoice.toFixed(2)}`,10,y);
y += 6;
pdf.text(`Highest Invoice: ₹${highestInvoice}`,10,y);
y += 6;
pdf.text(`Lowest Invoice: ₹${lowestInvoice}`,10,y);


y += 14;

pdf.setFont("helvetica","bold");
pdf.setFontSize(16);
pdf.text("AI Financial Insights",10,y);

y += 6;
pdf.line(10,y,200,y);

y += 8;
pdf.setFont("helvetica","normal");
pdf.setFontSize(13);

insights.forEach((insight)=>{
  pdf.text(`• ${insight}`,10,y);
  y += 7;
});


 pdf.save("gst-report.pdf");

 await addDoc(collection(db,"reports"),{
  name:"GST Summary Report",
  period:"All Data",
  generatedAt:new Date(),
  type:"pdf"
  });
  await generateReports();
};



const generateReports = async ()=>{

const reportSnapshot = await getDocs(collection(db,"reports"));

const reportList:any[] = [];

reportSnapshot.forEach((doc)=>{
  const data = doc.data();

  reportList.push({
    name:data.name,
    period:data.period,
    date:data.generatedAt?.toDate().toLocaleDateString(),
    status:"Ready"
  });
});

setReports(reportList);

};

useEffect(()=>{
  generateReports();
},[]);


  return (
    <DashboardLayout>
      <div id="report-analytics" className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Reports</h1>
            <p className="text-muted-foreground text-sm">Export and download GST reports</p>
          </div>
          <div className="flex gap-3">
            <Button variant="hero" onClick={downloadPDF}>
              <Download className="h-4 w-4 mr-2" /> Download GST Report
            </Button>
            <Button variant="outline" onClick={downloadCSV}>
              <FileSpreadsheet className="h-4 w-4 mr-2" /> Export CSV
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">

    </div>

        <div className="rounded-xl border border-border/50 bg-card shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left py-3 px-5 font-medium text-muted-foreground">Report Name</th>
                <th className="text-left py-3 px-5 font-medium text-muted-foreground">Period</th>
                <th className="text-left py-3 px-5 font-medium text-muted-foreground">Generated</th>
                <th className="text-left py-3 px-5 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-5 font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
            {reports.length === 0 ? (
            <tr>
            <td colSpan={5} className="text-center py-6 text-muted-foreground">
            No reports generated yet
            </td>
            </tr>
            ) : (
            reports.map((report) => (
                <tr key={report.name + report.period} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-5 font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" /> {report.name}
                  </td>
                  <td className="py-3 px-5">{report.period}</td>
                  <td className="py-3 px-5 text-muted-foreground">{report.date}</td>
                  <td className="py-3 px-5">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      report.status === "Ready" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="py-3 px-5">
                    <Button variant="ghost" size="sm" disabled={report.status !== "Ready"} onClick={downloadCSV}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))
            )}

            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
