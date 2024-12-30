// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const prisma = require('../lib/prisma');

// Register endpoint'i
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log('Register isteği:', { name, email });

        // Email kontrolü
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Bu email zaten kullanılıyor' });
        }

        // Şifreyi hashle
        const hashedPassword = await bcrypt.hash(password, 10);

        // Yeni kullanıcı oluştur
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });

        console.log('Kullanıcı kaydedildi:', { id: user.id, email });

        // Token oluştur
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Register hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Login endpoint'i
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login isteği:', { email });

        // Kullanıcıyı bul
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({ message: 'Kullanıcı bulunamadı' });
        }

        // Şifre kontrolü
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Geçersiz şifre' });
        }

        // Token oluştur
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Kullanıcı giriş yaptı:', { id: user.id, email });
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Token doğrulama endpoint'i
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Token bulunamadı' });
        }

        // Token'ı doğrula
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Kullanıcıyı kontrol et
        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        });

        if (!user) {
            return res.status(401).json({ message: 'Geçersiz token' });
        }

        res.json({ valid: true });
    } catch (error) {
        res.status(401).json({ message: 'Geçersiz token' });
    }
});

// Kullanıcı bilgilerini getirme endpoint'i
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Token bulunamadı' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        });

        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        res.json({
            id: user.id,
            name: user.name,
            email: user.email
        });
    } catch (error) {
        res.status(401).json({ message: 'Geçersiz token' });
    }
});

module.exports = router;