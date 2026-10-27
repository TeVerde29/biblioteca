const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar el token JWT
 */
const verificarToken = (req, res, next) => {
    try {
        // Obtener token del header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                mensaje: 'Acceso denegado. No se proporcionó token de autenticación.'
            });
        }

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Agregar información del usuario a la request
        req.usuario = decoded;
        
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                mensaje: 'Token expirado. Por favor, inicie sesión nuevamente.'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                mensaje: 'Token inválido.'
            });
        }

        return res.status(500).json({
            success: false,
            mensaje: 'Error al verificar token',
            error: error.message
        });
    }
};

/**
 * Middleware para verificar rol de administrador
 */
const verificarAdmin = (req, res, next) => {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({
            success: false,
            mensaje: 'Acceso denegado. Se requieren permisos de administrador.'
        });
    }
    next();
};

module.exports = {
    verificarToken,
    verificarAdmin
};