import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export default function DashboardSettings() {
  const [businessName,setBusinessName] = useState("")
  const [gstNumber,setGstNumber] = useState("")
  const [financialYear,setFinancialYear] = useState("")

  useEffect(()=>{

  const loadSettings = async()=>{

  const user = auth.currentUser
  if(!user) return

  const ref = doc(db,"settings",user.uid)
  const snap = await getDoc(ref)

  if(snap.exists()){
  const data = snap.data()

  setBusinessName(data.businessName || "")
  setGstNumber(data.gstNumber || "")
  setFinancialYear(data.financialYear || "")
  }

  }

  loadSettings()

  },[])

  const saveSettings = async()=>{

const user = auth.currentUser
if(!user) return

await setDoc(doc(db,"settings",user.uid),{
businessName,
gstNumber,
financialYear
})

alert("Settings saved")

}

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your workspace and account</p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-card space-y-5">
          <h3 className="font-semibold">Workspace Details</h3>
          <div className="space-y-4">
            <div>
              <Label>Business Name</Label>
              <Input value={businessName} onChange={(e)=>setBusinessName(e.target.value)} />
            </div>
            <div>
              <Label>GST Number</Label>
              <Input value={gstNumber} onChange={(e)=>setGstNumber(e.target.value)} />
            </div>
            <div>
              <Label>Financial Year</Label>
              <Input value={financialYear} onChange={(e)=>setFinancialYear(e.target.value)} />
            </div>
          </div>
          <Button variant="hero" onClick={saveSettings}>
            Save Changes
          </Button>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-card space-y-5">
          <h3 className="font-semibold">Account</h3>
          <div className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input defaultValue="user@company.com" className="mt-1.5" />
            </div>
          </div>
          <Button variant="outline">Update Email</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
