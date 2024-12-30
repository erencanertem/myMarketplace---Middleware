// backend/src/routes/orders.js
const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const auth = require('../middleware/auth');

// Tüm siparişleri getir
router.get('/', auth, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: {
                userId: req.user.id
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json(orders);
    } catch (error) {
        console.error('Siparişleri getirme hatası:', error);
        res.status(500).json({ message: 'Siparişler alınamadı' });
    }
});

router.get('/:id', auth, async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        
        if (isNaN(orderId)) {
            return res.status(400).json({ message: 'Geçersiz sipariş ID' });
        }

        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                userId: req.user.id
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                payment: true
            }
        });

        if (!order) {
            return res.status(404).json({ message: 'Sipariş bulunamadı' });
        }

        res.json(order);
    } catch (error) {
        console.error('Sipariş detayı getirme hatası:', error);
        res.status(500).json({ message: 'Sipariş detayları alınamadı' });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const { items } = req.body;
        
        // Total hesaplama
        const total = items.reduce((sum, item) => 
            sum + (item.product.price * item.quantity), 0);

        // Sipariş oluştur
        const order = await prisma.order.create({
            data: {
                userId: req.user.id,
                total,
                status: 'PENDING',
                items: {
                    create: items.map(item => ({
                        productId: item.product.id,
                        quantity: item.quantity,
                        price: item.product.price,
                        size: item.size || null,
                        color: item.color || null
                    }))
                }
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        // Stok güncelleme
        for (const item of items) {
            await prisma.product.update({
                where: { id: item.product.id },
                data: {
                    stock: {
                        decrement: item.quantity
                    }
                }
            });
        }

        res.status(201).json(order);
    } catch (error) {
        console.error('Sipariş oluşturma hatası:', error);
        res.status(500).json({ message: 'Sipariş oluşturulamadı' });
    }
});

module.exports = router;