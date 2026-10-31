/**
 * Finca Blemish - recibe solicitudes de reserva del sitio y las guarda en la hoja.
 * Pegar en: Hoja "Blemish - Solicitudes de reserva" > Extensiones > Apps Script.
 * Implementar > Nueva implementación > Aplicación web > Ejecutar como: Yo > Acceso: Cualquier usuario.
 */
const COLS = ['registro','fecha','tipoDia','plan','adH','adM','niH','niM','beH','beM','personas','total','abono','nombre','telefono','correo','acepto'];
function doPost(e) {
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    const clean = v => { v = (v === undefined || v === null) ? '' : String(v).slice(0, 300); return /^[=+\-@]/.test(v) ? "'" + v : v; };
    d.registro = Utilities.formatDate(new Date(), 'America/Bogota', 'yyyy-MM-dd HH:mm:ss');
    sh.appendRow(COLS.map(k => clean(d[k])));
    return ContentService.createTextOutput('ok');
  } finally { lock.releaseLock(); }
}
