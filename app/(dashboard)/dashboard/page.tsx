import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const userName = session.user.name?.split(" ")[0] || "Usuario"

  return <DashboardContent userName={userName} />
}
