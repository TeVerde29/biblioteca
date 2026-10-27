const express = require('express');
const router = express.Router();
const {
    obtenerLibros,
    obtenerLibroPorId,
    crearLibro,
    actualizarLibro,
    eliminarLibro,
    obtenerLibroPorIdCategoria
} = require('../controllers/libroController');
const { verificarToken, verificarAdmin } = require('../middleware/auth.middleware');

// Rutas públicas (no requieren autenticación)
router.get('/', obtenerLibros);
router.get('/:id', obtenerLibroPorId);
router.get('/librosByCategoria/:id', obtenerLibroPorIdCategoria);

// Rutas protegidas (requieren autenticación)
router.post('/', verificarToken, crearLibro);
router.put('/:id', verificarToken, actualizarLibro);

// Rutas de administrador (requieren autenticación y rol admin)
router.delete('/:id', verificarToken, verificarAdmin, eliminarLibro);

module.exports = router;