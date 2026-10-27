const db = require('../config/database');

/**
 * Obtener todos los libros
 * GET /api/libros
 */
const obtenerLibros = async (req, res) => {
    try {
        const [libros] = await db.query('SELECT * FROM libros ORDER BY id DESC');
        
        res.json({
            success: true,
            count: libros.length,
            data: libros
        });
    } catch (error) {
        console.error('Error al obtener libros:', error);
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener los libros",
            error: error.message
        });
    }
};

/**
 * Obtener un libro por ID
 * GET /api/libros/:id
 */
const obtenerLibroPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const [libro] = await db.query('SELECT * FROM libros WHERE id = ?', [id]);
        
        if (libro.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Libro no encontrado"
            });
        }
        
        res.json({
            success: true,
            data: libro[0]
        });
    } catch (error) {
        console.error('Error al obtener libro por ID:', error);
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener el libro",
            error: error.message
        });
    }
};

/**
 * Crear un nuevo libro
 * POST /api/libros
 * Requiere autenticación
 */
const crearLibro = async (req, res) => {
    try {
        const { titulo, autor, isbn, editorial, idcategoria } = req.body;
        
        // Validación de campos obligatorios
        if (!titulo || !autor) {
            return res.status(400).json({
                success: false,
                mensaje: "Título y autor son obligatorios"
            });
        }
        
        const [resultado] = await db.query(
            'INSERT INTO libros (titulo, autor, isbn, editorial, idcategoria) VALUES (?, ?, ?, ?, ?)',
            [titulo, autor, isbn, editorial, idcategoria]
        );
        
        res.status(201).json({
            success: true,
            mensaje: "Libro creado exitosamente",
            data: {
                id: resultado.insertId,
                titulo,
                autor,
                isbn,
                editorial,
                idcategoria
            }
        });
    } catch (error) {
        console.error('Error al crear libro:', error);
        res.status(500).json({
            success: false,
            mensaje: "Error al crear el libro",
            error: error.message
        });
    }
};

/**
 * Actualizar un libro existente
 * PUT /api/libros/:id
 * Requiere autenticación
 */
const actualizarLibro = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, autor, isbn, editorial, idcategoria } = req.body;
        
        // Verificar si el libro existe
        const [libroExistente] = await db.query('SELECT * FROM libros WHERE id = ?', [id]);
        
        if (libroExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Libro no encontrado"
            });
        }
        
        await db.query(
            'UPDATE libros SET titulo = ?, autor = ?, isbn = ?, editorial = ?, idcategoria = ? WHERE id = ?',
            [titulo, autor, isbn, editorial, idcategoria, id]
        );
        
        res.json({
            success: true,
            mensaje: "Libro actualizado exitosamente",
            data: {
                id,
                titulo,
                autor,
                isbn,
                editorial,
                idcategoria
            }
        });
    } catch (error) {
        console.error('Error al actualizar libro:', error);
        res.status(500).json({
            success: false,
            mensaje: "Error al actualizar el libro",
            error: error.message
        });
    }
};

/**
 * Eliminar un libro
 * DELETE /api/libros/:id
 * Requiere autenticación y rol admin
 */
const eliminarLibro = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar si el libro existe
        const [libroExistente] = await db.query('SELECT * FROM libros WHERE id = ?', [id]);
        
        if (libroExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Libro no encontrado"
            });
        }
        
        await db.query('DELETE FROM libros WHERE id = ?', [id]);
        
        res.json({
            success: true,
            mensaje: "Libro eliminado exitosamente"
        });
    } catch (error) {
        console.error('Error al eliminar libro:', error);
        res.status(500).json({
            success: false,
            mensaje: "Error al eliminar el libro",
            error: error.message
        });
    }
};

/**
 * Obtener libros por categoría
 * GET /api/libros/librosByCategoria/:id
 */
const obtenerLibroPorIdCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar si la categoría existe
        const [categoria] = await db.query('SELECT * FROM categoria WHERE idcategoria = ?', [id]);
        
        if (categoria.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Categoría no encontrada"
            });
        }
        
        // Obtener libros de esa categoría
        const [libros] = await db.query('SELECT * FROM libros WHERE idcategoria = ?', [id]);
        
        res.json({
            success: true,
            categoria: categoria[0],
            count: libros.length,
            data: libros
        });
    } catch (error) {
        console.error('Error al obtener libros por categoría:', error);
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener los libros por categoría",
            error: error.message
        });
    }
};

module.exports = {
    obtenerLibros,
    obtenerLibroPorId,
    crearLibro,
    actualizarLibro,
    eliminarLibro,
    obtenerLibroPorIdCategoria
};