/**
 * Utilidades para formateo de fechas
 * Formato estándar: DD MM AAAA
 */

/**
 * Formatea una fecha al formato DD MM AAAA (ejemplo: 08 12 2025)
 * @param date - Fecha a formatear (Date, string o timestamp)
 * @returns String con la fecha formateada
 */
export function formatDateDDMMYYYY(date: Date | string | number | undefined): string {
  if (!date) return 'Sin fecha';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Fecha inválida';
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day} ${month} ${year}`;
}

/**
 * Formatea una fecha al formato DD-MM-AAAA (ejemplo: 08-12-2025)
 * @param date - Fecha a formatear
 * @returns String con la fecha formateada
 */
export function formatDateDash(date: Date | string | number | undefined): string {
  if (!date) return 'Sin fecha';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Fecha inválida';
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}-${month}-${year}`;
}

/**
 * Formatea una fecha al formato largo en español (ejemplo: 8 de diciembre de 2025)
 * @param date - Fecha a formatear
 * @returns String con la fecha formateada
 */
export function formatDateLong(date: Date | string | number | undefined): string {
  if (!date) return 'Sin fecha';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Fecha inválida';
  
  return d.toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Formatea una fecha al formato corto (ejemplo: 08 dic 2025)
 * @param date - Fecha a formatear
 * @returns String con la fecha formateada
 */
export function formatDateShort(date: Date | string | number | undefined): string {
  if (!date) return 'Sin fecha';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Fecha inválida';
  
  return d.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}




