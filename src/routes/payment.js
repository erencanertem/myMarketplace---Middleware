// backend/src/routes/payment.js
const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const auth = require('../middleware/auth');

// Test kartları için sabitler
const TEST_CARDS = {
    'success': '4242424242424242',
    'decline': '4000000000000002',
    'error': '4000000000000069'
};

// Ödeme işlemi
router.post('/process', auth, async (req, res) => {
    try {
        const { orderId, cardNumber, amount } = req.body;

        // Order'ı bul
        const order = await prisma.order.findUnique({
            where: { id: parseInt(orderId) },
            include: { user: true }
        });

        if (!order) {
            return res.status(404).json({ message: 'Sipariş bulunamadı' });
        }

        // Test kartına göre ödeme durumunu belirle
        let paymentStatus;
        switch (cardNumber) {
            case TEST_CARDS.success:
                paymentStatus = 'COMPLETED';
                break;
            case TEST_CARDS.decline:
                paymentStatus = 'FAILED';
                break;
            default:
                throw new Error('Geçersiz kart');
        }

        // Ödeme kaydı oluştur
        const payment = await prisma.payment.create({
            data: {
                orderId: order.id,
                amount: parseFloat(amount),
                status: paymentStatus,
                cardNumber: cardNumber.slice(-4)
            }
        });

        // Sipariş durumunu güncelle
        await prisma.order.update({
            where: { id: order.id },
            data: {
                status: paymentStatus === 'COMPLETED' ? 'PROCESSING' : 'CANCELLED'
            }
        });

        // Başarılı ödemede sepeti temizle
        if (paymentStatus === 'COMPLETED') {
            const cart = await prisma.cart.findUnique({
                where: { userId: order.userId }
            });

            if (cart) {
                await prisma.cartItem.deleteMany({
                    where: { cartId: cart.id }
                });
            }

            res.json({
                success: true,
                message: 'Ödeme başarılı',
                orderId: order.id
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Ödeme başarısız'
            });
        }
    } catch (error) {
        console.error('Ödeme işlemi hatası:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Ödeme işlemi sırasında bir hata oluştu'
        });
    }
});

module.exports = router;