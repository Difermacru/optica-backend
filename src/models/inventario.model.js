import pool from '../db/pool.js'

// ── Categorías ────────────────────────────────────────────

export const getCategorias = async () => {
  const { rows } = await pool.query(`SELECT * FROM categorias ORDER BY nombre`)
  return rows
}

// ── Productos ─────────────────────────────────────────────

export const getProductos = async ({ search = '', categoria_id = null, solo_stock_bajo = false }) => {
  let conditions = ['p.activo = TRUE']
  const params = []
  let i = 1

  if (search) {
    conditions.push(`(p.nombre ILIKE $${i} OR p.codigo ILIKE $${i} OR p.marca ILIKE $${i})`)
    params.push(`%${search}%`)
    i++
  }
  if (categoria_id) {
    conditions.push(`p.categoria_id = $${i}`)
    params.push(categoria_id)
    i++
  }
  if (solo_stock_bajo) {
    conditions.push(`p.stock <= p.stock_minimo`)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const { rows } = await pool.query(
    `SELECT p.*, c.nombre AS categoria
     FROM productos p
     LEFT JOIN categorias c ON c.id = p.categoria_id
     ${where}
     ORDER BY p.nombre`,
    params
  )
  return rows
}

export const getProductoById = async (id) => {
  const { rows } = await pool.query(
    `SELECT p.*, c.nombre AS categoria
     FROM productos p
     LEFT JOIN categorias c ON c.id = p.categoria_id
     WHERE p.id = $1`,
    [id]
  )
  return rows[0] || null
}

export const createProducto = async ({ codigo, nombre, categoria_id, marca, precio_costo, precio_venta, stock, stock_minimo }) => {
  const { rows } = await pool.query(
    `INSERT INTO productos (codigo, nombre, categoria_id, marca, precio_costo, precio_venta, stock, stock_minimo)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [codigo || null, nombre, categoria_id || null, marca || null,
     precio_costo || 0, precio_venta || 0, stock || 0, stock_minimo || 1]
  )
  return rows[0]
}

export const updateProducto = async (id, { codigo, nombre, categoria_id, marca, precio_costo, precio_venta, stock, stock_minimo }) => {
  const { rows } = await pool.query(
    `UPDATE productos
     SET codigo=$1, nombre=$2, categoria_id=$3, marca=$4,
         precio_costo=$5, precio_venta=$6, stock=$7, stock_minimo=$8, updated_at=NOW()
     WHERE id=$9
     RETURNING *`,
    [codigo || null, nombre, categoria_id || null, marca || null,
     precio_costo || 0, precio_venta || 0, stock || 0, stock_minimo || 1, id]
  )
  return rows[0] || null
}

export const deleteProducto = async (id) => {
  const { rows } = await pool.query(
    `UPDATE productos SET activo=FALSE, updated_at=NOW() WHERE id=$1 RETURNING *`,
    [id]
  )
  return rows[0] || null
}

export const ajustarStock = async (id, cantidad) => {
  const { rows } = await pool.query(
    `UPDATE productos SET stock = stock + $1, updated_at=NOW()
     WHERE id=$2 RETURNING *`,
    [cantidad, id]
  )
  return rows[0] || null
}
