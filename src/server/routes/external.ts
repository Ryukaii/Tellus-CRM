import * as express from 'express';
import axios from 'axios';

const router = express.Router();

/**
 * Consulta CNPJ na ReceitaWS
 */
router.get('/cnpj/:cnpj', async (req, res) => {
  try {
    const { cnpj } = req.params;
    
    // Validar formato do CNPJ
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    if (cnpjLimpo.length !== 14) {
      return res.status(400).json({ error: 'CNPJ deve ter 14 dígitos' });
    }

    // Fazer requisição para a ReceitaWS
    const response = await axios.get(`https://www.receitaws.com.br/v1/cnpj/${cnpjLimpo}`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'TellusCRM/1.0'
      }
    });

    const data = response.data;

    // Verificar se a consulta foi bem-sucedida
    if (data.status === 'ERROR' || !data.nome) {
      return res.status(404).json({ error: 'CNPJ não encontrado' });
    }

    // Formatar os dados retornados
    const resultado = {
      razaoSocial: data.nome || '',
      nomeFantasia: data.fantasia || '',
      endereco: {
        logradouro: `${data.logradouro || ''} ${data.numero || ''}`.trim(),
        bairro: data.bairro || '',
        municipio: data.municipio || '',
        uf: data.uf || '',
        cep: data.cep ? data.cep.replace(/\D/g, '').replace(/^(\d{5})(\d{3})$/, '$1-$2') : ''
      },
      situacao: data.situacao || 'ATIVA'
    };

    res.json(resultado);
  } catch (error) {
    console.error('Erro ao consultar CNPJ:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        return res.status(408).json({ error: 'Timeout na consulta' });
      }
      if (error.response?.status === 404) {
        return res.status(404).json({ error: 'CNPJ não encontrado' });
      }
    }
    
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * Consulta CEP na ViaCEP
 */
router.get('/cep/:cep', async (req, res) => {
  try {
    const { cep } = req.params;
    
    // Validar formato do CEP
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) {
      return res.status(400).json({ error: 'CEP deve ter 8 dígitos' });
    }

    // Fazer requisição para a ViaCEP
    const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`, {
      timeout: 10000
    });

    const data = response.data;

    // Verificar se o CEP foi encontrado
    if (data.erro) {
      return res.status(404).json({ error: 'CEP não encontrado' });
    }

    // Formatar os dados retornados
    const resultado = {
      logradouro: data.logradouro || '',
      bairro: data.bairro || '',
      municipio: data.localidade || '',
      uf: data.uf || '',
      cep: data.cep || ''
    };

    res.json(resultado);
  } catch (error) {
    console.error('Erro ao consultar CEP:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        return res.status(408).json({ error: 'Timeout na consulta' });
      }
    }
    
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
