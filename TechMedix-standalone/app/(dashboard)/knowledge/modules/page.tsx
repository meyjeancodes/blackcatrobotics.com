import { redirect } from "next/navigation";

// /knowledge/modules redirects to the hub page which renders the module grid
export default function ModulesIndexPage() {
  redirect("/knowledge");
}
