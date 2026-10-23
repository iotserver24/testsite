import { writeFileSync } from "node:fs";

const routePath = new URL("../src/app/api/tasks/route.ts", import.meta.url);

const rollback = `import { NextResponse } from "next/server";
import { getFaultMode, tasks } from "@/lib/tasks";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const mode = getFaultMode();

  if (mode === "runtime" || mode === "persistent") {
    return NextResponse.json(
      {
        ok: false,
        error: mode === "runtime"
          ? "Demo runtime regression: task service unavailable"
          : "Demo persistent defect: task query failed",
        mode
      },
      { status: 500 }
    );
  }

  const status = new URL(request.url).searchParams.get("status");
  if (!status) {
    return NextResponse.json(
      { ok: false, error: "Task service failed while listing tasks." },
      { status: 500 }
    );
  }

  const selected = tasks.filter((task) => task.status === status.toLowerCase());
  return NextResponse.json({
    ok: true,
    count: selected.length,
    tasks: selected,
    timestamp: new Date().toISOString()
  });
}
`;

const fixOnly = `import { NextResponse } from "next/server";
import { getFaultMode, tasks } from "@/lib/tasks";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const mode = getFaultMode();

  if (mode === "runtime" || mode === "persistent") {
    return NextResponse.json(
      {
        ok: false,
        error: mode === "runtime"
          ? "Demo runtime regression: task service unavailable"
          : "Demo persistent defect: task query failed",
        mode
      },
      { status: 500 }
    );
  }

  const status = new URL(request.url).searchParams.get("status");
  // Build failure: status can be null, so next build fails before this deploy goes live.
  const selected = tasks.filter((task) => task.status.toLowerCase() === status.toLowerCase());
  return NextResponse.json({
    ok: true,
    count: selected.length,
    tasks: selected,
    timestamp: new Date().toISOString()
  });
}
`;

const mode = process.argv[2];
if (mode !== "rollback" && mode !== "fix-only") {
  console.error("Usage: node scripts/demo-case.mjs <rollback|fix-only>");
  process.exit(1);
}

writeFileSync(routePath, mode === "rollback" ? rollback : fixOnly);
console.log(mode === "rollback"
  ? "Wrote the rollback case. Unfiltered /api/tasks returns 500, and the previous healthy deploy still passes. Commit this on top of a healthy main, then push. Sentinel rolls production back, then opens a fix PR."
  : "Wrote the fix-only case. next build fails on status.toLowerCase() because status may be null, so this deploy never becomes production. Commit and push while the current production deploy is healthy. Sentinel opens a fix PR and does not roll back.");
