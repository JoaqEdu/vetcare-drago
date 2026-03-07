import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { PortalClient } from "@/components/portal/portal-client"

export default async function PortalPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  // Buscar propietario por token
  const owner = await db.owner.findFirst({
    where: {
      portalToken: token,
      portalEnabled: true,
    },
    include: {
      patients: {
        where: { isActive: true },
        include: {
          appointments: {
            include: {
              medicalRecord: {
                select: { id: true }
              }
            },
            orderBy: { scheduledAt: "desc" },
            take: 50,
          },
          vaccinations: {
            orderBy: { administeredAt: "desc" },
            take: 50,
          },
          dewormings: {
            orderBy: { administeredAt: "desc" },
            take: 50,
          },
          dentalRecords: {
            orderBy: { performedAt: "desc" },
            take: 50,
          },
          medicalRecords: {
            orderBy: { visitDate: "desc" },
            take: 20,
          },
        },
      },
    },
  })

  if (!owner) {
    notFound()
  }

  // Actualizar último acceso
  await db.owner.update({
    where: { id: owner.id },
    data: { lastLoginAt: new Date() },
  })

  return <PortalClient owner={JSON.parse(JSON.stringify(owner))} />
}
