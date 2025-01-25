/* eslint-disable @typescript-eslint/no-unused-vars */
import bcrypt from "bcryptjs"

interface User {
  id: string
  name: string
  email: string
  password: string
}

class MockDatabase {
  private users: User[] = []

  constructor() {
    // Add a mock user on initialization
    this.addMockUser("John Doe", "user@example.com", "password123")
    this.addMockUser("Admin User", "admin@example.com", "adminpass")
  }

  private async addMockUser(name: string, email: string, password: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
    }
    this.users.push(newUser)
  }

  async getUser(email: string): Promise<Omit<User, "password"> | undefined> {
    const user = this.users.find((user) => user.email === email)
    if (user) {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    }
    return undefined
  }

  async getUserById(id: string): Promise<Omit<User, "password"> | undefined> {
    const user = this.users.find((user) => user.id === id)
    if (user) {
      const { pass0word, ...userWithoutPassword } = user
      return userWithoutPassword
    }
    return undefined
  }

  async validateUser(email: string, password: string): Promise<boolean> {
    const user = this.users.find((user) => user.email === email)
    if (!user) return false
    return bcrypt.compare(password, user.password)
  }

  async authenticateUser(email: string, password: string): Promise<Omit<User, "password"> | null> {
    const user = this.users.find((user) => user.email === email)
    if (!user) return null

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) return null

    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }
}

export const mockDb = new MockDatabase()
