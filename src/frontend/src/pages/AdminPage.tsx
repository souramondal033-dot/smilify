import { useActor } from "@caffeineai/core-infrastructure";
import {
  Activity,
  Globe,
  Heart,
  RefreshCw,
  ShieldCheck,
  Smile,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createActor } from "../backend";
import type {
  AdminStats,
  Smile as BackendSmile,
  Donation,
  TopDonor,
  UserSummary,
} from "../backend";

interface AdminPageProps {
  onClose: () => void;
  smiles: BackendSmile[];
}

type AdminTab = "overview" | "users" | "feed" | "donations";

function SkeletonRow() {
  return (
    <div className="p-4 bg-white/5 rounded-3xl flex items-center gap-4 border border-white/5 animate-pulse">
      <div className="w-10 h-10 bg-white/10 rounded-2xl shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-white/10 rounded-full w-32" />
        <div className="h-2 bg-white/10 rounded-full w-20" />
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  iconColor: string;
  value: number | bigint | string;
  label: string;
  ocid: string;
}
function StatCard({ icon, iconColor, value, label, ocid }: StatCardProps) {
  return (
    <div
      className="p-6 bg-white/5 rounded-[2.5rem] border border-white/5"
      data-ocid={ocid}
    >
      <div className={`mb-4 ${iconColor}`}>{icon}</div>
      <p className="text-3xl font-bold">{String(value)}</p>
      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
        {label}
      </p>
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────
interface OverviewTabProps {
  stats: AdminStats | null;
  smiles: BackendSmile[];
  isLoadingStats: boolean;
}
function OverviewTab({ stats, smiles, isLoadingStats }: OverviewTabProps) {
  return (
    <div className="space-y-6" data-ocid="admin.overview.section">
      <div className="grid grid-cols-2 gap-4">
        {isLoadingStats ? (
          <>
            <div className="p-6 bg-white/5 rounded-[2.5rem] border border-white/5 animate-pulse h-32" />
            <div className="p-6 bg-white/5 rounded-[2.5rem] border border-white/5 animate-pulse h-32" />
            <div className="p-6 bg-white/5 rounded-[2.5rem] border border-white/5 animate-pulse h-32" />
          </>
        ) : (
          <>
            <StatCard
              icon={<Users size={24} />}
              iconColor="text-indigo-400"
              value={stats?.totalUsers ?? 0n}
              label="Pookies Joined"
              ocid="admin.stat.total_users"
            />
            <StatCard
              icon={<Smile size={24} />}
              iconColor="text-pink-400"
              value={stats?.totalSmiles ?? 0n}
              label="Total Smiles"
              ocid="admin.stat.total_smiles"
            />
            <StatCard
              icon={<Heart size={24} />}
              iconColor="text-yellow-400"
              value={stats?.totalDonations ?? 0n}
              label="Donations"
              ocid="admin.stat.total_donations"
            />
          </>
        )}
      </div>
      <div className="p-6 bg-white/5 rounded-[2.5rem] border border-white/5">
        <div className="flex items-center gap-3 mb-6">
          <Activity size={18} className="text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest">
            Live Activity
          </h3>
        </div>
        {smiles.length === 0 ? (
          <p
            className="text-[11px] font-bold text-white/30 text-center py-4"
            data-ocid="admin.activity.empty_state"
          >
            No smiles yet pookie 🌟
          </p>
        ) : (
          <div className="space-y-4" data-ocid="admin.activity.list">
            {smiles.slice(0, 3).map((s, i) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-2xl"
                data-ocid={`admin.activity.item.${i + 1}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-[10px] font-bold text-pink-300">
                    {s.userName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold">{s.userName}</p>
                    <p className="text-[9px] text-white/30 flex items-center gap-1">
                      <Globe size={8} />
                      {s.userCountry}
                    </p>
                  </div>
                </div>
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">
                  New Smile
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Users Tab ─────────────────────────────────────────────────────────────
interface UsersTabProps {
  users: UserSummary[];
  isLoading: boolean;
}
function UsersTab({ users, isLoading }: UsersTabProps) {
  if (isLoading)
    return (
      <div className="space-y-4" data-ocid="admin.users.loading_state">
        {[1, 2, 3, 4].map((n) => (
          <SkeletonRow key={n} />
        ))}
      </div>
    );
  if (users.length === 0)
    return (
      <div className="py-20 text-center" data-ocid="admin.users.empty_state">
        <p className="text-white/30 font-bold text-sm">No users yet 🐼</p>
      </div>
    );
  return (
    <div className="space-y-4" data-ocid="admin.users.list">
      {users.map((u, i) => (
        <div
          key={u.id.toString()}
          className="p-4 bg-white/5 rounded-3xl flex items-center justify-between border border-white/5 fade-in"
          style={{ animationDelay: `${i * 0.05}s` }}
          data-ocid={`admin.users.item.${i + 1}`}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-xs font-bold uppercase">
              {u.name?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold">{u.name}</p>
              <p className="text-[10px] text-white/40 flex items-center gap-1 mt-0.5">
                <Globe size={8} />
                {u.country}
              </p>
            </div>
          </div>
          <div className="text-right px-4">
            <p className="text-xs font-bold text-pink-400">
              {String(u.totalSmiles)}
            </p>
            <p className="text-[9px] text-white/20 uppercase tracking-tighter">
              Smiles
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Feed Tab ──────────────────────────────────────────────────────────────
interface FeedTabProps {
  smiles: BackendSmile[];
  onDelete: (id: string) => void;
  deletingId: string | null;
}
function FeedTab({ smiles, onDelete, deletingId }: FeedTabProps) {
  if (smiles.length === 0)
    return (
      <div className="py-20 text-center" data-ocid="admin.feed.empty_state">
        <p className="text-white/30 font-bold text-sm">No smiles yet 🌸</p>
      </div>
    );
  return (
    <div className="space-y-4" data-ocid="admin.feed.list">
      {smiles.map((s, i) => (
        <div
          key={s.id}
          className="p-4 bg-white/5 rounded-3xl flex items-center justify-between border border-white/5 fade-in"
          style={{ animationDelay: `${i * 0.04}s` }}
          data-ocid={`admin.feed.item.${i + 1}`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 ring-2 ring-white/5 overflow-hidden shrink-0 flex items-center justify-center">
              <img
                src={s.imageBlobId}
                alt={`Smile by ${s.userName}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div>
              <p className="text-sm font-bold">{s.userName}</p>
              <div className="flex items-center gap-2 mt-1">
                <Heart size={10} className="text-pink-400 fill-pink-400" />
                <span className="text-[10px] text-white/40 font-bold">
                  {String(s.likes)} Likes
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onDelete(s.id)}
            disabled={deletingId === s.id}
            className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500/20 transition-smooth active:scale-90 disabled:opacity-50"
            data-ocid={`admin.feed.delete_button.${i + 1}`}
            aria-label={`Delete smile by ${s.userName}`}
          >
            {deletingId === s.id ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Trash2 size={18} />
            )}
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Donations Tab ─────────────────────────────────────────────────────────
function getDonorBadge(rank: bigint): string {
  if (rank === 1n) return "🥇";
  if (rank === 2n) return "🥈";
  if (rank === 3n) return "🥉";
  return `#${rank}`;
}

interface DonationsTabProps {
  donations: Donation[];
  topDonors: TopDonor[];
  isLoading: boolean;
}
function DonationsTab({ donations, topDonors, isLoading }: DonationsTabProps) {
  if (isLoading)
    return (
      <div className="space-y-4" data-ocid="admin.donations.loading_state">
        {[1, 2, 3].map((n) => (
          <SkeletonRow key={n} />
        ))}
      </div>
    );

  const formatDate = (ts: bigint) => {
    const ms = Number(ts / 1_000_000n);
    return new Date(ms).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8" data-ocid="admin.donations.section">
      {/* Top Donors Leaderboard */}
      <div>
        <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span>🏆</span> Top Donors
        </h3>
        {topDonors.length === 0 ? (
          <p
            className="text-[11px] font-bold text-white/30 text-center py-6"
            data-ocid="admin.top_donors.empty_state"
          >
            No donors yet 💛
          </p>
        ) : (
          <div className="space-y-3" data-ocid="admin.top_donors.list">
            {topDonors.map((donor, i) => (
              <div
                key={donor.donorPrincipal}
                className="p-4 bg-white/5 rounded-3xl flex items-center justify-between border border-white/5 fade-in"
                style={{ animationDelay: `${i * 0.05}s` }}
                data-ocid={`admin.top_donors.item.${i + 1}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xl ${Number(donor.rank) <= 3 ? "" : "text-sm font-black text-white/40"}`}
                  >
                    {getDonorBadge(donor.rank)}
                  </span>
                  <div>
                    <p className="text-sm font-bold">{donor.donorName}</p>
                    <p className="text-[10px] text-white/40">
                      {String(donor.donationCount)} donation
                      {donor.donationCount !== 1n ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-yellow-400">
                    {donor.totalAmount}
                  </p>
                  <p className="text-[9px] text-white/30 uppercase tracking-widest">
                    Total
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Donation History */}
      <div>
        <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span>💛</span> Donation History
        </h3>
        {donations.length === 0 ? (
          <p
            className="text-[11px] font-bold text-white/30 text-center py-6"
            data-ocid="admin.donations.empty_state"
          >
            No donations recorded yet 🌱
          </p>
        ) : (
          <div className="space-y-3" data-ocid="admin.donations.list">
            {donations.map((d, i) => (
              <div
                key={d.id}
                className="p-4 bg-white/5 rounded-3xl border border-white/5 fade-in"
                style={{ animationDelay: `${i * 0.04}s` }}
                data-ocid={`admin.donations.item.${i + 1}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-sm font-bold text-yellow-300 shrink-0">
                        {d.donorName.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-sm font-bold truncate">
                        {d.donorName}
                      </p>
                    </div>
                    {d.message && (
                      <p className="text-[11px] text-white/40 italic mt-2 ml-10 leading-relaxed">
                        "{d.message}"
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 ml-10">
                      <span className="text-[10px] text-white/30 uppercase tracking-widest">
                        {d.paymentMethod}
                      </span>
                      <span className="text-[10px] text-white/20">•</span>
                      <span className="text-[10px] text-white/30">
                        {formatDate(d.createdAt)}
                      </span>
                    </div>
                  </div>
                  <span className="text-base font-black text-yellow-400 shrink-0">
                    {d.amount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── AdminPage ─────────────────────────────────────────────────────────────
export default function AdminPage({ onClose, smiles }: AdminPageProps) {
  const { actor } = useActor(createActor);
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [topDonors, setTopDonors] = useState<TopDonor[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingDonations, setIsLoadingDonations] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Fetch stats on mount
  useEffect(() => {
    if (!actor) return;
    setIsLoadingStats(true);
    actor
      .getAdminStats()
      .then((s) => setStats(s))
      .catch(() => triggerToast("Failed to load stats"))
      .finally(() => setIsLoadingStats(false));
  }, [actor, triggerToast]);

  // Fetch users when users tab opens
  useEffect(() => {
    if (activeTab !== "users" || !actor) return;
    setIsLoadingUsers(true);
    actor
      .getAllUsers()
      .then((u) => setUsers(u))
      .catch(() => triggerToast("Failed to load users"))
      .finally(() => setIsLoadingUsers(false));
  }, [activeTab, actor, triggerToast]);

  // Fetch donations when donations tab opens + poll every 15s
  const fetchDonations = useCallback(async () => {
    if (!actor) return;
    setIsLoadingDonations(true);
    try {
      const [donationsData, topDonorsData] = await Promise.all([
        actor.getDonations(),
        actor.getTopDonors(),
      ]);
      setDonations(donationsData);
      setTopDonors(topDonorsData);
    } catch {
      triggerToast("Failed to load donations");
    } finally {
      setIsLoadingDonations(false);
    }
  }, [actor, triggerToast]);

  useEffect(() => {
    if (activeTab !== "donations") return;
    void fetchDonations();
    const id = setInterval(() => void fetchDonations(), 15_000);
    return () => clearInterval(id);
  }, [activeTab, fetchDonations]);

  const handleDelete = async (smileId: string) => {
    if (!actor || deletingId) return;
    setDeletingId(smileId);
    try {
      const result = await actor.deleteSmile(smileId);
      if (result.__kind__ === "ok") {
        triggerToast("Smile removed pookie 🗑️");
      } else {
        triggerToast(`Delete failed: ${result.err}`);
      }
    } catch {
      triggerToast("Something went wrong pookie 🐼");
    } finally {
      setDeletingId(null);
    }
  };

  const TABS: { key: AdminTab; label: string }[] = [
    { key: "overview", label: "OVERVIEW" },
    { key: "users", label: "USERS" },
    { key: "feed", label: "FEED" },
    { key: "donations", label: "DONATIONS" },
  ];

  return (
    <div
      className="fixed inset-0 z-[2000] bg-slate-950 flex flex-col text-white fade-in"
      data-ocid="admin.page"
    >
      {toast && (
        <div
          className="absolute top-20 left-1/2 -translate-x-1/2 z-10 bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest border border-white/10 slide-in-from-top whitespace-nowrap"
          data-ocid="admin.toast"
        >
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">System Admin</h2>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
              Smilify HQ Node
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-smooth active:scale-90"
          data-ocid="admin.close_button"
          aria-label="Close admin portal"
        >
          <X size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div
        className="flex bg-white/5 p-1 mx-6 mt-6 rounded-2xl shrink-0 gap-1"
        role="tablist"
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold transition-smooth ${activeTab === tab.key ? "bg-indigo-500 shadow-lg text-white" : "text-white/40 hover:text-white/60"}`}
            data-ocid={`admin.${tab.key}.tab`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
        {activeTab === "overview" && (
          <OverviewTab
            stats={stats}
            smiles={smiles}
            isLoadingStats={isLoadingStats}
          />
        )}
        {activeTab === "users" && (
          <UsersTab users={users} isLoading={isLoadingUsers} />
        )}
        {activeTab === "feed" && (
          <FeedTab
            smiles={smiles}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        )}
        {activeTab === "donations" && (
          <DonationsTab
            donations={donations}
            topDonors={topDonors}
            isLoading={isLoadingDonations}
          />
        )}
      </div>
    </div>
  );
}
