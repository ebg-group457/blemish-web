import re,html
S=open('index.html').read()
if 'card-link' in S:
  import subprocess; S=subprocess.check_output(['git','show','main:index.html'],text=True)  # parte siempre del index original
P=[("miel-en-botella","Miel en botella","p-miel-500g","Mieles"),("miel-en-frasco","Miel en frasco","p-miel-650g","Mieles"),("panal","Panal de miel","p-panal","Mieles"),("pipimiel","Pipimiel (miel picante)","p-pipimiel","Mieles"),("jabon-de-miel","Jabón de miel","jabon","Jabones de miel"),("jabon-hexagonal","Jabón hexagonal","jabon-hexagonal","Jabones de miel"),("vela-cera-de-abeja","Vela de cera de abeja",None,"Velas de cera de abeja"),("set-de-velas","Set de velas",None,"Velas de cera de abeja"),("polen","Polen","p-polen","Derivados"),("tintura-de-propoleo","Tintura de propóleo","p-tintura-propoleo","Derivados"),("fourvigor","Fourvigor","p-fourvigor","Derivados"),("dispensador-de-miel","Dispensador de miel","p-dispensador","Accesorios y kits"),("abeja-3d-en-madera","Abeja 3D en madera","p-abeja-3d","Accesorios y kits"),("kit-regalo","Kit regalo",None,"Accesorios y kits")]
head=S.split('<header')[0].replace('styles.css','../styles.css')
hdr=re.search(r'<header.*?</header>',S,re.S).group(0)
hdr=hdr.replace('href="#','href="../index.html#').replace('src="img/','src="../img/')
foot=re.search(r'<footer>.*?</footer>',S,re.S).group(0)
WA="https://wa.me/573186506095?text="
import urllib.parse as u
FULL={"miel-en-botella":dict(pres="Botella de vidrio con cordel y etiqueta hexagonal · contenido neto 325 g",
 desc="Miel de abejas multifloral, cruda, 100% natural y pura, cosechada en nuestras colmenas de Finca Blemish en Jamundí, Valle del Cauca.",
 car=["Origen: Finca Blemish, Quinamayo / Playa Amarilla, Jamundí, Valle del Cauca (Colombia)","Tipo: miel multifloral","Miel cruda","Contenido neto: 325 g","Ingrediente: 100% miel de abejas, sin aditivos","Envase: botella de vidrio con cordel y etiqueta hexagonal"],
 ben=["Sabor y aroma de la miel multifloral del Valle del Cauca","Del productor a tu casa, sin intermediarios","Producto natural, sin ingredientes agregados","Envase de vidrio reutilizable"],
 uso=["Ideal para endulzar bebidas, acompañar frutas, yogur, panes o postres.","Consérvala bien tapada, en un lugar fresco y seco, lejos de la luz directa del sol. No requiere refrigeración.","Es normal que la miel cruda se cristalice con el tiempo; para volverla líquida, calienta el envase a baño maría suave."],
 precio="$35.000")}
def page(slug,name,img,cat):
  d=FULL.get(slug)
  if img: pic=f'<figure class="pf-main"><picture><source srcset="../img/{img}.webp" type="image/webp"><img src="../img/{img}.jpg" alt="{name}" width="800" height="800"></picture></figure>'
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
S=S.replace('styles.css?v=12','styles.css?v=13')
open('index.html','w').write(S)
