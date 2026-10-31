/* Reservas Finca Blemish. Edita aquí las fechas NO disponibles (formato AAAA-MM-DD): */
const NO_DISPONIBLES = [
  // '2026-11-13',
];
const ANTICIPACION_DIAS = 5;
/* Festivos de Colombia (Ley 51 de 1983 / Ley Emiliani, ya trasladados a lunes). Se muestran en azul, incluso si caen lunes. */
const FESTIVOS = [
 '2026-01-01','2026-01-12','2026-03-23','2026-04-02','2026-04-03','2026-05-01','2026-05-18','2026-06-08','2026-06-15','2026-06-29','2026-07-20','2026-08-07','2026-08-17','2026-10-12','2026-11-02','2026-11-16','2026-12-08','2026-12-25',
 '2027-01-01','2027-01-11','2027-03-22','2027-03-25','2027-03-26','2027-05-01','2027-05-10','2027-05-31','2027-06-07','2027-07-05','2027-07-20','2027-08-07','2027-08-16','2027-10-18','2027-11-01','2027-11-15','2027-12-08','2027-12-25'
];
const MIN_ENTRE_SEMANA = 16; // más de 15 personas (sin contar bebés)
const CUPO_FIN_SEMANA = 25;  // cupo máximo por día (sin contar bebés)
const WHATSAPP = '573186506095';
/* URL de la aplicación web de Google Apps Script que guarda cada solicitud en la hoja de Drive. Vacío = no se envía. */
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwe23S-Tyg5Q4afsYdWWR0yUTItj7eO7vi_zYb5qxbeYBKpA1_iYXRZgooLjP-5oZTUNQ/exec';
(function(){
const $=id=>document.getElementById(id);
const MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const PLANES={t:{n:'Plan Turístico - Un Viaje a la Miel (Apicultor por un día)',p:{ad:55000,ni:50000,be:0}},e:{n:'Plan Estudiantil - Presencial y/o en tu Colegio'},m:{n:'Plan Empresarial - Presencial y/o en tu Empresa'}};
const TIPOS=[['ad','Adultos','desde 15 años'],['ni','Niños','2 a 14 años'],['be','Bebés','menores de 2 años, gratis']];
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
  else if(NO_DISPONIBLES.includes(iso(f))||(f.getDay()===1&&!FESTIVOS.includes(iso(f)))){est='no';b.disabled=true;b.setAttribute('aria-label',larga(f)+', no disponible');}
  else if(f.getDay()===0||f.getDay()===6||FESTIVOS.includes(iso(f))){est='fs';b.setAttribute('aria-label',larga(f)+', fin de semana o festivo, público general');b.onclick=()=>paso2(f);}
  else{est='ok';b.setAttribute('aria-label',larga(f)+', martes a viernes, grupos privados');b.onclick=()=>paso2(f);}
  b.className=est+(f.getTime()===hoy.getTime()?' hoy':'');if(f.getTime()===hoy.getTime())b.setAttribute('aria-current','date');g.appendChild(b);}
}
$('cal-prev').onclick=()=>{vista.setMonth(vista.getMonth()-1);cal();};
$('cal-next').onclick=()=>{vista.setMonth(vista.getMonth()+1);cal();};
function paso2(f){sel=f;$('rsv-fecha').textContent=larga(f)+(FESTIVOS.includes(iso(f))?' (festivo)':'');$('rsv-s1').hidden=true;$('rsv-s2').hidden=false;tot();$('rsv-plan').focus();}
$('rsv-back').onclick=()=>{$('rsv-s2').hidden=true;$('rsv-s1').hidden=false;$('rsv-res').hidden=true;};
const tb=$('rsv-cnt');
TIPOS.forEach(([k,n,e])=>{const tr=document.createElement('tr');tr.innerHTML='<th scope="row">'+n+'<small>'+e+'</small></th>'+['h','m'].map(s=>'<td><span class="cnt"><button type="button" data-k="'+k+'" data-s="'+s+'" data-d="-1" aria-label="Quitar '+n+' '+(s=='h'?'hombres':'mujeres')+'">−</button><output id="c-'+k+s+'">'+cnt[k][s]+'</output><button type="button" data-k="'+k+'" data-s="'+s+'" data-d="1" aria-label="Agregar '+n+' '+(s=='h'?'hombres':'mujeres')+'">+</button></span></td>').join('');tb.appendChild(tr);});
tb.onclick=e=>{const b=e.target.closest('button');if(!b)return;const k=b.dataset.k,s=b.dataset.s;cnt[k][s]=Math.max(0,cnt[k][s]+ +b.dataset.d);$('c-'+k+s).textContent=cnt[k][s];tot();};
const ENT={e:['Institución','Nombre de la institución educativa (colegio, universidad, instituto…)','Escribe el nombre de la institución educativa.'],m:['Empresa','Nombre de la empresa','Escribe el nombre de la empresa.']};
function entUI(){const x=ENT[$('rsv-plan').value];$('rsv-ent-w').hidden=!x;$('rsv-ent').required=!!x;if(x)$('rsv-ent-l').textContent=x[1];}
$('rsv-plan').onchange=()=>{entUI();tot();};entUI();
const T=k=>cnt[k].h+cnt[k].m;
const esFS=()=>sel&&(sel.getDay()===0||sel.getDay()===6||FESTIVOS.includes(iso(sel)));
const PER=()=>T('ad')+T('ni');
function err(){const a=T('ad');if(a<1)return 'Debe asistir al menos 1 adulto.';if(T('be')>a)return 'Máximo 1 bebé por adulto.';
 if(esFS()&&PER()>CUPO_FIN_SEMANA)return 'Cupo máximo '+CUPO_FIN_SEMANA+' personas por día (sin contar bebés). Para grupos más grandes elige un día de martes a viernes.';
 if(!esFS()&&PER()<MIN_ENTRE_SEMANA)return 'De martes a viernes atendemos grupos privados de más de 15 personas: lleva '+PER()+', faltan '+(MIN_ENTRE_SEMANA-PER())+' (sin contar bebés). Para grupos pequeños elige un sábado, domingo o festivo.';
 return '';}
function tot(){if($('rsv-err2'))$('rsv-err2').textContent='';$('rsv-regla').textContent=esFS()?'Fin de semana o festivo: público general. Cupo máximo '+CUPO_FIN_SEMANA+' personas por día (sin contar bebés), sujeto a disponibilidad.':'Martes a viernes: grupos privados de mínimo '+MIN_ENTRE_SEMANA+' personas (sin contar bebés).';const e=err();$('rsv-err').textContent=e;const pl=PLANES[$('rsv-plan').value];let h;
 if(pl.p){let t=0;TIPOS.forEach(([k])=>t+=T(k)*pl.p[k]);h='Total estimado: <b>'+cop(t)+'</b><br>Abono para confirmar (40%): <b>'+cop(Math.round(t*.4))+'</b><br><small>Adultos $55.000 · Niños $50.000 · Bebés gratis</small>';pl.t=t;}
 else h='Precio: <b>a cotizar</b>. Te enviaremos la cotización por WhatsApp; el abono es del 40%.';
 $('rsv-tot').innerHTML=h;}
function resumen(){const k=$('rsv-plan').value,pl=PLANES[k];const CORTO={t:'Un Viaje a la Miel',e:'Plan Estudiantil',m:'Plan Empresarial'};
 const sx=x=>'('+cnt[x].h+' H, '+cnt[x].m+' M)';
 const L=['Hola, quiero reservar una visita a Finca Blemish'+(k==='t'?' para ser Apicultor por un día':''),'','*Fecha:* '+larga(sel)+(FESTIVOS.includes(iso(sel))?' (festivo)':''),'','*Plan:* '+CORTO[k],'','*Participantes:*'];
 if(T('ad'))L.push('• Adultos: '+T('ad')+' '+sx('ad')+(pl.p?' x '+cop(pl.p.ad)+' = '+cop(T('ad')*pl.p.ad):''));
 if(T('ni'))L.push('• Niños: '+T('ni')+' '+sx('ni')+(pl.p?' x '+cop(pl.p.ni)+' = '+cop(T('ni')*pl.p.ni):''));
 if(T('be'))L.push('• Bebés: '+T('be')+' '+sx('be')+' (gratis)');
 L.push('• Total personas: '+(PER()+T('be')),'');
 L.push(pl.p?'*Total estimado:* '+cop(pl.t)+' · *Abono 40%:* '+cop(Math.round(pl.t*.4)):'*Total estimado:* a cotizar · *Abono 40%:* a cotizar');
 const X=ENT[k];L.push('');if(X)L.push('*'+X[0]+':* '+$('rsv-ent').value.trim());L.push('*Nombre:* '+$('rsv-nom').value.trim(),'*Teléfono:* '+$('rsv-tel').value.trim(),'*Correo:* '+$('rsv-mail').value.trim(),'✅ Acepto la Política de Tratamiento de Datos Personales.');return L;}
function guardar(){if(!APPS_SCRIPT_URL)return;const pl=PLANES[$('rsv-plan').value];
 const d={fecha:iso(sel),tipoDia:esFS()?(FESTIVOS.includes(iso(sel))?'Festivo':'Fin de semana'):'Martes a viernes',plan:pl.n,adH:cnt.ad.h,adM:cnt.ad.m,niH:cnt.ni.h,niM:cnt.ni.m,beH:cnt.be.h,beM:cnt.be.m,personas:PER()+T('be'),total:pl.p?pl.t:'A cotizar',abono:pl.p?Math.round(pl.t*.4):'A cotizar',nombre:$('rsv-nom').value.trim(),telefono:$('rsv-tel').value.trim(),correo:$('rsv-mail').value.trim(),acepto:'Sí',entidad:ENT[$('rsv-plan').value]?$('rsv-ent').value.trim():''};
 try{fetch(APPS_SCRIPT_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(d),keepalive:true}).catch(()=>{});}catch(_){}}
$('rsv-s2').onsubmit=ev=>{ev.preventDefault();let e=err();
 if(!e&&ENT[$('rsv-plan').value]&&!$('rsv-ent').value.trim())e=ENT[$('rsv-plan').value][2];
 if(!e&&!$('rsv-nom').value.trim())e='Escribe tu nombre.';
 if(!e&&$('rsv-tel').value.replace(/\D/g,'').length<7)e='Escribe un teléfono válido.';
 if(!e&&!/^\S+@\S+\.\S+$/.test($('rsv-mail').value))e='Escribe un correo válido.';
 if(!e&&!$('rsv-acepto').checked)e='Debes aceptar la Política de Tratamiento de Datos Personales.';
 $('rsv-err').textContent=e;const e2=$('rsv-err2');e2.textContent=e;if(e){e2.scrollIntoView({behavior:'smooth',block:'center'});return;}
 const L=resumen(),r=$('rsv-res');
 if(r.hidden){r.innerHTML='<b>Revisa tu solicitud:</b><br>'+L.slice(2).map(x=>{x=x.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/\*([^*]+)\*/g,'<b>$1</b>');return x.startsWith('<b>Plan:</b>')?'<span class="rsv-plan-sum">'+x+'</span>':x;}).join('<br>')+'<br><br>Si todo está bien, pulsa de nuevo «Enviar solicitud por WhatsApp».';r.hidden=false;r.scrollIntoView({block:'nearest'});return;}
 guardar();
 window.open('https://wa.me/'+WHATSAPP+'?text='+encodeURIComponent(L.join('\n')),'_blank','noopener');};
['rsv-plan','rsv-ent','rsv-nom','rsv-tel','rsv-mail'].forEach(i=>$(i).addEventListener('input',()=>{$('rsv-res').hidden=true;}));
tb.addEventListener('click',()=>{$('rsv-res').hidden=true;});
cal();
})();
