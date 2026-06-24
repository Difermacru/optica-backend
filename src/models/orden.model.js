import pool from '../db/pool.js'

export const getOrdenes = async ({ estado, desde, hasta }) => {
  const conditions = []
  const params = []
  let i = 1

  if (estado)  { conditions.push(`o.estado = $${i++}`);     params.push(estado) }
  if (desde)   { conditions.push(`o.fecha >= $${i++}`);     params.push(desde) }
  if (hasta)   { conditions.push(`o.fecha <= $${i++}`);     params.push(hasta) }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const { rows } = await pool.query(
    `SELECT o.*, p.nombre, p.apellido, p.rut
     FROM ordenes_laboratorio o
     LEFT JOIN pacientes p ON p.id = o.paciente_id
     ${where}
     ORDER BY o.created_at DESC`,
    params
  )
  return rows
}

export const getOrdenById = async (id) => {
  const { rows } = await pool.query(
    `SELECT o.*, p.nombre, p.apellido, p.rut
     FROM ordenes_laboratorio o
     LEFT JOIN pacientes p ON p.id = o.paciente_id
     WHERE o.id = $1`,
    [id]
  )
  return rows[0] || null
}

export const createOrden = async (data) => {
  const {
    venta_id, paciente_id, descripcion, fecha,
    od_esfera, od_cilindro, od_eje,
    oi_esfera, oi_cilindro, oi_eje,
    adicion, notas
  } = data

  const { rows } = await pool.query(
    `INSERT INTO ordenes_laboratorio
       (venta_id, paciente_id, descripcion, fecha,
        od_esfera, od_cilindro, od_eje,
        oi_esfera, oi_cilindro, oi_eje,
        adicion, notas)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [
      venta_id || null, paciente_id || null,
      descripcion, fecha || new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' }),
      od_esfera || null, od_cilindro || null, od_eje || null,
      oi_esfera || null, oi_cilindro || null, oi_eje || null,
      adicion || null, notas || null
    ]
  )
  return rows[0]
}

export const updateEstadoOrden = async (id, estado, notas) => {
  const { rows } = await pool.query(
    `UPDATE ordenes_laboratorio
     SET estado = $1, notas = COALESCE($2, notas), updated_at = NOW()
     WHERE id = $3 RETURNING *`,
    [estado, notas || null, id]
  )
  return rows[0] || null
}

export const deleteOrden = async (id) => {
  const { rowCount } = await pool.query(
    `DELETE FROM ordenes_laboratorio WHERE id = $1`, [id]
  )
  return rowCount > 0
}
