require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const libroRoutes = require('./routes/libroRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/libros', libroRoutes);
app.use('/api/categorias', categoriaRoutes);

// Ruta raíz
app.get('/', (req, res) => {
    res.json({
        mensaje: "API BIBLIOTECA - CRUD con Autenticación JWT",
        version: "2.0.0",
        endpoints: {
            autenticacion: {
                registro: "POST /api/auth/registro",
                login: "POST /api/auth/login",
                perfil: "GET /api/auth/perfil [Token requerido]",
                verificar: "GET /api/auth/verificar [Token requerido]"
            },
            libros: {
                obtenerTodos: "GET /api/libros [Público]",
                obtenerPorId: "GET /api/libros/:id [Público]",
                crear: "POST /api/libros [Token requerido]",
                actualizar: "PUT /api/libros/:id [Token requerido]",
                eliminar: "DELETE /api/libros/:id [Token + Admin requerido]",
                porCategoria: "GET /api/libros/librosByCategoria/:id [Público]"
            },
            categorias: {
                obtenerLibros: "GET /api/categorias/:id [Público]"
            }
        },
        autenticacion: {
            tipo: "Bearer Token (JWT)",
            header: "Authorization: Bearer <token>",
            expiracion: "24 horas"
        }
    });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        success: false,
        mensaje: "Ruta no encontrada"
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════');
    console.log('Servidor con JWT inicializado correctamente');
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`Base de datos: ${process.env.DB_NAME || 'bdbiblioteca_dssl_ga'}`);
    console.log(`JWT configurado - Expiración: ${process.env.JWT_EXPIRES_IN || '24h'}`);
    console.log('═══════════════════════════════════════════');
});