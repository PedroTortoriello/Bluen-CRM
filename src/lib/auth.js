import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { supabase } from '../../../Backend_CRM/src/lib/supabase'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

export const authOperations = {
  async login(email, password) {
    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      throw new Error('Usuário não encontrado')
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      throw new Error('Senha incorreta')
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    }
  },

  async register(userData) {
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10)

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        id: `user_${Date.now()}`,
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role || 'vendedor',
        createdAt: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      throw new Error('Erro ao criar usuário')
    }

    return user
  },

  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET)
    } catch (error) {
      throw new Error('Token inválido')
    }
  }
}

// Middleware function to verify authentication
export function withAuth(handler) {
  return async (req, context) => {
    try {
      const authHeader = req.headers.get('authorization')
      
      if (!authHeader?.startsWith('Bearer ')) {
        return new Response(
          JSON.stringify({ error: 'Token não fornecido' }), 
          { status: 401 }
        )
      }

      const token = authHeader.substring(7)
      const decoded = authOperations.verifyToken(token)
      
      // Add user info to request
      req.user = decoded
      
      return handler(req, context)
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Token inválido' }), 
        { status: 401 }
      )
    }
  }
}