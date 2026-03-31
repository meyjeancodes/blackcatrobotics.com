import { RobotTable } from "../../../components/robot-table";
import { SurfaceCard } from "../../../components/surface-card";
import { getDashboardData } from "../../../lib/data";

export default async function FleetPage() {
  const { snapshot } = await getDashboardData();

  return (
    <SurfaceCard title="Fleet inventory" eyebrow="Customer robots">
      <RobotTable robots={snapshot.robots} />
    </SurfaceCard>
  );
}
