import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { BreadcrumbNav } from "@/components/navigation/breadcrumb-nav"
import { SkipNav } from "@/components/accessibility/skip-nav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <TooltipProvider>
      <SkipNav />
      <div className="flex min-h-screen">
        <Sidebar
          user={{
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
          }}
        />
        <main className="flex-1 overflow-y-auto bg-muted/30">
          <div className="container mx-auto p-6 pt-20 md:pt-6">
            <div className="mb-4">
              <BreadcrumbNav />
            </div>
            <div id="main-content">
              {children}
            </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
}
