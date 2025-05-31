interface User {
  email: string
  name: string
  role: string
}

interface Credentials {
  email: string
  password: string
  user: User
}

// Simple credentials store - can be expanded in the future
const credentialsStore: Credentials[] = [
  {
    email: "admin@clyckk.com",
    password: "admin123",
    user: {
      email: "admin@clyckk.com",
      name: "Admin User",
      role: "admin",
    },
  },
]

export const validateCredentials = (email: string, password: string): User | null => {
  const credential = credentialsStore.find((cred) => cred.email === email && cred.password === password)
  return credential ? credential.user : null
}

export const addCredentials = (email: string, password: string, user: User): void => {
  credentialsStore.push({ email, password, user })
}
