import { GanttChart } from "@/components/gantt/gantt-chart";

export default function ProjectsPage() {
  return (
    <div>
      <h1 className="text-2xl font-medium text-text-primary mb-6">Projects</h1>
      <GanttChart />
    </div>
  );
}
