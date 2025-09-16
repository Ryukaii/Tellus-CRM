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
  
  // Determinar qual formulário renderizar
  if (path === '/cadastro/agro' || formParam === 'agro') {
    return <LeadFormAgro />;
  } else if (path === '/cadastro/credito' || formParam === 'credito') {
    return <LeadFormCredito />;
  } else if (path === '/cadastro/consultoria' || formParam === 'consultoria') {
    return <LeadFormConsultoria />;
  } else if (path === '/cadastro/creditoimobiliario' || formParam === 'creditoimobiliario') {
    return <LeadFormCredImobil />;
  } else {
    // Formulário padrão
    return <LeadForm />;
  }
}

export default PublicApp;
