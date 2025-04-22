export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return "N/A"; // O puedes devolver '$0.00' o una cadena vacía según prefieras
  }
  
  // Puedes ajustar las opciones según tus necesidades de formato (ej. 'es-MX', 'USD')
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
