/**
 * Utilidades para manejo de localStorage
 * 
 * Funciones genéricas y específicas para persistencia de datos en el cliente
 */

/**
 * Carga datos de localStorage con un valor por defecto
 */
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return defaultValue
    return JSON.parse(stored) as T
  } catch (error) {
    console.error(`Error loading from localStorage "${key}":`, error)
    return defaultValue
  }
}

/**
 * Guarda datos en localStorage
 */
export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error saving to localStorage "${key}":`, error)
  }
}

/**
 * Elimina datos de localStorage
 */
export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing from localStorage "${key}":`, error)
  }
}

/**
 * Limpia todo el localStorage
 */
export function clearStorage(): void {
  try {
    localStorage.clear()
  } catch (error) {
    console.error('Error clearing localStorage:', error)
  }
}

// ============================================================================
// Funciones específicas para datos de delivery
// ============================================================================

/**
 * Datos de delivery para persistencia en localStorage
 */
interface DeliveryStorageData {
  clientName?: string
  address?: string
  locationToSend?: string
  agencia?: string
  dni?: string
  clientPhone?: string
  email?: string
}

/**
 * Carga datos de delivery guardados previamente
 */
export function loadDeliveryData(): DeliveryStorageData {
  return loadFromStorage<DeliveryStorageData>('dataDeliverySend', {})
}

/**
 * Guarda datos de delivery en localStorage
 */
export function saveDeliveryData(data: DeliveryStorageData): void {
  saveToStorage('dataDeliverySend', data)
}

/**
 * Elimina datos de delivery del localStorage
 */
export function clearDeliveryData(): void {
  removeFromStorage('dataDeliverySend')
}
