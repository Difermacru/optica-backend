import { Router } from 'express'
import { reporteVentas, controlAnual, ventasPaciente, detalleVentaImpresion } from '../controllers/reporte.controller.js'

const router = Router()

router.get('/ventas',                   reporteVentas)         // ?desde= &hasta=
router.get('/control-anual',            controlAnual)
router.get('/paciente/:id/ventas',      ventasPaciente)
router.get('/venta/:id/imprimir',       detalleVentaImpresion)

export default router
