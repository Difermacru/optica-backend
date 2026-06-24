import pool from '../db/pool.js'

// ── Reportes de ventas ────────────────────────────────────

export const getReporteVentas = async (desde, hasta) => {
  const { rows } = await pool.query(
    `SELECT
       fecha,
       COUNT(*)::int                                          AS total_ventas,
       COALESCE(SUM(total), 0)                               AS monto_total,
       COALESCE(SUM(CASE WHEN metodo_pago='efectivo'      THEN total END), 0) AS efectivo,
       COALESCE(SUM(CASE WHEN metodo_pago='debito'        THEN total END), 0) AS debito,
       COALESCE(SUM(CASE WHEN metodo_pago='credito'       THEN total END), 0) AS credito,
       COALESCE(SUM(CASE WHEN metodo_pago='transferencia' THEN total END), 0) AS transferencia
     FROM ventas
     WHERE fecha BETWEEN $1 AND $2 AND estado = 'completada'
     GROUP BY fecha
     ORDER BY fecha ASC`,
    [desde, hasta]
  )
  return rows
}

export const getProductosMasVendidos = async (desde, hasta, limit = 10) => {
  const { rows } = await pool.query(
    `SELECT
       dv.nombre_producto,
       SUM(dv.cantidad)::int                 AS unidades,
       SUM(dv.subtotal)                      AS monto_total,
       COUNT(DISTINCT dv.venta_id)::int      AS num_ventas
     FROM detalle_ventas dv
     JOIN ventas v ON v.id = dv.venta_id
     WHERE v.fecha BETWEEN $1 AND $2 AND v.estado = 'completada'
     GROUP BY dv.nombre_producto
     ORDER BY unidades DESC
     LIMIT $3`,
    [desde, hasta, limit]
  )
  return rows
}

export const getResumenPeriodo = async (desde, hasta) => {
  const { rows: [resumen] } = await pool.query(
    `SELECT
       COUNT(*)::int                          AS total_ventas,
       COALESCE(SUM(total), 0)               AS monto_total,
       COALESCE(AVG(total), 0)               AS ticket_promedio,
       COALESCE(MAX(total), 0)               AS venta_maxima,
       COALESCE(SUM(descuento), 0)           AS total_descuentos,
       COUNT(DISTINCT paciente_id)::int       AS clientes_distintos
     FROM ventas
     WHERE fecha BETWEEN $1 AND $2 AND estado = 'completada'`,
    [desde, hasta]
  )
  return resumen
}

// ── Recordatorios de control anual ───────────────────────

export const getPacientesControlAnual = async () => {
  const { rows } = await pool.query(
    `SELECT
       p.id, p.nombre, p.apellido, p.rut, p.telefono, p.email,
       MAX(g.fecha)                           AS ultima_graduacion,
       NOW()::date - MAX(g.fecha)             AS dias_desde_control
     FROM pacientes p
     LEFT JOIN graduaciones g ON g.paciente_id = p.id
     GROUP BY p.id
     HAVING MAX(g.fecha) < NOW() - INTERVAL '12 months'
        OR MAX(g.fecha) IS NULL
     ORDER BY ultima_graduacion ASC NULLS FIRST`
  )
  return rows
}

// ── Historial de ventas por paciente ─────────────────────

export const getVentasPorPaciente = async (paciente_id) => {
  const { rows: ventas } = await pool.query(
    `SELECT v.*
     FROM ventas v
     WHERE v.paciente_id = $1 AND v.estado = 'completada'
     ORDER BY v.created_at DESC`,
    [paciente_id]
  )

  // Cargar detalle de cada venta
  const conDetalle = await Promise.all(ventas.map(async (v) => {
    const { rows: detalle } = await pool.query(
      `SELECT * FROM detalle_ventas WHERE venta_id = $1`, [v.id]
    )
    return { ...v, detalle }
  }))

  return conDetalle
}

// ── Detalle completo de venta (para impresión) ────────────

export const getVentaDetalle = async (id) => {
  const { rows: [venta] } = await pool.query(
    `SELECT v.*, p.nombre, p.apellido, p.rut, p.telefono, p.email
     FROM ventas v
     LEFT JOIN pacientes p ON p.id = v.paciente_id
     WHERE v.id = $1`,
    [id]
  )
  if (!venta) return null

  const { rows: detalle } = await pool.query(
    `SELECT * FROM detalle_ventas WHERE venta_id = $1 ORDER BY id`, [id]
  )
  return { ...venta, detalle }
}
