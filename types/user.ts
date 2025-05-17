export interface User {
  id: number
  username: string
  password: string
  role: string
}

export interface Session {
  user: {
    id: number
    username: string
    role: string
  }
}
