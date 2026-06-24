import { Router } from 'express'
import {
  listarPacientes,
  obtenerPaciente,
  crearPaciente,
  actualizarPaciente,
  eliminarPaciente,
  listarGraduaciones,
  crearGraduacion,
  eliminarGraduacion,
} from '../controllers/paciente.controller.js'

const router = Router()

// Pacientes
router.get('/',         listarPacientes)
router.get('/:id',      obtenerPaciente)
router.post('/',        crearPaciente)
router.put('/:id',      actualizarPaciente)
router.delete('/:id',   eliminarPaciente)

// Graduaciones (anidadas bajo paciente)
router.get('/:id/graduaciones',                          listarGraduaciones)
router.post('/:id/graduaciones',                         crearGraduacion)
router.delete('/:id/graduaciones/:graduacion_id',        eliminarGraduacion)

export default router
