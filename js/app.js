(function(){
  "use strict";
  var header=document.getElementById('header');
  var burger=document.getElementById('burger');
  var drawer=document.getElementById('drawer');
  var scrim=document.getElementById('scrim');
  var toTop=document.getElementById('toTop');
  document.getElementById('year').textContent=new Date().getFullYear();

  /* Header shrink + back-to-top */
  function onScroll(){
    var y=window.scrollY||window.pageYOffset||0;
    header.classList.toggle('shrunk',y>20);
    toTop.classList.toggle('show',y>360);
  }
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
  toTop.addEventListener('click',function(){
    try{ window.scrollTo({top:0,behavior:'smooth'}); }
    catch(e){ window.scrollTo(0,0); }
  });

  /* Drawer */
  function setDrawer(open){
    drawer.classList.toggle('open',open);
    scrim.classList.toggle('open',open);
    burger.classList.toggle('open',open);
    burger.setAttribute('aria-expanded',open);
    drawer.setAttribute('aria-hidden',!open);
    document.body.style.overflow=open?'hidden':'';
  }
  burger.addEventListener('click',function(){setDrawer(!drawer.classList.contains('open'));});
  scrim.addEventListener('click',function(){setDrawer(false);});
  drawer.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){setDrawer(false);});});

  /* Submenús del drawer: plegables. El <span> del grupo hace de cabecera
     y los enlaces se agrupan en un contenedor para poder animar el pliegue. */
  drawer.querySelectorAll('.dgroup').forEach(function(g){
    var cab=g.querySelector('span'); if(!cab) return;
    var caja=document.createElement('div');
    caja.className='dg-items';
    while(cab.nextSibling) caja.appendChild(cab.nextSibling);
    g.appendChild(caja);
    cab.setAttribute('role','button');
    cab.setAttribute('tabindex','0');
    cab.setAttribute('aria-expanded','false');
    function alternar(){
      var abierto=g.classList.toggle('open');
      cab.setAttribute('aria-expanded',abierto?'true':'false');
    }
    cab.addEventListener('click',alternar);
    cab.addEventListener('keydown',function(e){
      if(e.key==='Enter'||e.key===' '||e.keyCode===13||e.keyCode===32){e.preventDefault();alternar();}
    });
  });

  /* Scroll reveal */
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){e.target.classList.add('in'); io.unobserve(e.target);} });
  },{threshold:0.12,rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal:not(.in)').forEach(function(el){io.observe(el);});

  /* Active link on scroll (scrollspy) */
  var sections=['inicio','nosotros','que-hacemos','programas','proyectos','contacto']
    .map(function(id){return document.getElementById(id);}).filter(Boolean);
  var links=Array.prototype.slice.call(document.querySelectorAll('.menu a'));
  var spy=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        var id=e.target.id;
        links.forEach(function(l){l.classList.toggle('active',l.getAttribute('href')==='#'+id);});
      }
    });
  },{threshold:0.4,rootMargin:'-30% 0px -50% 0px'});
  sections.forEach(function(s){spy.observe(s);});

  /* Count-up stats */
  var counted=false;
  function runCount(){
    if(counted)return; counted=true;
    document.querySelectorAll('.hero-stats b[data-count]').forEach(function(el){
      var target=parseInt(el.getAttribute('data-count'),10);
      var raw=el.getAttribute('data-raw');
      var dur=1100, t0=null;
      function frame(ts){
        if(!t0)t0=ts; var p=Math.min((ts-t0)/dur,1);
        var val=Math.floor((0.5-Math.cos(p*Math.PI)/2)*target);
        el.textContent=raw?val:val; if(p<1)requestAnimationFrame(frame); else el.textContent=target;
      }
      requestAnimationFrame(frame);
    });
  }
  var heroStats=document.querySelector('.hero-stats');
  if(heroStats){
    var sObs=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)runCount();});},{threshold:.5});
    sObs.observe(heroStats);
  }

  /* Contact form → mailto */
  var form=document.getElementById('contactForm');
  if(form){
    form.addEventListener('submit',function(ev){
      ev.preventDefault();
      var n=encodeURIComponent(document.getElementById('nombre').value||'');
      var c=document.getElementById('email').value||'';
      var a=document.getElementById('asunto').value||'Contacto desde la web';
      var m=document.getElementById('mensaje').value||'';
      var body='Nombre: '+decodeURIComponent(n)+'%0D%0ACorreo: '+c+'%0D%0A%0D%0A'+encodeURIComponent(m);
      window.location.href='mailto:corpoteverde@gmail.com?subject='+encodeURIComponent(a)+'&body='+body;
    });
  }

  /* ===== Carrusel genérico (robusto, sin bugs al final) ===== */
  function initSlider(railId, prevId, nextId, dotsId){
    var rail=document.getElementById(railId);
    if(!rail) return;
    var prev=document.getElementById(prevId), next=document.getElementById(nextId),
        dotsWrap=document.getElementById(dotsId);
    var cards=rail.children;
    function gap(){var s=getComputedStyle(rail);return parseFloat(s.columnGap||s.gap||0)||0;}
    function step(){var c=rail.children[0];return c?c.getBoundingClientRect().width+gap():rail.clientWidth;}
    function maxScroll(){return Math.max(0, rail.scrollWidth-rail.clientWidth);}
    function perView(){return Math.max(1, Math.round((rail.clientWidth+gap())/step()));}
    function stops(){return Math.max(1, cards.length-perView()+1);}
    function leftFor(i){
      i=Math.max(0,Math.min(i,stops()-1));
      if(i>=stops()-1) return maxScroll();        /* último: pegado al final exacto */
      return Math.min(i*step(), maxScroll());
    }
    function current(){
      if(rail.scrollLeft>=maxScroll()-1) return stops()-1;
      return Math.max(0, Math.min(Math.round(rail.scrollLeft/step()), stops()-1));
    }
    function buildDots(){
      dotsWrap.innerHTML='';
      for(var i=0;i<stops();i++){
        (function(i){
          var b=document.createElement('button');
          b.setAttribute('aria-label','Ir a la posición '+(i+1));
          b.addEventListener('click',function(){rail.scrollTo({left:leftFor(i),behavior:'smooth'});});
          dotsWrap.appendChild(b);
        })(i);
      }
    }
    function sync(){
      var i=current();
      prev.disabled = rail.scrollLeft<=1;
      next.disabled = rail.scrollLeft>=maxScroll()-1;
      var dots=dotsWrap.children;
      for(var k=0;k<dots.length;k++) dots[k].classList.toggle('on', k===i);
    }
    prev.addEventListener('click',function(){rail.scrollTo({left:leftFor(current()-1),behavior:'smooth'});});
    next.addEventListener('click',function(){rail.scrollTo({left:leftFor(current()+1),behavior:'smooth'});});
    var raf; rail.addEventListener('scroll',function(){cancelAnimationFrame(raf);raf=requestAnimationFrame(sync);},{passive:true});
    var rt; window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){buildDots();sync();},150);});
    buildDots(); sync();
  }
  initSlider('progRail','progPrev','progNext','progDots');
  initSlider('vRail','vPrev','vNext','vDots');

  /* ===== Vista previa de video profesional: autoplay silencioso + fallback ===== */
  (function(){
    var frames=document.querySelectorAll('.vframe');
    frames.forEach(function(fr){
      var v=fr.querySelector('video'), poster=fr.querySelector('.vposter'), play=fr.querySelector('.vplay');
      if(!v) return;
      v.muted=true;
      v.loop=true;
      v.playsInline=true;
      v.autoplay=true;

      function hidePreview(){
        poster&&poster.classList.add('hide');
        play&&play.classList.add('hide');
      }

      function showPreview(){
        poster&&poster.classList.remove('hide');
        play&&play.classList.remove('hide');
      }

      function start(){
        v.muted=true;
        var playPromise=v.play();
        if(playPromise&&typeof playPromise.then==='function'){
          playPromise.then(hidePreview).catch(showPreview);
        }else{
          hidePreview();
        }
      }

      [poster,play,fr].forEach(function(el){el&&el.addEventListener('click',start);});
      v.addEventListener('play',hidePreview);
      v.addEventListener('loadeddata',start);
      v.addEventListener('mouseenter',start);
      start();
    });
  })();



  /* ===== Submenús en drawer móvil (toggle) ya vienen abiertos; nada extra ===== */

  /* ===== Sub-navegación sticky: marcar activo por sección ===== */
  (function(){
    var sub=document.querySelector('.subnav'); if(!sub) return;
    var links=Array.prototype.slice.call(sub.querySelectorAll('a'));
    var ids=links.map(function(a){return (a.getAttribute('href')||'').replace('#','');}).filter(Boolean);
    var secs=ids.map(function(id){return document.getElementById(id);}).filter(Boolean);
    var so=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){
        links.forEach(function(l){l.classList.toggle('active', (l.getAttribute('href')||'')==='#'+e.target.id);});
      }});
    },{rootMargin:'-45% 0px -50% 0px'});
    secs.forEach(function(s){so.observe(s);});
  })();

  /* ===== 10 ejes: click para expandir en táctil ===== */
  (function(){
    document.querySelectorAll('.eje').forEach(function(e){
      e.addEventListener('click',function(){e.classList.toggle('open');});
    });
  })();

  /* ===== Pipeline: pestañas de estado ===== */
  (function(){
    var tabs=document.querySelectorAll('.pipe-tab'); if(!tabs.length) return;
    tabs.forEach(function(t){
      t.addEventListener('click',function(){
        var id=t.getAttribute('data-panel');
        document.querySelectorAll('.pipe-tab').forEach(function(x){x.classList.remove('active');});
        document.querySelectorAll('.pipe-panel').forEach(function(p){p.classList.remove('active');});
        t.classList.add('active');
        var panel=document.getElementById(id); if(panel) panel.classList.add('active');
      });
    });
  })();

  /* ===== Tabla de proyectos activados: render + búsqueda + filtro + orden ===== */
  (function(){
    var mount=document.getElementById('pjBody'); if(!mount || !window.PROYECTOS) return;
    var data=window.PROYECTOS.slice();
    var search=document.getElementById('pjSearch');
    var sectorSel=document.getElementById('pjSector');
    var depSel=document.getElementById('pjDep');
    var munSel=document.getElementById('pjMun');
    /* El estado ya no se elige en un desplegable: lo fijan las pestañas
       del ciclo a través de window.CPV_PROYECTOS.filtrarEstado(). */
    var estadoActivo='';
    var countEl=document.getElementById('pjCount');
    var sortKey='n', sortDir=1;

    /* --- paginación ------------------------------------------------------
       porPagina 0 significa "todos". La página se reinicia con cualquier
       cambio de filtro, de orden o de etapa: de lo contrario el visitante se
       queda mirando una página que ya no existe. */
    var pager=document.getElementById('pjPager');
    var pagNums=document.getElementById('pjpNums');
    var pagPagina=document.getElementById('pjpPagina');
    var pagRango=document.getElementById('pjpRango');
    var selTam=document.getElementById('pjPorPagina');
    var porPagina=selTam?(parseInt(selTam.value,10)||0):25;
    var pagina=1;
    var quieto=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var TEXTOS={
      es:{pag:'Página %a de %b', una:'Página única',
          rango:'Proyectos %a a %b de %t', vacio:'Sin resultados'},
      en:{pag:'Page %a of %b', una:'Single page',
          rango:'Projects %a to %b of %t', vacio:'No results'}
    };
    /* i18n.js publica window.CPV_I18N al final de su IIFE, después de aplicar
       el idioma inicial, así que en el primer aviso todavía no existe: el
       idioma se toma del propio evento. */
    var idiomaPager='es';
    function textos(){ return TEXTOS[idiomaPager==='en'?'en':'es']; }
    function plantilla(s,a,b,t){
      return s.replace('%a',a).replace('%b',b).replace('%t',t);
    }
    var fmt=function(v){return v==null?'—':v.toLocaleString('es-CO');};
    var money=function(v){return v==null?'—':'$'+v.toLocaleString('es-CO');};
    /* Las filas se inyectan con innerHTML: todo campo de texto pasa por aquí */
    var esc=function(s){
      return String(s==null?'':s).replace(/[&<>"]/g,function(c){
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];
      });
    };

    // valores únicos de un campo, ordenados con acentos del español
    function unicos(rows,key){
      var vistos={}, out=[];
      rows.forEach(function(d){
        var v=d[key];
        if(!v||vistos[v]) return;
        vistos[v]=1; out.push(v);
      });
      return out.sort(function(a,b){return a.localeCompare(b,'es');});
    }
    // repuebla un <select> conservando su primera opción ("Todos…") y la selección si sigue disponible
    function llenar(sel,valores){
      if(!sel) return;
      var prev=sel.value;
      while(sel.options.length>1) sel.remove(1);
      valores.forEach(function(v){var o=document.createElement('option');o.value=v;o.textContent=v;sel.appendChild(o);});
      sel.value=valores.indexOf(prev)>=0?prev:'';
    }

    llenar(sectorSel,unicos(data,'sector'));
    llenar(depSel,unicos(data,'dep'));

    // los municipios dependen del departamento elegido
    function syncMun(){
      if(!munSel) return;
      var dep=depSel&&depSel.value||'';
      var base=dep?data.filter(function(d){return d.dep===dep;}):data;
      var muns=unicos(base,'mun');
      llenar(munSel,muns);
      munSel.disabled=!muns.length;
    }
    syncMun();

    function current(){
      var q=(search&&search.value||'').toLowerCase().trim();
      var sec=sectorSel&&sectorSel.value||'';
      var dep=depSel&&depSel.value||'';
      var mun=munSel&&munSel.value||'';
      var est=estadoActivo;
      var rows=data.filter(function(d){
        var okS=!sec||d.sector===sec;
        var okD=!dep||d.dep===dep;
        var okM=!mun||d.mun===mun;
        var okE=!est||d.estado===est;
        var okQ=!q||[d.nombre,d.dep,d.mun,d.sector,d.estado].join(' ').toLowerCase().indexOf(q)>=0;
        return okS&&okD&&okM&&okE&&okQ;
      });
      rows.sort(function(a,b){
        var x=a[sortKey],y=b[sortKey];
        if(x==null)x=(typeof y==='number'?-Infinity:'');
        if(y==null)y=(typeof x==='number'?-Infinity:'');
        if(typeof x==='string'){x=x.toLowerCase();y=(''+y).toLowerCase();}
        return (x<y?-1:x>y?1:0)*sortDir;
      });
      return rows;
    }
    function render(){
      var rows=current();
      cifras(rows);
      /* El contador se mide contra la etapa activa, no contra el catálogo
         entero: dentro de "Estudio" lo útil es saber cuántos de esos 7 quedan. */
      if(countEl){
        var base = estadoActivo
          ? data.filter(function(d){ return d.estado===estadoActivo; }).length
          : data.length;
        countEl.textContent = rows.length + ' de ' + base + ' proyectos' +
          (estadoActivo ? ' en ' + estadoActivo.toLowerCase() : '');
      }
      if(!rows.length){
        mount.innerHTML='<tr><td colspan="7" class="pj-empty">No se encontraron proyectos con esos criterios.</td></tr>';
        pintarPager(0,1,0,0);
        return;
      }
      /* La tabla pinta solo la página activa; las cifras de arriba y el
         contador siguen midiendo el filtro completo, para que no cambien
         al pasar de página. */
      var paginas = porPagina ? Math.max(1,Math.ceil(rows.length/porPagina)) : 1;
      if(pagina>paginas) pagina=paginas;
      if(pagina<1) pagina=1;
      var desde = porPagina ? (pagina-1)*porPagina : 0;
      var pagRows = porPagina ? rows.slice(desde,desde+porPagina) : rows;
      pintarPager(rows.length,paginas,desde,pagRows.length);
      var html='';
      pagRows.forEach(function(d){
        var clase=(d.estado==='Estudio')?'est':(d.estado==='Aprobados')?'apr':'reg';
        html+='<tr><td class="c-num">'+d.n+'</td>'+
          '<td>'+esc(d.nombre)+'</td>'+
          '<td>'+esc(d.dep||'—')+'<br><span style="color:var(--niebla);font-size:.85em">'+esc(d.mun||'')+'</span></td>'+
          '<td><span class="badge">'+esc(d.sector||'—')+'</span></td>'+
          '<td><span class="pj-estado '+clase+'">'+esc(d.estado||'—')+'</span></td>'+
          '<td class="c-num">'+fmt(d.ben)+'</td>'+
          '<td class="c-num">'+money(d.val)+'</td></tr>';
      });
      mount.innerHTML=html;
    }
    /* Dibuja la barra: a la izquierda cuántas páginas hay, en el centro los
       números y a la derecha el tamaño de página. */
    function pintarPager(total,paginas,desde,enPagina){
      if(!pager) return;
      pager.hidden = !total;
      if(!total){
        if(pagNums) pagNums.innerHTML='';
        if(pagPagina) pagPagina.textContent='';
        if(pagRango) pagRango.textContent='';
        return;
      }
      var t=textos();
      if(pagPagina) pagPagina.textContent = paginas>1 ? plantilla(t.pag,pagina,paginas) : t.una;
      if(pagRango) pagRango.textContent = plantilla(t.rango,desde+1,desde+enPagina,total);

      if(pagNums){
        var lista=ventana(pagina,paginas), html='';
        lista.forEach(function(x){
          if(x==='…'){ html+='<span class="pjp-hueco" aria-hidden="true">…</span>'; return; }
          html+='<button type="button" class="pjp-b pjp-num'+(x===pagina?' on':'')+'"'+
                (x===pagina?' aria-current="page"':'')+' data-pag="'+x+'">'+x+'</button>';
        });
        pagNums.innerHTML=html;
      }
      pager.querySelectorAll('.pjp-flecha').forEach(function(b){
        var fin = b.getAttribute('data-ir')==='prev' ? pagina<=1 : pagina>=paginas;
        b.disabled=fin;
      });
    }

    /* Hasta siete ranuras: primera, última, la actual y sus vecinas. */
    function ventana(p,total){
      var out=[], i;
      if(total<=7){ for(i=1;i<=total;i++) out.push(i); return out; }
      if(p<=4){ for(i=1;i<=5;i++) out.push(i); return out.concat(['…',total]); }
      if(p>=total-3){ out=[1,'…']; for(i=total-4;i<=total;i++) out.push(i); return out; }
      return [1,'…',p-1,p,p+1,'…',total];
    }

    function irArriba(){
      var caja=document.querySelector('.pj-table-wrap');
      if(!caja||!caja.getBoundingClientRect) return;
      var y=caja.getBoundingClientRect().top+(window.pageYOffset||0)-110;
      if(window.scrollTo) window.scrollTo({top:y<0?0:y,behavior:quieto?'auto':'smooth'});
    }

    function verPagina(p){
      if(p===pagina) return;
      pagina=p;
      render();
      irArriba();
    }

    if(pagNums) pagNums.addEventListener('click',function(e){
      var b=e.target.closest?e.target.closest('.pjp-num'):null;
      if(b) verPagina(parseInt(b.getAttribute('data-pag'),10));
    });
    if(pager) pager.querySelectorAll('.pjp-flecha').forEach(function(b){
      b.addEventListener('click',function(){
        verPagina(pagina+(b.getAttribute('data-ir')==='prev'?-1:1));
      });
    });
    if(selTam) selTam.addEventListener('change',function(){
      porPagina=parseInt(selTam.value,10)||0;
      pagina=1;
      render();
      irArriba();
    });
    document.addEventListener('cpv:idioma',function(e){
      idiomaPager=(e&&e.detail&&e.detail.idioma) ||
                  (window.CPV_I18N&&window.CPV_I18N.idioma()) || 'es';
      render();
    });

    /* Cualquier cambio de filtro devuelve a la primera página */
    function refiltrar(){ pagina=1; render(); }
    if(search) search.addEventListener('input',refiltrar);
    if(sectorSel) sectorSel.addEventListener('change',refiltrar);
    if(depSel) depSel.addEventListener('change',function(){syncMun();refiltrar();});
    if(munSel) munSel.addEventListener('change',refiltrar);
    /* Cifras de cabecera: se recalculan con lo que hay en pantalla, para que
       nunca contradigan a la tabla que tienen debajo. */
    function cifras(rows){
      var ben=0, val=0, deps={};
      rows.forEach(function(d){
        ben+=d.ben||0; val+=d.val||0;
        if(d.dep && d.dep!=='Cobertura nacional') deps[d.dep]=1;
      });
      var v={n:rows.length, ben:ben, val:val, dep:Object.keys(deps).length};
      document.querySelectorAll('[data-pj]').forEach(function(el){
        var k=el.getAttribute('data-pj');
        if(k==='val'){
          /* Por debajo de un billón la cifra se lee mejor en miles de millones */
          el.textContent = v.val >= 1e12
            ? '$'+(v.val/1e12).toLocaleString('es-CO',
                {minimumFractionDigits:2,maximumFractionDigits:2})+' billones'
            : '$'+(v.val/1e9).toLocaleString('es-CO',
                {maximumFractionDigits:1})+' mil millones';
        } else {
          el.textContent=v[k].toLocaleString('es-CO');
        }
      });
      var etq=document.querySelector('[data-pj-tx="n"]');
      if(etq) etq.textContent = estadoActivo
        ? 'Proyectos en '+estadoActivo.toLowerCase()
        : 'Proyectos activados y presentados';
    }

    window.CPV_PROYECTOS={
      filtrarEstado:function(est){
        estadoActivo=est||'';
        if(search) search.value='';
        if(sectorSel) sectorSel.value='';
        if(depSel){ depSel.value=''; syncMun(); }
        if(munSel) munSel.value='';
        pagina=1;
        render();
      }
    };

    document.querySelectorAll('table.pj thead th[data-key]').forEach(function(th){
      th.addEventListener('click',function(){
        var k=th.getAttribute('data-key');
        if(sortKey===k) sortDir*=-1; else {sortKey=k;sortDir=1;}
        pagina=1;
        render();
      });
    });
    render();
  })();



  /* ===== Ciclo de proyectos: las pestañas gobiernan la tabla =====
     Las etapas con datos (Activados presentados y Estudio) muestran siempre la
     misma tabla, filtrada; las que aún no tienen registros abren su aviso. */
  (function(){
    var tabs=document.querySelectorAll('.pipe-tab'); if(!tabs.length) return;
    var tit=document.getElementById('pjVistaTit');
    var sub=document.getElementById('pjVistaSub');

    var VISTAS={
      '':       {t:'Portafolio completo',
                 s:'Todos los proyectos radicados ante la Corporación, con su etapa en el ciclo.'},
      'Estudio':{t:'Proyectos en estudio',
                 s:'Iniciativas radicadas que están en formulación o estructuración técnica y financiera. Al superar esta etapa pasan a viables.'},
      'Aprobados':{t:'Proyectos aprobados',
                 s:'Proyectos avalados por el equipo técnico y aprobados por la mesa internacional. Pasan a la fase de financiación y ejecución.'}
    };

    tabs.forEach(function(b){
      b.addEventListener('click',function(){
        if(!b.hasAttribute('data-estado')) return;   /* etapas sin datos */
        var est=b.getAttribute('data-estado')||'';
        if(window.CPV_PROYECTOS) window.CPV_PROYECTOS.filtrarEstado(est);
        var v=VISTAS[est]||VISTAS[''];
        if(tit) tit.textContent=v.t;
        if(sub) sub.textContent=v.s;
      });
    });

    function abrirDesdeHash(){
      var id=(location.hash||'').replace('#','');
      if(!id) return;
      var tab=document.querySelector('.pipe-tab[data-ancla="'+id+'"]');
      if(tab){ tab.click(); tab.scrollIntoView({block:'nearest',inline:'center'}); }
    }
    window.addEventListener('hashchange',abrirDesdeHash);
    abrirDesdeHash();
  })();


  /* ===== Inscripción de emprendimientos de mujeres (mujeres.html) =====
     Como el resto de formularios del sitio, no publica en ningún servidor:
     arma un correo con los campos ordenados y lo abre en el cliente de la
     visitante. Los nombres van en el cuerpo para que el equipo los lea tal
     cual, sin tener que abrir un adjunto. */
  (function(){
    var f=document.getElementById('formMujeres'); if(!f) return;

    function v(id){
      var e=document.getElementById(id);
      return e ? (e.value||'').trim() : '';
    }
    function linea(etiqueta,valor){
      return valor ? etiqueta+': '+valor+'\n' : '';
    }

    f.addEventListener('submit',function(e){
      e.preventDefault();
      var apoyos=[];
      f.querySelectorAll('input[name="apoyo"]:checked').forEach(function(c){
        apoyos.push(c.value);
      });

      var cuerpo =
        'INSCRIPCIÓN DE EMPRENDIMIENTO\n'+
        '=============================\n\n'+
        'DATOS DE CONTACTO\n'+
        linea('Nombre', v('mjNombre'))+
        linea('Correo', v('mjCorreo'))+
        linea('Teléfono o WhatsApp', v('mjTel'))+
        linea('Edad', v('mjEdad'))+
        linea('Departamento', v('mjDep'))+
        linea('Municipio o vereda', v('mjMun'))+
        '\nEL EMPRENDIMIENTO\n'+
        linea('Nombre', v('mjNegocio'))+
        linea('Se dedica a', v('mjSector'))+
        linea('Punto en el que está', v('mjEtapa'))+
        linea('Personas que lo trabajan', v('mjPersonas'))+
        linea('Tiempo de funcionamiento', v('mjTiempo'))+
        '\nDescripción:\n'+v('mjDesc')+'\n'+
        '\nAPOYO QUE NECESITA\n'+
        (apoyos.length ? apoyos.join('\n') : 'No lo especificó')+'\n'+
        '\nAutoriza el tratamiento de sus datos: sí\n';

      var asunto='Inscripción de emprendimiento: '+(v('mjNegocio')||v('mjNombre'));
      window.location.href='mailto:corpoteverde@gmail.com'+
        '?subject='+encodeURIComponent(asunto)+
        '&body='+encodeURIComponent(cuerpo);
    });
  })();

})();