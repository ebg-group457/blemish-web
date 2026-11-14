/* Finca Blemish: formulario de contacto antes de abrir WhatsApp.
   Guarda nombre, empresa, WhatsApp y correo en la hoja "Blemish - Interesados" (Google Apps Script). */
(function(){
var LEADS_URL='https://script.google.com/macros/s/AKfycbyA8lFMSi9go-R6CMCs0Evyqs7iT2DGQXVtpBkt_QSM7K5Wg2t26hmW53uyXblurK13/exec';/* URL /exec de la aplicación web de Apps Script de interesados */
var base=(document.currentScript&&document.currentScript.src)?document.currentScript.src.replace(/lead\.js.*$/,''):'';
var css='.ld-bg{position:fixed;inset:0;background:rgba(1,48,37,.72);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem}'+
'.ld-box{background:#FFFBEF;border-radius:16px;max-width:420px;width:100%;padding:1.4rem 1.4rem 1.1rem;box-shadow:0 12px 40px rgba(0,0,0,.35);font-family:Nunito,system-ui,sans-serif;color:#013025;position:relative;max-height:92vh;overflow:auto}'+
'.ld-box h3{font-family:"Yeseva One",serif;margin:0 0 .3rem;font-size:1.35rem;color:#013025}.ld-box p.ld-sub{margin:0 0 .9rem;font-size:.92rem;color:#5a4a2a}'+
'.ld-box label{display:block;font-weight:700;font-size:.88rem;margin:.55rem 0 .2rem}.ld-box input[type=text],.ld-box input[type=tel],.ld-box input[type=email]{width:100%;box-sizing:border-box;padding:.6rem .7rem;border:1px solid #d9c690;border-radius:10px;font:inherit;background:#fff}'+
'.ld-ok{display:flex;gap:.5rem;align-items:flex-start;font-weight:400!important;font-size:.84rem!important;margin-top:.8rem!important}.ld-ok input{margin-top:.2rem}.ld-ok a{color:#013025}'+
'.ld-err{color:#b3261e;font-size:.84rem;min-height:1.1em;margin:.4rem 0 0}.ld-go{width:100%;margin-top:.6rem;background:#25D366;color:#fff;border:0;border-radius:999px;padding:.75rem;font:700 1rem Nunito,sans-serif;cursor:pointer}.ld-go:disabled{opacity:.6}'+
'.ld-x{position:absolute;top:.5rem;right:.7rem;background:none;border:0;font-size:1.6rem;color:#013025;cursor:pointer;line-height:1}.ld-opt{font-weight:400;color:#8a7a55}';
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function interes(a){var h=document.querySelector('h1');var t=a.textContent.trim();return (h?h.textContent.trim():document.title)+(t?' · '+t:'')}
function guardado(){try{return JSON.parse(localStorage.getItem('fb_lead')||'{}')}catch(_){return{}}}
function abrir(a){
 if(!document.getElementById('ld-css')){var st=document.createElement('style');st.id='ld-css';st.textContent=css;document.head.appendChild(st)}
 var g=guardado(),bg=document.createElement('div');bg.className='ld-bg';
 bg.innerHTML='<form class="ld-box" novalidate><button type="button" class="ld-x" aria-label="Cerrar">×</button><h3>Hablemos por WhatsApp</h3><p class="ld-sub">Déjanos tus datos y te abrimos el chat con Finca Blemish.</p>'+
 '<label for="ld-n">Nombre</label><input id="ld-n" type="text" autocomplete="name" required maxlength="120" value="'+esc(g.nombre||'')+'">'+
 '<label for="ld-e">Empresa <span class="ld-opt">(si aplica)</span></label><input id="ld-e" type="text" autocomplete="organization" maxlength="120" value="'+esc(g.empresa||'')+'">'+
 '<label for="ld-t">Teléfono (WhatsApp)</label><input id="ld-t" type="tel" autocomplete="tel" inputmode="tel" required maxlength="20" value="'+esc(g.telefono||'')+'">'+
 '<label for="ld-c">Correo electrónico</label><input id="ld-c" type="email" autocomplete="email" required maxlength="120" value="'+esc(g.correo||'')+'">'+
 '<label class="ld-ok"><input id="ld-a" type="checkbox" required> <span>Acepto la <a href="'+base+'politica-de-datos.html" target="_blank" rel="noopener">Política de Tratamiento de Datos</a> de Finca Blemish.</span></label>'+
 '<p class="ld-err" role="alert"></p><button class="ld-go" type="submit">Continuar a WhatsApp</button></form>';
 document.body.appendChild(bg);var f=bg.querySelector('form'),err=f.querySelector('.ld-err');
 function cerrar(){bg.remove();document.removeEventListener('keydown',k)}function k(e){if(e.key==='Escape')cerrar()}
 document.addEventListener('keydown',k);bg.addEventListener('click',function(e){if(e.target===bg)cerrar()});f.querySelector('.ld-x').onclick=cerrar;
 setTimeout(function(){f.querySelector('#ld-n').focus()},30);
 f.onsubmit=function(e){e.preventDefault();
  var d={tipo:'interesado',nombre:f.querySelector('#ld-n').value.trim(),empresa:f.querySelector('#ld-e').value.trim(),telefono:f.querySelector('#ld-t').value.trim(),correo:f.querySelector('#ld-c').value.trim(),acepto:f.querySelector('#ld-a').checked?'Sí':'',interes:interes(a),pagina:location.href};
  if(d.nombre.length<2){err.textContent='Escribe tu nombre.';return}
  if(d.telefono.replace(/\D/g,'').length<7){err.textContent='Escribe un número de WhatsApp válido.';return}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.correo)){err.textContent='Escribe un correo válido.';return}
  if(!d.acepto){err.textContent='Debes aceptar la Política de Tratamiento de Datos.';return}
  try{localStorage.setItem('fb_lead',JSON.stringify({nombre:d.nombre,empresa:d.empresa,telefono:d.telefono,correo:d.correo}))}catch(_){}
  if(LEADS_URL){try{fetch(LEADS_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(d),keepalive:true}).catch(function(){})}catch(_){}}
  var u=a.href,txt='\n\nSoy '+d.nombre+(d.empresa?' ('+d.empresa+')':'')+'.';
  u+= (u.indexOf('text=')>-1)?encodeURIComponent(txt):(u.indexOf('?')>-1?'&':'?')+'text='+encodeURIComponent('Hola, quiero información de Finca Blemish.'+txt);
  window.open(u,'_blank','noopener');cerrar();
 };
}
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href*="wa.me/"]');if(!a||e.ctrlKey||e.metaKey)return;e.preventDefault();abrir(a)},true);
})();
