import { Router } from 'express'
import {
  citasDelDia,
  citasPorRango,
  obtenerCita,
  crearCita,
  actualizarCita,
  cambiarEstado,
  eliminarCita,
} from '../controllers/cita.controller.js'

const router = Router()

router.get('/',           citasDelDia)      // ?fecha=2026-06-22
router.get('/rango',      citasPorRango)    // ?desde=2026-06-01&hasta=2026-06-30
router.get('/:id',        obtenerCita)
router.post('/',          crearCita)
router.put('/:id',        actualizarCita)
router.patch('/:id/estado', cambiarEstado)  // { "estado": "atendido" }
router.delete('/:id',     eliminarCita)

export default router
