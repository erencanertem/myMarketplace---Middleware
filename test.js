// backend/test.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testDB() {
    try {
        // Test user oluştur
        const user = await prisma.user.create({
            data: {
                name: 'Test User',
                email: 'test@test.com',
                password: '123456'
            }
        })
        console.log('Test user created:', user)

        // Tüm kullanıcıları getir
        const users = await prisma.user.findMany()
        console.log('All users:', users)

    } catch (error) {
        console.error('Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

testDB()