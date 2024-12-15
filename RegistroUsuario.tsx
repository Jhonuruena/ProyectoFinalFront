"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { User, Mail, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'

export  function RegistroUsuario() {
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('/api/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert('Registro exitoso')
        router.push('/')
      } else {
        const data = await response.json()
        setError(data.error || 'Error al registrar usuario')
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-6 h-6 text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold text-center">Bienvenido a DigitalForge</h1>
            <p className="text-sm text-muted-foreground text-center mt-1">
              Regístrate para iniciar tu aprendizaje de lenguaje de señas
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                name="nombre"
                placeholder="Nombre de usuario"
                className="pl-10"
                value={formData.nombre}
                onChange={handleChange}
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                className="pl-10"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="relative">
              <Input
                type={mostrarPassword ? "text" : "password"}
                name="password"
                placeholder="Contraseña"
                className="pr-10"
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

            <Button type="submit" className="w-full bg-green-500 hover:bg-green-600">
              Registrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}