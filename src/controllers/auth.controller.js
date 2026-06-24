import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import * as UsuarioModel from '../models/usuario.model.js'

const SECRET = process.env.JWT_SECRET || 'optica_secret_dev'

// ── Auth ──────────────────────────────────────────────────

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'Email y contraseña requeridos' })
    }

    const usuario = await UsuarioModel.getUserByEmail(email)
    if (!usuario) {
      return res.status(401).json({ ok: false, error: 'Credenciales incorrectas' })
    }

    const valido = await bcrypt.compare(password, usuario.password_hash)
    if (!valido) {
      return res.status(401).json({ ok: false, error: 'Credenciales incorrectas' })
    }

    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
      SECRET,
      { expiresIn: '8h' }
    )

    res.json({
      ok: true,
      data: {
        token,
        usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
      }
    })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}

export const me = async (req, res) => {
  try {
    const usuario = await UsuarioModel.getUserById(req.user.id)
    if (!usuario) return res.status(404).json({ ok: false, error: 'Usuario no encontrado' })
    res.json({ ok: true, data: usuario })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}

// ── Usuarios (solo admin) ─────────────────────────────────

export const listarUsuarios = async (req, res) => {
  try {
    const data = await UsuarioModel.getAllUsuarios()
    res.json({ ok: true, data })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}

export const crearUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body
    if (!nombre || !email || !password) {
      return res.status(400).json({ ok: false, error: 'Nombre, email y contraseña son obligatorios' })
    }
    const password_hash = await bcrypt.hash(password, 10)
    const usuario = await UsuarioModel.createUsuario({ nombre, email, password_hash, rol })
    res.status(201).json({ ok: true, data: usuario })
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ ok: false, error: 'El email ya está registrado' })
    res.status(500).json({ ok: false, error: err.message })
  }
}

export const actualizarUsuario = async (req, res) => {
  try {
    const usuario = await UsuarioModel.updateUsuario(req.params.id, req.body)
    if (!usuario) return res.status(404).json({ ok: false, error: 'Usuario no encontrado' })
    res.json({ ok: true, data: usuario })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}

export const cambiarPassword = async (req, res) => {
  try {
    const { password_actual, password_nuevo } = req.body
    const usuario = await UsuarioModel.getUserByEmail(req.user.email)
    const valido = await bcrypt.compare(password_actual, usuario.password_hash)
    if (!valido) return res.status(401).json({ ok: false, error: 'Contraseña actual incorrecta' })
    const hash = await bcrypt.hash(password_nuevo, 10)
    await UsuarioModel.updatePassword(req.user.id, hash)
    res.json({ ok: true, message: 'Contraseña actualizada' })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}
