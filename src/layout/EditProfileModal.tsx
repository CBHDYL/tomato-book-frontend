import React from "react";
import { Modal } from "../components/common/Modal";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useToast } from "../components/common/ToastHost";
import {
  useProfileQuery,
  useUpdateProfileMutation,
} from "../features/profile/profileQueries";
import type { Profile, UpdateProfilePayload } from "../features/profile/types";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="text-sm">
      <div className="mb-2 font-medium text-neutral-800">{label}</div>
      {children}
      {hint ? (
        <div className="mt-1 text-xs text-neutral-500">{hint}</div>
      ) : null}
    </label>
  );
}

function Select({
  value,
  onChange,
  disabled,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={[
        "w-full rounded-xl border bg-white px-3 py-2 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-neutral-200",
        disabled ? "opacity-60" : "",
      ].join(" ")}
    >
      {children}
    </select>
  );
}

/**
 * EditProfileModal.
 */
export function EditProfileModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();

  const { data: serverProfile, isLoading } = useProfileQuery(open);
  const updateMut = useUpdateProfileMutation();

  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [snapshot, setSnapshot] = React.useState<Profile | null>(null);

  React.useEffect(() => {
    if (!open) return;
    if (!serverProfile) return;
    setProfile(serverProfile);
    setSnapshot(serverProfile);
  }, [open, serverProfile]);

  function cancel() {
    if (snapshot) setProfile(snapshot);
    onClose();
  }

  function removePhoto() {
    if (!profile) return;
    setProfile({ ...profile, avatar: "" });
  }

  async function save() {
    if (!profile) return;

    const payload: UpdateProfilePayload = {
      nickname: profile.nickname ?? "",
      phone: profile.phone ?? "",
      email: profile.email ?? "",
      avatar: profile.avatar ?? "",
    };

    try {
      await updateMut.mutateAsync(payload);
      toast.push("Profile updated");
      onSaved();
    } catch (err: any) {
      const msg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        err?.message ||
        "Update profile failed";
      toast.push(msg);
    }
  }

  if (!open) return null;

  if (isLoading || !profile) {
    return (
      <Modal open={open} onClose={cancel}>
        <div className="p-4 text-sm text-neutral-500">Loading...</div>
      </Modal>
    );
  }

  const avatarSrc =
    profile.avatar?.trim() ||
    "https://api.dicebear.com/7.x/initials/svg?seed=" +
      encodeURIComponent(profile.nickname || profile.username || "User");

  const saving = updateMut.isPending;

  return (
    <Modal open={open} onClose={cancel} title="Edit Profile">
      <div className="px-1">
        {/* Header area: mobile stacks */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 border-b pb-4">
          <img
            src={avatarSrc}
            alt="avatar"
            className="h-16 w-16 rounded-full border object-cover"
          />

          <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Button
                className="w-full sm:w-auto"
                variant="primary"
                onClick={() => toast.push("Upload: Not implemented")}
              >
                Upload photo
              </Button>
              <Button
                className="w-full sm:w-auto"
                variant="ghost"
                onClick={removePhoto}
              >
                Remove photo
              </Button>
            </div>
            <div className="text-xs text-neutral-500">
              At least 132 × 132px PNG or JPG file.
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Full name">
            <Input
              value={profile.nickname ?? ""}
              onChange={(e) =>
                setProfile({ ...profile, nickname: e.target.value })
              }
            />
          </Field>

          <Field label="Email">
            <Input
              value={profile.email ?? ""}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
            />
          </Field>

          <Field
            label="Username"
            hint="(Read only) Backend does not support updating username yet."
          >
            <Input value={profile.username ?? ""} readOnly disabled />
          </Field>

          <Field label="Phone">
            <Input
              value={profile.phone ?? ""}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
            />
          </Field>

          <Field
            label="Avatar URL"
            hint="临时方案：你接上传后可改成后端返回 URL"
          >
            <Input
              value={profile.avatar ?? ""}
              onChange={(e) =>
                setProfile({ ...profile, avatar: e.target.value })
              }
            />
          </Field>

          <Field
            label="Gender"
            hint="(Read only) 0: Unspecified, 1: Male, 2: Female"
          >
            <Select
              value={String(profile.gender ?? "")}
              onChange={() => {}}
              disabled
            >
              <option value="">—</option>
              <option value="0">Unspecified (0)</option>
              <option value="1">Male (1)</option>
              <option value="2">Female (2)</option>
            </Select>
          </Field>
        </div>

        {/* Footer buttons: mobile full width */}
        <div className="mt-6 flex flex-col-reverse md:flex-row md:items-center md:justify-end gap-2">
          <Button className="w-full md:w-auto" variant="ghost" onClick={cancel}>
            Close
          </Button>
          <Button
            className="w-full md:w-auto"
            variant="primary"
            onClick={save}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}