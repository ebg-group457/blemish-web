/**
 * Finca Blemish - Solicitudes de reserva + seguimiento financiero.
 * Hoja: "Blemish - Solicitudes de reserva". Pegar en Extensiones > Apps Script (reemplaza todo el código).
 * 1) Ejecutar una vez la función setupFinanzas (menú superior, botón ▶ Ejecutar).
 * 2) Implementar > Gestionar implementaciones > lápiz > Versión: Nueva versión > Implementar (la URL /exec no cambia).
 * Si ya corriste setupFinanzas antes, basta ejecutar setupEntidad (crea AE 'Institución / Empresa').
 * Cupos: doGet devuelve el acumulado de personas por día. Marca 'Cancelada' en la columna Estado (R) para liberar cupos.
 * Columnas A-Q y AE las escribe el sitio web; R-AD son de llenado manual (AA y AB se calculan solas).
 */
const TZ = 'America/Bogota';
const CUPO_SEMANA = 16, CUPO_FINDE = 25;   // personas por día, sin contar bebés
// Festivos de Colombia 2026-2027 (igual que reserva.js)
const FESTIVOS = ['2026-01-01','2026-01-12','2026-03-23','2026-04-02','2026-04-03','2026-05-01','2026-05-18','2026-06-08','2026-06-15','2026-06-29','2026-07-20','2026-08-07','2026-08-17','2026-10-12','2026-11-02','2026-11-16','2026-12-08','2026-12-25',
 '2027-01-01','2027-01-11','2027-03-22','2027-03-25','2027-03-26','2027-05-01','2027-05-10','2027-05-31','2027-06-07','2027-07-05','2027-07-20','2027-08-07','2027-08-16','2027-10-18','2027-11-01','2027-11-15','2027-12-08','2027-12-25'];
const esFinde = f => { const w = new Date(f + 'T12:00:00Z').getUTCDay(); return w === 0 || w === 6 || FESTIVOS.includes(f); };
const cupoDia = f => esFinde(f) ? CUPO_FINDE : CUPO_SEMANA;
const esPrivado = plan => /Estudiantil|Empresarial/.test(String(plan));
const fmtFecha = v => v instanceof Date ? Utilities.formatDate(v, TZ, 'yyyy-MM-dd') : String(v).slice(0, 10);

/** Acumulado por día: {fecha: personas} sin bebés, sin canceladas, desde hoy. Un grupo privado entre semana ocupa el día completo. */
function acumulado_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const last = sh.getLastRow(); const out = {};
  if (last < 2) return out;
  const v = sh.getRange(2, 1, last - 1, 18).getValues();
  const hoy = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
  v.forEach(r => {
    if (r[0] === '' || String(r[17]).trim().toLowerCase() === 'cancelada') return;
    const f = fmtFecha(r[1]); if (!/^\d{4}-\d{2}-\d{2}$/.test(f) || f < hoy) return;
    let n = (Number(r[10]) || 0) - (Number(r[8]) || 0) - (Number(r[9]) || 0);  // K - bebés (I, J)
    if (!esFinde(f) && esPrivado(r[3])) n = cupoDia(f);
    out[f] = Math.min(cupoDia(f), (out[f] || 0) + Math.max(0, n));
  });
  return out;
}

function doGet(e) {
  const json = JSON.stringify(acumulado_());
  const cb = e && e.parameter && e.parameter.callback;
  if (cb && /^[A-Za-z_$][\w$]*$/.test(cb)) return ContentService.createTextOutput(cb + '(' + json + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

const COLS = ['registro','fecha','tipoDia','plan','adH','adM','niH','niM','beH','beM','personas','total','abono','nombre','telefono','correo','acepto'];

function doPost(e) {
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    const clean = v => { v = (v === undefined || v === null) ? '' : String(v).slice(0, 300); return /^[=+\-@]/.test(v) ? "'" + v : v; };
    d.registro = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss');
    // Control de cupo antes de escribir
    const f = String(d.fecha || '').slice(0, 10), ya = acumulado_()[f] || 0;
    const pide = (Number(d.adH)||0) + (Number(d.adM)||0) + (Number(d.niH)||0) + (Number(d.niM)||0);
    const privado = !esFinde(f) && esPrivado(d.plan);
    if (/^\d{4}-\d{2}-\d{2}$/.test(f) && (privado ? ya > 0 : ya + pide > cupoDia(f))) return ContentService.createTextOutput('lleno');
    // Siguiente fila libre según la columna A (no usa appendRow, para no chocar con las fórmulas de AA/AB).
    const colA = sh.getRange('A:A').getValues();
    let r = colA.length; while (r > 1 && colA[r - 1][0] === '') r--;
    const row = r + 1;
    sh.getRange(row, 1, 1, COLS.length).setValues([COLS.map(k => clean(d[k]))]);
    sh.getRange(row, 18).setValue('Solicitud'); // R Estado inicial
    sh.getRange(row, 31).setValue(clean(d.entidad)); // AE Institución / Empresa
    return ContentService.createTextOutput('ok');
  } finally { lock.releaseLock(); }
}

function setupEntidad() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sh.getMaxColumns() < 31) sh.insertColumnsAfter(sh.getMaxColumns(), 31 - sh.getMaxColumns());
  sh.getRange(1, 31).setValue('Institución / Empresa').setFontWeight('bold').setBackground('#013025').setFontColor('#F5F1DF').setWrap(true);
  sh.setColumnWidth(31, 220);
}

function setupFinanzas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheets()[0];
  if (sh.getMaxColumns() < 30) sh.insertColumnsAfter(sh.getMaxColumns(), 30 - sh.getMaxColumns());
  const H = ['Estado','Valor final acordado','Abono pagado','Fecha abono','Medio de pago abono','Referencia abono',
             'Saldo pagado','Fecha saldo','Medio de pago saldo','Total pagado','Saldo pendiente','Factura No.','Observaciones'];
  sh.getRange(1, 18, 1, H.length).setValues([H]);           // R1:AD1
  const n = sh.getMaxRows();
  const lista = v => SpreadsheetApp.newDataValidation().requireValueInList(v, true).setAllowInvalid(false).build();
  sh.getRange(2, 18, n - 1).setDataValidation(lista(['Solicitud','Contactado','Confirmada','Pagada','Realizada','Cancelada']));
  const medios = lista(['Nequi','Daviplata','Transferencia','Efectivo','Wompi','Otro']);
  sh.getRange(2, 22, n - 1).setDataValidation(medios);      // V
  sh.getRange(2, 26, n - 1).setDataValidation(medios);      // Z
  const fecha = SpreadsheetApp.newDataValidation().requireDate().setAllowInvalid(false).build();
  sh.getRange(2, 21, n - 1).setDataValidation(fecha).setNumberFormat('yyyy-mm-dd');   // U
  sh.getRange(2, 25, n - 1).setDataValidation(fecha).setNumberFormat('yyyy-mm-dd');   // Y
  // Fórmulas automáticas para todas las filas (AA, AB)
  sh.getRange('AA2:AB' + n).clearContent();
  sh.getRange('AA2').setFormula('=ARRAYFORMULA(IF(A2:A="","",N(T2:T)+N(X2:X)))');
  sh.getRange('AB2').setFormula('=ARRAYFORMULA(IF(A2:A="","",IF(S2:S="",N(L2:L),N(S2:S))-(N(T2:T)+N(X2:X))))');
  // Formato pesos
  ['L','M','S','T','X','AA','AB'].forEach(c => sh.getRange(c + '2:' + c + n).setNumberFormat('$#,##0'));
  // Encabezado
  sh.setFrozenRows(1);
  const hdr = sh.getRange(1, 1, 1, 30);
  hdr.setFontWeight('bold').setWrap(true).setVerticalAlignment('middle');
  sh.getRange(1, 1, 1, 17).setBackground('#013025').setFontColor('#F5F1DF');   // datos del sitio
  sh.getRange(1, 18, 1, 13).setBackground('#E2B84F').setFontColor('#013025');  // seguimiento manual
  sh.setRowHeight(1, 42);
  sh.setColumnWidths(1, 17, 110); sh.setColumnWidth(4, 230); sh.setColumnWidth(14, 170); sh.setColumnWidth(16, 190);
  sh.setColumnWidths(18, 12, 125); sh.setColumnWidth(30, 280);
  sh.getRange('AA2:AB' + n).setBackground('#F5F1DF');
  // Estado = Solicitud en filas existentes vacías
  const last = sh.getLastRow();
  if (last > 1) { const est = sh.getRange(2, 18, last - 1).getValues().map((v, i) => [v[0] || (sh.getRange(i + 2, 1).getValue() ? 'Solicitud' : '')]); sh.getRange(2, 18, last - 1).setValues(est); }
  // Colores por estado
  const R = sh.getRange('R2:R' + n), cf = c => SpreadsheetApp.newConditionalFormatRule().setRanges([R]);
  sh.setConditionalFormatRules([
    cf().whenTextEqualTo('Confirmada').setBackground('#D7E9F7').build(),
    cf().whenTextEqualTo('Pagada').setBackground('#CDEBD7').build(),
    cf().whenTextEqualTo('Realizada').setBackground('#9FD3B0').build(),
    cf().whenTextEqualTo('Cancelada').setBackground('#F4C7C7').build(),
    cf().whenTextEqualTo('Contactado').setBackground('#FFF2C6').build()
  ]);
  // Pestaña Resumen por mes de visita (excluye canceladas)
  let rs = ss.getSheetByName('Resumen') || ss.insertSheet('Resumen');
  rs.clear();
  const S = "'" + sh.getName() + "'!";
  rs.getRange('A1').setFormula(
    '=QUERY({ARRAYFORMULA(IF(' + S + 'B2:B="","",LEFT(' + S + 'B2:B,7))),' + S + 'K2:K,' + S + 'AA2:AA,' + S + 'AB2:AB,' + S + 'R2:R},' +
    '"select Col1, count(Col1), sum(Col2), sum(Col3), sum(Col4) where Col1 <> \'\' and Col5 <> \'Cancelada\' group by Col1 order by Col1 ' +
    'label Col1 \'Mes visita\', count(Col1) \'Reservas\', sum(Col2) \'Personas\', sum(Col3) \'Total pagado\', sum(Col4) \'Saldo pendiente\'",0)');
  rs.getRange('D2:E200').setNumberFormat('$#,##0');
  rs.getRange('A1:E1').setFontWeight('bold').setBackground('#013025').setFontColor('#F5F1DF');
  rs.setFrozenRows(1); rs.setColumnWidths(1, 5, 140);
  setupEntidad();
  rs.getRange('G1').setValue('Resumen por mes de la visita (sin canceladas). Se actualiza solo.');
}
