/**
 * Finca Blemish - Solicitudes de reserva + seguimiento financiero.
 * Hoja: "Blemish - Solicitudes de reserva". Pegar en Extensiones > Apps Script (reemplaza todo el código).
 * 1) Ejecutar una vez la función setupFinanzas (menú superior, botón ▶ Ejecutar).
 * 2) Implementar > Gestionar implementaciones > lápiz > Versión: Nueva versión > Implementar (la URL /exec no cambia).
 * Columnas A-Q las escribe el sitio web; R-AD son de llenado manual (AA y AB se calculan solas).
 */
const COLS = ['registro','fecha','tipoDia','plan','adH','adM','niH','niM','beH','beM','personas','total','abono','nombre','telefono','correo','acepto'];

function doPost(e) {
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    const clean = v => { v = (v === undefined || v === null) ? '' : String(v).slice(0, 300); return /^[=+\-@]/.test(v) ? "'" + v : v; };
    d.registro = Utilities.formatDate(new Date(), 'America/Bogota', 'yyyy-MM-dd HH:mm:ss');
    // Siguiente fila libre según la columna A (no usa appendRow, para no chocar con las fórmulas de AA/AB).
    const colA = sh.getRange('A:A').getValues();
    let r = colA.length; while (r > 1 && colA[r - 1][0] === '') r--;
    const row = r + 1;
    sh.getRange(row, 1, 1, COLS.length).setValues([COLS.map(k => clean(d[k]))]);
    sh.getRange(row, 18).setValue('Solicitud'); // R Estado inicial
    return ContentService.createTextOutput('ok');
  } finally { lock.releaseLock(); }
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
  rs.getRange('G1').setValue('Resumen por mes de la visita (sin canceladas). Se actualiza solo.');
}
