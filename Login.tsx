"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { User, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from "next-themes"

export function Login() {
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const router = useRouter()
  const { setTheme } = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('userId', data.user.id.toString())
        router.push('/traductor')
        const prefsResponse = await fetch(`/api/usuarios/preferencias?userId=${data.userId}`)
        if (prefsResponse.ok) {
          const { theme } = await prefsResponse.json()
          setTheme(theme) // Aplicar el tema preferido del usuario
        }
      } else {
        const data = await response.json()
        setError(data.error || 'Error al iniciar sesión')
      }
    } catch (error) {
      setError('Error al conectar con el servidor')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    // Estilos estáticos que ignoran el tema oscuro/claro
    <div className="min-h-screen flex items-center justify-center bg-white text-black p-4">
      <Card className="w-full max-w-md bg-white shadow-md border border-gray-200">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-6 h-6 text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold text-center text-black">Bienvenido a DigitalForge</h1>
            <p className="text-sm text-gray-600 text-center mt-1">
              Inicia sesión para continuar tu aprendizaje de lenguaje de señas
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                className="pl-10 bg-white text-black border-gray-300"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="relative">
              <Input
                type={mostrarPassword ? "text" : "password"}
                name="password"
                placeholder="Contraseña"
                className="pr-10 bg-white text-black border-gray-300"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {mostrarPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center" role="alert">
                {error}
              </p>
            )}

            <Button 
              type="submit" 
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              Iniciar sesión
            </Button>

            <p className="text-sm text-center text-gray-600">
              ¿No tienes cuenta?{" "}
              <Link href="/registro" className="text-blue-500 hover:underline">
                Regístrate
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}