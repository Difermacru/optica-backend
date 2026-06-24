import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import pacienteRoutes    from './routes/paciente.routes.js'
import citaRoutes        from './routes/cita.routes.js'
import inventarioRoutes  from './routes/inventario.routes.js'
import ventaRoutes       from './routes/venta.routes.js'
import authRoutes        from './routes/auth.routes.js'
import ordenRoutes       from './routes/orden.routes.js'
import reporteRoutes     from './routes/reporte.routes.js'
import { auth }          from './middlewares/auth.middleware.js'

const app  = express()
const PORT = process.env.PORT || 3000

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
app.use(express.json())

// Públicas
app.use('/api/auth',      authRoutes)

// Protegidas
app.use('/api/pacientes', auth, pacienteRoutes)
app.use('/api/citas',     auth, citaRoutes)
app.use('/api/productos', auth, inventarioRoutes)
app.use('/api/ventas',    auth, ventaRoutes)
app.use('/api/ordenes',   auth, ordenRoutes)
app.use('/api/reportes',  auth, reporteRoutes)

app.get('/api/health', (_, res) => res.json({ ok: true }))

app.use((req, res)         => res.status(404).json({ ok: false, error: `Ruta ${req.path} no encontrada` }))
app.use((err, req, res, _) => { console.error(err); res.status(500).json({ ok: false, error: 'Error interno' }) })

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`))
