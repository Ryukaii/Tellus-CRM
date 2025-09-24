/**
 * Serviço para validação e formatação de CNPJ
 */

export class CNPJService {
  /**
   * Valida se um CNPJ é válido
   */
  static validarCNPJ(cnpj: string): boolean {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    
    // Verificar se tem 14 dígitos
    if (cnpjLimpo.length !== 14) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cnpjLimpo)) return false;
    
    // Calcular primeiro dígito verificador
    let soma = 0;
    let peso = 5;
    
    for (let i = 0; i < 12; i++) {
      soma += parseInt(cnpjLimpo[i]) * peso;
      peso = peso === 2 ? 9 : peso - 1;
    }
    
    let resto = soma % 11;
    let digito1 = resto < 2 ? 0 : 11 - resto;
    
    if (parseInt(cnpjLimpo[12]) !== digito1) return false;
    
    // Calcular segundo dígito verificador
    soma = 0;
    peso = 6;
    
    for (let i = 0; i < 13; i++) {
      soma += parseInt(cnpjLimpo[i]) * peso;
      peso = peso === 2 ? 9 : peso - 1;
    }
    
    resto = soma % 11;
    let digito2 = resto < 2 ? 0 : 11 - resto;
    
    return parseInt(cnpjLimpo[13]) === digito2;
  }

  /**
   * Formata CNPJ para exibição (XX.XXX.XXX/XXXX-XX)
   */
  static formatarCNPJ(cnpj: string): string {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    
    if (cnpjLimpo.length <= 14) {
      return cnpjLimpo.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        '$1.$2.$3/$4-$5'
      );
    }
    
    return cnpj.slice(0, 18); // Limitar a 18 caracteres
  }

  /**
   * Remove formatação do CNPJ, deixando apenas números
   */
  static limparCNPJ(cnpj: string): string {
    return cnpj.replace(/\D/g, '');
  }

  /**
   * Verifica se o formato do CNPJ está correto (XX.XXX.XXX/XXXX-XX)
   */
  static validarFormatoCNPJ(cnpj: string): boolean {
    const regex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
    return regex.test(cnpj);
  }

  /**
   * Valida e consulta dados da empresa pelo CNPJ (simulação)
   * Em um cenário real, isso faria uma consulta à Receita Federal
   */
  static async consultarCNPJ(cnpj: string): Promise<{
    razaoSocial: string;
    nomeFantasia?: string;
    endereco: {
      logradouro: string;
      bairro: string;
      municipio: string;
      uf: string;
      cep: string;
    };
    situacao: string;
  } | null> {
    const cnpjLimpo = this.limparCNPJ(cnpj);
    
    if (!this.validarCNPJ(cnpjLimpo)) {
      return null;
    }

    // Simulação de consulta à Receita Federal
    // Em produção, isso seria uma chamada para uma API real
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dados simulados baseados no CNPJ
      return {
        razaoSocial: `Empresa Exemplo ${cnpjLimpo.slice(-4)} LTDA`,
        nomeFantasia: `Empresa ${cnpjLimpo.slice(-4)}`,
        endereco: {
          logradouro: 'Rua das Flores, 123',
          bairro: 'Centro',
          municipio: 'São Paulo',
          uf: 'SP',
          cep: '01000-000'
        },
        situacao: 'ATIVA'
      };
    } catch (error) {
      console.error('Erro ao consultar CNPJ:', error);
      return null;
    }
  }
}
