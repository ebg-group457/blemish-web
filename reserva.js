/* Reservas Finca Blemish. Edita aquí las fechas NO disponibles (formato AAAA-MM-DD): */
const NO_DISPONIBLES = [
  // '2026-11-13',
];
const ANTICIPACION_DIAS = 5;
const WHATSAPP = '573186506095';
(function(){
const $=id=>document.getElementById(id);
const MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const PLANES={t:{n:'Plan Turístico - Un Viaje a la Miel (Apicultor por un día)',p:{ad:55000,jo:55000,ni:50000,be:0}},e:{n:'Plan Estudiantil - Presencial y/o en tu Colegio'},m:{n:'Plan Empresarial - Presencial y/o en tu Empresa'}};
const TIPOS=[['ad','Adultos','desde 15 años'],['jo','Jóvenes','12 a 14 años'],['ni','Niños','2 a 11 años'],['be','Bebés','menores de 2 años']];
const cnt={};TIPOS.forEach(t=>cnt[t[0]]={h:0,m:0});cnt.ad.h=1;
const hoy=new Date();hoy.setHours(0,0,0,0);
const min=new Date(hoy);min.setDate(min.getDate()+ANTICIPACION_DIAS);
let vista=new Date(hoy.getFullYear(),hoy.getMonth(),1),sel=null;
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const larga=d=>d.toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
const cop=n=>'$'+n.toLocaleString('es-CO');
function cal(){
 $('cal-mes').textContent=MESES[vista.getMonth()]+' '+vista.getFullYear();
 $('cal-prev').disabled=vista<=new Date(hoy.getFullYear(),hoy.getMonth(),1);
 const g=$('cal-dias');g.innerHTML='';
 const off=(vista.getDay()+6)%7;for(let i=0;i<off;i++)g.appendChild(document.createElement('span'));
 const n=new Date(vista.getFullYear(),vista.getMonth()+1,0).getDate();
 for(let d=1;d<=n;d++){const f=new Date(vista.getFullYear(),vista.getMonth(),d),b=document.createElement('button');b.type='button';b.textContent=d;
  let est;if(f<min){est='off';b.disabled=true;b.setAttribute('aria-label',larga(f)+', fuera de plazo');}
  else if(NO_DISPONIBLES.includes(iso(f))){est='no';b.setAttribute('aria-disabled','true');b.setAttribute('aria-label',larga(f)+', no disponible');}
  else{est='ok';b.setAttribute('aria-label',larga(f)+', disponible');b.onclick=()=>paso2(f);}
  b.className=est+(f.getTime()===hoy.getTime()?' hoy':'');if(f.getTime()===hoy.getTime())b.setAttribute('aria-current','date');g.appendChild(b);}
}
$('cal-prev').onclick=()=>{vista.setMonth(vista.getMonth()-1);cal();};
$('cal-next').onclick=()=>{vista.setMonth(vista.getMonth()+1);cal();};
function paso2(f){sel=f;$('rsv-fecha').textContent=larga(f);$('rsv-s1').hidden=true;$('rsv-s2').hidden=false;tot();$('rsv-plan').focus();}
$('rsv-back').onclick=()=>{$('rsv-s2').hidden=true;$('rsv-s1').hidden=false;$('rsv-res').hidden=true;};
const tb=$('rsv-cnt');
TIPOS.forEach(([k,n,e])=>{const tr=document.createElement('tr');tr.innerHTML='<th scope="row">'+n+'<small>'+e+'</small></th>'+['h','m'].map(s=>'<td><span class="cnt"><button type="button" data-k="'+k+'" data-s="'+s+'" data-d="-1" aria-label="Quitar '+n+' '+(s=='h'?'hombres':'mujeres')+'">−</button><output id="c-'+k+s+'">'+cnt[k][s]+'</output><button type="button" data-k="'+k+'" data-s="'+s+'" data-d="1" aria-label="Agregar '+n+' '+(s=='h'?'hombres':'mujeres')+'">+</button></span></td>').join('');tb.appendChild(tr);});
tb.onclick=e=>{const b=e.target.closest('button');if(!b)return;const k=b.dataset.k,s=b.dataset.s;cnt[k][s]=Math.max(0,cnt[k][s]+ +b.dataset.d);$('c-'+k+s).textContent=cnt[k][s];tot();};
$('rsv-plan').onchange=tot;
const T=k=>cnt[k].h+cnt[k].m;
function err(){const a=T('ad');if(a<1)return 'Debe asistir al menos 1 adulto.';if(T('be')>a)return 'Máximo 1 bebé por adulto.';return '';}
function tot(){const e=err();$('rsv-err').textContent=e;const pl=PLANES[$('rsv-plan').value];let h;
 if(pl.p){let t=0;TIPOS.forEach(([k])=>t+=T(k)*pl.p[k]);h='Total estimado: <b>'+cop(t)+'</b><br>Abono para confirmar (40%): <b>'+cop(Math.round(t*.4))+'</b><br><small>Adultos y jóvenes $55.000 · Niños $50.000 · Bebés sin costo (por confirmar)</small>';pl.t=t;}
 else h='Precio: <b>a cotizar</b>. Te enviaremos la cotización por WhatsApp; el abono es del 40%.';
 $('rsv-tot').innerHTML=h;}
function resumen(){const pl=PLANES[$('rsv-plan').value];const L=['Hola, quiero reservar una visita a Finca Blemish.','Fecha: '+larga(sel),'Plan: '+pl.n,'Visitantes:'];
 TIPOS.forEach(([k,n,e])=>{if(T(k))L.push('- '+n+' ('+e+'): '+T(k)+' (H '+cnt[k].h+' / M '+cnt[k].m+')');});
 L.push(pl.p?'Total estimado: '+cop(pl.t)+' · Abono 40%: '+cop(Math.round(pl.t*.4)):'Precio: a cotizar');
 L.push('Nombre: '+$('rsv-nom').value.trim(),'Teléfono: '+$('rsv-tel').value.trim(),'Correo: '+$('rsv-mail').value.trim(),'Acepto la Política de Tratamiento de Datos Personales.');return L;}
$('rsv-s2').onsubmit=ev=>{ev.preventDefault();let e=err();
 if(!e&&!$('rsv-nom').value.trim())e='Escribe tu nombre.';
 if(!e&&$('rsv-tel').value.replace(/\D/g,'').length<7)e='Escribe un teléfono válido.';
 if(!e&&!/^\S+@\S+\.\S+$/.test($('rsv-mail').value))e='Escribe un correo válido.';
 if(!e&&!$('rsv-acepto').checked)e='Debes aceptar la Política de Tratamiento de Datos Personales.';
 $('rsv-err').textContent=e;if(e)return;
 const L=resumen(),r=$('rsv-res');
 if(r.hidden){r.innerHTML='<b>Revisa tu solicitud:</b><br>'+L.slice(1).map(x=>x.replace(/</g,'&lt;')).join('<br>')+'<br><br>Si todo está bien, pulsa de nuevo «Enviar solicitud por WhatsApp».';r.hidden=false;r.scrollIntoView({block:'nearest'});return;}
 window.open('https://wa.me/'+WHATSAPP+'?text='+encodeURIComponent(L.join('\n')),'_blank','noopener');};
['rsv-plan','rsv-nom','rsv-tel','rsv-mail'].forEach(i=>$(i).addEventListener('input',()=>{$('rsv-res').hidden=true;}));
tb.addEventListener('click',()=>{$('rsv-res').hidden=true;});
cal();
})();
