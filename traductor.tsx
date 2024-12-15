'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Loader2, Plus, Trash2, Volume2, Save, History, RefreshCw, Moon, Sun } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTheme } from "next-themes"

interface ImageInfo {
  path: string;
  preview: string;
}

interface Traduccion {
  TraduccionID: number;
  PalabraTraducida: string;
  RutaAudio: string;
  FechaTraduccion: string;
}

export function Traductor() {
  const [imagenes, setImagenes] = useState<ImageInfo[]>([])
  const [nuevaImagenPath, setNuevaImagenPath] = useState('')
  const [traduccion, setTraduccion] = useState('')
  const [estaTraduciendo, setEstaTraduciendo] = useState(false)
  const [estaReproduciendo, setEstaReproduciendo] = useState(false)
  const [apiUrl, setApiUrl] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const [mostrarHistorial, setMostrarHistorial] = useState(false)
  const [historial, setHistorial] = useState<Traduccion[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const loadUserPreferences = async () => {
      const storedUserId = localStorage.getItem('userId')
      if (!storedUserId) {
        router.push('/')
        return
      }
      setUserId(storedUserId)
      
      try {
        const response = await fetch(`/api/preferencias?userId=${storedUserId}`)
        if (response.ok) {
          const data = await response.json()
          setTheme(data.theme)
        }
      } catch (error) {
        console.error('Error al cargar preferencias:', error)
      }
    }

    loadUserPreferences()
  }, [router, setTheme])

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    
    if (userId) {
      try {
        await fetch('/api/preferencias', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            theme: newTheme
          })
        })
      } catch (error) {
        console.error('Error al guardar preferencias:', error)
      }
    }
  }

  const agregarImagen = () => {
    if (nuevaImagenPath) {
      setImagenes([...imagenes, { 
        path: nuevaImagenPath, 
        preview: nuevaImagenPath 
      }])
      setNuevaImagenPath('')
    }
  }

  const eliminarImagen = (index: number) => {
    const nuevasImagenes = imagenes.filter((_, i) => i !== index)
    setImagenes(nuevasImagenes)
  }

  const manejarTraduccion = async () => {
    setEstaTraduciendo(true)
    setError('')
    try {
      const rutasImagenes = imagenes.map(imagen => imagen.path)
      const apiUrl = 'http://localhost:62089/predict-sequence'
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(rutasImagenes)
      })

      if (!response.ok) {
        throw new Error(`Error en la API: ${response.statusText}`)
      }

      const data = await response.text()
      setTraduccion(data || "No se recibió traducción de la API.")
    } catch (err) {
      setError(`Error al traducir: ${err instanceof Error ? err.message : String(err)}`)
      setTraduccion('')
    } finally {
      setEstaTraduciendo(false)
    }
  }

  const reproducirAudio = () => {
    if (traduccion) {
      const utterance = new SpeechSynthesisUtterance(traduccion);
      utterance.onstart = () => setEstaReproduciendo(true);
      utterance.onend = () => setEstaReproduciendo(false);
      speechSynthesis.speak(utterance);
    }
  }

  const guardarTraduccion = async () => {
    if (traduccion && userId) {
      try {
        const audioTraducido = `/audios/traduccion-${Date.now()}.mp3`; // Ruta ficticia
        const response = await fetch('/api/traducciones/guardar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userId,
            palabraTraducida: traduccion,
            audioTraducido: audioTraducido
          })
        });

        if (response.ok) {
          alert('Traducción guardada exitosamente');
          await cargarHistorial();
        } else {
          throw new Error('Error al guardar la traducción');
        }
      } catch (error) {
        console.error('Error al guardar la traducción:', error);
        alert('Error al guardar la traducción');
      }
    }
  }

  const formatearFecha = (fechaOriginal: string) => {
    const fecha = new Date(fechaOriginal);
    if (isNaN(fecha.getTime())) {
      console.error('Fecha inválida:', fechaOriginal);
      return 'Fecha no disponible';
    }
    return fecha.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const cargarHistorial = async () => {
    if (userId) {
      try {
        const response = await fetch(`/api/traducciones/historial?userId=${userId}`)
        const data = await response.json()
        console.log('Datos del historial:', data);
        setHistorial(data)
        setMostrarHistorial(true)
      } catch (error) {
        console.error('Error al cargar historial:', error)
      }
    }
  }

  const cerrarSesion = () => {
    localStorage.removeItem('userId')
    router.push('/')
  }

  const limpiarTodo = () => {
    setImagenes([])
    setTraduccion('')
    setError('')
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl bg-background text-foreground">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">DigitalForge V 0.0.1</h1>
        <div className="flex space-x-2">
          <Button onClick={toggleTheme} variant="outline" size="icon">
            {theme === 'dark' ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
          </Button>
          <Button onClick={cerrarSesion} variant="outline">
            Cerrar Sesión
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex mb-2">
          <Input
            type="text"
            placeholder="URL de la imagen"
            value={nuevaImagenPath}
            onChange={(e) => setNuevaImagenPath(e.target.value)}
            className="flex-grow mr-2"
            aria-label="URL de la imagen"
          />
          <Button onClick={agregarImagen} disabled={!nuevaImagenPath}>
            <Plus className="h-4 w-4 mr-2" /> Agregar
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {imagenes.map((imagen, index) => (
            <Card key={index} className="relative p-2 bg-card text-card-foreground">
              <img
                src={imagen.preview}
                alt={`Imagen de lenguaje de señas ${index + 1}`}
                className="w-full h-24 object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/150'
                }}
              />
              <p className="text-xs mt-1 truncate">{imagen.path}</p>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1"
                onClick={() => eliminarImagen(index)}
                aria-label={`Eliminar imagen ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-between mb-6">
        <Button
          onClick={manejarTraduccion}
          className="flex-grow mr-2"
          disabled={estaTraduciendo || imagenes.length === 0}
        >
          {estaTraduciendo ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Traduciendo...
            </>
          ) : (
            'Traducir'
          )}
        </Button>
        <Button
          onClick={limpiarTodo}
          variant="outline"
          className="flex-shrink-0"
          aria-label="Limpiar todo"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Limpiar
        </Button>
      </div>

      {error && (
        <div className="text-destructive mb-4" role="alert">
          {error}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Resultado de la traducción</h2>
        <Textarea
          value={traduccion}
          readOnly
          className="w-full h-32 bg-card text-card-foreground"
          placeholder="La traducción aparecerá aquí..."
          aria-label="Resultado de la traducción"
        />
        <div className="flex justify-between mt-2">
          <Button
            onClick={reproducirAudio}
            disabled={!traduccion || estaReproduciendo}
            aria-label="Reproducir audio"
          >
            <Volume2 className={`h-4 w-4 mr-2 ${estaReproduciendo ? 'animate-pulse' : ''}`} />
            {estaReproduciendo ? 'Reproduciendo...' : 'Reproducir Audio'}
          </Button>
          <Button
            variant="outline"
            disabled={!traduccion}
            onClick={guardarTraduccion}
            aria-label="Guardar traducción"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
        </div>
      </div>

      <Button 
        variant="outline" 
        className="w-full mt-4" 
        aria-label="Ver historial de traducciones"
        onClick={cargarHistorial}
      >
        <History className="h-4 w-4 mr-2" />
        Historial de Traducciones
      </Button>

      {mostrarHistorial && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Historial de Traducciones</h2>
          {historial.length === 0 ? (
            <p className="text-muted-foreground">No hay traducciones en el historial</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full bg-card text-card-foreground shadow-md rounded-lg overflow-hidden">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Traducción</th>
                    <th className="px-4 py-2 text-left">Ruta Audio</th>
                    <th className="px-4 py-2 text-left">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((item) => (
                    <tr
                      key={item.TraduccionID} 
                      className="border-b border-muted hover:bg-muted/50"
                    >
                      <td className="px-4 py-2">
                        {item.TraduccionID}
                      </td>
                      <td className="px-4 py-2">
                        {item.PalabraTraducida}
                      </td>
                      <td className="px-4 py-2">
                        {item.RutaAudio}
                      </td>
                      <td className="px-4 py-2">
                        {formatearFecha(item.FechaTraduccion)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-2 flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setMostrarHistorial(false)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}