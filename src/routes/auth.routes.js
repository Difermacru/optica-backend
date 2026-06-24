import { Router } from 'express'
import { login, me, listarUsuarios, crearUsuario, actualizarUsuario, cambiarPassword } from '../controllers/auth.controller.js'
import { auth, rol } from '../middlewares/auth.middleware.js'

const router = Router()

// Públicas
router.post('/login', login)

// Autenticadas
router.get('/me',              auth, me)
router.put('/me/password',     auth, cambiarPassword)

// Solo admin
router.get('/usuarios',        auth, rol('admin'), listarUsuarios)
router.post('/usuarios',       auth, rol('admin'), crearUsuario)
router.put('/usuarios/:id',    auth, rol('admin'), actualizarUsuario)

export default router
