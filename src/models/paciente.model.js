import pool from '../db/pool.js'

// ── Pacientes ────────────────────────────────────────────

export const getAllPacientes = async ({ search = '', limit = 8, offset = 0 }) => {
  const q = `%${search}%`
  const { rows } = await pool.query(
    `SELECT id, rut, nombre, apellido, telefono, email, fecha_nacimiento, created_at
     FROM pacientes
     WHERE nombre ILIKE $1 OR apellido ILIKE $1 OR rut ILIKE $1
     ORDER BY apellido, nombre
     LIMIT $2 OFFSET $3`,
    [q, limit, offset]
  )
  return rows
}

export const countPacientes = async ({ search = '' }) => {
  const q = `%${search}%`
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS total FROM pacientes
     WHERE nombre ILIKE $1 OR apellido ILIKE $1 OR rut ILIKE $1`,
    [q]
  )
  return rows[0].total
}

export const getPacienteById = async (id) => {
  const { rows } = await pool.query(
    `SELECT * FROM pacientes WHERE id = $1`,
    [id]
  )
  return rows[0] || null
}

export const createPaciente = async ({ rut, nombre, apellido, telefono, email, fecha_nacimiento }) => {
  const { rows } = await pool.query(
    `INSERT INTO pacientes (rut, nombre, apellido, telefono, email, fecha_nacimiento)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [rut, nombre, apellido, telefono || null, email || null, fecha_nacimiento || null]
  )
  return rows[0]
}

export const updatePaciente = async (id, { nombre, apellido, telefono, email, fecha_nacimiento }) => {
  const { rows } = await pool.query(
    `UPDATE pacientes
     SET nombre = $1, apellido = $2, telefono = $3, email = $4,
         fecha_nacimiento = $5, updated_at = NOW()
     WHERE id = $6
     RETURNING *`,
    [nombre, apellido, telefono || null, email || null, fecha_nacimiento || null, id]
  )
  return rows[0] || null
}

export const deletePaciente = async (id) => {
  const { rowCount } = await pool.query(
    `DELETE FROM pacientes WHERE id = $1`,
    [id]
  )
  return rowCount > 0
}

// ── Graduaciones ─────────────────────────────────────────

export const getGraduacionesByPaciente = async (paciente_id) => {
  const { rows } = await pool.query(
    `SELECT * FROM graduaciones
     WHERE paciente_id = $1
     ORDER BY fecha DESC, created_at DESC`,
    [paciente_id]
  )
  return rows
}

export const createGraduacion = async (paciente_id, data) => {
  const {
    fecha,
    od_esfera, od_cilindro, od_eje, od_avl, od_avc,
    oi_esfera, oi_cilindro, oi_eje, oi_avl, oi_avc,
    adicion, dip, observaciones
  } = data

  const { rows } = await pool.query(
    `INSERT INTO graduaciones
       (paciente_id, fecha,
        od_esfera, od_cilindro, od_eje, od_avl, od_avc,
        oi_esfera, oi_cilindro, oi_eje, oi_avl, oi_avc,
        adicion, dip, observaciones)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     RETURNING *`,
    [
      paciente_id, fecha || new Date().toISOString().split('T')[0],
      od_esfera || null, od_cilindro || null, od_eje || null, od_avl || null, od_avc || null,
      oi_esfera || null, oi_cilindro || null, oi_eje || null, oi_avl || null, oi_avc || null,
      adicion || null, dip || null, observaciones || null
    ]
  )
  return rows[0]
}

export const deleteGraduacion = async (id) => {
  const { rowCount } = await pool.query(
    `DELETE FROM graduaciones WHERE id = $1`,
    [id]
  )
  return rowCount > 0
}
