import pool from '../db/pool.js'

export const getCitasByFecha = async (fecha) => {
  const { rows } = await pool.query(
    `SELECT c.*, p.nombre, p.apellido, p.rut, p.telefono
     FROM citas c
     LEFT JOIN pacientes p ON p.id = c.paciente_id
     WHERE c.fecha = $1
     ORDER BY c.hora ASC`,
    [fecha]
  )
  return rows
}

export const getCitasByRango = async (desde, hasta) => {
  const { rows } = await pool.query(
    `SELECT c.*, p.nombre, p.apellido, p.rut
     FROM citas c
     LEFT JOIN pacientes p ON p.id = c.paciente_id
     WHERE c.fecha BETWEEN $1 AND $2
     ORDER BY c.fecha ASC, c.hora ASC`,
    [desde, hasta]
  )
  return rows
}

export const getCitaById = async (id) => {
  const { rows } = await pool.query(
    `SELECT c.*, p.nombre, p.apellido, p.rut, p.telefono
     FROM citas c
     LEFT JOIN pacientes p ON p.id = c.paciente_id
     WHERE c.id = $1`,
    [id]
  )
  return rows[0] || null
}

export const createCita = async ({ paciente_id, fecha, hora, motivo, notas }) => {
  const { rows } = await pool.query(
    `INSERT INTO citas (paciente_id, fecha, hora, motivo, notas)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [paciente_id || null, fecha, hora, motivo || null, notas || null]
  )
  return rows[0]
}

export const updateCita = async (id, { fecha, hora, motivo, notas, paciente_id }) => {
  const { rows } = await pool.query(
    `UPDATE citas
     SET fecha = $1, hora = $2, motivo = $3, notas = $4,
         paciente_id = $5, updated_at = NOW()
     WHERE id = $6
     RETURNING *`,
    [fecha, hora, motivo || null, notas || null, paciente_id || null, id]
  )
  return rows[0] || null
}

export const updateEstado = async (id, estado) => {
  const { rows } = await pool.query(
    `UPDATE citas SET estado = $1, updated_at = NOW()
     WHERE id = $2 RETURNING *`,
    [estado, id]
  )
  return rows[0] || null
}

export const deleteCita = async (id) => {
  const { rowCount } = await pool.query(`DELETE FROM citas WHERE id = $1`, [id])
  return rowCount > 0
}
