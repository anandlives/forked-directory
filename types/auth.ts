export interface User {
  username: string
  role: string
}

export interface AuthResponse {
  success: boolean
  error?: string
  user?: User
}

export const VALID_USERS = [
  { username: "Anand.Patil", password: "password@123", role: "admin" },
  { username: "Aradhana.Mishra", password: "password@123", role: "admin" },
  { username: "Swapnil", password: "password", role: "admin" },
] as const
