import { Router } from 'express'
import { listarVentas, obtenerVenta, crearVenta, anularVenta, resumenDia } from '../controllers/venta.controller.js'

const router = Router()

router.get('/resumen', resumenDia)        // ?fecha=2026-06-22
router.get('/',        listarVentas)      // ?desde= &hasta= &paciente_id=
router.get('/:id',     obtenerVenta)
router.post('/',       crearVenta)
router.patch('/:id/anular', anularVenta)

export default router
