import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'optica_secret_dev'

// Verifica el token JWT
export const auth = (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, error: 'Token no proporcionado' })
  }
  const token = header.split(' ')[1]
  try {
    req.user = jwt.verify(token, SECRET)
    next()
  } catch {
    res.status(401).json({ ok: false, error: 'Token inválido o expirado' })
  }
}

// Restringe por rol
export const rol = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.rol)) {
    return res.status(403).json({ ok: false, error: 'No tienes permisos para esta acción' })
  }
  next()
}
