import { Router } from 'express'
import {
  listarCategorias, listarProductos, obtenerProducto,
  crearProducto, actualizarProducto, eliminarProducto, ajustarStock
} from '../controllers/inventario.controller.js'

const router = Router()

router.get('/categorias',         listarCategorias)
router.get('/',                   listarProductos)       // ?search= &categoria_id= &stock_bajo=true
router.get('/:id',                obtenerProducto)
router.post('/',                  crearProducto)
router.put('/:id',                actualizarProducto)
router.delete('/:id',             eliminarProducto)
router.patch('/:id/stock',        ajustarStock)          // { "cantidad": 10 } o -5

export default router
