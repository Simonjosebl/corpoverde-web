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
    var countEl=document.getElementById('pjCount');
    var sortKey='n', sortDir=1;
    var fmt=function(v){return v==null?'—':v.toLocaleString('es-CO');};
    var money=function(v){return v==null?'—':'$'+v.toLocaleString('es-CO');};

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
      var rows=data.filter(function(d){
        var okS=!sec||d.sector===sec;
        var okD=!dep||d.dep===dep;
        var okM=!mun||d.mun===mun;
        var okQ=!q||[d.nombre,d.dep,d.mun,d.sector].join(' ').toLowerCase().indexOf(q)>=0;
        return okS&&okD&&okM&&okQ;
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
      if(countEl) countEl.textContent=rows.length+' de '+data.length+' proyectos';
      if(!rows.length){mount.innerHTML='<tr><td colspan="6" class="pj-empty">No se encontraron proyectos con esos criterios.</td></tr>';return;}
      var html='';
      rows.forEach(function(d){
        html+='<tr><td class="c-num">'+d.n+'</td>'+
          '<td>'+d.nombre+'</td>'+
          '<td>'+(d.dep||'—')+'<br><span style="color:var(--niebla);font-size:.85em">'+(d.mun||'')+'</span></td>'+
          '<td><span class="badge">'+(d.sector||'—')+'</span></td>'+
          '<td class="c-num">'+fmt(d.ben)+'</td>'+
          '<td class="c-num">'+money(d.val)+'</td></tr>';
      });
      mount.innerHTML=html;
    }
    if(search) search.addEventListener('input',render);
    if(sectorSel) sectorSel.addEventListener('change',render);
    if(depSel) depSel.addEventListener('change',function(){syncMun();render();});
    if(munSel) munSel.addEventListener('change',render);
    document.querySelectorAll('table.pj thead th[data-key]').forEach(function(th){
      th.addEventListener('click',function(){
        var k=th.getAttribute('data-key');
        if(sortKey===k) sortDir*=-1; else {sortKey=k;sortDir=1;}
        render();
      });
    });
    render();
  })();



  /* ===== Pipeline: abrir pestaña según ancla (#estado) ===== */
  (function(){
    var tabs=document.querySelectorAll('.pipe-tab'); if(!tabs.length) return;
    function openFromHash(){
      var id=(location.hash||'').replace('#','');
      if(!id) return;
      var tab=document.querySelector('.pipe-tab[data-panel="'+id+'"]');
      if(tab){ tab.click(); tab.scrollIntoView({block:'nearest',inline:'center'}); }
    }
    window.addEventListener('hashchange',openFromHash);
    openFromHash();
  })();

})();