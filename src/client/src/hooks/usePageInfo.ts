import { useLocation } from 'react-router-dom';

export function usePageInfo() {
  const location = useLocation();

  const getPageInfo = () => {
    const path = location.pathname;
    
    if (path.startsWith('/dashboard/customers')) {
      return {
        title: 'Clientes',
        breadcrumb: ['Dashboard', 'Clientes']
      };
    }
    
    if (path.startsWith('/dashboard/pre-registrations')) {
      return {
        title: 'Pré-Cadastros',
        breadcrumb: ['Dashboard', 'Pré-Cadastros']
      };
    }
    
    if (path.startsWith('/dashboard/customers/') && path.includes('/edit')) {
      return {
        title: 'Editar Cliente',
        breadcrumb: ['Dashboard', 'Clientes', 'Editar']
      };
    }
    
    if (path.startsWith('/dashboard/customers/') && !path.includes('/edit')) {
      return {
        title: 'Detalhes do Cliente',
        breadcrumb: ['Dashboard', 'Clientes', 'Detalhes']
      };
    }
    
    return {
      title: 'Dashboard',
      breadcrumb: ['Dashboard']
    };
  };

  return getPageInfo();
}
