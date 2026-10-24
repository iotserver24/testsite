import { expect, test } from "bun:test";
import { GET as readTask } from "../app/api/tasks/crash/route";

test("the task read endpoint returns a task instead of a server error", async () => {
  const response = await readTask(new Request("http://localhost/api/tasks/crash"));
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body).toEqual({ ok: true, status: "In progress" });
});

test("a request for an unknown task returns not found", async () => {
  const response = await readTask(new Request("http://localhost/api/tasks/crash?id=0"));
  const body = await response.json();

  expect(response.status).toBe(404);
  expect(body).toEqual({ ok: false, error: "Task not found" });
});
