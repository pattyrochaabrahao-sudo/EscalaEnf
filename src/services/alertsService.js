/**
 * alertsService.js
 * Serviço simples de alertas de cobertura mínima de escala.
 * Produzido pelo Chefe 2 ao salvar a escala; consumido pelo Chefe 3.
 */

let _alertas = [];

/**
 * Regista um alerta de dia abaixo do mínimo.
 * @param {{ setor: string, mes: number, ano: number, dia: number, turno: string, totalPresente: number, minimo: number }} alerta
 */
export function registrarAlertaEscala(alerta) {
  // Evita duplicatas do mesmo dia/turno/setor
  const existe = _alertas.some(
    a => a.setor === alerta.setor && a.mes === alerta.mes && a.ano === alerta.ano
      && a.dia === alerta.dia && a.turno === alerta.turno
  );
  if (!existe) {
    _alertas = [{ ...alerta, id: Date.now() + Math.random(), criadoEm: new Date().toISOString() }, ..._alertas];
  }
}

/**
 * Remove um alerta previamente registado (ex: após correcção da escala).
 */
export function removerAlertaEscala({ setor, mes, ano, dia, turno }) {
  _alertas = _alertas.filter(
    a => !(a.setor === setor && a.mes === mes && a.ano === ano && a.dia === dia && a.turno === turno)
  );
}

/** Devolve todos os alertas activos. */
export function getAlertasEscala() {
  return _alertas;
}

/** Limpa todos os alertas (utilitário de teste). */
export function limparAlertas() {
  _alertas = [];
}
