import * as InventarioModel from '../models/inventario.model.js'

export const listarCategorias = async (req, res) => {
  try {
    const data = await InventarioModel.getCategorias()
    res.json({ ok: true, data })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}

export const listarProductos = async (req, res) => {
  try {
    const { search = '', categoria_id, stock_bajo } = req.query
    const data = await InventarioModel.getProductos({
      search,
      categoria_id: categoria_id ? Number(categoria_id) : null,
      solo_stock_bajo: stock_bajo === 'true'
    })
    res.json({ ok: true, data })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}

export const obtenerProducto = async (req, res) => {
  try {
    const data = await InventarioModel.getProductoById(req.params.id)
    if (!data) return res.status(404).json({ ok: false, error: 'Producto no encontrado' })
    res.json({ ok: true, data })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}

export const crearProducto = async (req, res) => {
  try {
    const { nombre, precio_venta } = req.body
    if (!nombre) return res.status(400).json({ ok: false, error: 'El nombre es obligatorio' })
    if (precio_venta === undefined) return res.status(400).json({ ok: false, error: 'El precio de venta es obligatorio' })
    const data = await InventarioModel.createProducto(req.body)
    res.status(201).json({ ok: true, data })
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ ok: false, error: 'El código ya existe' })
    res.status(500).json({ ok: false, error: err.message })
  }
}

export const actualizarProducto = async (req, res) => {
  try {
    const data = await InventarioModel.updateProducto(req.params.id, req.body)
    if (!data) return res.status(404).json({ ok: false, error: 'Producto no encontrado' })
    res.json({ ok: true, data })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}

export const eliminarProducto = async (req, res) => {
  try {
    const data = await InventarioModel.deleteProducto(req.params.id)
    if (!data) return res.status(404).json({ ok: false, error: 'Producto no encontrado' })
    res.json({ ok: true, message: 'Producto desactivado' })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}

export const ajustarStock = async (req, res) => {
  try {
    const { cantidad } = req.body
    if (!cantidad) return res.status(400).json({ ok: false, error: 'Cantidad requerida' })
    const data = await InventarioModel.ajustarStock(req.params.id, Number(cantidad))
    if (!data) return res.status(404).json({ ok: false, error: 'Producto no encontrado' })
    res.json({ ok: true, data })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}
