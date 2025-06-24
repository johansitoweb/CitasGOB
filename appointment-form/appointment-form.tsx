"use client"

import { useState, useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import { sendAppointmentEmail } from "./actions/send-email"

interface FormData {
  tramite: string
  nombres: string
  correo: string
  cedula: string
  direccion: string
  institucion: string
  apellidos: string
  telefono: string
  fecha: string
}

interface FormErrors {
  [key: string]: boolean
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"]

export default function Component() {
  const [formData, setFormData] = useState<FormData>({
    tramite: "",
    nombres: "",
    correo: "",
    cedula: "",
    direccion: "",
    institucion: "",
    apellidos: "",
    telefono: "",
    fecha: "",
  })

  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [currentDate, setCurrentDate] = useState(new Date(2025, 5)) // June 2025
  const [selectedDay, setSelectedDay] = useState<number | null>(24)
  const [state, formAction, isPending] = useActionState(sendAppointmentEmail, null)

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Limpiar error cuando el usuario empiece a escribir
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: false,
      }))
    }
  }

  // Formatear cédula: 000-00000000-0
  const formatCedula = (value: string) => {
    // Remover todo lo que no sea número
    const numbers = value.replace(/\D/g, "")

    // Limitar a 11 dígitos máximo
    const limited = numbers.slice(0, 11)

    // Aplicar formato
    if (limited.length <= 3) {
      return limited
    } else if (limited.length <= 11) {
      const part1 = limited.slice(0, 3)
      const part2 = limited.slice(3, 11)
      const part3 = limited.slice(11, 12)

      if (limited.length <= 11) {
        return `${part1}-${part2}${part3 ? "-" + part3 : ""}`
      }
    }

    const part1 = limited.slice(0, 3)
    const part2 = limited.slice(3, 11)
    const part3 = limited.slice(11, 12)

    return `${part1}-${part2}-${part3}`
  }

  // Formatear teléfono: 000-000-0000
  const formatTelefono = (value: string) => {
    // Remover todo lo que no sea número
    const numbers = value.replace(/\D/g, "")

    // Limitar a 10 dígitos máximo
    const limited = numbers.slice(0, 10)

    // Aplicar formato
    if (limited.length <= 3) {
      return limited
    } else if (limited.length <= 6) {
      const part1 = limited.slice(0, 3)
      const part2 = limited.slice(3, 6)
      return `${part1}-${part2}`
    } else {
      const part1 = limited.slice(0, 3)
      const part2 = limited.slice(3, 6)
      const part3 = limited.slice(6, 10)
      return `${part1}-${part2}-${part3}`
    }
  }

  const handleCedulaChange = (value: string) => {
    const formatted = formatCedula(value)
    handleInputChange("cedula", formatted)
  }

  const handleTelefonoChange = (value: string) => {
    const formatted = formatTelefono(value)
    handleInputChange("telefono", formatted)
  }

  const validateForm = () => {
    const errors: FormErrors = {}
    const requiredFields: (keyof FormData)[] = [
      "tramite",
      "nombres",
      "correo",
      "cedula",
      "direccion",
      "institucion",
      "apellidos",
      "telefono",
      "fecha",
    ]

    requiredFields.forEach((field) => {
      if (!formData[field].trim()) {
        errors[field] = true
      }
    })

    // Validar formato de email
    if (formData.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      errors.correo = true
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (formDataObj: FormData) => {
    if (!validateForm()) {
      return
    }

    return formAction(formData)
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleDayClick = (day: number) => {
    setSelectedDay(day)
    const dateStr = `${day}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`
    handleInputChange("fecha", dateStr)
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <button
          key={day}
          onClick={() => handleDayClick(day)}
          className={`w-8 h-8 text-sm rounded-full hover:bg-gray-100 ${
            selectedDay === day ? "bg-blue-500 text-white" : "text-gray-700"
          }`}
        >
          {day}
        </button>,
      )
    }

    return days
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver
          </Button>
        </div>

        {/* Success/Error Message */}
        {state && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              state.success
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {state.success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {state.message}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-blue-600 mb-8">Agenda tu cita</h1>

            <form action={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                {/* First Column */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="tramite" className="text-sm font-medium text-gray-700">
                      Tramite
                    </Label>
                    <Input
                      id="tramite"
                      placeholder="Por defecto"
                      value={formData.tramite}
                      onChange={(e) => handleInputChange("tramite", e.target.value)}
                      className={`bg-gray-100 border-0 ${formErrors.tramite ? "border-2 border-red-500" : ""}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nombres" className="text-sm font-medium text-gray-700">
                      Nombres
                    </Label>
                    <Input
                      id="nombres"
                      placeholder="John Doe"
                      value={formData.nombres}
                      onChange={(e) => handleInputChange("nombres", e.target.value)}
                      className={`bg-gray-100 border-0 ${formErrors.nombres ? "border-2 border-red-500" : ""}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="correo" className="text-sm font-medium text-gray-700">
                      Correo electrónico
                    </Label>
                    <Input
                      id="correo"
                      type="email"
                      placeholder="johndoe@gmail.com"
                      value={formData.correo}
                      onChange={(e) => handleInputChange("correo", e.target.value)}
                      className={`bg-gray-100 border-0 ${formErrors.correo ? "border-2 border-red-500" : ""}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cedula" className="text-sm font-medium text-gray-700">
                      Cédula
                    </Label>
                    <Input
                      id="cedula"
                      placeholder="000-00000000-0"
                      value={formData.cedula}
                      onChange={(e) => handleCedulaChange(e.target.value)}
                      className={`bg-gray-100 border-0 ${formErrors.cedula ? "border-2 border-red-500" : ""}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="direccion" className="text-sm font-medium text-gray-700">
                      Dirección
                    </Label>
                    <Input
                      id="direccion"
                      placeholder="Calle ej. #1, Provincia, País."
                      value={formData.direccion}
                      onChange={(e) => handleInputChange("direccion", e.target.value)}
                      className={`bg-gray-100 border-0 ${formErrors.direccion ? "border-2 border-red-500" : ""}`}
                    />
                  </div>
                </div>

                {/* Second Column */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="institucion" className="text-sm font-medium text-gray-700">
                      Institución
                    </Label>
                    <Input
                      id="institucion"
                      placeholder="Por defecto"
                      value={formData.institucion}
                      onChange={(e) => handleInputChange("institucion", e.target.value)}
                      className={`bg-gray-100 border-0 ${formErrors.institucion ? "border-2 border-red-500" : ""}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apellidos" className="text-sm font-medium text-gray-700">
                      Apellidos
                    </Label>
                    <Input
                      id="apellidos"
                      placeholder="Genez Suarez"
                      value={formData.apellidos}
                      onChange={(e) => handleInputChange("apellidos", e.target.value)}
                      className={`bg-gray-100 border-0 ${formErrors.apellidos ? "border-2 border-red-500" : ""}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefono" className="text-sm font-medium text-gray-700">
                      Teléfono
                    </Label>
                    <Input
                      id="telefono"
                      placeholder="000-000-0000"
                      value={formData.telefono}
                      onChange={(e) => handleTelefonoChange(e.target.value)}
                      className={`bg-gray-100 border-0 ${formErrors.telefono ? "border-2 border-red-500" : ""}`}
                    />
                  </div>

                  {/* Calendar */}
                  <div className="space-y-2">
                    <div className={`bg-gray-100 rounded-lg p-4 ${formErrors.fecha ? "border-2 border-red-500" : ""}`}>
                      <div className="flex items-center justify-between mb-4">
                        <button
                          type="button"
                          onClick={() => navigateMonth("prev")}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="font-medium text-gray-700">
                          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </span>
                        <button
                          type="button"
                          onClick={() => navigateMonth("next")}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {daysOfWeek.map((day) => (
                          <div
                            key={day}
                            className="w-8 h-8 flex items-center justify-center text-xs font-medium text-gray-500"
                          >
                            {day}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:pl-8">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-blue-600">Datos de tu cita</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-blue-600">Tramite: </span>
                    <span className="text-gray-600">{formData.tramite || "Por defecto"}</span>
                  </div>

                  <div>
                    <span className="font-medium text-blue-600">Institución: </span>
                    <span className="text-gray-600">{formData.institucion || "Por defecto"}</span>
                  </div>

                  <div>
                    <span className="font-medium text-blue-600">Nombres: </span>
                    <span className="text-gray-600">{formData.nombres || "John Doe"}</span>
                  </div>

                  <div>
                    <span className="font-medium text-blue-600">Apellidos: </span>
                    <span className="text-gray-600">{formData.apellidos || "Genez Suarez"}</span>
                  </div>

                  <div>
                    <span className="font-medium text-blue-600">Teléfono: </span>
                    <span className="text-gray-600">{formData.telefono || "000-000-0000"}</span>
                  </div>

                  <div>
                    <span className="font-medium text-blue-600">Correo electrónico: </span>
                    <span className="text-gray-600">{formData.correo || "johndoe@gmail.com"}</span>
                  </div>

                  <div>
                    <span className="font-medium text-blue-600">Cédula: </span>
                    <span className="text-gray-600">{formData.cedula || "000-00000000-0"}</span>
                  </div>

                  <div>
                    <span className="font-medium text-blue-600">Dirección: </span>
                    <span className="text-gray-600">{formData.direccion || "Calle ej. #1, Provincia, País."}</span>
                  </div>

                  {formData.fecha && (
                    <div>
                      <span className="font-medium text-blue-600">Fecha: </span>
                      <span className="text-gray-600">{formData.fecha}</span>
                    </div>
                  )}
                </div>

                <div className="pt-6">
                  <Button
                    onClick={() => handleSubmit(new FormData())}
                    disabled={isPending}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {isPending ? "Enviando..." : "Confirmar cita"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
