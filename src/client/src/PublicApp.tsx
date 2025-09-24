import { LeadForm } from './components/Public/LeadForm';
import { LeadFormAgro } from './components/Public/LeadFormAgro';
import { LeadFormCredito } from './components/Public/LeadFormCredito';
import { LeadFormConsultoria } from './components/Public/LeadFormConsultoria';
import { LeadFormCredImobil } from './components/Public/LeadFormCredImobil';
import { ThemeToggle } from './components/UI/ThemeToggle';

function PublicApp() {
  // Detectar qual formulário usar baseado na URL
  const path = window.location.pathname;
  const urlParams = new URLSearchParams(window.location.search);
  const formParam = urlParams.get('form');
  
  // Lista das rotas válidas
  const validRoutes = [
    '/cadastro/agro',
    '/cadastro/credito', 
    '/cadastro/consultoria',
    '/cadastro/creditoimobiliario'
  ];
  
  // Verificar se a rota é válida
  const isValidRoute = validRoutes.includes(path) || validRoutes.some(route => 
    formParam && route.includes(formParam)
  );
  
  // Se não for uma rota válida, mostrar página 404
  if (!isValidRoute) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-background flex items-center justify-center relative">
        {/* Botão de tema no canto superior direito */}
        <div className="absolute top-4 right-4">
          <ThemeToggle size="md" variant="icon" />
        </div>
        
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-dark-text mb-4">404</h1>
          <p className="text-gray-600 dark:text-dark-textSecondary mb-4">Página não encontrada</p>
        </div>
      </div>
    );
  }
  
  // Componente wrapper para formulários públicos com botão de tema
  const PublicFormWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="relative min-h-screen">
      {/* Botão de tema no canto superior direito */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle size="md" variant="icon" />
      </div>
      {children}
    </div>
  );

  // Determinar qual formulário renderizar
  if (path === '/cadastro/agro' || formParam === 'agro') {
    return (
      <PublicFormWrapper>
        <LeadFormAgro />
      </PublicFormWrapper>
    );
  } else if (path === '/cadastro/credito' || formParam === 'credito') {
    return (
      <PublicFormWrapper>
        <LeadFormCredito />
      </PublicFormWrapper>
    );
  } else if (path === '/cadastro/consultoria' || formParam === 'consultoria') {
    return (
      <PublicFormWrapper>
        <LeadFormConsultoria />
      </PublicFormWrapper>
    );
  } else if (path === '/cadastro/creditoimobiliario' || formParam === 'creditoimobiliario') {
    return (
      <PublicFormWrapper>
        <LeadFormCredImobil />
      </PublicFormWrapper>
    );
  } else {
    // Formulário padrão (não deveria chegar aqui com a validação acima)
    return (
      <PublicFormWrapper>
        <LeadForm />
      </PublicFormWrapper>
    );
  }
}

export default PublicApp;


