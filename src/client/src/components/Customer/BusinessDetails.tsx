import React, { useState, useEffect } from 'react';
import { 
  DollarSign, MessageSquare, Plus, Calendar, User, 
  Edit2, Trash2, Save, X, Loader2 
} from 'lucide-react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Comentario, NovoComentario } from '../../../shared/types/customer';

interface BusinessDetailsProps {
  customerId: string;
  valorNegocio?: number;
  comentarios?: Comentario[];
  onValorChange: (valor: number | undefined) => void;
  onComentariosChange: (comentarios: Comentario[]) => void;
}

export const BusinessDetails: React.FC<BusinessDetailsProps> = ({
  customerId,
  valorNegocio,
  comentarios = [],
  onValorChange,
  onComentariosChange
}) => {
  const [editingValor, setEditingValor] = useState(false);
  const [tempValor, setTempValor] = useState(valorNegocio?.toString() || '');
  const [displayValor, setDisplayValor] = useState('');
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [tempComment, setTempComment] = useState('');
  const [saving, setSaving] = useState(false);

  // Funções para formatação de valor
  const formatValueForDisplay = (value: number | undefined): string => {
    if (!value) return '';
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const parseValueFromDisplay = (displayValue: string): number | undefined => {
    if (!displayValue) return undefined;
    // Remove pontos de milhares e substitui vírgula por ponto
    const cleanValue = displayValue.replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? undefined : parsed;
  };

  const handleValorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Remove caracteres não numéricos exceto vírgula e ponto
    const cleanInput = inputValue.replace(/[^\d,.]/g, '');
    
    // Se tem ponto e vírgula, mantém apenas o último
    if ((cleanInput.match(/\./g) || []).length > 1 || (cleanInput.match(/,/g) || []).length > 1) {
      return;
    }
    
    // Se tem vírgula, formata como decimal brasileiro
    if (cleanInput.includes(',')) {
      const parts = cleanInput.split(',');
      if (parts.length === 2 && parts[1].length <= 2) {
        // Formata a parte inteira com pontos de milhares
        const integerPart = parts[0].replace(/\D/g, '');
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        const formattedValue = formattedInteger + ',' + parts[1];
        setDisplayValor(formattedValue);
        setTempValor(parseValueFromDisplay(formattedValue)?.toString() || '');
      }
    } else if (cleanInput.includes('.')) {
      // Se tem apenas ponto, trata como separador de milhares
      const cleanNumber = cleanInput.replace(/\D/g, '');
      const formatted = cleanNumber.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      setDisplayValor(formatted);
      setTempValor(cleanNumber);
    } else {
      // Apenas números, formata com pontos de milhares
      const cleanNumber = cleanInput.replace(/\D/g, '');
      const formatted = cleanNumber.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      setDisplayValor(formatted);
      setTempValor(cleanNumber);
    }
  };

  useEffect(() => {
    setTempValor(valorNegocio?.toString() || '');
    setDisplayValor(formatValueForDisplay(valorNegocio));
  }, [valorNegocio]);

  const handleSaveValor = async () => {
    try {
      setSaving(true);
      const valor = tempValor ? parseFloat(tempValor) : undefined;
      
      // Salvar no backend primeiro
      await saveBusinessDataWithData(valor, comentarios);
      
      // Depois atualizar o estado local
      onValorChange(valor);
      setEditingValor(false);
    } catch (error) {
      console.error('Erro ao salvar valor:', error);
      alert('Erro ao salvar valor do negócio');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelValor = () => {
    setTempValor(valorNegocio?.toString() || '');
    setDisplayValor(formatValueForDisplay(valorNegocio));
    setEditingValor(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSaving(true);
      const novoComentario: Comentario = {
        id: Date.now().toString(),
        comentario: newComment.trim(),
        data: new Date().toISOString(),
        autor: 'Usuário Atual' // TODO: pegar do contexto de autenticação
      };

      const updatedComentarios = [novoComentario, ...comentarios];
      
      // Salvar no backend primeiro
      await saveBusinessDataWithData(tempValor ? parseFloat(tempValor) : undefined, updatedComentarios);
      
      // Depois atualizar o estado local
      onComentariosChange(updatedComentarios);
      setNewComment('');
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      alert('Erro ao adicionar comentário');
    } finally {
      setSaving(false);
    }
  };

  const handleEditComment = (commentId: string) => {
    const comment = comentarios.find(c => c.id === commentId);
    if (comment) {
      setEditingComment(commentId);
      setTempComment(comment.comentario);
    }
  };

  const handleSaveComment = async (commentId: string) => {
    try {
      setSaving(true);
      const updatedComentarios = comentarios.map(comment =>
        comment.id === commentId
          ? { ...comment, comentario: tempComment.trim() }
          : comment
      );
      
      // Salvar no backend primeiro
      await saveBusinessDataWithData(tempValor ? parseFloat(tempValor) : undefined, updatedComentarios);
      
      // Depois atualizar o estado local
      onComentariosChange(updatedComentarios);
      setEditingComment(null);
      setTempComment('');
    } catch (error) {
      console.error('Erro ao salvar comentário:', error);
      alert('Erro ao salvar comentário');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este comentário?')) return;

    try {
      setSaving(true);
      const updatedComentarios = comentarios.filter(c => c.id !== commentId);
      
      // Salvar no backend primeiro
      await saveBusinessDataWithData(tempValor ? parseFloat(tempValor) : undefined, updatedComentarios);
      
      // Depois atualizar o estado local
      onComentariosChange(updatedComentarios);
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      alert('Erro ao excluir comentário');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEditComment = () => {
    setEditingComment(null);
    setTempComment('');
  };

  const saveBusinessDataWithData = async (valor: number | undefined, comentariosData: Comentario[]) => {
    const token = localStorage.getItem('tellus_token');
    const response = await fetch(`/api/customers/${customerId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        valorNegocio: valor,
        comentarios: comentariosData
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na resposta:', response.status, errorText);
      throw new Error('Erro ao salvar dados do negócio');
    }

    const result = await response.json();
    console.log('Dados salvos com sucesso:', result);
    return result;
  };

  const formatCurrency = (value?: number) => {
    if (!value) return 'Não informado';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Valor do Negócio */}
      <div className="bg-white rounded-lg shadow-sm border dark:bg-dark-card dark:border-dark-border">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b dark:border-dark-border">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center dark:text-dark-text">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500 dark:text-green-400" />
            Valor do Negócio
          </h3>
        </div>
        <div className="p-4 sm:p-6">
          {editingValor ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700 dark:text-dark-textSecondary">
                  R$ 
                </span>
                <Input
                  type="text"
                  value={displayValor}
                  onChange={handleValorInputChange}
                  placeholder="0,00"
                  className="flex-1"
                  disabled={saving}
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleSaveValor}
                  disabled={saving}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Salvar</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelValor}
                  disabled={saving}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancelar</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">
                  {formatCurrency(valorNegocio)}
                </p>
                <p className="text-sm text-gray-600 dark:text-dark-textSecondary">
                  Valor estimado do negócio
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setEditingValor(true)}
                className="flex items-center space-x-2"
                size="sm"
              >
                <Edit2 className="w-4 h-4" />
                <span>Editar</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Comentários */}
      <div className="bg-white rounded-lg shadow-sm border dark:bg-dark-card dark:border-dark-border">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b dark:border-dark-border">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center dark:text-dark-text">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500 dark:text-blue-400" />
            Comentários ({comentarios.length})
          </h3>
        </div>
        <div className="p-4 sm:p-6">
          {/* Adicionar Novo Comentário */}
          <div className="mb-6">
            <div className="space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Adicione um comentário sobre este negócio..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-input dark:border-dark-border dark:text-dark-text dark:focus:ring-dark-accent dark:focus:border-dark-accent"
                rows={3}
                disabled={saving}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || saving}
                  className="flex items-center space-x-2"
                  size="sm"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>Adicionar Comentário</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de Comentários */}
          <div className="space-y-4">
            {comentarios.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-dark-textSecondary">
                  Nenhum comentário ainda. Adicione o primeiro comentário sobre este negócio.
                </p>
              </div>
            ) : (
              comentarios.map((comentario) => (
                <div
                  key={comentario.id}
                  className="border border-gray-200 rounded-lg p-4 dark:border-dark-border"
                >
                  {editingComment === comentario.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={tempComment}
                        onChange={(e) => setTempComment(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-input dark:border-dark-border dark:text-dark-text dark:focus:ring-dark-accent dark:focus:border-dark-accent"
                        rows={3}
                        disabled={saving}
                      />
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleSaveComment(comentario.id)}
                          disabled={saving}
                          size="sm"
                          className="flex items-center space-x-2"
                        >
                          {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          <span>Salvar</span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCancelEditComment}
                          disabled={saving}
                          size="sm"
                          className="flex items-center space-x-2"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancelar</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-900 dark:text-dark-text mb-3 whitespace-pre-wrap">
                        {comentario.comentario}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-dark-textSecondary">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(comentario.data)}</span>
                          </div>
                          {comentario.autor && (
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>{comentario.autor}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => handleEditComment(comentario.id)}
                            size="sm"
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleDeleteComment(comentario.id)}
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
