const db = require('../config/database');

/**
 * Obtener libros por ID de categoría
 * GET /api/categorias/:id
 */
const obtenerLibroPorIdCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [categoria] = await db.query('SELECT * FROM categoria WHERE idcategoria = ?', [id]);
        
        if (categoria.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Categoría no encontrada"
            });
        }
        
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
            mensaje: "Error al obtener los libros",
            error: error.message
        });
    }
};

module.exports = {
    obtenerLibroPorIdCategoria
};