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
      model: 'gemma-3-27b-it'
    })

    // Construimos el prompt completo incluyendo las instrucciones
    const prompt = `Eres un moderador de contenido experto para un e-commerce de ropa.

TAREA: Analiza la reseña del usuario que aparece al final y detecta:
- Insultos o lenguaje ofensivo
- Discurso de odio o discriminación
- Amenazas o violencia
- Spam o contenido promocional de otros sitios
- Información personal sensible (teléfonos, direcciones, emails)
- Comentarios inapropiados para menores

Responde ÚNICAMENTE en este formato JSON:
{
  "approved": boolean,
  "reason": "explicación breve y concisa en español."
}

RESEÑA DEL USUARIO A ANALIZAR:
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
