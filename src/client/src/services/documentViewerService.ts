// Removido import do Supabase - agora usa backend para assinar URLs

export interface SignedUrlResult {
  signedUrl: string;
  expiresAt: Date;
  error?: string;
}

export interface ShareableLink {
  id: string;
  customerId: string;
  customerName: string;
  customerCpf: string;
  createdBy: string;
  createdAt: Date;
  expiresAt: Date;
  accessCount: number;
  maxAccess?: number;
  isActive: boolean;
  
  // Controle de acesso
  permissions: {
    viewPersonalData: boolean;
    viewAddress: boolean;
    viewFinancialData: boolean;
    viewDocuments: boolean;
    viewNotes: boolean;
  };
  
  // Documentos incluídos
  documents: Array<{
    id: string;
    fileName: string;
    documentType: string;
    signedUrl?: string;
  }>;
}

export class DocumentViewerService {
  // Gerar URL assinada para um documento via backend
  static async getSignedDocumentUrl(filePath: string, expiresInSeconds?: number): Promise<SignedUrlResult> {
    try {
      // Se não especificado, usar 1 hora como padrão
      const expiresIn = expiresInSeconds || 3600;
      
      console.log('DocumentViewerService - Gerando URL assinada para:', filePath);
      console.log('DocumentViewerService - Expires in:', expiresIn, 'segundos');
      
      const response = await fetch('/api/sharing/document/signed-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tellus_token')}`
        },
        body: JSON.stringify({ filePath, expiresIn })
      });

      console.log('DocumentViewerService - Response status:', response.status);
      
      const data = await response.json();
      console.log('DocumentViewerService - Response data:', data);

      if (!data.success) {
        console.error('DocumentViewerService - Erro na resposta:', data.error);
        return {
          signedUrl: '',
          expiresAt: new Date(),
          error: data.error || 'Erro ao gerar URL assinada'
        };
      }

      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);

      console.log('DocumentViewerService - URL assinada gerada com sucesso');
      return {
        signedUrl: data.data.signedUrl,
        expiresAt,
      };
    } catch (error) {
      console.error('DocumentViewerService - Erro na requisição:', error);
      return {
        signedUrl: '',
        expiresAt: new Date(),
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Gerar múltiplas URLs assinadas via backend
  static async getSignedDocumentUrls(filePaths: string[], expiresInSeconds: number = 3600): Promise<Record<string, SignedUrlResult>> {
    const results: Record<string, SignedUrlResult> = {};

    // Gerar URLs uma por uma via backend
    for (const filePath of filePaths) {
      const result = await this.getSignedDocumentUrl(filePath, expiresInSeconds);
      results[filePath] = result;
    }

    return results;
  }

  // Verificar se URL ainda é válida
  static isUrlValid(expiresAt: Date): boolean {
    return new Date() < expiresAt;
  }

  // Formatar tempo restante
  static getTimeRemaining(expiresAt: Date): string {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();

    if (diff <= 0) return 'Expirado';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    } else {
      return `${minutes}min`;
    }
  }

  // Calcular tempo restante em segundos
  static getTimeRemainingInSeconds(expiresAt: Date): number {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    return Math.max(0, Math.floor(diff / 1000));
  }

  // Gerar URL assinada baseada no tempo de expiração do compartilhamento
  static async getSignedDocumentUrlForSharing(filePath: string, shareExpiresAt: Date): Promise<SignedUrlResult> {
    try {
      // Calcular tempo restante do compartilhamento
      const timeRemaining = this.getTimeRemainingInSeconds(shareExpiresAt);
      
      // Se o compartilhamento já expirou, retornar erro
      if (timeRemaining <= 0) {
        return {
          signedUrl: '',
          expiresAt: new Date(),
          error: 'Compartilhamento expirado'
        };
      }

      // Usar o tempo restante do compartilhamento, mas com um mínimo de 5 minutos
      const expiresIn = Math.max(300, timeRemaining); // Mínimo 5 minutos
      
      console.log(`Gerando URL assinada para ${filePath}: ${expiresIn} segundos (${Math.floor(expiresIn/60)} minutos)`);
      
      return await this.getSignedDocumentUrl(filePath, expiresIn);
    } catch (error) {
      return {
        signedUrl: '',
        expiresAt: new Date(),
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

export class SharingService {
  private static API_BASE_URL = '/api';

  private static getAuthHeaders() {
    const token = localStorage.getItem('tellus_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  // Criar link de compartilhamento
  static async createShareableLink(data: {
    customerId: string;
    expiresInHours: number;
    maxAccess?: number;
    permissions: ShareableLink['permissions'];
    documentIds: string[];
  }): Promise<ShareableLink> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/sharing/create`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Erro ao criar link de compartilhamento');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error creating shareable link:', error);
      throw error;
    }
  }

  // Buscar link de compartilhamento
  static async getShareableLink(linkId: string): Promise<ShareableLink> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/sharing/${linkId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Link não encontrado ou expirado');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting shareable link:', error);
      throw error;
    }
  }

  // Registrar acesso ao link
  static async recordAccess(linkId: string): Promise<void> {
    try {
      await fetch(`${this.API_BASE_URL}/sharing/${linkId}/access`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error recording access:', error);
    }
  }

  // Listar links criados por usuário
  static async getUserSharedLinks(): Promise<ShareableLink[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/sharing/my-links`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar links');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting user shared links:', error);
      throw error;
    }
  }

  // Desativar link
  static async deactivateLink(linkId: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/sharing/${linkId}/deactivate`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erro ao desativar link');
      }
    } catch (error) {
      console.error('Error deactivating link:', error);
      throw error;
    }
  }

  // Download em lote de documentos compartilhados
  static async downloadAllDocuments(linkId: string): Promise<{
    customerName: string;
    documents: Array<{
      id: string;
      fileName: string;
      documentType: string;
      signedUrl: string;
      expiresIn: number;
    }>;
    totalDocuments: number;
  }> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/sharing/${linkId}/download-all`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Erro ao baixar documentos');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error downloading all documents:', error);
      throw error;
    }
  }
}
