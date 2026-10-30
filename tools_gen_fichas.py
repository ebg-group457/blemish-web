import re,html
S=open('index.html').read()
if 'card-link' in S:
  import subprocess; S=subprocess.check_output(['git','show','main:index.html'],text=True)  # parte siempre del index original
P=[("miel-en-botella","Miel en botella","p-miel-500g-ad","Mieles"),("miel-en-frasco","Miel en frasco","p-miel-650g-ad","Mieles"),("panal","Panal de miel","p-panal","Mieles"),("pipimiel","Pipimiel (miel picante)","p-pipimiel","Mieles"),("jabon-de-miel","Jabón de miel","jabon","Jabones de miel"),("jabon-hexagonal","Jabón hexagonal","jabon-hexagonal","Jabones de miel"),("vela-cera-de-abeja","Vela de cera de abeja",None,"Velas de cera de abeja"),("set-de-velas","Set de velas",None,"Velas de cera de abeja"),("polen","Polen","p-polen","Derivados"),("tintura-de-propoleo","Tintura de propóleo","p-tintura-propoleo","Derivados"),("fourvigor","Fourvigor","p-fourvigor","Derivados"),("dispensador-de-miel","Dispensador de miel","p-dispensador","Accesorios y kits"),("abeja-3d-en-madera","Abeja 3D en madera","p-abeja-3d","Accesorios y kits"),("kit-regalo","Kit regalo",None,"Accesorios y kits")]
head=S.split('<header')[0].replace('styles.css','../styles.css')
hdr=re.search(r'<header.*?</header>',S,re.S).group(0)
hdr=hdr.replace('href="#','href="../index.html#').replace('src="img/','src="../img/')
foot=re.search(r'<footer>.*?</footer>',S,re.S).group(0)
WA="https://wa.me/573186506095?text="
import urllib.parse as u
FULL={"miel-en-frasco":dict(pres="Frasco de vidrio con tapa hermética de clic y palito dispensador de madera · contenido neto 300 g",
 desc="La misma miel de abejas multifloral, cruda y sin aditivos de nuestras colmenas en Jamundí, Valle del Cauca, en una presentación especial. Viene en un frasco de vidrio con tapa hermética de clic que la mantiene bien sellada, e incluye un palito dispensador de madera para servirla sin regueros. Sabor auténtico e intenso, del campo directo a tu mesa. Ideal para regalar o para lucir en la mesa.",
 car=["Origen: Finca Blemish, Quinamayo / Playa Amarilla, Jamundí, Valle del Cauca (Colombia)","Tipo: miel multifloral","Miel cruda","Contenido neto: 300 g","Ingrediente: 100% miel de abejas, sin aditivos","Envase: frasco de vidrio con tapa hermética de clic (cierre de sellado)","Incluye: palito dispensador de miel en madera"],
 ben=["Sabor auténtico e intenso de la miel multifloral del Valle del Cauca","Cierre hermético que la mantiene sellada después de abrirla","Palito de madera para servir la miel con facilidad","Presentación ideal para regalo o para la mesa","Del campo directo a tu mesa: apoyas lo local"],
 uso=["Usa el palito de madera para servirla sobre pancakes, waffles o en tu té.","Endulza tus mañanas, tus bebidas, frutas, yogur y postres.","Después de usarla, cierra la tapa de clic y guárdala en un lugar fresco y seco, lejos de la luz directa del sol. No requiere refrigeración.","Es normal que la miel cruda se cristalice con el tiempo; para volverla líquida, calienta el frasco a baño maría suave."],
 precio="$55.000"),"miel-en-botella":dict(pres="Botella de vidrio sellada con cordel y etiqueta en forma de panal · contenido neto 325 g",
 desc="Miel de abejas multifloral, cruda y sin aditivos, de nuestras colmenas en Jamundí, Valle del Cauca. Es una miel artesanal: cuidamos cada detalle, desde la recolección hasta la etiqueta en forma de panal. Tiene un sabor auténtico e intenso y una textura suave. Llega sellada para garantizar su frescura, del campo directo a tu mesa. Al elegirla, apoyas a productores locales.",
 car=["Origen: Finca Blemish, Quinamayo / Playa Amarilla, Jamundí, Valle del Cauca (Colombia)","Tipo: miel multifloral","Miel cruda","Contenido neto: 325 g","Ingrediente: 100% miel de abejas, sin aditivos","Envase: botella de vidrio sellada, con cordel y etiqueta en forma de panal"],
 ben=["Sabor auténtico e intenso de la miel multifloral del Valle del Cauca","Del campo directo a tu mesa: apoyas lo local","Producto natural, sin ingredientes agregados","Envase de vidrio reutilizable"],
 uso=["Endulza tus mañanas y tus bebidas favoritas.","Acompaña desayunos como pancakes y waffles, frutas, yogur y postres.","Consérvala bien tapada, en un lugar fresco y seco, lejos de la luz directa del sol. No requiere refrigeración.","Es normal que la miel cruda se cristalice con el tiempo; para volverla líquida, calienta el envase a baño maría suave."],
 precio="$35.000")}
def page(slug,name,img,cat):
  d=FULL.get(slug)
  EX={'miel-en-botella':['p-miel-500g','p-miel-500g-3'],'miel-en-frasco':['p-miel-650g','p-miel-650g-3']}
  if img and EX.get(slug):
    ims=[img]+EX[slug]
    pic=f'<figure class="pf-main"><picture><source id="pf-src" srcset="../img/{img}.webp" type="image/webp"><img id="pf-img" src="../img/{img}.jpg" alt="{name}"></picture></figure><div class="pf-thumbs">'+''.join(f'<button type="button" data-i="{i}" aria-label="Ver foto {k+1}"{" class=on" if k==0 else ""}><img src="../img/{i}.webp" alt=""></button>' for k,i in enumerate(ims))+'</div><script>document.querySelectorAll(".pf-thumbs button").forEach(b=>b.onclick=()=>{const i=b.dataset.i;document.getElementById("pf-src").srcset="../img/"+i+".webp";document.getElementById("pf-img").src="../img/"+i+".jpg";document.querySelectorAll(".pf-thumbs button").forEach(x=>x.classList.toggle("on",x===b))})</script>'
  elif img: pic=f'<figure class="pf-main"><picture><source srcset="../img/{img}.webp" type="image/webp"><img src="../img/{img}.jpg" alt="{name}" width="800" height="800"></picture></figure>'
  else: pic='<figure class="pf-main"><div class="ph"><span>Foto pendiente</span></div></figure>'
  q=WA+u.quote(f"Hola, quiero información sobre {name} de Finca Blemish")
  if d:
    li=lambda xs:"".join(f"<li>{x}</li>" for x in xs)
    body=f'''<p class="pf-pres">{d["pres"]}</p><p class="pf-price">{d["precio"]} <small>IVA incluido</small></p>
<p>{d["desc"]}</p>
<div class="pf-btns"><button class="btn" disabled>Comprar · Próximamente</button> <a class="btn wa" href="{q}" target="_blank" rel="noopener">Pregunta por WhatsApp</a></div>
<h2>Características</h2><ul class="pf-list">{li(d["car"])}</ul>
<h2>Beneficios</h2><ul class="pf-list">{li(d["ben"])}</ul>
<h2>Modo de uso y conservación</h2><ul class="pf-list">{li(d["uso"])}</ul>'''
  else:
    body=f'''<p class="pf-price"><small>Precio por confirmar</small></p><p class="pf-wip">Información en preparación.</p>
<div class="pf-btns"><button class="btn" disabled>Comprar · Próximamente</button> <a class="btn wa" href="{q}" target="_blank" rel="noopener">Pregunta por WhatsApp</a></div>'''
  h=head.replace('<title>Finca Blemish | Miel de abejas y productos de la colmena</title>',f'<title>{name} | Finca Blemish</title>')
  h=re.sub(r'<meta name="description" content="[^"]*">',f'<meta name="description" content="{name} de Finca Blemish, Jamundí, Valle del Cauca.">',h)
  h=h.replace('</head>',f'<link rel="canonical" href="https://fincablemish.com/productos/{slug}.html"></head>')
  return h+hdr+f'''
<main class="sec pf"><div class="wrap"><p class="pf-back"><a href="../index.html#productos">← Volver al catálogo</a> · <span>{cat}</span></p>
<div class="pf-grid"><div class="pf-gal">{pic}</div><div class="pf-info"><h1>{name}</h1>{body}</div></div>
<p class="pf-back"><a href="../index.html#productos">← Volver al catálogo</a></p></div></main>
'''+foot+"</body></html>\n"
for p in P: open(f"productos/{p[0]}.html","w").write(page(*p))
# link cards
cards=re.findall(r'<article class="card">.*?</article>',S,re.S)
assert len(cards)==len(P),len(cards)
for c,(slug,name,img,cat) in zip(cards,P):
  n=re.sub(r'<a href="img/[^"]*" data-gallery="[^"]*" data-caption="[^"]*">(.*?)</a>',r'\1',c,flags=re.S)
  n=n.replace('<article class="card">',f'<article class="card"><a class="card-link" href="productos/{slug}.html">',1).replace('</article>','</a></article>')
  n=n.replace('<span class="badge">Próximamente</span>','<span class="badge">Ver ficha</span>')
  S=S.replace(c,n,1)
S=S.replace('styles.css?v=12','styles.css?v=14')
for o in ['p-miel-500g','p-miel-650g']:
  S=S.replace(f'img/{o}.webp',f'img/{o}-ad.webp').replace(f'img/{o}.jpg',f'img/{o}-ad.jpg')
open('index.html','w').write(S)
