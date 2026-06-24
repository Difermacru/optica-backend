// ── orden.controller.js ──────────────────────────────────
import * as OrdenModel from '../models/orden.model.js'

export const listarOrdenes = async (req, res) => {
  try {
    const { estado, desde, hasta } = req.query
    const data = await OrdenModel.getOrdenes({ estado, desde, hasta })
    res.json({ ok: true, data })
  } catch (err) { res.status(500).json({ ok: false, error: err.message }) }
}

export const obtenerOrden = async (req, res) => {
  try {
    const data = await OrdenModel.getOrdenById(req.params.id)
    if (!data) return res.status(404).json({ ok: false, error: 'Orden no encontrada' })
    res.json({ ok: true, data })
  } catch (err) { res.status(500).json({ ok: false, error: err.message }) }
}

export const crearOrden = async (req, res) => {
  try {
    const { descripcion } = req.body
    if (!descripcion) return res.status(400).json({ ok: false, error: 'La descripción es obligatoria' })
    const data = await OrdenModel.createOrden(req.body)
    res.status(201).json({ ok: true, data })
  } catch (err) { res.status(500).json({ ok: false, error: err.message }) }
}

export const cambiarEstadoOrden = async (req, res) => {
  try {
    const { estado, notas } = req.body
    const estados = ['en_proceso', 'listo', 'entregado']
    if (!estados.includes(estado)) {
      return res.status(400).json({ ok: false, error: `Estado debe ser: ${estados.join(', ')}` })
    }
    const data = await OrdenModel.updateEstadoOrden(req.params.id, estado, notas)
    if (!data) return res.status(404).json({ ok: false, error: 'Orden no encontrada' })
    res.json({ ok: true, data })
  } catch (err) { res.status(500).json({ ok: false, error: err.message }) }
}

export const eliminarOrden = async (req, res) => {
  try {
    const ok = await OrdenModel.deleteOrden(req.params.id)
    if (!ok) return res.status(404).json({ ok: false, error: 'Orden no encontrada' })
    res.json({ ok: true, message: 'Orden eliminada' })
  } catch (err) { res.status(500).json({ ok: false, error: err.message }) }
}
