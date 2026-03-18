import { GoogleGenerativeAI } from '@google/generative-ai'

// Inicializar Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

/**
 * Moderar contenido de una review usando IA
 * Detecta: insultos, odio, amenazas, spam, información personal
 */
export async function moderateReview(comment: string): Promise<{
  approved: boolean
  reason?: string
  error?: boolean
}> {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY no configurada')
    return {
      approved: false,
      reason: 'Error de configuración',
      error: true
    }
  }

  try {
    // Configuramos el modelo sin systemInstruction para evitar el error 400
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite-preview'
    })

    // Construimos el prompt completo incluyendo las instrucciones
    const prompt = `Eres un moderador automático de reseñas para un e-commerce de ropa.

OBJETIVO:
Decidir si una reseña puede publicarse o debe ser rechazada.

REGLAS DE RECHAZO (approved = false):
Rechaza la reseña si contiene cualquiera de estos casos:

1. Insultos, vulgaridades o lenguaje ofensivo.
2. Ataques personales contra personas, marcas o grupos.
3. Discurso de odio, racismo, sexismo, homofobia o discriminación.
4. Amenazas o incitación a la violencia.
5. Spam, publicidad o enlaces a otros sitios o tiendas.
6. Información personal sensible:
   - teléfonos
   - direcciones
   - emails
   - redes sociales
7. Contenido sexual explícito o inapropiado para menores.
8. Texto sin sentido, repetitivo o claramente generado como spam.

IMPORTANTE:
- Opiniones negativas sobre el producto (ej: "no me gustó", "es de mala calidad")
- Críticas fuertes pero dirigidas al producto, no a personas
- Lenguaje coloquial moderado sin ataques personales
- Ejemplo permitido: "La tela es mala y el envío fue lento."
- Ejemplo NO permitido: "Esta tienda es una mierda, no compren."

REGLA DE SEGURIDAD:
Si tienes duda, marca la reseña como NO aprobada.

RESPUESTA:
Responde únicamente en JSON válido.

Formato obligatorio:
{
  "approved": boolean,
  "reason": "explicación breve en español"
}

RESEÑA DEL USUARIO:
"${comment}"`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    // Al usar responseMimeType, responseText ya es un JSON válido directamente
    const response = JSON.parse(
      responseText
        .trim()
        .replace('```json', '')
        .replace('```', '')
        .replace('json', '')
    )

    return {
      approved: response.approved === true,
      reason: response.reason || undefined,
      error: false
    }
  } catch (error) {
    console.error('Error en moderación de review con IA:', error)
    return {
      approved: false,
      reason: 'Error al procesar la moderación',
      error: true
    }
  }
}
