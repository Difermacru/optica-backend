import pool from '../db/pool.js'

export const getVentas = async ({ desde, hasta, paciente_id }) => {
  let conditions = []
  const params = []
  let i = 1

  if (desde) { conditions.push(`v.fecha >= $${i}`); params.push(desde); i++ }
  if (hasta) { conditions.push(`v.fecha <= $${i}`); params.push(hasta); i++ }
  if (paciente_id) { conditions.push(`v.paciente_id = $${i}`); params.push(paciente_id); i++ }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const { rows } = await pool.query(
    `SELECT v.*, p.nombre, p.apellido, p.rut
     FROM ventas v
     LEFT JOIN pacientes p ON p.id = v.paciente_id
     ${where}
     ORDER BY v.created_at DESC`,
    params
  )
  return rows
}

export const getVentaById = async (id) => {
  const { rows: [venta] } = await pool.query(
    `SELECT v.*, p.nombre, p.apellido, p.rut
     FROM ventas v LEFT JOIN pacientes p ON p.id = v.paciente_id
     WHERE v.id = $1`,
    [id]
  )
  if (!venta) return null

  const { rows: detalle } = await pool.query(
    `SELECT * FROM detalle_ventas WHERE venta_id = $1`,
    [id]
  )
  return { ...venta, detalle }
}

export const createVenta = async ({ paciente_id, items, descuento = 0, metodo_pago = 'efectivo', notas }) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Calcular totales
    const subtotal = items.reduce((sum, i) => sum + (i.precio_unit * i.cantidad), 0)
    const total = subtotal - descuento

    // Insertar venta
    const { rows: [venta] } = await client.query(
      `INSERT INTO ventas (paciente_id, subtotal, descuento, total, metodo_pago, notas)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [paciente_id || null, subtotal, descuento, total, metodo_pago, notas || null]
    )

    // Insertar detalle y descontar stock
    for (const item of items) {
      const itemSubtotal = item.precio_unit * item.cantidad
      await client.query(
        `INSERT INTO detalle_ventas (venta_id, producto_id, nombre_producto, cantidad, precio_unit, subtotal)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [venta.id, item.producto_id || null, item.nombre_producto, item.cantidad, item.precio_unit, itemSubtotal]
      )
      if (item.producto_id) {
        await client.query(
          `UPDATE productos SET stock = stock - $1 WHERE id = $2`,
          [item.cantidad, item.producto_id]
        )
      }
    }

    await client.query('COMMIT')
    return await getVentaById(venta.id)
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export const anularVenta = async (id) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows: detalle } = await client.query(
      `SELECT * FROM detalle_ventas WHERE venta_id = $1`, [id]
    )

    // Devolver stock
    for (const item of detalle) {
      if (item.producto_id) {
        await client.query(
          `UPDATE productos SET stock = stock + $1 WHERE id = $2`,
          [item.cantidad, item.producto_id]
        )
      }
    }

    const { rows: [venta] } = await client.query(
      `UPDATE ventas SET estado='anulada' WHERE id=$1 RETURNING *`, [id]
    )

    await client.query('COMMIT')
    return venta
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export const getResumenDia = async (fecha) => {
  const { rows: [resumen] } = await pool.query(
    `SELECT
       COUNT(*)::int AS total_ventas,
       COALESCE(SUM(total), 0) AS total_monto,
       COALESCE(SUM(CASE WHEN metodo_pago='efectivo' THEN total END), 0) AS efectivo,
       COALESCE(SUM(CASE WHEN metodo_pago='debito' THEN total END), 0) AS debito,
       COALESCE(SUM(CASE WHEN metodo_pago='credito' THEN total END), 0) AS credito,
       COALESCE(SUM(CASE WHEN metodo_pago='transferencia' THEN total END), 0) AS transferencia
     FROM ventas
     WHERE fecha = $1 AND estado = 'completada'`,
    [fecha]
  )
  return resumen
}
