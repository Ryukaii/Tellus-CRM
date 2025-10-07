import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from '../middleware/auth.js';
import { uploadFile, deleteFile } from '../services/supabaseService.js';

const router = express.Router();

// Configuração do multer para upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    // Tipos de arquivo permitidos
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Apenas PDF, JPG, PNG e WEBP são aceitos.'));
    }
  }
});

// Upload de documento
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo enviado'
      });
    }

    const uploadedFile = req.file;
    const { documentType, userCpf, sessionId } = req.body;

    // Validações
    if (!documentType) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de documento é obrigatório'
      });
    }

    if (!userCpf && !sessionId) {
      return res.status(400).json({
        success: false,
        error: 'CPF do usuário ou ID da sessão é obrigatório'
      });
    }

    // Gerar nome único para o arquivo
    const fileExtension = uploadedFile.originalname.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    
    // Definir caminho baseado no contexto
    let filePath: string;
    if (userCpf) {
      filePath = `${userCpf}/${uniqueFileName}`;
    } else {
      filePath = `session/${sessionId}/${uniqueFileName}`;
    }

    console.log('Fazendo upload seguro para Supabase:', {
      fileName: uploadedFile.originalname,
      filePath,
      documentType,
      userCpf: userCpf || 'N/A',
      sessionId: sessionId || 'N/A',
      fileSize: uploadedFile.size
    });

    // Upload para Supabase usando service key (seguro)
    const uploadResult = await uploadFile(
      uploadedFile.buffer, 
      filePath, 
      process.env.SUPABASE_STORAGE_BUCKET || 'user-documents'
    );

    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'Erro no upload');
    }

    // Retornar dados do documento (incluindo customTitle se fornecido)
    const documentData = {
      id: filePath,
      fileName: uploadedFile.originalname,
      fileSize: uploadedFile.size,
      fileType: uploadedFile.mimetype,
      documentType,
      uploadedAt: new Date(),
      url: uploadResult.url,
      filePath: uploadResult.filePath,
      customTitle: req.body.customTitle || undefined // Suporte a título personalizado
    };

    res.json({
      success: true,
      data: documentData,
      message: 'Documento enviado com sucesso!'
    });

  } catch (error) {
    console.error('Erro no upload de documento:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    });
  }
});

// Upload múltiplo de documentos
router.post('/upload-multiple', upload.array('files', 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo enviado'
      });
    }

    const { documentType, userCpf, sessionId } = req.body;

    if (!documentType) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de documento é obrigatório'
      });
    }

    if (!userCpf && !sessionId) {
      return res.status(400).json({
        success: false,
        error: 'CPF do usuário ou ID da sessão é obrigatório'
      });
    }

    const results = [];
    const errors = [];

    for (const file of files) {
      try {
        // Gerar nome único para o arquivo
        const fileExtension = file.originalname.split('.').pop();
        const uniqueFileName = `${uuidv4()}.${fileExtension}`;
        
        // Definir caminho baseado no contexto
        let filePath: string;
        if (userCpf) {
          filePath = `${userCpf}/${uniqueFileName}`;
        } else {
          filePath = `session/${sessionId}/${uniqueFileName}`;
        }

        // Upload para Supabase
        const uploadResult = await uploadFile(
          file.buffer, 
          filePath, 
          process.env.SUPABASE_STORAGE_BUCKET || 'user-documents'
        );

        if (uploadResult.success) {
          results.push({
            id: filePath,
            fileName: file.originalname,
            fileSize: file.size,
            fileType: file.mimetype,
            documentType,
            uploadedAt: new Date(),
            url: uploadResult.url,
            filePath: uploadResult.filePath
          });
        } else {
          errors.push({
            fileName: file.originalname,
            error: uploadResult.error || 'Erro no upload'
          });
        }
      } catch (error) {
        errors.push({
          fileName: file.originalname,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }

    res.json({
      success: true,
      data: {
        successful: results,
        failed: errors
      },
      message: `${results.length} documento(s) enviado(s) com sucesso${errors.length > 0 ? `, ${errors.length} falharam` : ''}`
    });

  } catch (error) {
    console.error('Erro no upload múltiplo:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    });
  }
});

// Deletar documento
router.delete('/:filePath', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { filePath } = req.params;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'Caminho do arquivo é obrigatório'
      });
    }

    console.log('Deletando documento:', { filePath, userId });

    // Deletar do Supabase
    const deleteResult = await deleteFile(
      filePath, 
      process.env.SUPABASE_STORAGE_BUCKET || 'user-documents'
    );

    if (!deleteResult.success) {
      throw new Error(deleteResult.error || 'Erro ao deletar arquivo');
    }

    res.json({
      success: true,
      message: 'Documento deletado com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao deletar documento:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    });
  }
});

export default router;
