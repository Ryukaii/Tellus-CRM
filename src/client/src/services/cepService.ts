export interface CepData {
  cep: string;
  logradouro: string;
  complemento: string;
  unidade: string;
  bairro: string;
  localidade: string;
  uf: string;
  estado: string;
  regiao: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

export interface CepError {
  erro: boolean;
}

export class CepService {
  private static readonly VIA_CEP_URL = 'https://viacep.com.br/ws';

  /**
   * Busca dados do CEP na API do ViaCEP
   * @param cep - CEP no formato 00000000 ou 00000-000
   * @returns Promise com os dados do CEP ou erro
   */
  static async buscarCep(cep: string): Promise<CepData | null> {
    try {
      // Remove caracteres não numéricos
      const cepLimpo = cep.replace(/\D/g, '');
      
      // Valida se o CEP tem 8 dígitos
      if (cepLimpo.length !== 8) {
        throw new Error('CEP deve ter 8 dígitos');
      }

      const response = await fetch(`${this.VIA_CEP_URL}/${cepLimpo}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar CEP');
      }

      const data: CepData | CepError = await response.json();

      // Verifica se a API retornou erro
      if ('erro' in data && data.erro) {
        throw new Error('CEP não encontrado');
      }

      return data as CepData;
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      return null;
    }
  }

  /**
   * Valida formato do CEP
   * @param cep - CEP a ser validado
   * @returns true se o formato é válido
   */
  static validarFormatoCep(cep: string): boolean {
    const cepLimpo = cep.replace(/\D/g, '');
    return cepLimpo.length === 8;
  }

  /**
   * Formata CEP para exibição (00000-000)
   * @param cep - CEP no formato 00000000
   * @returns CEP formatado
   */
  static formatarCep(cep: string): string {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      return `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5)}`;
    }
    return cep;
  }
}
