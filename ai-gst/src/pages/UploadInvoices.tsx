import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Upload, FileText, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import Papa from "papaparse";

export default function UploadInvoices() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...dropped]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
  };

const handleProcess = async () => {
  setProcessing(true);

  try {

    for (const file of files) {
      await handleFileUpload(file);
    }

    setProcessing(false);
    setDone(true);

  } catch (error) {
    console.error("Processing error:", error);
    setProcessing(false);
  }
};



const handleFileUpload = (file: File) => {
  return new Promise<void>((resolve, reject) => {

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,

      complete: async (results) => {

        try {

          const rows = results.data.filter((row:any) => row.invoiceId);

          for (const row of rows) {

          await addDoc(collection(db,"invoices"),{

            invoiceId: row.invoiceId,
            invoiceDate: new Date(row.invoiceDate),

            customerName: row.customerName,

            totalGST: Number(row.gstAmount),
            totalAmount: Number(row.totalAmount),

            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,

            uploadedAt: serverTimestamp()

          });

          }

          resolve();

        } catch (error) {

          reject(error);

        }

      },

      error: reject

    });

  });
};

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">Upload Invoices</h1>
          <p className="text-muted-foreground text-sm">Upload your GST invoices for AI-powered analysis</p>
        </div>

        {processing ? (
          <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-lg font-semibold">Analyzing invoices with AI...</p>
            <p className="text-sm text-muted-foreground mt-1">This may take a moment</p>
          </div>
        ) : done ? (
          <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
            <CheckCircle className="h-12 w-12 text-success mb-4" />
            <p className="text-lg font-semibold">Analysis Complete!</p>
            <p className="text-sm text-muted-foreground mt-1">{files.length} invoices processed successfully</p>
            <Button variant="hero" className="mt-6" onClick={() => { setFiles([]); setDone(false); }}>
              Upload More
            </Button>
          </div>
        ) : (
          <>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl bg-card p-16 text-center transition-colors cursor-pointer"
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-1">Drag & Drop your GST invoices here</p>
              <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-md border border-border px-2 py-1">PDF</span>
                <span className="rounded-md border border-border px-2 py-1">Images</span>
                <span className="rounded-md border border-border px-2 py-1">CSV</span>
              </div>
              <input id="file-input" type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.csv" className="hidden" onChange={handleFileSelect} />
            </div>

            {files.length > 0 && (
              <div className="space-y-3 animate-fade-in">
                <h3 className="font-semibold">Selected Files ({files.length})</h3>
                {files.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-3 shadow-card">
                    <FileText className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                ))}
                <Button variant="hero" onClick={handleProcess} className="w-full sm:w-auto">
                  Process {files.length} Invoice{files.length > 1 ? "s" : ""} with AI
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
