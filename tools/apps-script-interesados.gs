/**
 * Finca Blemish - Base de datos de interesados (botones "Pregunta por WhatsApp" de fincablemish.com).
 * Hoja: "Blemish - Interesados". Asigna un N.º de solicitud consecutivo (BL-0001, BL-0002, ...)
 * y lo devuelve a la web para incluirlo en el mensaje de WhatsApp.
 * Implementar > Gestionar implementaciones > Editar > Versión nueva (así se conserva la misma URL /exec).
 */
const TZ = 'America/Bogota';
const H = ['N.º solicitud','Fecha registro','Nombre','Empresa','WhatsApp','Correo','Acepta política de datos','Interés (producto / sección)','Cantidad','Página','Estado','Observaciones'];
function hoja_(){const ss=SpreadsheetApp.getActiveSpreadsheet();return ss.getSheetByName('Interesados')||ss.getSheets()[0];}
function migrar_(sh){
  // Hoja antigua (sin N.º solicitud ni Cantidad): inserta las dos columnas sin perder datos.
  if(String(sh.getRange(1,1).getValue())==='N.º solicitud') return;
  sh.insertColumnBefore(1);          // N.º solicitud
  sh.insertColumnAfter(8);           // Cantidad, después de Interés
  formato_(sh);
}
function formato_(sh){
  sh.getRange(1,1,1,H.length).setValues([H]).setFontWeight('bold').setBackground('#013025').setFontColor('#F5F1DF').setWrap(true);
  sh.getRange(1,11,1,2).setBackground('#E2B84F').setFontColor('#013025');
  sh.setFrozenRows(1); sh.setColumnWidths(1,H.length,150); sh.setColumnWidth(8,280); sh.setColumnWidth(10,280);
  sh.getRange(2,11,sh.getMaxRows()-1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Nuevo','Contactado','Cliente','No interesado'],true).build());
}
function setup(){const sh=hoja_(); sh.setName('Interesados'); migrar_(sh); formato_(sh);}
function siguiente_(){
  const p=PropertiesService.getScriptProperties();
  const n=(parseInt(p.getProperty('seq')||'0',10)||0)+1; p.setProperty('seq',String(n));
  return 'BL-'+('000'+n).slice(-4);
}
function json_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);}
function doGet(){return ContentService.createTextOutput('ok');}
function doPost(e){
  const lock=LockService.getScriptLock(); lock.waitLock(10000);
  try{
    const d=JSON.parse(e.postData.contents);
    if(d.tipo!=='interesado') return json_({ok:false});
    const sh=hoja_(); migrar_(sh);
    const clean=v=>{v=(v===undefined||v===null)?'':String(v).slice(0,300);return /^[=+\-@]/.test(v)?"'"+v:v;};
    const num=siguiente_();
    sh.appendRow([num,Utilities.formatDate(new Date(),TZ,'yyyy-MM-dd HH:mm:ss'),clean(d.nombre),clean(d.empresa),clean(d.telefono),clean(d.correo),clean(d.acepto),clean(d.interes),clean(d.cantidad),clean(d.pagina),'Nuevo','']);
    return json_({ok:true,solicitud:num});
  } finally { lock.releaseLock(); }
}
