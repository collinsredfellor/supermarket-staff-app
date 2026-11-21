import { DEPARTMENTS } from "@/lib/erpData";
import DepartmentWorkspace from "@/components/DepartmentWorkspace";

export function generateStaticParams() {
  return DEPARTMENTS.map((dept) => ({
    code: dept.slug,
  }));
}

export default async function DepartmentPortalPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <DepartmentWorkspace slug={code.toLowerCase()} />;
}
