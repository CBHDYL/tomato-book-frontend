import React from "react";
import { Modal } from "../components/common/Modal";
import { Button } from "../components/ui/Button";
import { EditProfileModal } from "./EditProfileModal";
import { genderLabel, statusLabel } from "../features/profile/profileApi";
import { useProfileQuery } from "../features/profile/profileQueries";

function InfoTile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-0 bg-white px-2 py-2">
      <div className="text-xs font-semibold text-neutral-500">{label}</div>
      <div className="mt-1 text-sm md:text-md font-medium text-neutral-900 truncate">
        {value}
      </div>
    </div>
  );
}

/**
 * ProfileModal.
 */
export function ProfileModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [editOpen, setEditOpen] = React.useState(false);

  const {
    data: profile,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useProfileQuery(open);

  if (!open) return null;

  if (isLoading || error || !profile) {
    return (
      <>
        <Modal open={open} onClose={onClose} title="Profile">
          <div className="px-1">
            {isLoading ? (
              <div className="p-4 text-sm text-neutral-500">Loading...</div>
            ) : error ? (
              <div className="p-4">
                <div className="text-sm text-red-600">
                  {(error as any)?.message || "Failed to load profile."}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="primary" onClick={() => refetch()}>
                    Retry
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 text-sm text-neutral-500">
                No profile data.
              </div>
            )}
          </div>
        </Modal>

        <EditProfileModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSaved={() => {
            setEditOpen(false);
            refetch().catch(() => {});
          }}
        />
      </>
    );
  }

  const avatarSrc =
    profile.avatar?.trim() ||
    "https://api.dicebear.com/7.x/initials/svg?seed=" +
      encodeURIComponent(profile.nickname || profile.username || "User");

  const badgeText = (profile.role || "user")
    .toUpperCase()
    .replace(/^ROLE_/, "");

  return (
    <>
      <Modal open={open} onClose={onClose} title="Profile">
        <div className="px-1">
          <div className="flex flex-col items-center text-center">
            <img
              src={avatarSrc}
              alt="avatar"
              className="h-20 w-20 md:h-24 md:w-24 rounded-full border object-cover shadow-sm"
            />

            <div className="mt-3 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {badgeText}
              {isFetching ? (
                <span className="ml-2 opacity-70">(syncing)</span>
              ) : null}
            </div>

            <div className="mt-3 text-xl md:text-2xl font-semibold text-neutral-900">
              {profile.nickname || profile.username || "—"}
            </div>

            <div className="mt-1 text-sm text-neutral-500">
              @{profile.username || "—"} · {genderLabel(profile.gender)} ·{" "}
              {statusLabel(profile.status)}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoTile label="Email" value={profile.email || "—"} />
            <InfoTile label="Phone" value={profile.phone || "—"} />
            <InfoTile label="Role" value={profile.role || "—"} />
            <InfoTile label="User ID" value={profile.id ?? "—"} />
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoTile label="Create Time" value={profile.createTime || "—"} />
            <InfoTile label="Update Time" value={profile.updateTime || "—"} />
          </div>

          {/* Mobile: full width buttons, stacked */}
          <div className="mt-6 flex flex-col-reverse md:flex-row md:items-center md:justify-end gap-2">
            <Button
              className="w-full md:w-auto"
              variant="ghost"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              className="w-full md:w-auto"
              variant="primary"
              onClick={() => setEditOpen(true)}
            >
              Edit profile
            </Button>
          </div>
        </div>
      </Modal>

      <EditProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={() => {
          setEditOpen(false);
          refetch().catch(() => {});
        }}
      />
    </>
  );
}