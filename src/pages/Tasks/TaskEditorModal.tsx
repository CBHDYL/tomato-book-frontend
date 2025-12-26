import React from "react";
import { Modal } from "../../components/common/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import type {
  Priority,
  Status,
  Task,
  TaskCreate,
} from "../../features/tasks/types";
import { CalendarDays, Flag, Tag as TagIcon, ListChecks } from "lucide-react";

const schema = z.object({
  title: z.string().min(1, "Title required"),
  description: z.string().optional(),
  tag: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["active", "completed"]),
  dueAt: z.string().optional(),
});

type Form = z.infer<typeof schema>;

function prHelp(p: Priority) {
  if (p === "high")
    return {
      label: "High impact / urgent",
      cls: "text-red-700 bg-red-50 border-red-200",
    };
  if (p === "medium")
    return {
      label: "Normal priority",
      cls: "text-amber-700 bg-amber-50 border-amber-200",
    };
  return {
    label: "Nice to have",
    cls: "text-neutral-700 bg-neutral-50 border-neutral-200",
  };
}

function stHelp(s: Status) {
  if (s === "completed")
    return {
      label: "Done (won’t show in active lists)",
      cls: "text-emerald-700 bg-emerald-50 border-emerald-200",
    };
  return {
    label: "Active (shows in focus & lists)",
    cls: "text-neutral-700 bg-neutral-50 border-neutral-200",
  };
}

/**
 * Page component: TaskEditorModal.
 */
export function TaskEditorModal({
  open,
  onClose,
  initial,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Task | null;
  onSubmit: (
    payload: TaskCreate | { id: string; patch: Partial<TaskCreate> }
  ) => void;
}) {
  const isEdit = !!initial?.id;
  const [err, setErr] = React.useState<string | null>(null);

  const { register, handleSubmit, reset, control, watch } = useForm<Form>({
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      tag: initial?.tag ?? "",
      priority: (initial?.priority ?? "medium") as Priority,
      status: (initial?.status ?? "active") as Status,
      dueAt: initial?.dueAt ? initial.dueAt.slice(0, 10) : "",
    },
  });

  React.useEffect(() => {
    if (!open) return;
    setErr(null);
    reset({
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      tag: initial?.tag ?? "",
      priority: (initial?.priority ?? "medium") as Priority,
      status: (initial?.status ?? "active") as Status,
      dueAt: initial?.dueAt ? initial.dueAt.slice(0, 10) : "",
    });
  }, [open, initial, reset]);

  const pr = (watch("priority") ?? "medium") as Priority;
  const st = (watch("status") ?? "active") as Status;
  const prMeta = prHelp(pr);
  const stMeta = stHelp(st);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="min-w-0">
          <div className="text-base md:text-lg font-semibold text-neutral-900">
            {isEdit ? "Edit Task" : "Create Task"}
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            {isEdit
              ? "Update details and save changes."
              : "Add a new task — you can always refine it later."}
          </div>
        </div>
      }
      className="w-full md:max-w-2xl"
    >
      <form
        onSubmit={handleSubmit((raw) => {
          const parsed = schema.safeParse(raw);
          if (!parsed.success) {
            setErr(parsed.error.issues[0]?.message ?? "Invalid input");
            return;
          }
          const v = parsed.data;

          
          const dueISO = v.dueAt
            ? new Date(v.dueAt + "T12:00:00").toISOString()
            : null;

          if (isEdit && initial) {
            onSubmit({
              id: initial.id,
              patch: {
                title: v.title,
                description: v.description ?? "",
                tag: v.tag ?? "",
                priority: v.priority,
                status: v.status,
                dueAt: dueISO,
              },
            });
          } else {
            onSubmit({
              title: v.title,
              description: v.description ?? "",
              tag: v.tag ?? "",
              priority: v.priority,
              status: v.status,
              dueAt: dueISO,
            });
          }
          onClose();
        })}
        className="space-y-4"
      >
        {err ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="font-semibold">Check this</div>
            <div className="mt-1">{err}</div>
          </div>
        ) : null}

        {/* Basics */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
            <ListChecks className="h-4 w-4 text-neutral-600" />
            Basics
          </div>

          <div className="mt-4">
            <div className="text-sm font-medium mb-2">Title</div>
            <Input
              {...register("title")}
              placeholder="e.g., Finish assignment"
            />
          </div>

          <div className="mt-4">
            <div className="text-sm font-medium mb-2">Description</div>
            <textarea
              className="w-full min-h-[88px] md:min-h-[104px] rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-200"
              {...register("description")}
              placeholder="Optional notes…"
            />
          </div>
        </div>

        {/* Planning */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
            <CalendarDays className="h-4 w-4 text-neutral-600" />
            Planning
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm">
              <div className="mb-2 font-medium flex items-center gap-2">
                <Flag className="h-4 w-4 text-neutral-500" />
                Priority
              </div>

              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onChange={(v) => field.onChange(v as Priority)}
                    options={[
                      { value: "high", label: "High" },
                      { value: "medium", label: "Medium" },
                      { value: "low", label: "Low" },
                    ]}
                  />
                )}
              />

              <div className="mt-2">
                <div
                  className={[
                    "inline-flex items-center rounded-full border px-3 py-1 text-xs",
                    prMeta.cls,
                  ].join(" ")}
                >
                  {prMeta.label}
                </div>
              </div>
            </label>

            <label className="text-sm">
              <div className="mb-2 font-medium flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-neutral-500" />
                Status
              </div>

              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onChange={(v) => field.onChange(v as Status)}
                    options={[
                      { value: "active", label: "Active" },
                      { value: "completed", label: "Completed" },
                    ]}
                  />
                )}
              />

              <div className="mt-2">
                <div
                  className={[
                    "inline-flex items-center rounded-full border px-3 py-1 text-xs",
                    stMeta.cls,
                  ].join(" ")}
                >
                  {stMeta.label}
                </div>
              </div>
            </label>

            <label className="text-sm">
              <div className="mb-2 font-medium flex items-center gap-2">
                <TagIcon className="h-4 w-4 text-neutral-500" />
                Tag
              </div>
              <Input {...register("tag")} placeholder="personal / school" />
              <div className="mt-1 text-xs text-neutral-500">
                Optional. Helps filtering and search.
              </div>
            </label>

            <label className="text-sm">
              <div className="mb-2 font-medium flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-neutral-500" />
                Due date
              </div>
              <Input type="date" {...register("dueAt")} />
              <div className="mt-1 text-xs text-neutral-500">
                Optional. Adds the task to Calendar & due reminders.
              </div>
            </label>
          </div>
        </div>

        {}
        <div className="mt-2 border-t border-neutral-200 pt-4">
          <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-end gap-2">
            <Button
              className="w-full md:w-auto"
              variant="ghost"
              type="button"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="w-full md:w-auto"
              variant="primary"
              type="submit"
            >
              {isEdit ? "Save changes" : "Create task"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}