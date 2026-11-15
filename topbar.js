/* Finca Blemish: muestra el banner superior de productos (el mismo de index.html) fijo en todas las páginas. */
(function(){
var me=document.currentScript,base=me&&me.src?me.src.replace(/topbar\.js.*$/,''):'';
var hdr=document.querySelector('header.hdr');if(!hdr||document.querySelector('.site-top'))return;
var top=document.createElement('div');top.className='site-top';hdr.parentNode.insertBefore(top,hdr);top.appendChild(hdr);
document.body.classList.add('has-top');
fetch(base+'index.html',{cache:'no-cache'}).then(function(r){return r.text()}).then(function(t){
 var d=new DOMParser().parseFromString(t,'text/html'),a=d.querySelector('aside.topbar');if(!a)return;
 a.querySelectorAll('[href],[src]').forEach(function(el){['href','src'].forEach(function(k){var v=el.getAttribute(k);if(!v||/^(https?:|mailto:|tel:|data:|\/\/)/.test(v))return;el.setAttribute(k,v.charAt(0)==='#'?base+'index.html'+v:base+v)})});
 top.appendChild(document.importNode(a,true));
}).catch(function(){});
})();
