import { TaskPerformancePanel } from "@/components/task-performance-panel";

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="kicker">Fleet analytics</p>
        <h1 className="mt-2 font-header text-3xl text-theme-primary">Task Performance</h1>
        <p className="mt-1.5 font-body text-sm text-theme-soft">
          Per-robot, per-task success rates, failure modes, and reassignment recommendations.
        </p>
      </div>
      <TaskPerformancePanel />
    </div>
  );
}
