import prisma from './config/db'

async function main() {
  console.log("Attempting to create a user...")

  // Create a dummy user matching your Schema
  const user = await prisma.user.create({
    data: {
      auth0_id: "test-user-001",
      email: "test@example.com",
    },
  })
  
  console.log("SUCCESS! Created User:", user)
}

main()
  .catch((e) => {
    console.error("ERROR:", e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })