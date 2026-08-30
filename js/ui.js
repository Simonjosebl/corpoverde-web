/* ============================================================================
   UI 2026 — Corporación Protectora Verde
   ----------------------------------------------------------------------------
   Comportamientos del rediseño. Se carga DESPUÉS de js/app.js y todo lo que
   hay aquí se auto-protege (`if(!el) return`), así que el mismo archivo sirve
   para las seis páginas sin romper ninguna.

   Contenido: loader, barra de progreso, burbuja de WhatsApp, parallax suave,
   tilt de tarjetas, showcase de video, carrusel de mensajes (con arrastre),
   acordeón y contadores de cifras.
   Estilo ES5, igual que js/app.js.
   ========================================================================== */
(function(){
  "use strict";

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     1. LOADER — se va cuando la página termina de cargar (con tope de 3,5 s
        para que nunca se quede atascado si un video tarda demasiado).
     ====================================================================== */
  (function loader(){
    var box = document.getElementById('loader');
    if(!box){ document.body.classList.remove('cargando'); return; }
    var barra = box.querySelector('.loader-bar i');
    var pct = 0, cerrado = false;

    var tic = setInterval(function(){
      pct = Math.min(92, pct + Math.random()*16);
      if(barra) barra.style.width = pct+'%';
    }, 180);

    function cerrar(){
      if(cerrado) return; cerrado = true;
      clearInterval(tic);
      if(barra) barra.style.width = '100%';
      setTimeout(function(){
        box.classList.add('done');
        document.body.classList.remove('cargando');
        document.body.classList.add('listo');
      }, 260);
    }
    if(document.readyState === 'complete') setTimeout(cerrar, 320);
    else window.addEventListener('load', function(){ setTimeout(cerrar, 320); });
    setTimeout(cerrar, 3500);   /* red de seguridad */
  })();

  /* ==========================================================================
     2. BARRA DE PROGRESO DE LECTURA
     ====================================================================== */
  (function progreso(){
    var b = document.getElementById('progreso');
    var anillo = document.querySelector('.to-top .tt-avance');
    if(!b && !anillo) return;
    function pinta(){
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var y = window.scrollY || window.pageYOffset || 0;
      var p = h > 0 ? Math.min(1, Math.max(0, y/h)) : 0;
      if(b) b.style.transform = 'scaleX(' + p + ')';
      /* El anillo del botón "volver arriba" usa pathLength="100", así que el
         desplazamiento del trazo es directamente el porcentaje que falta. */
      if(anillo) anillo.style.strokeDashoffset = (100 - p*100).toFixed(1);
    }
    window.addEventListener('scroll', pinta, {passive:true});
    window.addEventListener('resize', pinta);
    pinta();
  })();

  /* ==========================================================================
     3. BURBUJA DE WHATSAPP — aparece al bajar un poco; se puede cerrar y la
        decisión se recuerda durante la sesión.
     ====================================================================== */
  (function whatsapp(){
    var caja = document.getElementById('waFlota');
    if(!caja) return;
    var cerrar = caja.querySelector('.wa-cerrar');
    var oculto = false;
    try{ oculto = sessionStorage.getItem('cpv-wa') === 'off'; }catch(e){}

    if(!oculto){
      setTimeout(function(){ caja.classList.add('abierta'); }, 2600);
    }
    if(cerrar){
      cerrar.addEventListener('click', function(e){
        e.preventDefault(); e.stopPropagation();
        caja.classList.remove('abierta');
        try{ sessionStorage.setItem('cpv-wa','off'); }catch(err){}
      });
    }
  })();

  /* ==========================================================================
     4. PARALLAX SUAVE — cualquier elemento con data-parallax="0.18" se mueve
        a esa fracción del scroll. Se apaga en móvil y con reduced-motion.
     ====================================================================== */
  (function parallax(){
    var els = [].slice.call(document.querySelectorAll('[data-parallax]'));
    if(!els.length || reduce || window.innerWidth < 900) return;
    var pendiente = false;

    function pinta(){
      pendiente = false;
      var vh = window.innerHeight;
      els.forEach(function(el){
        var r = el.getBoundingClientRect();
        if(r.bottom < -200 || r.top > vh + 200) return;
        var k = parseFloat(el.getAttribute('data-parallax')) || .15;
        var centro = r.top + r.height/2 - vh/2;
        el.style.transform = 'translate3d(0,'+ (-centro*k).toFixed(1) +'px,0)';
      });
    }
    window.addEventListener('scroll', function(){
      if(!pendiente){ pendiente = true; requestAnimationFrame(pinta); }
    }, {passive:true});
    window.addEventListener('resize', pinta);
    pinta();
  })();

  /* ==========================================================================
     5. TILT — inclinación 3D sutil siguiendo el cursor sobre [data-tilt].
     ====================================================================== */
  (function tilt(){
    var els = [].slice.call(document.querySelectorAll('[data-tilt]'));
    if(!els.length || reduce) return;
    if(window.matchMedia && window.matchMedia('(hover: none)').matches) return;

    els.forEach(function(el){
      el.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1)';
      el.addEventListener('mousemove', function(e){
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left)/r.width - .5;
        var y = (e.clientY - r.top)/r.height - .5;
        el.style.transition = 'transform .12s linear';
        el.style.transform = 'perspective(900px) rotateX('+(-y*6).toFixed(2)+
                             'deg) rotateY('+(x*7).toFixed(2)+'deg) translateY(-6px)';
      });
      el.addEventListener('mouseleave', function(){
        el.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)';
        el.style.transform = '';
      });
    });
  })();

  /* ==========================================================================
     6. SHOWCASE DE VIDEO — un destacado grande + rail de miniaturas.
        El destacado se reproduce en silencio y en bucle; al elegir otra pieza
        se intercambia la fuente sin recargar la página.
     ====================================================================== */
  (function videos(){
    var caja = document.getElementById('vshow');
    if(!caja) return;
    var vid   = caja.querySelector('.vshow-main video');
    var cap   = caja.querySelector('.vs-cap');
    var mute  = caja.querySelector('.vs-mute');
    var items = [].slice.call(caja.querySelectorAll('.vs-item'));
    if(!vid || !items.length) return;

    function reproducir(){
      vid.muted = true; vid.loop = true; vid.playsInline = true;
      vid.setAttribute('playsinline',''); vid.setAttribute('muted','');
      var p = vid.play();
      if(p && p.catch) p.catch(function(){ /* la política del navegador manda */ });
    }

    /* Casi todas las piezas están grabadas en vertical. El marco se adapta a la
       orientación real del archivo y, cuando es vertical, se rellena el resto
       con una copia desenfocada del póster en vez de recortar la imagen. */
    var marco = caja.querySelector('.vshow-main');
    var fondo = caja.querySelector('.vs-fondo');

    function ajustarFormato(){
      if(!marco || !vid.videoWidth) return;
      marco.classList.toggle('vertical', vid.videoHeight > vid.videoWidth);
    }
    vid.addEventListener('loadedmetadata', ajustarFormato);

    function elegir(it){
      items.forEach(function(x){ x.classList.remove('on'); x.setAttribute('aria-pressed','false'); });
      it.classList.add('on'); it.setAttribute('aria-pressed','true');
      var src = it.getAttribute('data-src');
      var pos = it.getAttribute('data-poster') || '';
      if(src && vid.getAttribute('src') !== src){
        vid.setAttribute('src', src);
        vid.setAttribute('poster', pos);
        vid.load();
      }
      if(fondo) fondo.style.backgroundImage = pos ? 'url("'+pos+'")' : '';
      if(cap){
        cap.innerHTML = '<b>'+ (it.getAttribute('data-titulo')||'') +'</b>'+
                        '<span>'+ (it.getAttribute('data-desc')||'') +'</span>';
      }
      ajustarFormato();
      reproducir();
    }

    items.forEach(function(it){
      it.addEventListener('click', function(){ elegir(it); });
    });
    elegir(items[0]);

    /* Solo reproduce mientras se ve en pantalla: ahorra datos y batería */
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){
        es.forEach(function(e){ e.isIntersecting ? reproducir() : vid.pause(); });
      },{threshold:.25}).observe(vid);
    }

    if(mute){
      mute.addEventListener('click', function(){
        vid.muted = !vid.muted;
        mute.classList.toggle('sonando', !vid.muted);
        mute.setAttribute('aria-label', vid.muted ? 'Activar sonido' : 'Silenciar');
        mute.innerHTML = vid.muted
          ? '<svg viewBox="0 0 24 24"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="m23 9-6 6M17 9l6 6"/></svg>'
          : '<svg viewBox="0 0 24 24"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
        if(!vid.muted) vid.play();
      });
    }
  })();

  /* ==========================================================================
     7. CARRUSEL DE MENSAJES — deslizante, con arrastre, flechas y puntos.
        Sirve para el bloque de testimonios/mensajes de contacto.
     ====================================================================== */
  (function mensajes(){
    var wrap = document.getElementById('msgWrap');
    if(!wrap) return;
    var rail = wrap.querySelector('.msg-rail');
    var dots = wrap.querySelector('.msg-dots');
    var prev = wrap.querySelector('[data-msg="prev"]');
    var next = wrap.querySelector('[data-msg="next"]');
    if(!rail || !rail.children.length) return;

    var tarjetas = [].slice.call(rail.children);

    function paso(){
      var a = tarjetas[0].getBoundingClientRect().width;
      var g = parseFloat(getComputedStyle(rail).columnGap || getComputedStyle(rail).gap || 0) || 0;
      return a + g;
    }
    function maxScroll(){ return Math.max(0, rail.scrollWidth - rail.clientWidth); }
    function indice(){ return Math.round(rail.scrollLeft / paso()); }

    function pintarDots(){
      if(!dots) return;
      var porVista = Math.max(1, Math.round(rail.clientWidth / paso()));
      var paradas  = Math.max(1, tarjetas.length - porVista + 1);
      dots.innerHTML = '';
      for(var i=0;i<paradas;i++){
        (function(i){
          var b = document.createElement('button');
          b.type = 'button';
          b.setAttribute('aria-label','Ir al mensaje '+(i+1));
          b.addEventListener('click', function(){
            rail.scrollTo({left: i>=paradas-1 ? maxScroll() : i*paso(), behavior:'smooth'});
          });
          dots.appendChild(b);
        })(i);
      }
      sincronizar();
    }
    function sincronizar(){
      if(!dots) return;
      var i = rail.scrollLeft >= maxScroll()-2 ? dots.children.length-1 : indice();
      [].forEach.call(dots.children, function(b,j){ b.classList.toggle('on', j===i); });
      if(prev) prev.disabled = rail.scrollLeft <= 2;
      if(next) next.disabled = rail.scrollLeft >= maxScroll()-2;
    }

    if(prev) prev.addEventListener('click', function(){
      rail.scrollBy({left:-paso(), behavior:'smooth'});
    });
    if(next) next.addEventListener('click', function(){
      rail.scrollBy({left: paso(), behavior:'smooth'});
    });
    rail.addEventListener('scroll', sincronizar, {passive:true});
    window.addEventListener('resize', pintarDots);
    pintarDots();

    /* Arrastre con el ratón (en táctil ya funciona el scroll nativo) */
    var abajo=false, x0=0, s0=0, movido=0;
    rail.addEventListener('mousedown', function(e){
      abajo=true; movido=0; x0=e.pageX; s0=rail.scrollLeft;
      rail.classList.add('arrastrando');
    });
    window.addEventListener('mouseup', function(){
      if(!abajo) return;
      abajo=false; rail.classList.remove('arrastrando');
    });
    window.addEventListener('mousemove', function(e){
      if(!abajo) return;
      e.preventDefault();
      var d = e.pageX - x0; movido = Math.abs(d);
      rail.scrollLeft = s0 - d;
    });
    rail.addEventListener('click', function(e){
      if(movido > 8){ e.preventDefault(); e.stopPropagation(); }
    }, true);
  })();

  /* ==========================================================================
     8. ACORDEÓN — usado en la guía de presentación de proyectos.
     ====================================================================== */
  (function acordeon(){
    var its = [].slice.call(document.querySelectorAll('.acord-it'));
    if(!its.length) return;
    its.forEach(function(it){
      var bt = it.querySelector('.acord-bt');
      if(!bt) return;
      bt.setAttribute('aria-expanded', it.classList.contains('open') ? 'true':'false');
      bt.addEventListener('click', function(){
        var abierto = it.classList.toggle('open');
        bt.setAttribute('aria-expanded', abierto ? 'true':'false');
      });
    });
  })();

  /* ==========================================================================
     9. CIFRAS ANIMADAS — cualquier [data-cifra] cuenta hasta su valor cuando
        entra en pantalla. Formato es-CO. Con data-suf se añade un sufijo.
     ====================================================================== */
  (function cifras(){
    var els = [].slice.call(document.querySelectorAll('[data-cifra]'));
    if(!els.length) return;

    /* Si el visitante está leyendo en inglés, el sufijo y el formato de
       número también cambian (el diccionario de i18n.js manda). */
    function traduce(s){
      if(!s) return s;
      var i18n = window.CPV_I18N;
      if(!i18n || i18n.idioma() !== 'en') return s;
      var t = i18n.diccionario[s];
      return t === undefined ? s : t;
    }
    function locale(){
      var i18n = window.CPV_I18N;
      return (i18n && i18n.idioma() === 'en') ? 'en-US' : 'es-CO';
    }

    function correr(el){
      var fin = parseFloat(el.getAttribute('data-cifra')) || 0;
      var dec = parseInt(el.getAttribute('data-dec')||'0', 10);
      var suf = traduce(el.getAttribute('data-suf') || '');
      var pre = el.getAttribute('data-pre') || '';
      var loc = locale();
      var op  = {minimumFractionDigits:dec, maximumFractionDigits:dec};
      if(reduce){
        el.textContent = pre + fin.toLocaleString(loc, op) + suf;
        return;
      }
      var t0 = null, dur = 1500;
      function cuadro(ts){
        if(!t0) t0 = ts;
        var p = Math.min(1, (ts-t0)/dur);
        var e = 1 - Math.pow(1-p, 3);
        el.textContent = pre + (fin*e).toLocaleString(loc, op) + suf;
        if(p < 1) requestAnimationFrame(cuadro);
      }
      requestAnimationFrame(cuadro);
    }

    var vistos = [];
    if('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(es){
        es.forEach(function(e){
          if(e.isIntersecting){ correr(e.target); vistos.push(e.target); io.unobserve(e.target); }
        });
      },{threshold:.4});
      els.forEach(function(el){ io.observe(el); });
    } else {
      els.forEach(function(el){ correr(el); vistos.push(el); });
    }

    /* Si el visitante cambia de idioma, las cifras ya animadas se repintan
       con el separador decimal y el sufijo del nuevo idioma. */
    document.addEventListener('cpv:idioma', function(){
      vistos.forEach(correr);
    });
  })();

  /* ==========================================================================
     10. AUTOPLAY DE FONDOS EN VIDEO — <video data-fondo> siempre en silencio,
         en bucle y solo mientras se ve.
     ====================================================================== */
  (function fondos(){
    var vs = [].slice.call(document.querySelectorAll('video[data-fondo]'));
    if(!vs.length) return;
    vs.forEach(function(v){
      v.muted = true; v.loop = true; v.playsInline = true;
      v.setAttribute('playsinline',''); v.setAttribute('muted','');
      function play(){ var p = v.play(); if(p && p.catch) p.catch(function(){}); }
      if('IntersectionObserver' in window){
        new IntersectionObserver(function(es){
          es.forEach(function(e){ e.isIntersecting ? play() : v.pause(); });
        },{threshold:.15}).observe(v);
      } else play();
    });
  })();

})();
