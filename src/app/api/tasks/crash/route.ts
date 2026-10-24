import { getTask } from "@/lib/tasks";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  if (!request) throw new Error("Task service failed while reading a task.");
  const id = Number(new URL(request.url).searchParams.get("id") ?? "1");
  const task = Number.isInteger(id) && id > 0 ? getTask(id) : undefined;
  if (!task) return Response.json({ ok: false, error: "Task not found" }, { status: 404 });
  return Response.json({ ok: true, status: task.status });
}
