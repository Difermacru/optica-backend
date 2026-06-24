import * as ReporteModel from '../models/reporte.model.js'

const fechaChile = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' })

export const reporteVentas = async (req, res) => {
  try {
    const hasta = req.query.hasta || fechaChile()
    const desde = req.query.desde || hasta.slice(0, 7) + '-01' // primer día del mes
    const [porDia, productos, resumen] = await Promise.all([
      ReporteModel.getReporteVentas(desde, hasta),
      ReporteModel.getProductosMasVendidos(desde, hasta),
      ReporteModel.getResumenPeriodo(desde, hasta),
    ])
    res.json({ ok: true, data: { resumen, por_dia: porDia, productos_top: productos, desde, hasta } })
  } catch (err) { res.status(500).json({ ok: false, error: err.message }) }
}

export const controlAnual = async (req, res) => {
  try {
    const data = await ReporteModel.getPacientesControlAnual()
    res.json({ ok: true, data })
  } catch (err) { res.status(500).json({ ok: false, error: err.message }) }
}

export const ventasPaciente = async (req, res) => {
  try {
    const data = await ReporteModel.getVentasPorPaciente(req.params.id)
    res.json({ ok: true, data })
  } catch (err) { res.status(500).json({ ok: false, error: err.message }) }
}

export const detalleVentaImpresion = async (req, res) => {
  try {
    const data = await ReporteModel.getVentaDetalle(req.params.id)
    if (!data) return res.status(404).json({ ok: false, error: 'Venta no encontrada' })
    res.json({ ok: true, data })
  } catch (err) { res.status(500).json({ ok: false, error: err.message }) }
}
