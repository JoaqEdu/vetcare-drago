import "dotenv/config"
import { PrismaClient, UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminEmail || !adminPassword) throw new Error("ADMIN_EMAIL o ADMIN_PASSWORD no estan definidos en .env")

    const existingAdmin = await prisma.user.findFirst({
        where: { role: UserRole.ADMIN }
    })

    if (existingAdmin) {
        console.log("✅ Admin ya existe")
        return
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    const admin = await prisma.user.create({
        data: {
        name: "Administrador",
        email: adminEmail,
        password: hashedPassword,
        role: UserRole.ADMIN,
        }
    })

    console.log("✅ Admin creado:", admin.email)
}

main()
.catch((e) => {
    console.error(e)
    process.exit(1)
})
.finally(async () => {
    await prisma.$disconnect()
})
