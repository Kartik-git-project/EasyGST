import DashboardLayout from "@/components/DashboardLayout";
import { auth } from "@/lib/firebase";

export default function Profile() {

const user = auth.currentUser;

const email = user?.email || "No email";
const avatarLetter = email.charAt(0).toUpperCase();

return (
<DashboardLayout>

<div className="space-y-6">

<h1 className="text-2xl font-bold">My Profile</h1>

<div className="flex items-center gap-4">

<div className="h-14 w-14 rounded-full gradient-primary flex items-center justify-center text-white text-xl font-bold">
{avatarLetter}
</div>
<br />

<div className="space-y-1">
<p className="text-sm text-muted-foreground">Email</p>
<p className="font-medium">{email}</p>
</div>

</div>

</div>

</DashboardLayout>
);
}