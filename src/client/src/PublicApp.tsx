import { LeadForm } from './components/Public/LeadForm';
import { LeadFormAgro } from './components/Public/LeadFormAgro';
import { LeadFormCredito } from './components/Public/LeadFormCredito';
import { LeadFormConsultoria } from './components/Public/LeadFormConsultoria';
import { LeadFormCredImobil } from './components/Public/LeadFormCredImobil';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600 mb-4">Página não encontrada</p>
        </div>
      </div>
    );
  }
  
  // Componente wrapper para formulários públicos (sempre tema light)
  const PublicFormWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen">
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


