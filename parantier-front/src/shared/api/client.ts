import { apiClient } from './axios'

// Export apiClient directly and as 'api' for backward compatibility
export { apiClient }
export const api = apiClient
