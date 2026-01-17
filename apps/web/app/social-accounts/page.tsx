import { platformCapabilityMatrix } from "@postflow/shared";

const accounts = [
  { platform: "telegram", name: "@postflow_bot", status: "Active" },
  { platform: "vk", name: "PostFlow Community", status: "Active" },
  { platform: "instagram", name: "postflow" as const, status: "Stub" }
];

export default function SocialAccountsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Social Accounts</h1>
        <p className="text-sm text-slate-600">Manage connected channels and see capabilities.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {accounts.map((account) => (
          <div key={account.name} className="rounded bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold capitalize">{account.platform}</p>
                <p className="text-sm text-slate-600">{account.name}</p>
              </div>
              <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">{account.status}</span>
            </div>
            <div className="mt-3 text-xs text-slate-500">
              {Object.entries(platformCapabilityMatrix[account.platform as keyof typeof platformCapabilityMatrix])
                .filter(([, value]) => value)
                .map(([key]) => key)
                .join(", ")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
