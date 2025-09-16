export interface CPFData {
  cpf: string;
  nome: string;
  nome_mae: string;
  data_nascimento: string;
  sexo: string;
}

export interface CPFResponse {
  DADOS: CPFData;
}

export class CPFService {
  private static readonly API_URL = 'https://consulta.fontesderenda.blog/cpf.php';
  private static readonly TOKEN = '1285fe4s-e931-4071-a848-3fac8273c55a';

  static async consultarCPF(cpf: string): Promise<CPFData | null> {
    try {
      // Limpar CPF (remover pontos, traços, etc.)
      const cpfLimpo = cpf.replace(/\D/g, '');
      
      // Verificar se tem 11 dígitos
      if (cpfLimpo.length !== 11) {
        throw new Error('CPF deve ter 11 dígitos');
      }

      const response = await fetch(`${this.API_URL}?token=${this.TOKEN}&cpf=${cpfLimpo}`);
      
      if (!response.ok) {
        throw new Error('Erro na consulta do CPF');
      }

      const data: CPFResponse = await response.json();
      
      if (data.DADOS && data.DADOS.cpf) {
        return data.DADOS;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao consultar CPF:', error);
      return null;
    }
  }

  static formatarDataNascimento(dataNascimento: string): string {
    // Converter de "1984-09-07 00:00:00" para "1984-09-07"
    return dataNascimento.split(' ')[0];
  }
}
