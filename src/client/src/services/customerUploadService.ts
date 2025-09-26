export interface CustomerUploadLink {
  id: string;
  customerId: string;
  customerName: string;
  customerCpf: string;
  createdBy: string;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
  accessCount: number;
  maxAccess?: number;
  allowedDocumentTypes: string[];
  maxFileSize: number;
  maxFiles: number;
  timeRemaining?: number;
}

export interface CreateUploadLinkData {
  customerId: string;
  expiresInHours?: number;
  maxAccess?: number;
  allowedDocumentTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
}

export class CustomerUploadService {
  private static API_BASE_URL = '/api';

  private static getAuthHeaders() {
    const token = localStorage.getItem('tellus_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  // Criar link de upload para cliente
  static async createUploadLink(data: CreateUploadLinkData): Promise<CustomerUploadLink> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/customer-upload/create`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Erro ao criar link de upload');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error creating upload link:', error);
      throw error;
    }
  }

  // Buscar link de upload (público)
  static async getUploadLink(linkId: string): Promise<CustomerUploadLink> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/customer-upload/${linkId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Link não encontrado ou expirado');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting upload link:', error);
      throw error;
    }
  }

  // Upload de documento via link
  static async uploadDocument(linkId: string, file: File): Promise<{ success: boolean; message: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.API_BASE_URL}/customer-upload/${linkId}/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Erro ao fazer upload do documento');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  // Listar links de upload do usuário
  static async getUserUploadLinks(page: number = 1, limit: number = 10): Promise<CustomerUploadLink[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/customer-upload/my-links?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar links');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting user upload links:', error);
      throw error;
    }
  }

  // Desativar link de upload
  static async deactivateUploadLink(linkId: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/customer-upload/${linkId}/deactivate`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erro ao desativar link');
      }
    } catch (error) {
      console.error('Error deactivating upload link:', error);
      throw error;
    }
  }

  // Gerar URL completa do link de upload
  static getUploadLinkUrl(linkId: string): string {
    return `${window.location.origin}/upload/${linkId}`;
  }

  // Formatar tempo restante
  static formatTimeRemaining(timeRemaining: number): string {
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return 'Expirado';
    }
  }

  // Verificar se o link está ativo
  static isLinkActive(uploadLink: CustomerUploadLink): boolean {
    const now = new Date();
    return uploadLink.isActive && now < new Date(uploadLink.expiresAt);
  }
}
