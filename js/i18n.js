/* ============================================================================
   BILINGÜE ES / EN — Corporación Protectora Verde
   ----------------------------------------------------------------------------
   El sitio está escrito en español (es el idioma original y el que se sirve
   por defecto). Este módulo lo traduce al inglés en caliente, sin recargar y
   sin necesidad de duplicar las páginas.

   Cómo funciona
   -------------
   1. Recorre los nodos de texto del <body> y los atributos traducibles
      (placeholder, title, aria-label, alt) buscando cada cadena en DIC.
   2. Guarda el original en un WeakMap, así volver a español es exacto.
   3. Un MutationObserver vuelve a traducir el contenido que se pinta después
      (la tabla de proyectos, el mapa de incidencia, el carrusel de mensajes).
   4. La elección se guarda en localStorage. Si el visitante nunca ha elegido,
      se detecta: español si el navegador está en español o si la zona horaria
      es colombiana; inglés en cualquier otro caso.

   Para añadir o corregir una traducción basta con agregar una entrada a DIC
   usando como clave el texto español EXACTO que aparece en el HTML.
   ========================================================================== */
(function(){
  "use strict";

  /* ==========================================================================
     DICCIONARIO  español → inglés
     ====================================================================== */
  var DIC = {

  /* ---------- Cromo: barra superior, menú, pie ---------- */
  "ONG – Colombia":"NGO – Colombia",
  "Idioma / Language":"Language / Idioma",
  "Inicio":"Home",
  "Nosotros":"About us",
  "Qué hacemos":"What we do",
  "Programas":"Programs",
  "Proyectos":"Projects",
  "Alianzas":"Partnerships",
  "Contáctanos":"Contact us",
  "Contáctenos":"Contact us",
  "Contacto":"Contact",
  "Menú":"Menu",
  "Menú principal":"Main menu",
  "Abrir menú":"Open menu",
  "Volver arriba":"Back to top",
  "Cerrar mensaje":"Close message",
  "Secciones de la página":"Page sections",
  "Navegación":"Navigation",
  "Protectora Verde":"Protectora Verde",
  "Corporación":"Corporation",
  "Corporación Protectora Verde":"Corporación Protectora Verde",
  "Unidos por la humanidad":"United for humanity",
  "Unidos por la humanidad, guiados por":"United for humanity, guided by",
  "el corazón.":"the heart.",
  "Unidos por la humanidad, guiados por el corazón.":"United for humanity, guided by the heart.",
  "Organización no gubernamental colombiana que trabaja por la dignidad humana y el cuidado del planeta. NIT 804.012.972-2.":"A Colombian non-governmental organization working for human dignity and the care of the planet. Tax ID (NIT) 804.012.972-2.",
  "Trabajamos en red con":"We work in partnership with",
  "Colombia · cobertura nacional":"Colombia · nationwide coverage",
  "Lunes a viernes · 8:00 a.m. – 5:00 p.m.":"Monday to Friday · 8:00 a.m. – 5:00 p.m.",
  "Correo":"Email",
  "Correo electrónico":"Email",
  "Teléfono / WhatsApp":"Phone / WhatsApp",
  "Ubicación":"Location",
  "Atención":"Office hours",
  "Colombia":"Colombia",
  "WhatsApp":"WhatsApp",
  "Escríbenos por WhatsApp":"Message us on WhatsApp",
  "¿Hablamos?":"Shall we talk?",
  "Cuéntanos tu idea o tu proyecto y te respondemos por WhatsApp.":"Tell us about your idea or your project and we'll reply on WhatsApp.",
  "Formatos de registro":"Registration forms",
  "Protección de datos":"Data protection",
  "Protección de Datos":"Data Protection",
  "PQR":"Complaints & requests",

  /* ---------- Mega-menú: descripciones ---------- */
  "Conócenos":"Get to know us",
  "Quiénes somos y de dónde venimos":"Who we are and where we come from",
  "Misión":"Mission",
  "El propósito que nos mueve":"The purpose that drives us",
  "Visión":"Vision",
  "Hacia dónde vamos al 2030":"Where we are heading by 2030",
  "Valores":"Values",
  "Los principios que nos guían":"The principles that guide us",
  "Equipo de trabajo":"Our team",
  "Las personas detrás de cada proyecto":"The people behind every project",
  "Tratamiento de la información":"How we handle your information",
  "Peticiones, quejas y reclamos":"Requests, complaints and claims",
  "Peticiones, Quejas y Reclamos":"Requests, Complaints and Claims",
  "Canal de atención ciudadana":"Citizen service channel",
  "Áreas de acción":"Areas of action",
  "Los nueve frentes donde trabajamos":"The nine fronts where we work",
  "Iniciativas en marcha en el territorio":"Initiatives under way in the field",
  "Ejes estratégicos":"Strategic pillars",
  "Las diez líneas que ordenan el trabajo":"The ten lines that organize our work",
  "Zonas de incidencia":"Areas of impact",
  "Mapa interactivo de nuestra presencia":"Interactive map of our presence",
  "En territorio":"In the field",
  "Video y galería de nuestras jornadas":"Video and gallery of our field days",
  "Activados presentados":"Activated & submitted",
  "Portafolio completo con buscador":"Full portfolio with search",
  "Estudio":"In study",
  "En formulación y estructuración":"Being formulated and structured",
  "Viables":"Viable",
  "Con concepto técnico favorable":"With a favourable technical opinion",
  "Aprobados":"Approved",
  "Avalados por la entidad competente":"Endorsed by the competent authority",
  "Financiados":"Funded",
  "Con recursos asegurados":"With secured resources",
  "Ejecución":"In execution",
  "Obras y actividades en marcha":"Works and activities under way",
  "Supervisión":"Supervision",
  "Seguimiento e interventoría":"Monitoring and oversight",
  "Ejecutados":"Completed",
  "Proyectos entregados y cerrados":"Projects delivered and closed",
  "Informes":"Reports",
  "Rendición de cuentas y resultados":"Accountability and results",
  "Presenta tu proyecto · descarga los formatos de registro":"Submit your project · download the registration forms",
  "Presenta tu proyecto":"Submit your project",
  "En estudio":"In study",
  "En ejecución":"In execution",

  /* ---------- Portada: hero ---------- */
  "Corporación Protectora Verde · Unidos por la humanidad, guiados por el corazón":"Corporación Protectora Verde · United for humanity, guided by the heart",
  "Inicio · Corporación Protectora Verde":"Home · Corporación Protectora Verde",
  "Trabajamos por la dignidad humana y el cuidado del planeta, desarrollando proyectos estratégicos que transforman la vida de personas y comunidades a nivel social, cultural y económico.":"We work for human dignity and the care of the planet, developing strategic projects that transform the lives of people and communities socially, culturally and economically.",
  "CEO —":"CEO —",
  "CEO — Representante Legal":"CEO — Legal Representative",
  "Yaneth Gómez Mujica":"Yaneth Gómez Mujica",
  "Áreas de acción":"Areas of action",
  "Ejes estratégicos":"Strategic pillars",
  "Visión de impacto":"Impact horizon",
  "Nuestro impacto":"Our impact",
  "Cifras de impacto":"Impact figures",
  "años de trayectoria transformando comunidades":"years transforming communities",
  "personas beneficiadas en todo el territorio":"people reached across the country",
  "proyectos activados en distintos sectores":"projects activated across different sectors",
  "mujeres beneficiadas en los campos de Colombia":"women reached in rural Colombia",
  "Explorar":"Explore",
  "Desplázate":"Scroll",
  "Desliza para explorar":"Swipe to explore",
  "Paisaje de palmas, Colombia":"Palm landscape, Colombia",

  /* ---------- Portada: credenciales ---------- */
  "años de trayectoria":"years of experience",
  "proyectos activados y presentados":"projects activated and submitted",
  "departamentos con presencia":"departments with presence",
  "NIT 804.012.972-2":"Tax ID (NIT) 804.012.972-2",
  "entidad sin ánimo de lucro":"non-profit organization",

  /* ---------- Portada: quiénes somos ---------- */
  "Quiénes somos":"Who we are",
  "Nueve áreas de acción":"Nine areas of action",
  "Quiénes":"Who",
  "somos":"we are",
  "Una organización por la":"An organization for",
  "dignidad humana":"human dignity",
  "y el planeta":"and the planet",
  "Somos una organización que trabaja por la dignidad humana y el cuidado del planeta. Desarrollamos proyectos estratégicos en vivienda, salud, educación, agua, alimentación, agroindustria, energía, medio ambiente y emprendimiento para mejorar la calidad de vida de personas y comunidades.":"We are an organization that works for human dignity and the care of the planet. We develop strategic projects in housing, health, education, water, food, agro-industry, energy, the environment and entrepreneurship to improve the quality of life of people and communities.",
  "Vivienda":"Housing",
  "Salud":"Health",
  "Educación":"Education",
  "Agua":"Water",
  "Alimentación":"Food",
  "Agroindustria":"Agro-industry",
  "Energía":"Energy",
  "Medio ambiente":"Environment",
  "Emprendimiento":"Entrepreneurship",
  "Sostenible":"Sustainable",
  "Con el corazón":"With heart",

  /* ---------- Portada: pilares ---------- */
  "Nuestro enfoque":"Our approach",
  "Cuatro":"Four",
  "pilares":"pillars",
  "que sostienen cada proyecto":"that hold up every project",
  "La forma en que trabajamos: una manera de hacer que se repite en todos los territorios donde estamos.":"The way we work: a way of doing things that repeats itself in every territory where we are present.",
  "Sostenibilidad":"Sustainability",
  "Cada proyecto se diseña para perdurar: cuidamos los recursos naturales y dejamos capacidad instalada en el territorio.":"Every project is designed to last: we care for natural resources and leave installed capacity behind in the territory.",
  "Innovación":"Innovation",
  "Incorporamos tecnología y nuevas metodologías —energía solar, digitalización y agroindustria— para multiplicar el impacto.":"We bring in technology and new methods — solar energy, digitalization and agro-industry — to multiply impact.",
  "Cooperación":"Cooperation",
  "Trabajamos en red con comunidades, instituciones y aliados internacionales para llegar más lejos y con mayor respaldo.":"We work as a network with communities, institutions and international partners to reach further and with greater backing.",
  "Sistemas alimentarios":"Food systems",
  "Fortalecemos la producción campesina y la seguridad alimentaria como base del desarrollo rural y la nutrición de las familias.":"We strengthen smallholder production and food security as the foundation of rural development and family nutrition.",

  /* ---------- Portada: prioridades ---------- */
  "En qué ponemos el foco":"Where we put the focus",
  "Nuestras":"Our",
  "prioridades":"priorities",
  "Cuatro apuestas que guían nuestro trabajo y definen el impacto que buscamos generar.":"The four commitments that guide our work and define the impact we set out to create.",
  "Empoderar a las personas y a las empresas":"Empowering people and businesses",
  "Fortalecemos capacidades, liderazgos y tejido productivo para que comunidades y organizaciones sean protagonistas de su propio desarrollo.":"We strengthen skills, leadership and productive networks so that communities and organizations lead their own development.",
  "El poder del propósito e impacto social":"The power of purpose and social impact",
  "Cada proyecto nace de un propósito claro: generar cambios medibles y sostenibles en la vida de las personas y en el cuidado del planeta.":"Every project starts from a clear purpose: to create measurable, lasting change in people's lives and in the care of the planet.",
  "Empoderamiento económico femenino en los campos de Colombia":"Women's economic empowerment in rural Colombia",
  "Impulsamos la autonomía económica de las mujeres rurales mediante formación, emprendimiento y acceso a oportunidades en el campo colombiano.":"We advance the economic autonomy of rural women through training, entrepreneurship and access to opportunities in the Colombian countryside.",
  "Incentivación al cuidado ambiental":"Encouraging environmental stewardship",
  "Promovemos prácticas sostenibles, educación ambiental y proyectos que protegen los ecosistemas, inspirando a comunidades y empresas a cuidar el planeta.":"We promote sustainable practices, environmental education and projects that protect ecosystems, inspiring communities and companies to care for the planet.",

  /* ---------- Territorio / galería ---------- */
  "Nuestro trabajo, en imágenes":"Our work, in pictures",
  "Jornadas, encuentros y acompañamiento a comunidades: la evidencia viva de cada programa que impulsamos.":"Field days, gatherings and support for communities: living evidence of every program we drive.",
  "Niñez":"Children",
  "Comunidades":"Communities",
  "Comunidad":"Community",
  "Pueblos":"Indigenous peoples",
  "Encuentros":"Gatherings",
  "Niñas y niños dibujando en un taller comunitario":"Children drawing at a community workshop",
  "Niñas y niños en un taller de dibujo en una maloca comunitaria":"Children at a drawing workshop in a community maloca",
  "Talleres de creatividad con la niñez de comunidades ribereñas":"Creative workshops with children from riverside communities",
  "Talleres de creatividad y lectura con la niñez de comunidades ribereñas":"Creative and reading workshops with children from riverside communities",
  "Niñas escribiendo durante una actividad educativa":"Girls writing during an educational activity",
  "Tres niñas escribiendo durante una actividad educativa":"Three girls writing during an educational activity",
  "Acompañamiento educativo en zona rural dispersa":"Educational support in scattered rural areas",
  "Acompañamiento educativo y refuerzo escolar en zona rural dispersa":"Educational support and tutoring in scattered rural areas",
  "Actividad grupal con niñas y niños dirigida por una facilitadora":"Group activity with children led by a facilitator",
  "Grupo de niñas y niños en una actividad grupal dirigida por una facilitadora":"A group of children in a session led by a facilitator",
  "Jornadas lúdicas y de convivencia":"Play and community-building days",
  "Jornadas lúdicas y de convivencia con toda la comunidad":"Play and community-building days with the whole community",
  "Jornadas de bienestar con población adulta mayor":"Wellbeing days with older adults",
  "Encuentros con comunidades indígenas":"Gatherings with Indigenous communities",
  "Encuentros y diálogo con comunidades indígenas":"Gatherings and dialogue with Indigenous communities",
  "Acompañamiento a la niñez en comunidades rurales":"Support for children in rural communities",
  "Formación y actividades con jóvenes":"Training and activities with young people",
  "Espacios de acompañamiento y fe":"Spaces of support and faith",

  /* ---------- Videos ---------- */
  "Historias en movimiento":"Stories in motion",
  "Video del":"Video from the",
  "territorio":"field",
  "Momentos reales de nuestras jornadas y del trabajo con las comunidades. Elige una pieza de la lista para verla en grande.":"Real moments from our field days and our work with communities. Pick a clip from the list to watch it full size.",
  "Momentos reales de nuestras jornadas y del trabajo con las comunidades.":"Real moments from our field days and our work with communities.",
  "Videos":"Videos",
  "Activar sonido":"Turn on sound",
  "Silenciar":"Mute",
  "Anterior":"Previous",
  "Siguiente":"Next",
  "Jornada en comunidades del Vaupés":"Field days in Vaupés communities",
  "Viaje por selva y río para acompañar a familias, niñas y niños de comunidades indígenas del Vaupés.":"A journey through rainforest and river to support families and children in Indigenous communities of Vaupés.",
  "Jornada en comunidad":"Community field day",
  "Acompañamiento y atención directa en el territorio.":"Direct support and care in the field.",
  "Testimonio":"Testimony",
  "Voces de quienes viven la transformación.":"Voices of those living the transformation.",
  "Acompañamiento en territorio":"Support in the field",
  "Trabajo en comunidades":"Work in communities",
  "Trabajo en red":"Working as a network",
  "Educación y recreación":"Education and play",

  /* ---------- Aliados ---------- */
  "Trabajamos en red":"We work as a network",
  "Aliados que":"Partners who",
  "confían":"trust us",
  "Sumamos capacidades con organizaciones e instituciones comprometidas con el desarrollo humano y sostenible.":"We combine capabilities with organizations and institutions committed to human and sustainable development.",
  "Sumamos capacidades con organizaciones e instituciones que comparten nuestro compromiso con el desarrollo humano y sostenible.":"We combine capabilities with organizations and institutions that share our commitment to human and sustainable development.",
  "Conoce todas nuestras alianzas":"See all our partnerships",
  "Conocer las alianzas":"See the partnerships",
  "Ver el mapa de zonas de incidencia":"See the map of our areas of impact",
  "Alianzas · Corporación Protectora Verde":"Partnerships · Corporación Protectora Verde",
  "Quiénes lo hacen posible":"Who makes it possible",
  "Trabajamos en":"We work as a",
  "red":"network",
  "Empresas, gobiernos y aliados que multiplican el alcance.":"Companies, governments and partners that multiply our reach.",
  "Organización aliada":"Partner organization",
  "Aliado estratégico":"Strategic partner",
  "Cooperación internacional":"International cooperation",
  "Cooperación para el desarrollo":"Development cooperation",
  "Cooperación para el desarrollo en América Latina y el Caribe":"Development cooperation in Latin America and the Caribbean",
  "Institucionalidad ambiental de Colombia":"Colombia's environmental authority",
  "Ingeniería y gestión ambiental":"Environmental engineering and management",
  "Sector privado":"Private sector",
  "Acuerdo comercial":"Commercial agreement",
  "Ministerio de Ambiente y Desarrollo Sostenible":"Ministry of Environment and Sustainable Development",
  "Banco Interamericano de Desarrollo":"Inter-American Development Bank",
  "BID - Banco Interamericano de Desarrollo":"IDB – Inter-American Development Bank",
  "Grupo Banco Mundial":"World Bank Group",
  "Black Embassy ONG":"Black Embassy NGO",
  "Fundación Embajada Internacional Afrodescendiente":"International Afro-descendant Embassy Foundation",
  "Ingeambiental Ltda":"Ingeambiental Ltda",
  "Proyectos 360 Group":"Proyectos 360 Group",
  "Ir al sitio":"Visit website",
  "Ver alianza":"See partnership",
  "Conocer más":"Learn more",
  "¿Tu organización quiere sumar?":"Does your organization want to join?",
  "Construyamos una alianza":"Let's build a partnership",
  "Quiero ser aliado":"I want to become a partner",
  "Economía circular, gestión de residuos y energía renovable":"Circular economy, waste management and renewable energy",

  /* ---------- Contacto ---------- */
  "Te escuchamos":"We're listening",
  "Hablemos de cómo":"Let's talk about how to",
  "sumar":"join forces",
  "Estamos para escucharte. Escríbenos y construyamos juntos comunidades más justas y sostenibles.":"We're here to listen. Write to us and let's build fairer, more sustainable communities together.",
  "Elige el canal que mejor se ajuste a lo que necesitas. Si prefieres, escríbenos directamente con el formulario y te respondemos por correo.":"Pick the channel that best fits what you need. If you prefer, write to us directly with the form and we'll reply by email.",
  "¿En qué podemos ayudarte?":"How can we help?",
  "Canal directo":"Direct channel",
  "Presentar un proyecto":"Submit a project",
  "¿Tu organización tiene una iniciativa lista? Descarga los formatos oficiales, diligéncialos y te decimos en qué etapa queda.":"Does your organization have an initiative ready? Download the official forms, fill them in and we'll tell you what stage it reaches.",
  "Ver el proceso":"See the process",
  "Ser aliado o cooperante":"Become a partner or funder",
  "Empresas, fundaciones y agencias de cooperación que quieran sumar capacidades a los proyectos que ya están en marcha.":"Companies, foundations and cooperation agencies that want to add capabilities to projects already under way.",
  "Voluntariado y prácticas":"Volunteering and internships",
  "Profesionales y estudiantes que quieran aportar tiempo y conocimiento en territorio o desde la formulación de proyectos.":"Professionals and students who want to contribute time and knowledge in the field or in project design.",
  "Escribir por WhatsApp":"Message on WhatsApp",
  "Canal formal de atención ciudadana. Respondemos dentro de los términos de ley y hacemos seguimiento a cada caso.":"Formal citizen service channel. We respond within the legal timeframes and follow up on every case.",
  "Radicar una PQR":"File a request",
  "Prensa y comunicaciones":"Press and communications",
  "Solicitudes de entrevistas, material gráfico e información institucional sobre nuestros programas.":"Requests for interviews, visual material and institutional information about our programs.",
  "Escribir un correo":"Send an email",
  "Donaciones y aportes":"Donations and contributions",
  "Personas y organizaciones que quieran apoyar económicamente o en especie los programas de la Corporación.":"People and organizations that want to support the Corporation's programs financially or in kind.",
  "Hablemos por WhatsApp":"Let's talk on WhatsApp",
  "¿Prefieres una respuesta inmediata?":"Would you rather get an immediate reply?",
  "Escríbenos por WhatsApp y te atendemos en horario de oficina, de lunes a viernes.":"Message us on WhatsApp and we'll assist you during office hours, Monday to Friday.",
  "Nombre":"Name",
  "Tu nombre":"Your name",
  "Nombre completo":"Full name",
  "Nombre y organización":"Name and organization",
  "Tu nombre · tu organización":"Your name · your organization",
  "tu@correo.com":"you@email.com",
  "Asunto":"Subject",
  "¿En qué podemos ayudarte?":"How can we help?",
  "Mensaje":"Message",
  "Cuéntanos tu idea o solicitud…":"Tell us your idea or request…",
  "Cuéntanos en detalle tu solicitud…":"Tell us about your request in detail…",
  "Enviar mensaje":"Send message",
  "Enviar mi solicitud":"Send my request",
  "Se abrirá tu aplicación de correo con el mensaje listo para enviar.":"Your email app will open with the message ready to send.",
  "Se abrirá tu aplicación de correo con la solicitud lista para enviar a corpoteverde@gmail.com.":"Your email app will open with the request ready to send to corpoteverde@gmail.com.",
  "Se abrirá tu aplicación de correo con el mensaje listo. Recuerda adjuntar allí los formatos diligenciados.":"Your email app will open with the message ready. Remember to attach the completed forms there.",

  /* ---------- Súmate ---------- */
  "Súmate al cambio":"Join the change",
  "Tu apoyo hace posible que más comunidades accedan a vivienda, salud, agua y oportunidades. Hay muchas formas de ser parte de la transformación.":"Your support makes it possible for more communities to access housing, health, water and opportunity. There are many ways to be part of the transformation.",
  "Donaciones":"Donations",
  "Tu aporte se convierte en impacto real y medible.":"Your contribution becomes real, measurable impact.",
  "Voluntariado":"Volunteering",
  "Suma tu tiempo y talento a nuestros programas en territorio.":"Bring your time and talent to our programs in the field.",
  "Cooperación y convenios":"Cooperation and agreements",
  "Construyamos un proyecto juntos":"Let's build a project together",

  /* ---------- Nosotros ---------- */
  "Nosotros · Corporación Protectora Verde":"About us · Corporación Protectora Verde",
  "Una organización por la dignidad humana y el cuidado del planeta, con presencia en las comunidades de Colombia.":"An organization for human dignity and the care of the planet, present in communities across Colombia.",
  "Nuestro propósito":"Our purpose",
  "Reducir la pobreza y la desigualdad social construyendo comunidades justas, equitativas y sostenibles. Promovemos el acceso a los derechos básicos y una relación armónica entre el ser humano, la naturaleza y el planeta, con gestión ética y transparente.":"To reduce poverty and social inequality by building fair, equitable and sustainable communities. We promote access to basic rights and a harmonious relationship between people, nature and the planet, managed ethically and transparently.",
  "Hacia dónde caminamos":"Where we are heading",
  "Ser en 2030 una corporación referente en transformación social y ambiental en Colombia, reconocida por impulsar la igualdad de oportunidades, proteger la biodiversidad y articular comunidades, gobiernos y aliados para alcanzar un desarrollo sostenible y armónico.":"To be, by 2030, a leading corporation in social and environmental transformation in Colombia, recognized for advancing equal opportunity, protecting biodiversity and bringing together communities, governments and partners to achieve harmonious, sustainable development.",
  "Lo que nos guía":"What guides us",
  "Nuestros":"Our",
  "valores":"values",
  "Nuestros valores":"Our values",
  "Principios que sostienen cada decisión y cada proyecto que emprendemos.":"The principles behind every decision and every project we take on.",
  "Solidaridad":"Solidarity",
  "Ponemos a las personas primero, sin distinción.":"We put people first, without distinction.",
  "Respeto":"Respect",
  "Valoramos toda forma de vida y la diversidad cultural.":"We value every form of life and cultural diversity.",
  "Transparencia":"Transparency",
  "Gestionamos con honestidad y rendición de cuentas.":"We manage with honesty and accountability.",
  "Desarrollo":"Development",
  "Impulsamos soluciones que impliquen un progreso sustentable.":"We drive solutions that bring sustainable progress.",
  "Desarrollo Sostenible":"Sustainable Development",
  "Cuidamos los recursos naturales y el planeta para las futuras generaciones.":"We care for natural resources and the planet for future generations.",
  "Compromiso":"Commitment",
  "Apoyamos actividades que beneficien directamente a la sociedad y al planeta.":"We support activities that directly benefit society and the planet.",
  "Fomentamos proyectos verdes que protegen el medio ambiente.":"We foster green projects that protect the environment.",
  "Equipo":"Team",
  "Nuestro equipo de trabajo":"Our team",
  "Personas comprometidas con la transformación social y ambiental de Colombia.":"People committed to Colombia's social and environmental transformation.",
  "Dirección de Proyectos":"Project Management",
  "Coordinación Territorial":"Territorial Coordination",
  "Gestión de Alianzas":"Partnership Management",
  "Formulación y gestión":"Design and management",
  "Tu privacidad":"Your privacy",
  "Política de":"Policy on",
  "protección de datos":"data protection",
  "Habeas Data":"Habeas Data",
  "Ley 1581 de 2012":"Law 1581 of 2012",
  "Decreto 1377 de 2013":"Decree 1377 of 2013",
  "En cumplimiento de la normativa colombiana sobre protección de datos personales (Habeas Data), la":"In compliance with Colombian personal data protection law (Habeas Data), the",
  "informa el tratamiento que da a la información personal que recibe.":"discloses how it processes the personal information it receives.",
  "Responsable del tratamiento":"Data controller",
  "Finalidad de los datos":"Purpose of the data",
  "Atender solicitudes, peticiones, quejas y reclamos.":"To handle requests, petitions, complaints and claims.",
  "Enviar información institucional.":"To send institutional information.",
  "Gestionar la participación en programas y proyectos.":"To manage participation in programs and projects.",
  "Dar cumplimiento a obligaciones legales.":"To comply with legal obligations.",
  "Derechos del titular":"Rights of the data subject",
  "Conocer, actualizar y rectificar sus datos personales.":"To access, update and correct their personal data.",
  "Solicitar prueba de la autorización otorgada.":"To request proof of the authorization granted.",
  "Ser informado sobre el uso dado a sus datos.":"To be informed about how their data is used.",
  "Presentar quejas ante la Superintendencia de Industria y Comercio.":"To file complaints with the Superintendency of Industry and Commerce.",
  "Revocar la autorización y solicitar la supresión del dato cuando proceda.":"To withdraw consent and request deletion of the data where applicable.",
  "¿Cómo ejercer estos derechos?":"How to exercise these rights?",
  "Los datos se tratan conforme a la Ley 1581 de 2012 y a nuestra política de tratamiento de datos personales, que puedes consultar en":"Data is processed in accordance with Law 1581 of 2012 and our personal data processing policy, which you can consult under",
  "Tu voz nos ayuda a mejorar. Radica aquí tu solicitud y te responderemos.":"Your voice helps us improve. File your request here and we will get back to you.",
  "Escríbenos indicando tu solicitud. Daremos respuesta en los términos establecidos por la ley.":"Write to us describing your request. We will respond within the timeframes set by law.",
  "Radicar solicitud":"File a request",
  "Tipo de solicitud":"Type of request",
  "Petición":"Petition",
  "Queja":"Complaint",
  "Reclamo":"Claim",
  "Sugerencia":"Suggestion",
  "Felicitación":"Compliment",
  "Otro":"Other",
  "Institucional":"Institutional",
  "Quejas y reclamos":"Complaints and claims",

  /* ---------- Qué hacemos / programas ---------- */
  "Qué hacemos y Programas · Corporación Protectora Verde":"What we do and Programs · Corporación Protectora Verde",
  "Diez ejes estratégicos y programas concretos que transforman la vida de las comunidades.":"Ten strategic pillars and concrete programs that transform the lives of communities.",
  "Nueve frentes de acción":"Nine fronts of action",
  "Qué":"What",
  "hacemos":"we do",
  "Articulamos esfuerzos en las áreas que más impactan la calidad de vida de las comunidades y la salud del planeta.":"We bring together efforts in the areas that most affect communities' quality of life and the health of the planet.",
  "Construimos hogares seguros y dignos para familias necesitadas.":"We build safe, dignified homes for families in need.",
  "Promovemos el acceso a servicios de salud y mejoramos la calidad de vida.":"We promote access to health services and improve quality of life.",
  "Impulsamos la educación y el desarrollo de habilidades para un futuro mejor.":"We advance education and skills development for a better future.",
  "Garantizamos acceso a agua limpia y promovemos el saneamiento básico.":"We secure access to clean water and promote basic sanitation.",
  "Llevamos alimentos nutritivos y fomentamos hábitos saludables.":"We deliver nutritious food and encourage healthy habits.",
  "Impulsamos a las mujeres con formación y oportunidades para crear y sostener sus proyectos.":"We support women with training and opportunities to create and sustain their own projects.",
  "10 ejes estratégicos para":"10 strategic pillars to",
  "transformar a Colombia":"transform Colombia",
  "Un modelo integral de impacto social, humano y ambiental para el país":"An integrated model of social, human and environmental impact for the country",
  "Pasa el cursor o toca cada eje para ver su descripción.":"Hover over or tap each pillar to read its description.",
  "Salud Integral y Bienestar":"Comprehensive Health and Wellbeing",
  "Impulsamos la salud integral, la prevención y el bienestar físico y mental de las comunidades.":"We advance comprehensive health, prevention and the physical and mental wellbeing of communities.",
  "Educación y Formación":"Education and Training",
  "Educación y Capacitación":"Education and Training",
  "Ampliamos el acceso a educación de calidad y capacitación para el desarrollo de capacidades.":"We widen access to quality education and training for capacity building.",
  "Nutrición y Seguridad Alimentaria":"Nutrition and Food Security",
  "Alimentación y Nutrición":"Food and Nutrition",
  "Combatimos el hambre y promovemos la seguridad alimentaria con producción sostenible y hábitos saludables.":"We fight hunger and promote food security through sustainable production and healthy habits.",
  "Vivienda y Refugio":"Housing and Shelter",
  "Hábitat y Desarrollo Territorial":"Habitat and Territorial Development",
  "Mejoramos el hábitat, la vivienda digna y el ordenamiento sostenible del territorio.":"We improve habitat, dignified housing and sustainable land-use planning.",
  "Agua Potable y Saneamiento":"Drinking Water and Sanitation",
  "Salud y Bienestar":"Health and Wellbeing",
  "Comunidades Indígenas":"Indigenous Communities",
  "Acompañamos y fortalecemos a los pueblos indígenas respetando su cultura, autonomía y territorio.":"We accompany and strengthen Indigenous peoples while respecting their culture, autonomy and territory.",
  "Migrantes y Movilidad Humana":"Migrants and Human Mobility",
  "Atendemos a población migrante y en movilidad con enfoque de derechos y dignidad humana.":"We serve migrant and mobile populations with a rights-based, human-dignity approach.",
  "Innovación y Tecnología Humanitaria":"Humanitarian Innovation and Technology",
  "Aplicamos tecnología e innovación para resolver retos sociales y humanitarios.":"We apply technology and innovation to solve social and humanitarian challenges.",
  "Gobernanza, Ciudadanía y Cultura de Paz":"Governance, Citizenship and a Culture of Peace",
  "Fortalecemos la ciudadanía, la participación y la cultura de paz para una mejor gobernanza.":"We strengthen citizenship, participation and a culture of peace for better governance.",
  "Economía de la Paz y Desarrollo Local":"Peace Economy and Local Development",
  "Fomentamos economías locales, empleo y emprendimiento como base para la paz y el desarrollo.":"We foster local economies, employment and entrepreneurship as a foundation for peace and development.",
  "Finanzas Éticas":"Ethical Finance",
  "Promovemos finanzas transparentes, éticas y sostenibles al servicio del impacto social.":"We promote transparent, ethical and sustainable finance in the service of social impact.",
  "Emprendimiento Mujeres":"Women's Entrepreneurship",
  "Programas humanitarios":"Humanitarian programs",
  "Cada programa atiende una necesidad concreta de las comunidades, con un enfoque humano y sostenible.":"Each program addresses a concrete community need, with a human and sustainable approach.",
  "Proyectos humanitarios y desarrollo integral":"Humanitarian projects and integrated development",

  /* ---------- Mapa de incidencia ---------- */
  "Mapa interactivo":"Interactive map",
  "Nuestra huella en el":"Our footprint in the",
  "Cada foco del mapa es un departamento donde tenemos proyectos activados o presentados. El tamaño y la intensidad del color muestran la concentración del trabajo. Cambia la métrica para ver dónde llegamos a más gente y dónde se concentra la inversión.":"Each hotspot on the map is a department where we have activated or submitted projects. Size and colour intensity show how concentrated the work is. Switch the metric to see where we reach the most people and where investment is concentrated.",
  "Dónde":"Where",
  "estamos":"we are",
  "Proyectos":"Projects",
  "Beneficiarios":"Beneficiaries",
  "Inversión":"Investment",
  "Municipios":"Municipalities",
  "Croquis de referencia. Pasa el cursor (o toca) un departamento para ver el detalle.":"Reference outline. Hover over (or tap) a department to see the detail.",
  "Mapa de Colombia con las zonas donde la Corporación tiene proyectos":"Map of Colombia showing the areas where the Corporation has projects",

  /* ---------- Proyectos ---------- */
  "Proyectos · Corporación Protectora Verde":"Projects · Corporación Protectora Verde",
  "Proyectos que":"Projects that",
  "transforman":"transform",
  "transforman vidas":"transform lives",
  "Un portafolio de iniciativas de alto impacto en todo el territorio nacional, organizadas por su etapa en el ciclo de proyectos.":"A portfolio of high-impact initiatives across the country, organized by their stage in the project cycle.",
  "Ciclo de proyectos":"Project cycle",
  "Nuestros proyectos":"Our projects",
  "proyectos":"projects",
  "Del estudio a la ejecución: así avanza cada iniciativa que impulsamos por las comunidades de Colombia.":"From study to execution: this is how every initiative we drive for Colombia's communities moves forward.",
  "Proyectos activados y presentados":"Projects activated and submitted",
  "Beneficiarios proyectados":"Projected beneficiaries",
  "Inversión total estimada (COP)":"Total estimated investment (COP)",
  "Departamentos con presencia":"Departments with presence",
  "Buscar por nombre, departamento, municipio o sector…":"Search by name, department, municipality or sector…",
  "Filtrar por sector":"Filter by sector",
  "Filtrar por estado":"Filter by status",
  "Filtrar por departamento":"Filter by department",
  "Filtrar por municipio":"Filter by municipality",
  "Todos los sectores":"All sectors",
  "Todos los estados":"All statuses",
  "Todos los departamentos":"All departments",
  "Todos los municipios":"All municipalities",
  "No.":"No.",
  "Proyecto":"Project",
  "Sector":"Sector",
  "Estado":"Status",
  "Valor (COP)":"Value (COP)",
  "No se encontraron proyectos con esos criterios.":"No projects matched those filters.",
  "Registrado/Presentado":"Registered / Submitted",
  "Esta etapa del ciclo de proyectos se está actualizando. Muy pronto publicaremos aquí los proyectos en estado":"This stage of the project cycle is being updated. We will publish the projects with this status here very soon:",
  "viables":"viable",
  "aprobados":"approved",
  "financiados":"funded",
  "ejecución":"execution",
  "supervisión":"supervision",
  "ejecutados":"completed",
  "informes":"reports",
  "estudio":"study",
  "alianzas":"partnerships",

  /* ---------- Sectores de la tabla ---------- */
  "Salud y Protección Social":"Health and Social Protection",
  "Vivienda, Agua y Saneamiento":"Housing, Water and Sanitation",
  "Minas y Energía":"Mining and Energy",
  "Agricultura y Desarrollo Rural":"Agriculture and Rural Development",
  "Medio Ambiente y Desarrollo Sostenible":"Environment and Sustainable Development",
  "Transporte e Infraestructura Vial":"Transport and Road Infrastructure",
  "Comercio e Infraestructura Productiva":"Trade and Productive Infrastructure",
  "Cultura, Arte y Trabajo":"Culture, Arts and Work",
  "Deporte y Recreación":"Sport and Recreation",
  "Cobertura nacional":"Nationwide",
  "Territorio nacional":"National territory",
  "Varios municipios":"Several municipalities",

  /* ---------- Presentar proyecto ---------- */
  "Presenta tu proyecto · Corporación Protectora Verde":"Submit your project · Corporación Protectora Verde",
  "Presenta tu":"Submit your",
  "proyecto":"project",
  "Si tu organización tiene una iniciativa que transforma vidas, aquí te explicamos —paso a paso— cómo registrarla ante la Corporación Protectora Verde y qué documentos necesitas.":"If your organization has an initiative that transforms lives, here we explain — step by step — how to register it with Corporación Protectora Verde and what documents you need.",
  "Cómo funciona":"How it works",
  "Requisitos":"Requirements",
  "Formatos de descarga":"Downloadable forms",
  "Guía del formulario":"Form guide",
  "Preguntas frecuentes":"Frequently asked questions",
  "Enviar proyecto":"Submit project",
  "El proceso, en cinco pasos":"The process, in five steps",
  "De la idea al":"From idea to",
  "registro":"registration",
  "Ningún trámite escondido y ningún costo. Este es todo el camino, desde que revisas si tu iniciativa aplica hasta que recibes nuestra respuesta.":"No hidden paperwork and no cost. This is the whole path, from checking whether your initiative qualifies to receiving our answer.",
  "Revisa si aplicas":"Check whether you qualify",
  "Confirma que tu iniciativa encaja en alguna de nuestras nueve áreas de acción y que beneficia a una comunidad concreta del territorio colombiano.":"Confirm that your initiative fits one of our nine areas of action and benefits a specific community in Colombia.",
  "Descarga los formatos":"Download the forms",
  "Baja el":"Download the",
  "y los tres documentos del estudio SARLAFT. Están más abajo, listos para diligenciar.":"and the three SARLAFT screening documents. They are further down, ready to fill in.",
  "Formulario de Presentación de Proyecto":"Project Submission Form",
  "Diligencia el formulario":"Fill in the form",
  "Completa las once secciones. En la guía de esta página te explicamos qué espera cada una y cuánto detalle conviene dar.":"Complete the eleven sections. The guide on this page explains what each one expects and how much detail to give.",
  "Reúne los soportes SARLAFT":"Gather the SARLAFT supporting documents",
  "Certificado de Cámara de Comercio, RUT, cédula del representante legal, estados financieros y declaración de origen de fondos.":"Chamber of Commerce certificate, tax registration (RUT), the legal representative's ID, financial statements and a declaration of the source of funds.",
  "Envíalo y recibe respuesta":"Send it and get an answer",
  "Remite todo a":"Send everything to",
  "o escríbenos por WhatsApp. Te confirmamos la recepción y te contamos en qué etapa queda tu proyecto.":"or message us on WhatsApp. We confirm receipt and tell you what stage your project reaches.",
  "Antes de empezar":"Before you start",
  "Lo que necesitas":"What you need to",
  "saber":"know",
  "¿Quién puede presentar?":"Who can submit?",
  "Organizaciones sociales, juntas de acción comunal, asociaciones de productores, entidades territoriales, fundaciones, cooperativas y personas naturales con respaldo de una comunidad organizada.":"Social organizations, community action boards, producer associations, local governments, foundations, cooperatives and individuals backed by an organized community.",
  "¿Qué tipo de proyecto?":"What kind of project?",
  "Iniciativas en vivienda, salud, educación, agua y saneamiento, alimentación, agroindustria, energía, medio ambiente o emprendimiento, con beneficiarios identificables.":"Initiatives in housing, health, education, water and sanitation, food, agro-industry, energy, the environment or entrepreneurship, with identifiable beneficiaries.",
  "¿Qué evaluamos?":"What do we assess?",
  "Pertinencia del problema, claridad de los objetivos, coherencia del presupuesto, capacidad del equipo ejecutor y, sobre todo, sostenibilidad del impacto en el tiempo.":"How relevant the problem is, how clear the objectives are, how coherent the budget is, the implementing team's capacity and, above all, how sustainable the impact will be over time.",
  "¿Cuánto tarda?":"How long does it take?",
  "La revisión documental toma entre 10 y 15 días hábiles. Si el proyecto pasa a estudio, te acompañamos en la estructuración técnica y financiera.":"The document review takes 10 to 15 business days. If the project moves to study, we support you through the technical and financial structuring.",
  "Descargas":"Downloads",
  "Formatos oficiales de":"Official forms for",
  "Estos son los documentos que debes diligenciar y devolvernos. Descárgalos, complétalos y envíalos junto con los soportes. Cada tarjeta te dice para qué sirve el documento y si es obligatorio.":"These are the documents you must fill in and return to us. Download them, complete them and send them together with the supporting papers. Each card tells you what the document is for and whether it is mandatory.",
  "El documento central. Once secciones que recogen el problema, los objetivos, los beneficiarios, el plan de trabajo, los indicadores, el presupuesto, el equipo, la sostenibilidad y los riesgos de tu iniciativa.":"The core document. Eleven sections covering your initiative's problem, objectives, beneficiaries, work plan, indicators, budget, team, sustainability and risks.",
  "Documentos para Estudio SARLAFT — Persona Jurídica":"Documents for SARLAFT Screening — Legal Entities",
  "La lista de chequeo de todo lo que debes adjuntar: certificado de existencia y representación legal, RUT, cédula del representante, estados financieros, composición societaria y beneficiarios finales.":"The checklist of everything you must attach: certificate of existence and legal representation, tax registration (RUT), the representative's ID, financial statements, ownership structure and ultimate beneficial owners.",
  "Formato de Conocimiento SARLAFT — Persona Jurídica":"SARLAFT Know-Your-Client Form — Legal Entities",
  "Hoja de cálculo con los datos de identificación de la organización, su actividad económica, sus vinculados y su información financiera. Se diligencia y se firma por el representante legal.":"A spreadsheet with the organization's identification details, economic activity, related parties and financial information. It is filled in and signed by the legal representative.",
  "Declaración de Bienes y Origen de Fondos":"Declaration of Assets and Source of Funds",
  "Declaración juramentada sobre el origen de los recursos, los ingresos mensuales y los activos de la organización. Es el soporte antilavado que exige la normativa colombiana.":"A sworn statement on the source of funds, monthly income and assets of the organization. It is the anti-money-laundering document required by Colombian regulations.",
  "Obligatorio":"Mandatory",
  "11 secciones":"11 sections",
  "Lista de chequeo":"Checklist",
  "Léelo primero":"Read this first",
  "Excel editable":"Editable Excel",
  "Word editable":"Editable Word",
  "Descargar":"Download",
  "Un solo envío, todo junto.":"One single submission, everything together.",
  "Reúne el formulario diligenciado, los tres documentos SARLAFT y los soportes (Cámara de Comercio con menos de 3 meses, RUT, cédula del representante legal y estados financieros) en un mismo correo. Los envíos incompletos alargan la revisión.":"Gather the completed form, the three SARLAFT documents and the supporting papers (Chamber of Commerce certificate less than 3 months old, RUT, the legal representative's ID and financial statements) in a single email. Incomplete submissions slow the review down.",
  "Guía de diligenciamiento":"How to fill it in",
  "Cómo llenar el":"How to fill in the",
  "formulario":"form",
  "El formulario tiene once secciones. Aquí te explicamos qué espera cada una, con ejemplos tomados de proyectos que ya hemos estructurado. Despliega la que necesites.":"The form has eleven sections. Here we explain what each one expects, with examples taken from projects we have already structured. Expand the one you need.",
  "Encabezado e identificación":"Header and identification",
  "Nombre del proyecto, organización responsable, fecha, persona de contacto con cargo, teléfono/WhatsApp y correo. Si tienes página web o redes, inclúyelas.":"Project name, responsible organization, date, contact person with their role, phone/WhatsApp and email. If you have a website or social media, include them.",
  "El nombre debe decir":"The name should say",
  "se hace,":"is done,",
  "dónde":"where",
  "para quién":"for whom",
  ". Ejemplo: «Construcción de sistemas solares fotovoltaicos para 32 comunidades rurales de Timaná, Huila».":". Example: \"Construction of photovoltaic solar systems for 32 rural communities in Timaná, Huila\".",
  "Usa un correo que revises a diario: por ahí te responderemos.":"Use an email address you check daily: that is where we will reply.",
  "1. Resumen ejecutivo":"1. Executive summary",
  "Máximo 300 palabras. Es lo primero (y a veces lo único) que lee un evaluador, así que escríbelo al final, cuando ya tengas claro todo lo demás.":"300 words maximum. It is the first thing (and sometimes the only thing) an assessor reads, so write it last, once everything else is clear.",
  "Qué problema aborda el proyecto.":"What problem the project addresses.",
  "Cuál es la solución propuesta.":"What the proposed solution is.",
  "Cuál es el impacto esperado, en números.":"What the expected impact is, in numbers.",
  "2. Descripción del problema":"2. Description of the problem",
  "La situación actual que quieres cambiar, la zona geográfica, a quiénes afecta y por qué es urgente actuar ahora.":"The current situation you want to change, the geographic area, who it affects and why it is urgent to act now.",
  "Respalda con datos: censos, actas comunitarias, estadísticas del DANE o del municipio, fotografías, testimonios.":"Back it up with data: censuses, community minutes, statistics from DANE or the municipality, photographs, testimonies.",
  "Evita generalidades como «hay mucha pobreza». Di cuántas familias, en qué veredas y desde cuándo.":"Avoid generalities such as \"there is a lot of poverty\". Say how many families, in which hamlets and since when.",
  "3. Objetivos":"3. Objectives",
  "Un objetivo general en una sola frase, y entre 3 y 6 objetivos específicos.":"One general objective in a single sentence, and between 3 and 6 specific objectives.",
  "Empieza cada uno con un verbo en infinitivo: implementar, construir, capacitar, fortalecer.":"Start each one with a verb: implement, build, train, strengthen.",
  "Cada objetivo específico debe poder verificarse al terminar el proyecto.":"Each specific objective must be verifiable when the project ends.",
  "4. Beneficiarios":"4. Beneficiaries",
  "Separa beneficiarios directos e indirectos, con número aproximado y descripción, y explica por qué son prioritarios.":"Separate direct and indirect beneficiaries, with approximate numbers and a description, and explain why they are a priority.",
  "Directos: quienes reciben el bien o el servicio.":"Direct: those who receive the goods or the service.",
  "Indirectos: el resto de la comunidad que se favorece.":"Indirect: the rest of the community that benefits.",
  "Desagrega por sexo, edad y condición (víctimas, población indígena, madres cabeza de familia) cuando aplique.":"Break the figures down by sex, age and status (conflict victims, Indigenous population, single mothers) where applicable.",
  "5. Actividades y plan de trabajo":"5. Activities and work plan",
  "Lista de actividades con descripción breve, meses de ejecución y responsables.":"A list of activities with a short description, months of execution and those responsible.",
  "Ordena las actividades en el tiempo, no por importancia.":"Order the activities by time, not by importance.",
  "Si una actividad depende de otra, dilo: ayuda a entender el cronograma.":"If one activity depends on another, say so: it helps make sense of the schedule.",
  "6. Resultados e indicadores":"6. Results and indicators",
  "Los resultados concretos y cómo medirás el éxito, con indicadores cuantitativos y cualitativos.":"The concrete results and how you will measure success, with quantitative and qualitative indicators.",
  "Un buen indicador tiene cantidad, calidad, tiempo y lugar.":"A good indicator states quantity, quality, time and place.",
  "Ejemplo: «400 hectáreas de ñame sembradas y en producción por 200 familias del municipio de Chigorodó al mes 18».":"Example: \"400 hectares of yam planted and in production by 200 families in the municipality of Chigorodó by month 18\".",
  "7. Presupuesto resumido":"7. Summary budget",
  "Monto total solicitado y desglose por rubro con su porcentaje: personal, materiales, transporte, capacitaciones, monitoreo y otros. El total debe sumar 100 %.":"Total amount requested and a breakdown by line item with percentages: staff, materials, transport, training, monitoring and other. The total must add up to 100%.",
  "Indica si cuentas con cofinanciación o fondos propios, con monto y fuente.":"State whether you have co-funding or own funds, with the amount and source.",
  "Si tienes un presupuesto detallado, adjúntalo como anexo.":"If you have a detailed budget, attach it as an annex.",
  "8. Equipo ejecutor":"8. Implementing team",
  "Quiénes ejecutarán el proyecto, su experiencia relevante y cuántas personas son.":"Who will carry out the project, their relevant experience and how many people they are.",
  "No hace falta un currículo largo: dos o tres líneas por persona clave bastan.":"No need for a long CV: two or three lines per key person is enough.",
  "Menciona proyectos anteriores similares, si los hay.":"Mention similar previous projects, if there are any.",
  "9. Sostenibilidad y legado":"9. Sustainability and legacy",
  "Cómo se mantendrá el impacto una vez termine el proyecto y qué capacidades locales quedan instaladas.":"How the impact will be sustained once the project ends and what local capacity is left behind.",
  "Es una de las secciones que más pesa en la evaluación.":"It is one of the sections that weighs most in the assessment.",
  "Habla de quién opera y mantiene lo entregado, y con qué recursos.":"Say who will operate and maintain what is delivered, and with what resources.",
  "10. Riesgos y plan de mitigación":"10. Risks and mitigation plan",
  "Los principales riesgos identificados y las medidas concretas para reducirlos.":"The main risks identified and the concrete measures to reduce them.",
  "Piensa en riesgos climáticos, de orden público, de mercado y de rotación del equipo.":"Think about climate, public-order, market and staff-turnover risks.",
  "Reconocer un riesgo no debilita el proyecto: lo hace creíble.":"Acknowledging a risk does not weaken the project: it makes it credible.",
  "11. Anexos y declaración final":"11. Annexes and final declaration",
  "Opcionales pero muy recomendables: fotografías de la zona o los beneficiarios, cartas de apoyo de la comunidad, hojas de vida del equipo y presupuesto detallado.":"Optional but strongly recommended: photographs of the area or the beneficiaries, letters of support from the community, team CVs and a detailed budget.",
  "Cierra con la declaración final firmada (firma manuscrita escaneada o firma digital) y la fecha.":"Close with the signed final declaration (a scanned handwritten signature or a digital signature) and the date.",
  "Dudas frecuentes":"Common questions",
  "Preguntas":"Frequently asked",
  "frecuentes":"questions",
  "¿Tiene algún costo presentar un proyecto?":"Is there any cost to submit a project?",
  "No. La presentación, la revisión documental y el concepto que emitimos son gratuitos. La Corporación nunca solicita pagos para estudiar una iniciativa.":"No. Submission, the document review and the opinion we issue are free of charge. The Corporation never asks for payment to study an initiative.",
  "¿Puedo presentar si soy persona natural?":"Can I submit as an individual?",
  "Sí, siempre que el proyecto beneficie a una comunidad organizada y cuentes con su respaldo por escrito. Ten en cuenta que los formatos SARLAFT publicados aquí son los de persona jurídica; si es tu caso, escríbenos y te enviamos los de persona natural.":"Yes, as long as the project benefits an organized community and you have its written backing. Note that the SARLAFT forms published here are for legal entities; if that is your case, write to us and we will send you the ones for individuals.",
  "¿Qué pasa después de enviar los documentos?":"What happens after I send the documents?",
  "Confirmamos la recepción, revisamos que la documentación esté completa y, si lo está, el proyecto entra a":"We confirm receipt, check that the documentation is complete and, if it is, the project moves to",
  ". Desde ahí puede avanzar a viable, aprobado, financiado y ejecución. Puedes seguir el ciclo completo en la página de":". From there it can advance to viable, approved, funded and execution. You can follow the whole cycle on the",
  "¿Presentar un proyecto garantiza financiación?":"Does submitting a project guarantee funding?",
  "No. La aprobación depende del estudio técnico, financiero y jurídico, y de la disponibilidad de recursos de las fuentes de cooperación con las que trabajamos. Lo que sí garantizamos es una revisión seria y una respuesta clara.":"No. Approval depends on the technical, financial and legal study, and on the availability of resources from the cooperation sources we work with. What we do guarantee is a serious review and a clear answer.",
  "¿Puedo enviar el formulario en otro formato?":"Can I send the form in another format?",
  "Preferimos el formato oficial porque agiliza la revisión, pero si ya tienes el proyecto estructurado en otro documento (MGA, marco lógico, formato de un cooperante), envíalo y lo revisamos igual.":"We prefer the official form because it speeds up the review, but if you already have the project structured in another document (MGA, logical framework, a funder's template), send it and we will review it all the same.",
  "¿Cómo protegen la información que envío?":"How do you protect the information I send?",
  "Último paso":"Last step",
  "Envíanos tu":"Send us your",
  "Escríbenos con los documentos adjuntos. Si prefieres, cuéntanos primero de qué se trata por WhatsApp y te orientamos antes de que diligencies nada.":"Write to us with the documents attached. If you prefer, tell us what it is about on WhatsApp first and we will guide you before you fill in anything.",
  "Envía los documentos a":"Send the documents to",
  "Adjunta":"Attach",
  "Formulario diligenciado · Formato de conocimiento SARLAFT · Declaración de bienes y origen de fondos · Cámara de Comercio · RUT · Cédula · Estados financieros":"Completed form · SARLAFT know-your-client form · Declaration of assets and source of funds · Chamber of Commerce certificate · RUT · ID · Financial statements",
  "Tiempo de respuesta":"Response time",
  "Entre 10 y 15 días hábiles desde la recepción completa":"10 to 15 business days from complete receipt",
  "¿Prefieres hablarlo primero?":"Would you rather talk it through first?",
  "Cuéntanos tu idea por WhatsApp y te decimos si aplica antes de que llenes un solo campo.":"Tell us your idea on WhatsApp and we'll say whether it qualifies before you fill in a single field.",
  "Presentación de proyecto":"Project submission",
  "Consulta sobre los formatos":"Question about the forms",
  "Estado de un proyecto ya presentado":"Status of a project already submitted",
  "Alianza o cooperación":"Partnership or cooperation",
  "Cuéntanos de tu proyecto":"Tell us about your project",
  "Nombre del proyecto, municipio, población beneficiada y qué problema resuelve…":"Project name, municipality, population served and the problem it solves…",

  /* ---------- Unidades y varios ---------- */
  "Descripción":"Description",
  "PDF":"PDF", "DOCX":"DOCX", "XLSX":"XLSX",
  "145 KB":"145 KB", "148 KB":"148 KB", "101 KB":"101 KB", "1,8 MB":"1.8 MB",
  "10 Ejes":"10 Pillars",
  "corporacionprotectoraverde.ong":"corporacionprotectoraverde.ong",
  "corpoteverde@gmail.com":"corpoteverde@gmail.com",

  /* ---------- Piezas del showcase de video ---------- */
  "Portafolio completo":"Full portfolio",
  "Todos los proyectos radicados ante la Corporación, con su etapa en el ciclo.":"Every project filed with the Corporation, with its stage in the cycle.",
  "Iniciativas radicadas que están en formulación o estructuración técnica y financiera. Al superar esta etapa pasan a viables.":"Filed initiatives being formulated or structured technically and financially. Once they clear this stage they move to viable.",
  "mil millones":"billion",

  "Proyectos en estudio":"Projects under study",
  "Proyectos aprobados":"Approved projects",
  "Proyectos avalados por el equipo técnico y aprobados por la mesa internacional. Pasan a la fase de financiación y ejecución.":"Projects endorsed by the technical team and approved by the international board. They move on to the funding and delivery phase.",
  "Iniciativas que ya fueron radicadas y están en formulación o estructuración técnica y financiera. Al superar esta etapa pasan a":"Initiatives already filed that are being formulated or structured technically and financially. Once they clear this stage they move to",
  "Por ahora no hay proyectos en esta etapa.":"There are no projects at this stage yet.",
  "Valor":"Value",

  "A la orilla del río":"At the riverbank",
  "Niñas, niños y familias recorriendo la ribera durante una jornada en comunidad.":"Children and families walking along the riverbank during a community field day.",

  "Camino hacia la comunidad":"The way to the community",
  "Cruce del puente de troncos para llegar a las comunidades del interior.":"Crossing the log bridge to reach the inland communities.",
  "Trocha adentro":"Deep into the trail",
  "El último tramo del camino, a pie y cargando las provisiones.":"The last stretch of the journey, on foot and carrying the supplies.",
  "Presentar un proyecto":"Submit a project",

  /* ---------- Rediseño 2026: mapa, hero y formatos ---------- */
  ", los tres documentos del estudio SARLAFT y revisa el instructivo oficial. Están más abajo, listos para diligenciar.":", the three SARLAFT screening documents, and read the official instructions. They are further down, ready to fill in.",
  "248 KB":"248 KB",
  "Documento técnico y presupuesto del proyecto, certificado de Cámara de Comercio, RUT, cédula del representante legal, estados financieros y declaración de origen de fondos.":"The project's technical document and budget, Chamber of Commerce certificate, tax registration (RUT), the legal representative's ID, financial statements and a declaration of the source of funds.",
  "Ejemplo":"Example",
  "Ejemplo del formulario diligenciado":"Sample of the completed form",
  "El mismo formulario, completado de principio a fin con un proyecto de muestra, para que veas el nivel de detalle que esperamos en cada sección. Es material de referencia: no corresponde a una postulación real.":"The same form, filled in from start to finish with a sample project, so you can see the level of detail we expect in each section. It is reference material: it does not correspond to a real submission.",
  "Formulario de presentación diligenciado · Documento técnico del proyecto · Presupuesto del proyecto · Formato de conocimiento SARLAFT · Declaración de bienes y origen de fondos · Cámara de Comercio · RUT · Cédula · Estados financieros":"Completed submission form · Project technical document · Project budget · SARLAFT know-your-client form · Declaration of assets and source of funds · Chamber of Commerce certificate · RUT · ID · Financial statements",
  "Información para el Registro de Proyectos":"Instructions for Registering a Project",
  "Instructivo":"Instructions",
  "La instrucción oficial de la Corporación: a qué correo se radica, qué seis documentos se deben adjuntar y qué ocurre si el proyecto se aprueba técnica y financieramente. Empieza por aquí.":"The Corporation's official instructions: which address to file to, which six documents to attach, and what happens if the project is approved technically and financially. Start here.",
  "Modelo":"Template",
  "Nuestro trabajo en territorio":"Our work in the field",
  "Referencia":"Reference",
  "Reúne el formulario diligenciado, el documento técnico y el presupuesto del proyecto, los tres documentos SARLAFT y los soportes (Cámara de Comercio con menos de 3 meses, RUT, cédula del representante legal y estados financieros) en un mismo correo. Los envíos incompletos alargan la revisión.":"Gather the completed form, the project's technical document and budget, the three SARLAFT documents and the supporting papers (Chamber of Commerce certificate less than 3 months old, RUT, the legal representative's ID and financial statements) in a single email. Incomplete submissions slow the review down.",
  "Ver el video":"Watch the video",
  "Ver el video del territorio":"Watch the video from the field",
  "Ver nuestros proyectos":"See our projects",
  "Menor":"Lower",
  "Mayor":"Higher",
  "Pasa el cursor o toca un departamento para ver su detalle. Los departamentos en gris todavía no tienen proyectos registrados.":"Hover over or tap a department to see its detail. Departments shown in grey have no registered projects yet.",
  "Métrica del mapa":"Map metric",
  "Sin proyectos registrados por ahora":"No registered projects yet",
  "Mapa de Colombia por departamentos con la intensidad de los proyectos de la Corporación":"Map of Colombia by department showing the intensity of the Corporation's projects",
  "La intensidad del color muestra dónde se concentra nuestro trabajo.":"Colour intensity shows where our work is concentrated.",

  /* ---------- Secciones del formulario (sin el número) ---------- */
  "Resumen ejecutivo":"Executive summary",
  "Descripción del problema":"Description of the problem",
  "Objetivos":"Objectives",
  "Beneficiarios":"Beneficiaries",
  "Actividades y plan de trabajo":"Activities and work plan",
  "Resultados e indicadores":"Results and indicators",
  "Presupuesto resumido":"Summary budget",
  "Equipo ejecutor":"Implementing team",
  "Sostenibilidad y legado":"Sustainability and legacy",
  "Riesgos y plan de mitigación":"Risks and mitigation plan",
  "Anexos y declaración final":"Annexes and final declaration",

  /* ---------- Migas de pan, iniciales y cifras ---------- */
  "› Nosotros":"› About us",
  "› Qué hacemos":"› What we do",
  "› Proyectos":"› Projects",
  "› Alianzas":"› Partnerships",
  "› Presenta tu proyecto":"› Submit your project",
  "CEO · Representante Legal":"CEO · Legal Representative",
  "Trabajo":"Work",
  "qué":"what",
  "$1,85 billones":"$1.85 trillion",
  " billones":" trillion",
  "billones":"trillion",

  /* --- contenidos de septiembre de 2026 --- */
  "Participación":"Participation",
  "Cultura":"Culture",
  "Entregas":"Deliveries",
  "Convivencia":"Community life",
  "La jornada empieza en la escuela de la vereda, con toda la niñez de la comunidad":"The day starts at the village school, with every child in the community",
  "Asambleas abiertas: las decisiones se toman con la comunidad":"Open assemblies: decisions are made with the community",
  "Asambleas abiertas: las decisiones se toman con la comunidad, no por ella":"Open assemblies: decisions are made with the community, not for it",
  "Jornadas con la niñez del territorio":"Field days with the children of the territory",
  "Jornadas recreativas y culturales en la plaza del municipio":"Recreational and cultural events in the town square",
  "Olla comunitaria: la jornada también se comparte en la mesa":"Community kitchen: the day is also shared at the table",
  "Entrega de material didáctico y kits escolares a la niñez":"Handing out learning materials and school kits to children",
  "Talleres de creatividad y lectura":"Creativity and reading workshops",
  "Encuentros abiertos con las familias de las veredas":"Open gatherings with the families of the rural districts",
  "Niñas y niños en fila frente a la escuela de madera de una comunidad rural":"Children lined up in front of the wooden schoolhouse of a rural community",
  "Asamblea comunitaria al aire libre con asistentes levantando la mano":"Open-air community assembly with attendees raising their hands",
  "Tres niñas sonriendo durante una actividad comunitaria":"Three girls smiling during a community activity",
  "Familias compartiendo un almuerzo comunitario sentadas en bancas de madera":"Families sharing a community lunch seated on wooden benches",
  "Presentación artística ante vecinos reunidos en la plaza de un municipio":"A performance for neighbours gathered in a town square",
  "Grupo de niñas y niños mostrando el material recibido en la jornada":"A group of children showing the materials they received during the event",
  "Vecinos reunidos en círculo sobre bancas de madera en una explanada":"Neighbours gathered in a circle on wooden benches in an open field",
  "Recreación en el campo":"Recreation in the countryside",
  "Juegos y deporte con niñas, niños y familias durante una jornada comunitaria.":"Games and sport with children and families during a community day.",
  "Jornada de integración":"Community gathering",
  "Llegada de las familias y preparación del almuerzo comunitario en la explanada.":"Families arriving and the community lunch being prepared in the field.",
  "Taller con la niñez":"Workshop with children",
  "Actividades de lectura y dibujo con las niñas y niños de la comunidad.":"Reading and drawing activities with the children of the community.",
  "Brochure":"Brochure",
  "Brochure institucional":"Institutional brochure",
  "Documento institucional":"Institutional document",
  "Toda la Corporación en":"The whole Corporation in",
  "siete páginas":"seven pages",
  "La presentación oficial de la Corporación Protectora Verde: identidad, propósito, modelo de trabajo, programas y portafolio de proyectos. Pensado para compartir con aliados, cooperantes y entidades territoriales.":"The official presentation of Corporación Protectora Verde: identity, purpose, working model, programmes and project portfolio. Made to share with allies, cooperation agencies and local authorities.",
  "Identidad":"Identity",
  "Quiénes somos, NIT, representación legal y cobertura.":"Who we are, tax ID, legal representation and coverage.",
  "Propósito":"Purpose",
  "Misión, visión 2030, valores y los cuatro pilares.":"Mission, 2030 vision, values and the four pillars.",
  "Modelo integral":"Integrated model",
  "Los diez ejes estratégicos que ordenan el trabajo.":"The ten strategic axes that organise our work.",
  "Las nueve áreas de acción, una a una.":"The nine areas of action, one by one.",
  "Portafolio":"Portfolio",
  "El alcance de los proyectos activados y presentados.":"The scope of the activated and submitted projects.",
  "Cómo presentar un proyecto, aliarse o aportar.":"How to submit a project, partner with us or contribute.",
  "Descargar el brochure (PDF · 1.5 MB)":"Download the brochure (PDF · 1.5 MB)",
  "Corporación Protectora Verde · Colombia":"Corporación Protectora Verde · Colombia",
  "Brochure Institucional":"Institutional Brochure",
  "Los 9 pasos":"The 9 steps",
  "El proceso oficial, en tres fases":"The official process, in three phases",
  "De la idea a la":"From the idea to",
  "Ningún trámite escondido y ningún costo. La Corporación organiza el registro de proyectos en tres fases; cada una tiene sus documentos y su propio momento de respuesta.":"No hidden paperwork and no cost. The Corporation organises project registration in three phases; each one has its own documents and its own moment of response.",
  "Presentación del proyecto":"Project submission",
  "Registra o presenta tu proyecto al correo":"Register or submit your project to the address",
  ". En ese primer envío deben ir tres piezas, ni una menos.":". That first email must carry three pieces, not one less.",
  "Formulario de Presentación de Proyectos de la Corporación":"The Corporation's Project Submission Form",
  "Documento técnico del proyecto":"Technical document of the project",
  "Presupuesto del proyecto":"Project budget",
  "Viabilización y aprobación":"Feasibility review and approval",
  "Revisado el proyecto y declarado viable y aprobado técnica y financieramente, la entidad responsable y ejecutora diligencia y envía al mismo correo los documentos de conocimiento y estudio":"Once the project has been reviewed and declared feasible and approved technically and financially, the responsible and implementing organisation fills in and sends to the same address the due-diligence and study documents",
  "Formato de conocimiento SARLAFT persona jurídica":"SARLAFT know-your-client form for legal entities",
  "Declaración de bienes y origen de fondos":"Declaration of assets and source of funds",
  "Soportes del estudio SARLAFT":"Supporting documents for the SARLAFT study",
  "Financiación y ejecución":"Funding and delivery",
  "Aprobado el proyecto, la entidad ejecutora presenta los documentos financieros y jurídicos para la apertura de la cuenta internacional y accede a la transferencia de recursos de la fase de ejecución.":"Once the project is approved, the implementing organisation submits the financial and legal documents to open the international account and access the transfer of funds for the delivery phase.",
  "Documentos financieros de la entidad ejecutora":"Financial documents of the implementing organisation",
  "Documentos jurídicos y de representación legal":"Legal and legal-representation documents",
  "Cronogramas físico, financiero y jurídico":"Physical, financial and legal schedules",
  "Diagrama oficial":"Official diagram",
  "Los nueve pasos,":"The nine steps,",
  "uno por uno":"one by one",
  "Este es el recorrido completo que sigue cada iniciativa dentro de la Corporación, desde que llega al correo hasta que arranca la obra. Es el mismo diagrama que publicamos en el documento oficial.":"This is the full route every initiative follows inside the Corporation, from the moment it lands in our inbox until work begins. It is the same diagram we publish in the official document.",
  "Fase 1 · Presentación":"Phase 1 · Submission",
  "Fase 2 · Viabilización y aprobación":"Phase 2 · Feasibility and approval",
  "Fase 3 · Financiación y ejecución":"Phase 3 · Funding and delivery",
  "Subir el proyecto al correo":"Send the project by email",
  "Envías la iniciativa y sus anexos a corpoteverde@gmail.com. Ese correo es la puerta de entrada oficial: no hay otro canal de radicación.":"You send the initiative and its attachments to corpoteverde@gmail.com. That address is the official entry point: there is no other filing channel.",
  "Verificación de la información":"Verification of the information",
  "Corpoteverde evalúa el envío y verifica el estado de la información requerida. Si falta algo, te lo pedimos antes de continuar.":"Corpoteverde assesses the submission and verifies the status of the required information. If something is missing, we ask for it before moving on.",
  "Aval del equipo técnico":"Endorsement by the technical team",
  "El equipo técnico encargado de la Corporación estudia el proyecto y lo avala.":"The Corporation's technical team studies the project and endorses it.",
  "Presentación a la mesa internacional":"Presentation to the international board",
  "Una vez avalado, el proyecto se presenta a la mesa internacional de aprobación de proyectos.":"Once endorsed, the project is presented to the international project approval board.",
  "Cumplimiento de estándares":"Compliance with standards",
  "Se confirma que el proyecto cumple todos los ítems y estándares internacionales exigidos para la asignación de recursos.":"The project is confirmed to meet every item and international standard required for funds to be allocated.",
  "Revisión de la entidad ejecutora":"Review of the implementing organisation",
  "Corpoteverde revisa a la empresa que ejecutará y desarrollará el proyecto: cumplimiento jurídico, financiero y SARLAFT.":"Corpoteverde reviews the company that will carry out and deliver the project: legal, financial and SARLAFT compliance.",
  "Cargue en la plataforma":"Upload to the platform",
  "Verificados los cumplimientos anteriores, Corpoteverde envía un enlace para que la entidad cargue el proyecto en nuestra plataforma.":"Once the above is verified, Corpoteverde sends a link so the organisation can upload the project to our platform.",
  "Verificación de cronogramas":"Verification of the schedules",
  "Revisión y verificación de los cronogramas físico, financiero y jurídico del proyecto.":"Review and verification of the project's physical, financial and legal schedules.",
  "Desarrollo y ejecución":"Development and delivery",
  "Inicia el desarrollo y la ejecución del proyecto por parte de la entidad que lo presenta.":"The organisation that submitted the project begins its development and delivery.",
  "¿Prefieres tenerlo a mano?":"Would you rather keep it at hand?",
  "Descarga el documento oficial con las tres fases y el diagrama completo de los nueve pasos.":"Download the official document with the three phases and the full nine-step diagram.",
  "Descargar el proceso (PDF)":"Download the process (PDF)",
  "La instrucción oficial de la Corporación: a qué correo se radica, qué documentos exige cada una de las tres fases y el diagrama completo del proceso de presentación, evaluación y ejecución en nueve pasos. Empieza por aquí.":"The Corporation's official instructions: the address to file with, the documents each of the three phases requires, and the full nine-step diagram of the submission, review and delivery process. Start here.",
  "Instructivo + diagrama":"Instructions + diagram",
  "204 KB":"204 KB",
  "Cada documento, en su fase.":"Each document in its own phase.",
  "El primer correo lleva solo tres piezas: el formulario diligenciado, el documento técnico y el presupuesto del proyecto. Los documentos SARLAFT y sus soportes (Cámara de Comercio con menos de 3 meses, RUT, cédula del representante legal y estados financieros) se presentan en la segunda fase, cuando el proyecto ya fue declarado viable. Aun así, descárgalos desde ya: los envíos incompletos alargan la revisión.":"The first email carries only three pieces: the completed form, the technical document and the project budget. The SARLAFT documents and their supporting papers (chamber of commerce certificate less than 3 months old, tax registration, the legal representative's ID and financial statements) are submitted in the second phase, once the project has been declared feasible. Download them now anyway: incomplete submissions slow the review down.",
  "Estos son los documentos que debes diligenciar y devolvernos. Cada tarjeta te dice para qué sirve el documento, en qué fase del proceso se pide y si es obligatorio.":"These are the documents you need to fill in and send back. Each card tells you what the document is for, which phase of the process asks for it and whether it is mandatory."
  };

  /* ==========================================================================
     MOTOR
     ====================================================================== */
  var ORIG = new WeakMap();          /* nodo → texto original en español */
  var ORIG_ATTR = new WeakMap();     /* elemento → {atributo: valor original} */
  var ATRIBUTOS = ['placeholder','title','aria-label','alt'];
  var OMITIR = {SCRIPT:1, STYLE:1, NOSCRIPT:1, TEXTAREA:1, CODE:1, svg:1};
  var idioma = 'es';
  var observador = null;

  function omitible(el){
    while(el){
      if(el.nodeType === 1){
        if(OMITIR[el.tagName] || el.tagName === 'svg') return true;
        if(el.hasAttribute && el.hasAttribute('data-no-traducir')) return true;
      }
      el = el.parentNode;
    }
    return false;
  }

  function traducirNodo(nodo, hacia){
    var bruto = nodo.nodeValue;
    if(!bruto || !/\S/.test(bruto)) return;

    if(hacia === 'es'){
      if(ORIG.has(nodo)) nodo.nodeValue = ORIG.get(nodo);
      return;
    }
    var m = bruto.match(/^(\s*)([\s\S]*?)(\s*)$/);
    var pre = m[1], cuerpo = m[2].replace(/\s+/g,' '), post = m[3];
    var t = DIC[cuerpo];
    if(t === undefined) return;
    if(!ORIG.has(nodo)) ORIG.set(nodo, bruto);
    nodo.nodeValue = pre + t + post;
  }

  function traducirAtributos(el, hacia){
    for(var i=0;i<ATRIBUTOS.length;i++){
      var a = ATRIBUTOS[i];
      if(!el.hasAttribute || !el.hasAttribute(a)) continue;
      if(hacia === 'es'){
        var g = ORIG_ATTR.get(el);
        if(g && g[a] !== undefined) el.setAttribute(a, g[a]);
        continue;
      }
      var v = el.getAttribute(a);
      var t = DIC[v.replace(/\s+/g,' ').trim()];
      if(t === undefined) continue;
      var g2 = ORIG_ATTR.get(el) || {};
      if(g2[a] === undefined){ g2[a] = v; ORIG_ATTR.set(el, g2); }
      el.setAttribute(a, t);
    }
  }

  function recorrer(raiz, hacia){
    if(raiz.nodeType === 3){ if(!omitible(raiz.parentNode)) traducirNodo(raiz, hacia); return; }
    if(raiz.nodeType !== 1 || omitible(raiz)) return;

    traducirAtributos(raiz, hacia);
    var it = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null, false);
    var n;
    while((n = it.nextNode())){
      if(n.nodeType === 1){
        if(OMITIR[n.tagName] || n.tagName === 'svg' ||
           (n.hasAttribute && n.hasAttribute('data-no-traducir'))) continue;
        traducirAtributos(n, hacia);
      } else {
        if(!omitible(n.parentNode)) traducirNodo(n, hacia);
      }
    }
  }

  function aplicar(hacia){
    if(observador) observador.disconnect();
    recorrer(document.body, hacia);
    document.documentElement.setAttribute('lang', hacia);

    /* Título y descripción de la página */
    if(hacia === 'en'){
      if(!document.title.__orig){
        var t = DIC[document.title.replace(/\s+/g,' ').trim()];
        if(t){ aplicar._tituloEs = document.title; document.title = t; }
      }
      var md = document.querySelector('meta[name="description"]');
      if(md && DIC[md.content]){ aplicar._descEs = md.content; md.content = DIC[md.content]; }
    } else {
      if(aplicar._tituloEs) document.title = aplicar._tituloEs;
      var md2 = document.querySelector('meta[name="description"]');
      if(md2 && aplicar._descEs) md2.content = aplicar._descEs;
    }

    if(observador) observador.observe(document.body, {childList:true, subtree:true});
  }

  function marcarBotones(){
    var bs = document.querySelectorAll('[data-lang]');
    for(var i=0;i<bs.length;i++){
      var on = bs[i].getAttribute('data-lang') === idioma;
      bs[i].classList.toggle('on', on);
      bs[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }

  function cambiar(nuevo, guardar){
    if(nuevo === idioma) return;
    idioma = nuevo;
    aplicar(idioma);
    marcarBotones();
    if(guardar !== false){
      try{ localStorage.setItem('cpv-idioma', idioma); }catch(e){}
    }
    /* Avisa al resto de la interfaz (contadores, mapa) que cambió el idioma */
    try{
      document.dispatchEvent(new CustomEvent('cpv:idioma', {detail:{idioma:idioma}}));
    }catch(e){
      var ev = document.createEvent('Event');
      ev.initEvent('cpv:idioma', true, true);
      document.dispatchEvent(ev);
    }
  }

  /* ---- Detección: español si el navegador o la zona horaria son de habla
     hispana / colombiana; inglés en cualquier otro caso. ------------------ */
  function detectar(){
    /* 1. Un enlace explícito manda sobre todo lo demás: ?lang=en o #lang=en.
       Sirve para compartir la versión en inglés directamente. */
    var url = (location.search + ' ' + location.hash).match(/lang=(es|en)/i);
    if(url) return url[1].toLowerCase();

    /* 2. Lo que el visitante eligió la última vez. */
    var guardado = null;
    try{ guardado = localStorage.getItem('cpv-idioma'); }catch(e){}
    if(guardado === 'es' || guardado === 'en') return guardado;

    var idiomas = (navigator.languages && navigator.languages.length)
                  ? navigator.languages : [navigator.language || 'es'];
    for(var i=0;i<idiomas.length;i++){
      if(/^es\b/i.test(idiomas[i])) return 'es';
    }
    try{
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if(tz === 'America/Bogota') return 'es';
    }catch(e){}
    return 'en';
  }

  /* ---- Arranque --------------------------------------------------------- */
  function iniciar(){
    /* Re-traduce lo que se pinte después (tabla, mapa, carruseles) */
    if(window.MutationObserver){
      observador = new MutationObserver(function(muts){
        if(idioma !== 'en') return;
        observador.disconnect();
        for(var i=0;i<muts.length;i++){
          var añadidos = muts[i].addedNodes;
          for(var j=0;j<añadidos.length;j++) recorrer(añadidos[j], 'en');
        }
        observador.observe(document.body, {childList:true, subtree:true});
      });
    }

    document.addEventListener('click', function(e){
      var b = e.target.closest && e.target.closest('[data-lang]');
      if(!b) return;
      e.preventDefault();
      cambiar(b.getAttribute('data-lang'), true);
    });

    var elegido = detectar();
    idioma = 'es';
    marcarBotones();
    if(elegido === 'en') cambiar('en', false);
    else if(observador) observador.observe(document.body, {childList:true, subtree:true});
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();

  /* Expuesto por si hace falta traducir algo desde otro script */
  window.CPV_I18N = {
    idioma: function(){ return idioma; },
    cambiar: cambiar,
    aplicar: function(){ aplicar(idioma); },
    diccionario: DIC
  };
})();
