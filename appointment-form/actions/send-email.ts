"use server"

interface AppointmentData {
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

export async function sendAppointmentEmail(data: AppointmentData) {
  // Simular delay de envío
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // En un entorno real, aquí configurarías el envío de email
  // Por ejemplo, usando Nodemailer, SendGrid, etc.

  console.log("Enviando email con los siguientes datos:", data)

  // Simular el contenido del email
  const emailContent = `
    Nueva cita agendada:
    
    Trámite: ${data.tramite}
    Institución: ${data.institucion}
    Nombres: ${data.nombres}
    Apellidos: ${data.apellidos}
    Teléfono: ${data.telefono}
    Correo electrónico: ${data.correo}
    Cédula: ${data.cedula}
    Dirección: ${data.direccion}
    Fecha: ${data.fecha}
  `

  console.log("Contenido del email:", emailContent)

  // Simular éxito del envío
  return {
    success: true,
    message: "Cita confirmada y email enviado exitosamente",
  }
}
