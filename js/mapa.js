/* ============================================================================
   MAPA DE ZONAS DE INCIDENCIA — Corporación Protectora Verde
   ----------------------------------------------------------------------------
   Coropleta de los departamentos de Colombia: cada departamento se pinta con
   una intensidad proporcional a la métrica activa (proyectos, beneficiarios o
   inversión). La geometría viene de js/colombia-geo.js y los datos de
   js/proyectos-data.js, así que el mapa se actualiza solo cuando cambia la
   tabla de proyectos.

   Monta el componente dentro de #mapaIncidencia. Si falta el contenedor, la
   geometría o los datos, no hace nada. Estilo ES5, igual que js/app.js.
   ========================================================================== */
(function(){
  "use strict";

  var host = document.getElementById('mapaIncidencia');
  if(!host || !window.PROYECTOS || !window.PROYECTOS.length) return;
  if(!window.COLOMBIA_DEPTOS || !window.COLOMBIA_DEPTOS.length) return;

  var VB = window.COLOMBIA_VIEWBOX || [640,800];
  var W = VB[0], H = VB[1];

  /* ==========================================================================
     1. Agregación de los proyectos por departamento
     ====================================================================== */
  var porDep = {}, nacional = {n:0, ben:0, val:0};

  window.PROYECTOS.forEach(function(p){
    if(p.dep === 'Cobertura nacional'){
      nacional.n++; nacional.ben += p.ben||0; nacional.val += p.val||0;
      return;
    }
    var d = porDep[p.dep] || (porDep[p.dep] = {
      dep:p.dep, n:0, ben:0, val:0, mun:{}, sectores:{}
    });
    d.n++; d.ben += p.ben||0; d.val += p.val||0;
    d.mun[p.mun] = true;
    d.sectores[p.sector] = (d.sectores[p.sector]||0) + 1;
  });

  Object.keys(porDep).forEach(function(k){
    var d = porDep[k];
    d.municipios = Object.keys(d.mun).length;
    d.sectorTop = Object.keys(d.sectores).sort(function(a,b){
      return d.sectores[b] - d.sectores[a];
    })[0] || '';
  });

  var conDatos = Object.keys(porDep).map(function(k){ return porDep[k]; });

  /* Aviso en consola si la tabla trae un departamento que el mapa no conoce:
     casi siempre es una errata en js/proyectos-data.js. */
  var conocidos = {};
  window.COLOMBIA_DEPTOS.forEach(function(g){ conocidos[g.n] = true; });
  var huerfanos = conDatos.filter(function(d){ return !conocidos[d.dep]; });
  if(huerfanos.length && window.console){
    console.warn('Mapa de incidencia: departamentos sin geometría →',
                 huerfanos.map(function(d){ return d.dep; }).join(', '));
  }

  var METRICAS = {
    n:   {fmt:function(v){ return v.toLocaleString('es-CO'); }},
    ben: {fmt:function(v){ return v.toLocaleString('es-CO'); }},
    val: {fmt:function(v){
            return '$' + (v/1e9).toLocaleString('es-CO',{maximumFractionDigits:1}) + ' mil M';
          }}
  };
  var metrica = 'n';
  function maxDe(k){
    return conDatos.reduce(function(m,d){ return Math.max(m, d[k]); }, 0);
  }

  /* ==========================================================================
     2. Escala de color secuencial (verde de la marca, de tenue a intenso)
     ====================================================================== */
  var RAMPA = ['#1C6B45','#23844F','#2FA055','#4FBC54','#86D94A','#BEEE5E'];
  var SIN_DATOS = 'rgba(255,255,255,.07)';
  /* Suelo de la escala: un departamento con un solo proyecto tiene que
     distinguirse del fondo, así que nunca arranca en el extremo apagado. */
  var PISO = 0.22;

  function hexRGB(h){
    return [parseInt(h.substr(1,2),16), parseInt(h.substr(3,2),16), parseInt(h.substr(5,2),16)];
  }
  var RGB = RAMPA.map(hexRGB);

  function color(t){                       /* t ∈ [0,1] */
    if(t <= 0) return SIN_DATOS;
    var x = (PISO + Math.min(1, t) * (1 - PISO)) * (RGB.length - 1);
    var i = Math.floor(x), f = x - i;
    var a = RGB[i], b = RGB[Math.min(RGB.length-1, i+1)];
    return 'rgb(' + Math.round(a[0]+(b[0]-a[0])*f) + ',' +
                    Math.round(a[1]+(b[1]-a[1])*f) + ',' +
                    Math.round(a[2]+(b[2]-a[2])*f) + ')';
  }

  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];
    });
  }

  /* ==========================================================================
     3. Construcción del SVG
     ====================================================================== */
  var deptosSVG = window.COLOMBIA_DEPTOS.map(function(g, i){
    return '<path class="mi-dep" data-dep="' + esc(g.n) + '" style="--i:' + i + '" ' +
           'tabindex="0" role="button" aria-label="' + esc(g.n) + '" d="' + g.d + '"/>';
  }).join('');

  var inset = window.COLOMBIA_INSET;
  var insetSVG = '';
  if(inset){
    insetSVG =
      '<div class="mi-inset" aria-hidden="true">' +
        '<svg viewBox="0 0 ' + inset.w + ' ' + inset.h + '">' +
          '<path class="mi-dep mi-dep-inset" data-dep="' + esc(inset.n) + '" d="' + inset.d + '"/>' +
        '</svg>' +
        '<span>San Andrés y Providencia</span>' +
      '</div>';
  }

  host.classList.add('mapa-inc');
  host.innerHTML =
    '<div class="mi-canvas">' +
      '<div class="mi-glow" aria-hidden="true"></div>' +
      '<svg class="mi-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" ' +
           'aria-label="Mapa de Colombia por departamentos con la intensidad de los proyectos de la Corporación">' +
        '<g class="mi-deptos">' + deptosSVG + '</g>' +
        '<g class="mi-etiquetas"></g>' +
      '</svg>' +
      insetSVG +
      '<div class="mi-tip" hidden></div>' +
      '<div class="mi-leyenda">' +
        '<span class="ml-tx">Menor</span>' +
        '<span class="ml-barra"></span>' +
        '<span class="ml-tx">Mayor</span>' +
      '</div>' +
    '</div>' +
    '<div class="mi-panel">' +
      '<p class="mi-resumen"></p>' +
      '<div class="mi-tabs" role="tablist" aria-label="Métrica del mapa">' +
        '<button class="mi-tab active" data-m="n" role="tab" aria-selected="true">Proyectos</button>' +
        '<button class="mi-tab" data-m="ben" role="tab" aria-selected="false">Beneficiarios</button>' +
        '<button class="mi-tab" data-m="val" role="tab" aria-selected="false">Inversión</button>' +
      '</div>' +
      '<ol class="mi-rank"></ol>' +
      '<p class="mi-nota">Pasa el cursor o toca un departamento para ver su detalle. ' +
      'Los departamentos en gris todavía no tienen proyectos registrados.</p>' +
    '</div>';

  var svg    = host.querySelector('.mi-svg');
  var gEtiq  = host.querySelector('.mi-etiquetas');
  var tip    = host.querySelector('.mi-tip');
  var rank   = host.querySelector('.mi-rank');
  var canvas = host.querySelector('.mi-canvas');
  var barra  = host.querySelector('.ml-barra');

  if(barra){
    /* La leyenda se muestrea de la misma función que pinta el mapa, piso
       incluido: si no, su extremo izquierdo prometería un verde que ningún
       departamento llega a tener. */
    var tramos = [];
    for(var q=0;q<=10;q++) tramos.push(color(q/10));
    barra.style.background = 'linear-gradient(90deg,' + tramos.join(',') + ')';
  }

  /* Índice de los <path> por nombre de departamento */
  var paths = {};
  [].forEach.call(svg.querySelectorAll('.mi-dep'), function(el){
    paths[el.getAttribute('data-dep')] = el;
  });
  var centros = {};
  window.COLOMBIA_DEPTOS.forEach(function(g){ centros[g.n] = g.c; });

  /* ==========================================================================
     4. Tooltip y resaltado
     ====================================================================== */
  function resaltar(dep, on){
    var p = paths[dep];
    if(p) p.classList.toggle('on', on);
    var li = rank.querySelector('li[data-dep="' + dep.replace(/"/g,'') + '"]');
    if(li) li.classList.toggle('on', on);
  }

  function mostrarTip(dep){
    var d = porDep[dep], c = centros[dep];
    if(!c) return;
    if(d){
      tip.innerHTML =
        '<b>' + esc(dep) + '</b>' +
        '<span class="mi-tip-row"><i>Proyectos</i><em>' + d.n + '</em></span>' +
        '<span class="mi-tip-row"><i>Municipios</i><em>' + d.municipios + '</em></span>' +
        '<span class="mi-tip-row"><i>Beneficiarios</i><em>' + d.ben.toLocaleString('es-CO') + '</em></span>' +
        '<span class="mi-tip-row"><i>Inversión</i><em>' +
          METRICAS.val.fmt(d.val) + '</em></span>' +
        '<span class="mi-tip-sec">' + esc(d.sectorTop) + '</span>';
    } else {
      tip.innerHTML = '<b>' + esc(dep) + '</b>' +
        '<span class="mi-tip-vacio">Sin proyectos registrados por ahora</span>';
    }
    tip.hidden = false;
    var r = svg.getBoundingClientRect();
    tip.style.left = (c[0] / W * r.width) + 'px';
    tip.style.top  = (c[1] / H * r.height) + 'px';
  }
  function ocultarTip(){ tip.hidden = true; }

  [].forEach.call(svg.querySelectorAll('.mi-dep'), function(el){
    var dep = el.getAttribute('data-dep');
    function entrar(){ mostrarTip(dep); resaltar(dep, true); }
    function salir(){ ocultarTip(); resaltar(dep, false); }
    el.addEventListener('mouseenter', entrar);
    el.addEventListener('mouseleave', salir);
    el.addEventListener('focus', entrar);
    el.addEventListener('blur', salir);
    el.addEventListener('click', entrar);
  });
  canvas.addEventListener('mouseleave', ocultarTip);

  /* ==========================================================================
     5. Pintado según la métrica activa
     ====================================================================== */
  function pintar(){
    var max = maxDe(metrica) || 1;
    var orden = conDatos.slice().sort(function(a,b){ return b[metrica] - a[metrica]; });

    /* 5.1 Coropleta */
    window.COLOMBIA_DEPTOS.forEach(function(g){
      var d = porDep[g.n], el = paths[g.n];
      if(!el) return;
      if(!d){
        el.style.fill = SIN_DATOS;
        el.classList.add('sin-datos');
        return;
      }
      el.classList.remove('sin-datos');
      /* raíz cuadrada: reparte mejor cuando un departamento domina la escala */
      el.style.fill = color(Math.sqrt(d[metrica] / max));
    });

    /* 5.2 Etiquetas de todos los departamentos con proyectos.
           Veintidós rótulos no caben colocándolos sin más en el centroide, así
           que se pintan primero, se miden de verdad con getBBox y después se
           busca sitio: el de más peso se queda donde está y los demás prueban
           posiciones en espiral hasta encontrar hueco. Si uno acaba lejos de su
           departamento, se le tiende una línea guía. */
    /* El SVG mide W unidades de ancho pero se dibuja al ancho que le deje la
       caja. Si el factor deja el texto por debajo de unos 9 px reales no se
       lee, así que en pantallas estrechas se rotulan menos departamentos y con
       cuerpo mayor; la lista del ranking sigue nombrándolos todos. */
    var etis0 = conDatos;
    var anchoReal = svg.getBoundingClientRect().width || W;
    var escala = anchoReal / W;
    var cuantos, clase;
    if(escala >= 0.70){ cuantos = etis0.length; clase = ''; }
    else if(escala >= 0.56){ cuantos = 12; clase = 'mi-eti-md'; }
    else { cuantos = 6; clase = 'mi-eti-sm'; }
    host.classList.remove('mi-eti-md','mi-eti-sm');
    if(clase) host.classList.add(clase);

    var etis = orden.slice(0, cuantos).map(function(d){
      var c = centros[d.dep];
      if(!c) return null;
      return {dep:d.dep, v:d[metrica], ax:c[0], ay:c[1], x:c[0], y:c[1]};
    }).filter(Boolean);

    gEtiq.innerHTML = etis.map(function(e, i){
      return '<g class="mi-eti-g" data-i="' + i + '">' +
        '<text class="mi-eti" x="' + e.x + '" y="' + e.y + '">' +
        '<tspan class="mi-eti-n">' + esc(e.dep) + '</tspan>' +
        '<tspan class="mi-eti-v" x="' + e.x + '" dy="13.5">' +
        METRICAS[metrica].fmt(e.v) + '</tspan></text></g>';
    }).join('');

    var grupos = gEtiq.querySelectorAll('.mi-eti-g');
    var MX = 3, MY = 2;                    /* aire alrededor de cada caja */
    etis.forEach(function(e, i){
      var caja = grupos[i].querySelector('text').getBBox();
      e.w = caja.width + MX * 2;
      e.h = caja.height + MY * 2;
      e.dx = caja.x - e.x;                 /* el texto está centrado en x */
      e.dy = caja.y - e.y;
    });

    function choca(a, b){
      return Math.abs(a.cx - b.cx) * 2 < (a.w + b.w) &&
             Math.abs(a.cy - b.cy) * 2 < (a.h + b.h);
    }
    function centro(e, x, y){
      return {cx:x + e.dx + e.w/2 - MX, cy:y + e.dy + e.h/2 - MY, w:e.w, h:e.h};
    }

    /* anillos de búsqueda: primero el sitio natural, luego arriba, abajo y a
       los lados, abriéndose poco a poco */
    var PASOS = [[0,0]];
    for(var r=1; r<=9; r++){
      var d2 = r * 15;
      PASOS.push([0,-d2],[0,d2],[-d2*1.2,0],[d2*1.2,0],
                 [-d2,-d2*0.8],[d2,-d2*0.8],[-d2,d2*0.8],[d2,d2*0.8]);
    }

    var puestas = [];
    etis.forEach(function(e){
      var mejor = null;
      for(var k=0;k<PASOS.length;k++){
        var x = e.ax + PASOS[k][0], y = e.ay + PASOS[k][1];
        var c = centro(e, x, y);
        if(c.cx - c.w/2 < 2 || c.cx + c.w/2 > W - 2 ||
           c.cy - c.h/2 < 2 || c.cy + c.h/2 > H - 2) continue;
        var libre = true;
        for(var j=0;j<puestas.length;j++){ if(choca(c, puestas[j])){ libre = false; break; } }
        if(libre){ mejor = {x:x, y:y, c:c}; break; }
      }
      if(!mejor){                          /* sin hueco: se deja en su sitio */
        mejor = {x:e.ax, y:e.ay, c:centro(e, e.ax, e.ay)};
      }
      e.x = mejor.x; e.y = mejor.y;
      puestas.push(mejor.c);
    });

    gEtiq.innerHTML = etis.map(function(e){
      var lejos = Math.abs(e.x - e.ax) > 6 || Math.abs(e.y - e.ay) > 6;
      var guia = lejos
        ? '<line class="mi-guia" x1="' + e.ax + '" y1="' + e.ay +
          '" x2="' + e.x + '" y2="' + (e.y - 4) + '"/>' +
          '<circle class="mi-guia-p" cx="' + e.ax + '" cy="' + e.ay + '" r="2.4"/>'
        : '';
      return guia +
        '<text class="mi-eti" x="' + e.x + '" y="' + e.y + '">' +
        '<tspan class="mi-eti-n">' + esc(e.dep) + '</tspan>' +
        '<tspan class="mi-eti-v" x="' + e.x + '" dy="13.5">' +
        METRICAS[metrica].fmt(e.v) + '</tspan></text>';
    }).join('');

    /* 5.3 Ranking */
    rank.innerHTML = orden.slice(0,10).map(function(d,i){
      var pct = Math.max(4, Math.round(d[metrica] / max * 100));
      return '<li data-dep="' + esc(d.dep) + '" style="--d:' + (i*45) + 'ms">' +
        '<span class="mi-r-pos">' + (i+1) + '</span>' +
        '<span class="mi-r-body">' +
          '<span class="mi-r-top"><b>' + esc(d.dep) + '</b>' +
          '<em>' + METRICAS[metrica].fmt(d[metrica]) + '</em></span>' +
          '<span class="mi-r-bar"><i style="width:' + pct + '%"></i></span>' +
          '<span class="mi-r-sub">' + d.municipios + ' municipio' + (d.municipios===1?'':'s') +
          ', ' + esc(d.sectorTop) + '</span>' +
        '</span></li>';
    }).join('');

    [].forEach.call(rank.children, function(li){
      var dep = li.getAttribute('data-dep');
      li.addEventListener('mouseenter', function(){ resaltar(dep,true); mostrarTip(dep); });
      li.addEventListener('mouseleave', function(){ resaltar(dep,false); ocultarTip(); });
    });
  }

  /* Resumen general */
  (function resumen(){
    var mun = conDatos.reduce(function(a,d){ return a + d.municipios; }, 0);
    host.querySelector('.mi-resumen').innerHTML =
      'Presencia en <b>' + conDatos.length + ' departamentos</b> y <b>' + mun +
      ' municipios</b>' +
      (nacional.n ? ', más <b>' + nacional.n + '</b> iniciativas de cobertura nacional' : '') +
      '. La intensidad del color muestra dónde se concentra nuestro trabajo.';
  })();

  host.querySelectorAll('.mi-tab').forEach(function(b){
    b.addEventListener('click', function(){
      host.querySelectorAll('.mi-tab').forEach(function(x){
        x.classList.remove('active'); x.setAttribute('aria-selected','false');
      });
      b.classList.add('active'); b.setAttribute('aria-selected','true');
      metrica = b.getAttribute('data-m');
      pintar();
    });
  });

  pintar();

  /* Animación de entrada al aparecer en pantalla */
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){ host.classList.add('mi-vivo'); io.unobserve(e.target); }
      });
    },{threshold:0.15});
    io.observe(host);
  } else {
    host.classList.add('mi-vivo');
  }

  /* Si cambia el idioma, el ranking y las etiquetas se vuelven a pintar para
     que los sectores queden traducidos. */
  document.addEventListener('cpv:idioma', function(){ pintar(); });

  /* Al girar el teléfono o redimensionar cambia cuántos rótulos caben */
  var reloj = null;
  window.addEventListener('resize', function(){
    clearTimeout(reloj);
    reloj = setTimeout(pintar, 180);
  });
})();
