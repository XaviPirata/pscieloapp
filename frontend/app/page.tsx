'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Lock, Mail, ArrowRight, Sparkles } from 'lucide-react'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // TODO: Implement login logic
    setTimeout(() => setLoading(false), 1000)
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-neomorphic-bg via-neomorphic-tertiary to-neomorphic-secondary overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 -right-1/2 w-96 h-96 bg-neomorphic-primary rounded-full opacity-20 blur-3xl"
          animate={{ y: [0, 30, 0], x: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-neomorphic-secondary rounded-full opacity-20 blur-3xl"
          animate={{ y: [0, -30, 0], x: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        />
      </div>

      {/* Login Container */}
      <div className="relative flex items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <motion.div
              className="flex items-center justify-center mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-12 h-12 text-neomorphic-primary" />
            </motion.div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-gradient">PsCielo</span>
            </h1>
            <p className="text-text-secondary text-lg">Sistema de Gestión</p>
          </div>

          {/* Login Form Card */}
          <motion.div
            className="neomorphic-base p-8 space-y-6"
            whileHover={{ boxShadow: 'var(--shadow-large)' }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-text-light" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="neomorphic-input w-full pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-text-light" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="neomorphic-input w-full pl-10"
                    required
                  />
                </div>
              </div>

              {/* Remember me and forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="neomorphic-input w-4 h-4 mr-2"
                  />
                  <span className="text-sm text-text-secondary">Recuérdame</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-neomorphic-primary hover:text-neomorphic-primary-dark transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="neomorphic-button w-full bg-gradient-to-r from-neomorphic-primary to-neomorphic-primary-dark text-text-primary font-semibold flex items-center justify-center gap-2 mt-6"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Ingresar
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-text-light opacity-20" />
              <span className="text-sm text-text-light">o</span>
              <div className="flex-1 h-px bg-text-light opacity-20" />
            </div>

            {/* OAuth Buttons (Future) */}
            <div className="grid grid-cols-2 gap-3">
              <button className="neomorphic-button text-sm hover:bg-neomorphic-light-shade">
                Google
              </button>
              <button className="neomorphic-button text-sm hover:bg-neomorphic-light-shade">
                Zoho
              </button>
            </div>
          </motion.div>

          {/* Sign up link */}
          <p className="text-center mt-6 text-text-secondary">
            ¿No tienes cuenta?{' '}
            <Link
              href="/signup"
              className="text-neomorphic-primary font-semibold hover:text-neomorphic-primary-dark transition-colors"
            >
              Registrate aquí
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        className="absolute bottom-6 left-0 right-0 text-center text-text-light text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1 }}
      >
        <p>© 2026 PsCielo. Todos los derechos reservados.</p>
      </motion.div>
    </div>
  )
}
