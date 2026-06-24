import * as CitaModel from '../models/cita.model.js'

export const citasDelDia = async (req, res) => {
  try {
    const fecha = req.query.fecha || new Date().toISOString().split('T')[0]
    const citas = await CitaModel.getCitasByFecha(fecha)
    res.json({ ok: true, data: citas })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}

export const citasPorRango = async (req, res) => {
  try {
    const { desde, hasta } = req.query
    if (!desde || !hasta) {
      return res.status(400).json({ ok: false, error: 'Se requieren los parámetros desde y hasta' })
    }
    const citas = await CitaModel.getCitasByRango(desde, hasta)
    res.json({ ok: true, data: citas })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}

export const obtenerCita = async (req, res) => {
  try {
    const cita = await CitaModel.getCitaById(req.params.id)
    if (!cita) return res.status(404).json({ ok: false, error: 'Cita no encontrada' })
    res.json({ ok: true, data: cita })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}

export const crearCita = async (req, res) => {
  try {
    const { fecha, hora } = req.body
    if (!fecha || !hora) {
      return res.status(400).json({ ok: false, error: 'Fecha y hora son obligatorias' })
    }
    const cita = await CitaModel.createCita(req.body)
    res.status(201).json({ ok: true, data: cita })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}

export const actualizarCita = async (req, res) => {
  try {
    const cita = await CitaModel.updateCita(req.params.id, req.body)
    if (!cita) return res.status(404).json({ ok: false, error: 'Cita no encontrada' })
    res.json({ ok: true, data: cita })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}

export const cambiarEstado = async (req, res) => {
  try {
    const { estado } = req.body
    const estados = ['pendiente', 'atendido', 'cancelado']
    if (!estados.includes(estado)) {
      return res.status(400).json({ ok: false, error: `Estado debe ser: ${estados.join(', ')}` })
    }
    const cita = await CitaModel.updateEstado(req.params.id, estado)
    if (!cita) return res.status(404).json({ ok: false, error: 'Cita no encontrada' })
    res.json({ ok: true, data: cita })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}

export const eliminarCita = async (req, res) => {
  try {
    const eliminado = await CitaModel.deleteCita(req.params.id)
    if (!eliminado) return res.status(404).json({ ok: false, error: 'Cita no encontrada' })
    res.json({ ok: true, message: 'Cita eliminada' })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}
