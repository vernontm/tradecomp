import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";
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
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Admin Access Required</h1>
          <p className="text-white/70">You need admin access to view this dashboard.</p>
        </div>
      </div>
    );
  }

  const displayName = user.name || `@${user.username}`;

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
