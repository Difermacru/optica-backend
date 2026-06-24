import * as PacienteModel from '../models/paciente.model.js'

const LIMIT = 8

// ── Pacientes ────────────────────────────────────────────

export const listarPacientes = async (req, res) => {
  try {
    const { search = '', page = 1 } = req.query
    const offset = (Number(page) - 1) * LIMIT

    const [pacientes, total] = await Promise.all([
      PacienteModel.getAllPacientes({ search, limit: LIMIT, offset }),
      PacienteModel.countPacientes({ search })
    ])

    res.json({
      ok: true,
      data: pacientes,
      pagination: {
        total,
        page: Number(page),
        limit: LIMIT,
        pages: Math.ceil(total / LIMIT)
      }
    })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}

export const obtenerPaciente = async (req, res) => {
  try {
    const paciente = await PacienteModel.getPacienteById(req.params.id)
    if (!paciente) return res.status(404).json({ ok: false, error: 'Paciente no encontrado' })
    res.json({ ok: true, data: paciente })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}

export const crearPaciente = async (req, res) => {
  try {
    const { rut, nombre, apellido, telefono, email, fecha_nacimiento } = req.body
    if (!rut || !nombre || !apellido) {
      return res.status(400).json({ ok: false, error: 'RUT, nombre y apellido son obligatorios' })
    }
    const paciente = await PacienteModel.createPaciente({ rut, nombre, apellido, telefono, email, fecha_nacimiento })
    res.status(201).json({ ok: true, data: paciente })
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ ok: false, error: 'El RUT ya está registrado' })
    }
    res.status(500).json({ ok: false, error: err.message })
  }
}

export const actualizarPaciente = async (req, res) => {
  try {
    const paciente = await PacienteModel.updatePaciente(req.params.id, req.body)
    if (!paciente) return res.status(404).json({ ok: false, error: 'Paciente no encontrado' })
    res.json({ ok: true, data: paciente })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}

export const eliminarPaciente = async (req, res) => {
  try {
    const eliminado = await PacienteModel.deletePaciente(req.params.id)
    if (!eliminado) return res.status(404).json({ ok: false, error: 'Paciente no encontrado' })
    res.json({ ok: true, message: 'Paciente eliminado' })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}

// ── Graduaciones ─────────────────────────────────────────

export const listarGraduaciones = async (req, res) => {
  try {
    const graduaciones = await PacienteModel.getGraduacionesByPaciente(req.params.id)
    res.json({ ok: true, data: graduaciones })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}

export const crearGraduacion = async (req, res) => {
  try {
    const graduacion = await PacienteModel.createGraduacion(req.params.id, req.body)
    res.status(201).json({ ok: true, data: graduacion })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}

export const eliminarGraduacion = async (req, res) => {
  try {
    const eliminado = await PacienteModel.deleteGraduacion(req.params.graduacion_id)
    if (!eliminado) return res.status(404).json({ ok: false, error: 'Graduación no encontrada' })
    res.json({ ok: true, message: 'Graduación eliminada' })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}
