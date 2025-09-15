import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { database } from '../database/database.js';
import { User, LoginCredentials, AuthResponse, TokenPayload } from '../../shared/types/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tellus-crm-secret-key-2024';
const JWT_EXPIRES_IN = '7d';

interface MongoUser {
  _id: any;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  createdAt?: Date;
  updatedAt?: Date;
}

class AuthService {
  private mapMongoToUser(mongoUser: MongoUser): User {
    return {
      id: mongoUser._id.toString(),
      name: mongoUser.name,
      email: mongoUser.email,
      role: mongoUser.role,
      createdAt: mongoUser.createdAt?.toISOString(),
      updatedAt: mongoUser.updatedAt?.toISOString()
    };
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse | null> {
    try {
      const { email, password } = credentials;

      // Find user by email
      const mongoUser = await database.findUserByEmail(email);
      if (!mongoUser) {
        return null;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, mongoUser.password);
      if (!isValidPassword) {
        return null;
      }

      // Generate JWT token
      const tokenPayload: TokenPayload = {
        userId: mongoUser._id.toString(),
        email: mongoUser.email,
        role: mongoUser.role
      };

      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      // Return user and token (without password)
      const user = this.mapMongoToUser(mongoUser);

      return {
        user,
        token
      };
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      
      // Get fresh user data from database
      const mongoUser = await database.findUserById(decoded.userId);
      if (!mongoUser) {
        return null;
      }

      return this.mapMongoToUser(mongoUser);
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role?: 'admin' | 'user';
  }): Promise<User> {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      const mongoUserData = {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role || 'user'
      };

      const result = await database.createUser(mongoUserData);
      return this.mapMongoToUser(result);
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error('Email já está em uso');
      }
      throw error;
    }
  }

  generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }
}

export const authService = new AuthService();
