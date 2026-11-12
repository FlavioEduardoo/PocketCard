export const brl = (n) => `R$ ${(Number(n) || 0).toFixed(2).replace('.', ',')}`;
export const fmtDate = (d) => new Date(d).toLocaleDateString('pt-BR');
export const parseAmount = (text) => parseFloat(String(text).trim().replace(',', '.'));