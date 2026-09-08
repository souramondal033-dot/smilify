import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  CheckSquare,
  Eye,
  Heart,
  ImageOff,
  Loader2,
  Search,
  Share2,
  Square,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { type DateRange, useContentHub } from "../hooks/useContentHub";
import type { Smile } from "../lib/types";

// ── Delete Confirmation Modal ─────────────────────────────────────────────
interface DeleteModalProps {
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

function DeleteConfirmModal({
  count,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteModalProps) {
  return (
    <dialog
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      data-ocid="content_hub.dialog"
      open
    >
      <div className="bg-card rounded-2xl shadow-pookie-lg w-full max-w-sm p-6 animate-in zoom-in">
        <div className="text-center mb-5">
          <div className="text-5xl mb-3">🗑️</div>
          <h2
            id="delete-modal-title"
            className="text-xl font-bold text-foreground mb-2"
          >
            Delete {count} {count === 1 ? "smile" : "smiles"}?
          </h2>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. Your{" "}
            {count === 1 ? "smile" : `${count} smiles`} will be permanently
            removed from Smilify.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={isDeleting}
            data-ocid="content_hub.cancel_button"
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
            disabled={isDeleting}
            data-ocid="content_hub.confirm_button"
          >
            {isDeleting ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                Deleting…
              </>
            ) : (
              `Delete ${count}`
            )}
          </Button>
        </div>
      </div>
    </dialog>
  );
}

// ── Smile Card ────────────────────────────────────────────────────────────
interface SmileCardProps {
  smile: Smile;
  index: number;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function SmileCard({
  smile,
  index,
  isSelected,
  onToggleSelect,
  onDelete,
  isDeleting,
}: SmileCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imgError, setImgError] = useState(false);

  const formattedDate = smile.createdAt
    ? new Date(smile.createdAt.seconds * 1000).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Unknown date";

  return (
    <>
      <article
        className={`relative bg-card rounded-xl overflow-hidden border transition-smooth group
          ${
            isSelected
              ? "border-primary shadow-pookie ring-2 ring-primary/30"
              : "border-border hover:border-primary/40 hover:shadow-pookie"
          }`}
        aria-label={`Smile posted on ${formattedDate}`}
        data-ocid={`content_hub.item.${index + 1}`}
      >
        {/* Thumbnail */}
        <div className="relative aspect-square bg-muted">
          {imgError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-muted-foreground">
              <ImageOff size={28} />
              <span className="text-xs">Image unavailable</span>
            </div>
          ) : (
            <img
              src={smile.image}
              alt={`Smile posted on ${formattedDate}`}
              className="w-full h-full object-cover transition-smooth group-hover:scale-[1.03]"
              onError={() => setImgError(true)}
            />
          )}

          {/* Selection Checkbox */}
          <button
            type="button"
            className="absolute top-2 left-2 z-10 w-7 h-7 rounded-lg bg-card/90 backdrop-blur-sm flex items-center justify-center shadow transition-smooth hover:scale-110"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(smile.id);
            }}
            aria-label={isSelected ? "Deselect smile" : "Select smile"}
            aria-pressed={isSelected}
            data-ocid={`content_hub.checkbox.${index + 1}`}
          >
            {isSelected ? (
              <CheckSquare size={16} className="text-primary" />
            ) : (
              <Square size={16} className="text-muted-foreground" />
            )}
          </button>

          {/* Delete button (top-right) */}
          <button
            type="button"
            className="absolute top-2 right-2 z-10 w-7 h-7 rounded-lg bg-card/90 backdrop-blur-sm flex items-center justify-center shadow transition-smooth opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteConfirm(true);
            }}
            aria-label="Delete this smile"
            disabled={isDeleting}
            data-ocid={`content_hub.delete_button.${index + 1}`}
          >
            <Trash2 size={13} />
          </button>
        </div>

        {/* Card Footer */}
        <div className="p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-2.5">
            <Calendar size={11} />
            <span>{formattedDate}</span>
          </div>

          {/* Analytics Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-[12px]">
              <span
                className="flex items-center gap-1 text-muted-foreground"
                aria-label={`${smile.views ?? 0} views`}
              >
                <Eye size={12} />
                <span className="font-semibold text-foreground">
                  {(smile.views ?? 0).toLocaleString()}
                </span>
              </span>
              <span
                className="flex items-center gap-1 text-muted-foreground"
                aria-label={`${smile.likes} likes`}
              >
                <Heart size={12} />
                <span className="font-semibold text-foreground">
                  {smile.likes.toLocaleString()}
                </span>
              </span>
              <span
                className="flex items-center gap-1 text-muted-foreground"
                aria-label={`${smile.shares ?? 0} shares`}
              >
                <Share2 size={12} />
                <span className="font-semibold text-foreground">
                  {(smile.shares ?? 0).toLocaleString()}
                </span>
              </span>
            </div>
          </div>
        </div>
      </article>

      {/* Per-card delete confirmation */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          count={1}
          isDeleting={isDeleting}
          onConfirm={async () => {
            await onDelete(smile.id);
            setShowDeleteConfirm(false);
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
}

const SKELETON_KEYS = ["sk0", "sk1", "sk2", "sk3", "sk4", "sk5", "sk6", "sk7"];

// ── Loading Skeletons ─────────────────────────────────────────────────────
function SmileSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {SKELETON_KEYS.map((sk) => (
        <div
          key={sk}
          className="rounded-xl overflow-hidden border border-border bg-card"
        >
          <Skeleton className="aspect-square w-full" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-3 w-24" />
            <div className="flex gap-3">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Date Filter Pills ─────────────────────────────────────────────────────
interface DateFilterProps {
  value: DateRange;
  onChange: (r: DateRange) => void;
}

const DATE_FILTERS: { label: string; value: DateRange }[] = [
  { label: "All time", value: "all" },
  { label: "Last 30 days", value: "month" },
  { label: "Last 7 days", value: "week" },
];

function DateFilterPills({ value, onChange }: DateFilterProps) {
  return (
    <fieldset className="flex gap-2 flex-wrap border-0 p-0 m-0">
      <legend className="sr-only">Date range filter</legend>
      {DATE_FILTERS.map((f) => (
        <button
          key={f.value}
          type="button"
          onClick={() => onChange(f.value)}
          aria-pressed={value === f.value}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-smooth border
            ${
              value === f.value
                ? "bg-primary text-primary-foreground border-primary shadow-pookie"
                : "bg-muted text-muted-foreground border-transparent hover:border-primary/30 hover:text-foreground"
            }`}
          data-ocid={`content_hub.filter.${f.value}`}
        >
          {f.label}
        </button>
      ))}
    </fieldset>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function ContentHubPage() {
  const hub = useContentHub();
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Load smiles on mount — stable ref avoids exhaustive-deps warning
  const loadRef = useRef(hub.loadMySmiles);
  useEffect(() => {
    void loadRef.current();
  }, []);

  const selectedCount = hub.selectedIds.size;

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    const ids = Array.from(hub.selectedIds);
    await hub.bulkDeleteSmiles(ids);
    setIsBulkDeleting(false);
    setShowBulkDeleteModal(false);
  };

  const handleDeleteOne = async (id: string) => {
    setIsDeletingId(id);
    await hub.deleteSmile(id);
    setIsDeletingId(null);
  };

  const allFilteredSelected =
    hub.filteredSmiles.length > 0 &&
    hub.filteredSmiles.every((s) => hub.selectedIds.has(s.id));

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Page Header */}
      <div className="bg-card border-b border-border sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                📸 My Content Hub
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {hub.smiles.length === 0
                  ? "No smiles yet"
                  : `${hub.smiles.length} ${hub.smiles.length === 1 ? "smile" : "smiles"} uploaded`}
              </p>
            </div>
            {/* Select All / Deselect */}
            {hub.filteredSmiles.length > 0 && (
              <button
                type="button"
                onClick={
                  allFilteredSelected ? hub.clearSelection : hub.selectAll
                }
                className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-smooth self-start sm:self-auto"
                aria-label={allFilteredSelected ? "Deselect all" : "Select all"}
                data-ocid="content_hub.select_all_button"
              >
                {allFilteredSelected ? (
                  <>
                    <CheckSquare size={14} /> Deselect all
                  </>
                ) : (
                  <>
                    <Square size={14} /> Select all
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-5 space-y-4">
        {/* Search + Date Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              type="search"
              placeholder="Search by name or country…"
              value={hub.searchQuery}
              onChange={(e) => hub.setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl border-border focus:border-primary"
              aria-label="Search smiles"
              data-ocid="content_hub.search_input"
            />
            {hub.searchQuery && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
                onClick={() => hub.setSearchQuery("")}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <DateFilterPills value={hub.dateRange} onChange={hub.setDateRange} />
        </div>

        {/* Bulk Actions Bar */}
        {selectedCount > 0 && (
          <div
            className="flex items-center justify-between gap-3 bg-primary/8 border border-primary/30 rounded-xl px-4 py-3 animate-in slide-in-from-top"
            data-ocid="content_hub.bulk_actions_bar"
          >
            <span className="text-sm font-semibold text-primary">
              {selectedCount} {selectedCount === 1 ? "smile" : "smiles"}{" "}
              selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground text-xs h-8"
                onClick={hub.clearSelection}
                data-ocid="content_hub.clear_selection_button"
              >
                <X size={12} className="mr-1" />
                Clear
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 h-8 text-xs"
                onClick={() => setShowBulkDeleteModal(true)}
                data-ocid="content_hub.bulk_delete_button"
              >
                <Trash2 size={12} className="mr-1" />
                Delete {selectedCount}
              </Button>
            </div>
          </div>
        )}

        {/* Content Grid */}
        {hub.isLoading && hub.smiles.length === 0 ? (
          <SmileSkeletonGrid />
        ) : hub.filteredSmiles.length === 0 ? (
          // Empty State
          <div
            className="flex flex-col items-center justify-center py-20 text-center px-4"
            data-ocid="content_hub.empty_state"
          >
            {hub.smiles.length === 0 ? (
              <>
                <div className="text-7xl mb-4">🐼</div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  No smiles yet, pookie!
                </h2>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Share your first smile and spread some happiness around the
                  world! 🌍✨
                </p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-lg font-bold text-foreground mb-2">
                  No smiles found
                </h2>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Try adjusting your search or date filter, pookie!
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    hub.setSearchQuery("");
                    hub.setDateRange("all");
                  }}
                >
                  Clear filters
                </Button>
              </>
            )}
          </div>
        ) : (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            data-ocid="content_hub.list"
          >
            {hub.filteredSmiles.map((smile, idx) => (
              <SmileCard
                key={smile.id}
                smile={smile}
                index={idx}
                isSelected={hub.selectedIds.has(smile.id)}
                onToggleSelect={hub.toggleSelect}
                onDelete={handleDeleteOne}
                isDeleting={isDeletingId === smile.id}
              />
            ))}
          </div>
        )}

        {/* Error state */}
        {hub.error && (
          <div
            className="flex items-center justify-between gap-3 bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-sm text-destructive"
            data-ocid="content_hub.error_state"
          >
            <span>😢 {hub.error}</span>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-destructive hover:bg-destructive/10 h-7"
              onClick={() => void hub.loadMySmiles()}
            >
              Retry
            </Button>
          </div>
        )}
      </div>

      {/* Bulk Delete Modal */}
      {showBulkDeleteModal && (
        <DeleteConfirmModal
          count={selectedCount}
          isDeleting={isBulkDeleting}
          onConfirm={handleBulkDelete}
          onCancel={() => setShowBulkDeleteModal(false)}
        />
      )}
    </div>
  );
}
