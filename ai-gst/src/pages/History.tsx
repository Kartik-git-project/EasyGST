import DashboardLayout from "@/components/DashboardLayout";
import { FileText, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";



const statusIcon = {
  Completed: <CheckCircle className="h-4 w-4 text-success" />,
  Partial: <AlertTriangle className="h-4 w-4 text-warning" />,
  Processing: <Clock className="h-4 w-4 text-info" />,
};

export default function History() {

const [history,setHistory] = useState<any[]>([]);

const clearHistory = async () => {

const confirmDelete = window.confirm("Are you sure you want to clear history?");
if(!confirmDelete) return;

const snapshot = await getDocs(collection(db,"invoices"));

const deletePromises:any[] = [];

snapshot.forEach((d)=>{
deletePromises.push(deleteDoc(doc(db,"invoices",d.id)));
});

await Promise.all(deletePromises);

// refresh history after deletion
fetchHistory();

};

const fetchHistory = async ()=>{

const snapshot = await getDocs(collection(db,"invoices"));

const fileMap:any = {};

snapshot.forEach((doc)=>{

const data = doc.data();

const name = data.fileName || "Unknown";

if(!fileMap[name]){
fileMap[name] = {
name:name,
gst:0,
count:0,
date:data.uploadedAt ? data.uploadedAt.toDate().toLocaleDateString() : "-",
status:"Completed"
};
}

fileMap[name].gst += data.totalGST || 0;
fileMap[name].count += 1;




});

setHistory(Object.values(fileMap));

};

useEffect(()=>{
fetchHistory();
},[]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">History</h1>
          <p className="text-muted-foreground text-sm">
            Previously uploaded and processed files
          </p>
        </div>
        <button
        onClick={clearHistory}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
        >
        Clear History
        </button>
      </div>

        <div className="rounded-xl border border-border/50 bg-card shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left py-3 px-5 font-medium text-muted-foreground">File Name</th>
                <th className="text-left py-3 px-5 font-medium text-muted-foreground">Upload Date</th>
                <th className="text-left py-3 px-5 font-medium text-muted-foreground">GST Amount</th>
                <th className="text-left py-3 px-5 font-medium text-muted-foreground">Invoices</th>
                <th className="text-left py-3 px-5 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
              <tr>
              <td colSpan={5} className="text-center py-10 text-muted-foreground">
              No history available. Upload invoices to see processing history.
              </td>
              </tr>
              ) : (
              history.map((item) => (
              <tr key={item.name} className="border-b border-border/30 hover:bg-muted/20 transition-colors">

              <td className="py-3 px-5 font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              {item.name}
              </td>

              <td className="py-3 px-5 text-muted-foreground">
              {item.date}
              </td>

              <td className="py-3 px-5 font-medium">
              ₹{Number(item.gst).toLocaleString()}
              </td>

              <td className="py-3 px-5">
              {item.count}
              </td>

              <td className="py-3 px-5">
              <div className="flex items-center gap-1.5">
              {statusIcon[item.status]}
              <span>{item.status}</span>
              </div>
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
