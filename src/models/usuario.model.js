import pool from '../db/pool.js'

export const getUserByEmail = async (email) => {
  const { rows } = await pool.query(
    `SELECT * FROM usuarios WHERE email = $1 AND activo = TRUE`,
    [email]
  )
  return rows[0] || null
}

export const getUserById = async (id) => {
  const { rows } = await pool.query(
    `SELECT id, nombre, email, rol, activo, created_at FROM usuarios WHERE id = $1`,
    [id]
  )
  return rows[0] || null
}

export const getAllUsuarios = async () => {
  const { rows } = await pool.query(
    `SELECT id, nombre, email, rol, activo, created_at FROM usuarios ORDER BY nombre`
  )
  return rows
}

export const createUsuario = async ({ nombre, email, password_hash, rol }) => {
  const { rows } = await pool.query(
    `INSERT INTO usuarios (nombre, email, password_hash, rol)
     VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol, activo, created_at`,
    [nombre, email, password_hash, rol || 'vendedor']
  )
  return rows[0]
}

export const updateUsuario = async (id, { nombre, email, rol, activo }) => {
  const { rows } = await pool.query(
    `UPDATE usuarios SET nombre=$1, email=$2, rol=$3, activo=$4
     WHERE id=$5 RETURNING id, nombre, email, rol, activo`,
    [nombre, email, rol, activo, id]
  )
  return rows[0] || null
}

export const updatePassword = async (id, password_hash) => {
  const { rowCount } = await pool.query(
    `UPDATE usuarios SET password_hash=$1 WHERE id=$2`,
    [password_hash, id]
  )
  return rowCount > 0
}
