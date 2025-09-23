import { useLocation } from 'react-router-dom';

export function usePageInfo() {
  const location = useLocation();

  const getPageInfo = () => {
    const path = location.pathname;
    
    if (path === '/') {
      return {
        title: 'Dashboard',
        breadcrumb: ['Dashboard']
      };
    }
    
    if (path.startsWith('/customers')) {
      if (path.includes('/edit')) {
        return {
          title: 'Editar Cliente',
          breadcrumb: ['Dashboard', 'Clientes', 'Editar']
        };
      }
      
      if (path !== '/customers') {
        return {
          title: 'Detalhes do Cliente',
          breadcrumb: ['Dashboard', 'Clientes', 'Detalhes']
        };
      }
      
      return {
        title: 'Clientes',
        breadcrumb: ['Dashboard', 'Clientes']
      };
    }
    
    if (path.startsWith('/pre-registrations')) {
      return {
        title: 'Pré-Cadastros',
        breadcrumb: ['Dashboard', 'Pré-Cadastros']
      };
    }
    
    return {
      title: 'Dashboard',
      breadcrumb: ['Dashboard']
    };
  };

  return getPageInfo();
}
