import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";
import TradingApp from "@/components/TradingApp";

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) {
  const { experienceId } = await params;
  
  // Verify user is logged in on Whop
  const { userId } = await whopsdk.verifyUserToken(await headers());

  // Check access to this experience
  const [experience, user, access] = await Promise.all([
    whopsdk.experiences.retrieve(experienceId),
    whopsdk.users.retrieve(userId),
    whopsdk.users.checkAccess(experienceId, { id: userId }),
  ]);

  if (!access.has_access) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
          <p className="text-white/70">You don't have access to this experience.</p>
        </div>
      </div>
    );
  }

  const displayName = user.name || `@${user.username}`;

  return (
    <TradingApp 
      whopUser={{
        id: userId,
        username: user.username,
        name: displayName,
        accessLevel: access.access_level,
      }}
      experienceId={experienceId}
    />
  );
}
