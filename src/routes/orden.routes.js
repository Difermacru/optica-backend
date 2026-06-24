// orden.routes.js
import { Router } from 'express'
import { listarOrdenes, obtenerOrden, crearOrden, cambiarEstadoOrden, eliminarOrden } from '../controllers/orden.controller.js'

const router = Router()

router.get('/',                  listarOrdenes)     // ?estado= &desde= &hasta=
router.get('/:id',               obtenerOrden)
router.post('/',                 crearOrden)
router.patch('/:id/estado',      cambiarEstadoOrden) // { estado, notas }
router.delete('/:id',            eliminarOrden)

export default router
