import * as VentaModel from '../models/venta.model.js'

export const listarVentas = async (req, res) => {
  try {
    const { desde, hasta, paciente_id } = req.query
    const data = await VentaModel.getVentas({ desde, hasta, paciente_id })
    res.json({ ok: true, data })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}

export const obtenerVenta = async (req, res) => {
  try {
    const data = await VentaModel.getVentaById(req.params.id)
    if (!data) return res.status(404).json({ ok: false, error: 'Venta no encontrada' })
    res.json({ ok: true, data })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}

export const crearVenta = async (req, res) => {
  try {
    const { items } = req.body
    if (!items || items.length === 0) {
      return res.status(400).json({ ok: false, error: 'La venta debe tener al menos un producto' })
    }
    const data = await VentaModel.createVenta(req.body)
    res.status(201).json({ ok: true, data })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}

export const anularVenta = async (req, res) => {
  try {
    const data = await VentaModel.anularVenta(req.params.id)
    if (!data) return res.status(404).json({ ok: false, error: 'Venta no encontrada' })
    res.json({ ok: true, data })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}

export const resumenDia = async (req, res) => {
  try {
    const fecha = req.query.fecha || new Date().toISOString().split('T')[0]
    const data = await VentaModel.getResumenDia(fecha)
    res.json({ ok: true, data })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}
