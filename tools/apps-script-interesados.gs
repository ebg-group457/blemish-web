/**
 * Finca Blemish - Base de datos de interesados (botones "Pregunta por WhatsApp" de fincablemish.com).
 * Hoja: "Blemish - Interesados". Pegar en Extensiones > Apps Script, ejecutar setup una vez,
 * luego Implementar > Nueva implementación > Aplicación web (Ejecutar como: yo; Acceso: cualquier persona).
 */
const TZ = 'America/Bogota';
const H = ['Fecha registro','Nombre','Empresa','WhatsApp','Correo','Acepta política de datos','Interés (producto / sección)','Página','Estado','Observaciones'];
function hoja_(){const ss=SpreadsheetApp.getActiveSpreadsheet();return ss.getSheetByName('Interesados')||ss.getSheets()[0];}
function setup(){
  const sh=hoja_(); sh.setName('Interesados');
  sh.getRange(1,1,1,H.length).setValues([H]).setFontWeight('bold').setBackground('#013025').setFontColor('#F5F1DF').setWrap(true);
  sh.getRange(1,9,1,2).setBackground('#E2B84F').setFontColor('#013025');
  sh.setFrozenRows(1); sh.setColumnWidths(1,H.length,160); sh.setColumnWidth(7,280); sh.setColumnWidth(8,280);
  sh.getRange(2,9,sh.getMaxRows()-1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Nuevo','Contactado','Cliente','No interesado'],true).build());
}
function doGet(){return ContentService.createTextOutput('ok');}
function doPost(e){
  const lock=LockService.getScriptLock(); lock.waitLock(10000);
  try{
    const d=JSON.parse(e.postData.contents);
    if(d.tipo!=='interesado') return ContentService.createTextOutput('ignorado');
    const clean=v=>{v=(v===undefined||v===null)?'':String(v).slice(0,300);return /^[=+\-@]/.test(v)?"'"+v:v;};
    hoja_().appendRow([Utilities.formatDate(new Date(),TZ,'yyyy-MM-dd HH:mm:ss'),clean(d.nombre),clean(d.empresa),clean(d.telefono),clean(d.correo),clean(d.acepto),clean(d.interes),clean(d.pagina),'Nuevo','']);
    return ContentService.createTextOutput('ok');
  } finally { lock.releaseLock(); }
}
