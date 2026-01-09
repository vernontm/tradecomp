import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";
import { syncWhopUser } from "@/lib/sync-user";
import AdminDashboard from "@/components/AdminDashboard";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  
  // Verify user is logged in on Whop
  const { userId } = await whopsdk.verifyUserToken(await headers());

  // Check admin access to this company
  const [company, user, access] = await Promise.all([
    whopsdk.companies.retrieve(companyId),
    whopsdk.users.retrieve(userId),
    whopsdk.users.checkAccess(companyId, { id: userId }),
  ]);

  if (access.access_level !== "admin") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-500 mb-2">Admin Access Required</h1>
          <p className="text-muted text-sm">You need admin access to view this dashboard.</p>
        </div>
      </div>
    );
  }

  const displayName = user.name || `@${user.username}`;

  // Sync Whop user to Supabase (non-blocking)
  syncWhopUser({
    id: userId,
    username: user.username,
    name: displayName,
  });

  return (
    <AdminDashboard 
      whopUser={{
        id: userId,
        username: user.username,
        name: displayName,
        accessLevel: access.access_level,
      }}
      companyId={companyId}
      companyName={company.title}
    />
  );
}
