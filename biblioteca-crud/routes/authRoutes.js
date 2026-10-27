const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    registrarUsuario,
    login,
    obtenerPerfil,
    verificarToken
} = require('../controllers/authController');
const { verificarToken: middlewareToken } = require('../middleware/auth.middleware');

// Validaciones
const validacionRegistro = [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres')
];

// Rutas públicas
router.post('/registro', validacionRegistro, registrarUsuario);
router.post('/login', login);

// Rutas protegidas
router.get('/perfil', middlewareToken, obtenerPerfil);
router.get('/verificar', middlewareToken, verificarToken);

module.exports = router;