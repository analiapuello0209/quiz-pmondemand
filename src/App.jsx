import { useState, useEffect } from "react";

/*
  TOMANDO EL CONTROL — Lead Magnet Quiz
  PM On Demand · Analía Puello
  
  12 preguntas + nombre + rol
  5 perfiles + 1 optimizador
  Costo del caos calculado
  Google Sheets integration
  Ticket de descuento con código único
*/

// ═══ BRAND ═══
const B = {
  purple: "#815DFF", purpleMid: "#9E73AB", purpleDark: "#686087",
  lavender: "#EFE8F1", lime: "#D9ED92", yellow: "#FEE440",
  dark: "#1C1835", text: "#2D2944", gray: "#6B6580", white: "#FDFBFF",
};

// ═══ PROFILES ═══
const PROFILES = {
  fire: {
    name: "Apagafuegos", emoji: "🔥", color: "#E8734A",
    desc: "Vives respondiendo a lo urgente de otros. Tu día lo controlan las interrupciones, no tus decisiones.",
    pattern: "Confundes urgencia con importancia. Eisenhower demostró que lo urgente rara vez es importante — pero se siente importante porque grita más fuerte.",
    frog: "Tu tarea más importante no es lo urgente — es lo importante que llevas postergando porque siempre hay un fuego que apagar.",
    tips: [
      "Mañana, antes de abrir email o WhatsApp, dedica 20 minutos a tu tarea más importante. Solo 20. Las urgencias pueden esperar ese tiempo.",
      "Cuando alguien te traiga algo 'urgente', pregunta: '¿Qué pasa si esto se hace en 4 horas en vez de ahora?' El 80% de las veces, nada.",
      "Bloquea 1 hora en tu calendario como 'reunión' contigo mismo/a. Ponla como ocupado/a. Es tu hora de trabajo real.",
    ],
  },
  perfect: {
    name: "Perfeccionista", emoji: "✨", color: "#7B6BDB",
    desc: "Dedicas 3 horas a algo que podría tomar 1. Todo tiene que quedar 'perfecto' antes de soltarlo.",
    pattern: "Confundes calidad con perfección. Pareto demostró que el 80% del resultado viene del 20% del esfuerzo. Ese último 20% de 'perfección' te cuesta el 80% del tiempo.",
    frog: "Probablemente es algo que has estado puliendo en vez de soltar. El coraje está en entregar, no en perfeccionar.",
    tips: [
      "Antes de empezar cualquier tarea, define: '¿Cuál es el mínimo viable?' Haz eso primero. Si sobra tiempo, mejoras.",
      "Pon un timer de 45 minutos para cada tarea. Cuando suene, entrega lo que tengas. 'Hecho' le gana a 'perfecto' el 100% de las veces.",
      "Pregúntate: '¿Quién se va a dar cuenta de la diferencia entre 90% y 100%?' Casi siempre la respuesta es: nadie.",
    ],
  },
  multi: {
    name: "Multitasker", emoji: "🔄", color: "#D4A843",
    desc: "15 pestañas abiertas, 3 proyectos a medias, y la sensación constante de que algo se te olvida.",
    pattern: "Microsoft Research demostró que cambiar de tarea cuesta 23 minutos de recuperación mental. Si cambias 10 veces al día, pierdes casi 4 horas solo en 'reconectar'.",
    frog: "Tu tarea más importante es elegir. La parálisis viene de tener demasiadas opciones abiertas. Cierra 4 para poder avanzar en 1.",
    tips: [
      "Mañana elige solo UNA tarea y trabaja en ella 50 minutos sin tocar nada más. Ni email, ni WhatsApp, ni otra pestaña.",
      "Cierra todas las pestañas excepto la que necesitas ahora mismo. Literalmente. Las demás las puedes abrir después.",
      "Antes de empezar algo nuevo, termina lo que estás haciendo. Un pedazo terminado vale más que cinco empezados.",
    ],
  },
  todo: {
    name: "Todoterreno", emoji: "💪", color: "#3A9A6A",
    desc: "Dices que sí a todo porque 'es más fácil hacerlo yo' o porque no quieres quedar mal. Cargas con todo.",
    pattern: "Cada 'sí' que das a otro es un 'no' que te das a ti. Tu agenda la están llenando las prioridades de otros, no las tuyas.",
    frog: "Probablemente no es una tarea — es una conversación. Decirle a alguien 'no puedo con esto' o 'necesito que hagas tu parte.'",
    tips: [
      "Practica: 'Me encantaría ayudarte, pero esta semana estoy enfocado/a en [tu prioridad]. ¿Podemos verlo la próxima?'",
      "Haz una lista de todo lo que haces que OTRA persona podría hacer (aunque no lo haga tan bien). Delega una esta semana.",
      "Antes de decir sí a algo nuevo, espera 2 horas. La urgencia de los demás no es tu emergencia.",
    ],
  },
  planner: {
    name: "Planificador Eterno", emoji: "📋", color: "#C4564B",
    desc: "Planificas el lunes, reorganizas el martes, cambias de sistema el miércoles. Pero ejecutar... eso queda para después.",
    pattern: "Masicampo & Baumeister demostraron que hacer un plan da alivio mental tan real que tu cerebro cree que ya hiciste la tarea. Planificar se siente productivo, pero es una ilusión.",
    frog: "Dejar de planificar y hacer. Abre el documento, escribe la primera línea, manda el primer mensaje. Empieza imperfecto.",
    tips: [
      "Mañana, planifica MÁXIMO 5 minutos. Escribe 3 cosas. Cierra la app de planificación. Y empieza la primera inmediatamente.",
      "No cambies de herramienta de productividad por 30 días. El problema no es la herramienta — es el hábito de cambiar en vez de hacer.",
      "Regla de los 2 minutos: si algo toma menos de 2 minutos, hazlo ahora mismo en vez de anotarlo.",
    ],
  },
};

// ═══ QUESTIONS ═══
const QUESTIONS = [
  {
    q: "¿Qué es lo que MÁS te pasa en tu día a día?",
    sub: "Elige la que más te identifique.",
    opts: [
      { id: "fires", em: "🔥", lb: "Paso el día respondiendo urgencias de otros", sc: { fire: 3, todo: 1 } },
      { id: "toomuch", em: "🤯", lb: "Tengo tantas cosas que no sé por dónde empezar", sc: { multi: 3, planner: 1 } },
      { id: "nofinish", em: "🔄", lb: "Empiezo muchas cosas pero no termino ninguna", sc: { multi: 2, perfect: 2 } },
      { id: "busy", em: "😰", lb: "Trabajo mucho pero siento que no avanzo", sc: { fire: 2, perfect: 2, todo: 2 } },
      { id: "ok", em: "👍🏽", lb: "En general manejo bien mi día, pero puedo mejorar", sc: {} },
    ],
  },
  {
    q: "Cuando tienes una tarea importante, ¿qué pasa normalmente?",
    opts: [
      { id: "postpone", em: "⏳", lb: "La postergo hasta que se vuelve urgente", sc: { fire: 3, perfect: 1 } },
      { id: "overtime", em: "⏱️", lb: "La hago pero le dedico el triple de tiempo necesario", sc: { perfect: 3 } },
      { id: "interrupt", em: "📱", lb: "La empiezo pero me interrumpen y nunca la termino", sc: { multi: 2, fire: 1, todo: 1 } },
      { id: "plan", em: "📝", lb: "La planeo perfectamente pero no la ejecuto", sc: { planner: 3 } },
      { id: "doit", em: "🎯", lb: "La identifico y la hago primero", sc: {} },
    ],
  },
  {
    q: "¿En qué momento del día pierdes más el control?",
    opts: [
      { id: "morning", em: "🌅", lb: "En la mañana — abro el email y se me va el día", sc: { fire: 2, todo: 1, perfect: 1 } },
      { id: "midday", em: "☀️", lb: "A mitad del día — las reuniones me fragmentan", sc: { multi: 2, todo: 1 } },
      { id: "afternoon", em: "🌇", lb: "En la tarde — ya no tengo energía para lo importante", sc: { perfect: 1, fire: 1, todo: 1 } },
      { id: "allday", em: "🌀", lb: "Todo el día — nunca siento que tengo el control", sc: { multi: 2, planner: 1, todo: 1 } },
      { id: "control", em: "😌", lb: "Generalmente mantengo el control durante el día", sc: {} },
    ],
  },
  {
    q: "Cuando alguien te pide algo, ¿qué haces normalmente?",
    opts: [
      { id: "yesall", em: "✋🏼", lb: "Digo que sí a casi todo", sc: { todo: 3 } },
      { id: "absorb", em: "🏋🏾", lb: "Lo hago yo porque es más rápido que explicarle a otro", sc: { todo: 2, perfect: 1 } },
      { id: "sometimes", em: "⚖️", lb: "A veces digo no, pero me cuesta", sc: { todo: 1 } },
      { id: "filter", em: "🛡️", lb: "Filtro bastante bien lo que acepto", sc: {} },
    ],
  },
  {
    q: "¿Cómo organizas tu trabajo hoy?",
    opts: [
      { id: "head", em: "🧠", lb: "Todo en mi cabeza", sc: { multi: 2, todo: 1 } },
      { id: "notes", em: "📝", lb: "Notas sueltas, listas, post-its", sc: { planner: 1, multi: 1 } },
      { id: "app", em: "📱", lb: "Una app, pero no la uso consistentemente", sc: { planner: 2 } },
      { id: "system", em: "⚙️", lb: "Tengo un sistema, pero no funciona bien", sc: { planner: 1, perfect: 1 } },
      { id: "works", em: "🎯", lb: "Tengo un sistema que funciona razonablemente", sc: {} },
    ],
  },
  // BLOQUE 2 — Costo
  {
    q: "¿Cuántas horas no productivas por día sientes que pierdes en cosas que no mueven la aguja?",
    isCost: true,
    opts: [
      { id: "h0", em: "", lb: "Menos de 1 hora", hrs: 0.5 },
      { id: "h1", em: "", lb: "1-2 horas", hrs: 1.5 },
      { id: "h3", em: "", lb: "3-4 horas", hrs: 3.5 },
      { id: "h5", em: "", lb: "5+ horas", hrs: 5.5 },
      { id: "hdk", em: "🤷🏽", lb: "No sé, pero muchas", hrs: 3 },
    ],
  },
  {
    q: "¿Cuántas veces a la semana terminas el día sintiendo que no lograste lo importante?",
    isCost: true,
    opts: [
      { id: "f1", em: "", lb: "1-2 veces" },
      { id: "f3", em: "", lb: "3-4 veces" },
      { id: "f5", em: "", lb: "Casi todos los días" },
      { id: "f7", em: "", lb: "Todos los días" },
    ],
  },
  {
    q: "¿Cuánto vale aproximadamente tu hora de trabajo?",
    note: "Esto es para calcular el impacto económico en tu productividad.",
    isCost: true,
    opts: [
      { id: "r5", em: "", lb: "$5-10 / hora", rate: 7.5 },
      { id: "r15", em: "", lb: "$10-20 / hora", rate: 15 },
      { id: "r30", em: "", lb: "$20-40 / hora", rate: 30 },
      { id: "r50", em: "", lb: "$40+ / hora", rate: 50 },
    ],
  },
  // BLOQUE 3 — Situación
  {
    q: "¿Cómo llegas al final de la semana?",
    opts: [
      { id: "exhausted", em: "😵", lb: "Agotado/a y con culpa por lo que no hice", sc: {} },
      { id: "anxious", em: "😰", lb: "Ansioso/a porque la próxima semana viene igual", sc: {} },
      { id: "meh", em: "😐", lb: "Más o menos — sobreviví pero no avancé", sc: {} },
      { id: "ok", em: "😊", lb: "Relativamente bien, pero sé que puedo mejorar", sc: {} },
    ],
  },
  {
    q: "¿Has intentado organizarte antes con apps o métodos?",
    opts: [
      { id: "many", em: "📱", lb: "Sí, varios, ninguno me funcionó", sc: { planner: 2 } },
      { id: "one", em: "🔄", lb: "Sí, uno, pero lo abandoné", sc: { planner: 1 } },
      { id: "no", em: "🤷🏼", lb: "No realmente, no sé por dónde empezar", sc: { multi: 1 } },
      { id: "some", em: "🎯", lb: "Sí, tengo algo que más o menos funciona", sc: {} },
    ],
  },
  {
    q: "¿Qué te haría sentir que esta semana fue un éxito?",
    isPersonal: true,
    opts: [
      { id: "finish", em: "🏁", lb: "Terminar lo que empecé" },
      { id: "noguilt", em: "🕊️", lb: "No sentir culpa el viernes" },
      { id: "time", em: "⏰", lb: "Tener tiempo para lo que realmente importa" },
      { id: "progress", em: "🚀", lb: "Sentir que estoy avanzando hacia algo" },
    ],
  },
];

// Max scores: fire=10, perfect=10, multi=11, todo=10, planner=10

const SUCCESS_MSGS = {
  finish: "Imagina terminar tu viernes sabiendo que completaste lo que te propusiste.",
  noguilt: "Imagina llegar al viernes sin esa carga. Sin culpa. Con paz.",
  time: "Imagina que tus tardes son tuyas — para lo que realmente importa.",
  progress: "Imagina sentir cada viernes que estás más cerca de donde quieres estar.",
};

const CTA_MSGS = {
  many: "Ya probaste hacerlo solo/a y no funcionó. La diferencia es tener a alguien que construya el sistema CONTIGO y te acompañe hasta que sea hábito.",
  one: "Tener una herramienta no es suficiente — necesitas un sistema y alguien que te acompañe a usarlo hasta que sea automático.",
  no: "No necesitas saber por dónde empezar — para eso estoy yo. En la primera sesión lo definimos juntos/as.",
  some: "Ya tienes base. El siguiente paso es optimizar y llevar tu sistema al siguiente nivel.",
};

function getProfile(answers) {
  const scores = { fire: 0, perfect: 0, multi: 0, todo: 0, planner: 0 };
  answers.forEach((ans, qi) => {
    const q = QUESTIONS[qi];
    if (!q || q.isCost || q.isPersonal) return;
    const opt = q.opts.find(o => o.id === ans);
    if (opt && opt.sc) {
      Object.entries(opt.sc).forEach(([k, v]) => { scores[k] += v; });
    }
  });
  
  // Check for Optimizer (4+ positive answers in P1-P5)
  const positiveCount = answers.slice(0, 5).filter((ans, i) => {
    const opt = QUESTIONS[i].opts.find(o => o.id === ans);
    return opt && (!opt.sc || Object.keys(opt.sc).length === 0);
  }).length;
  
  if (positiveCount >= 4) {
    return { primary: "optimizer", secondary: null, scores };
  }
  
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return { primary: sorted[0][0], secondary: sorted[1][0], scores };
}

function genCode(name) {
  const initials = name.trim().split(/\s+/).map(w => (w[0] || "").toUpperCase() || "").join("").slice(0, 3) || "TC";
  const nums = String(Math.floor(1000 + Math.random() * 9000));
  return `TC-${initials}-${nums}`;
}

// ═══ GOOGLE SHEETS ═══
const SHEETS_URL = "const SHEETS_URL = "https://script.google.com/macros/s/AKfycbxwEM5yy6EGHCP0nul_UAM18f_Ohg9MDOvXckxwuUqsaxhHFIsudwzbqCVy1GtUeSfj/exec";

function sendToSheets(data) {
  if (SHEETS_URL === "YOUR_GOOGLE_SHEETS_URL_HERE") return;
  try {
    fetch(SHEETS_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data),
    });
  } catch (e) { /* silently fail */ }
}

// ═══ COMPONENT ═══

// ═══ STYLES ═══
const S = {
  wrap: { minHeight: "100vh", background: B.lavender, color: B.text, fontFamily: "'Rubik', sans-serif" },
  inner: { maxWidth: 520, margin: "0 auto", padding: "16px 20px 80px" },
  tag: { fontFamily: "'Jaro', sans-serif", fontSize: 11, letterSpacing: 4, color: B.purple, display: "inline-block", padding: "3px 10px", background: "#fff", borderRadius: 4, marginBottom: 12 },
  h1: { fontFamily: "'Jaro', sans-serif", fontSize: 28, color: B.dark, lineHeight: 1.15, marginBottom: 10 },
  sub: { fontSize: 14, color: B.gray, lineHeight: 1.6, marginBottom: 20 },
  coach: { padding: "14px 18px", borderRadius: "2px 16px 16px 16px", background: "#fff", border: `1px solid ${B.purple}22`, fontSize: 14, color: B.text, lineHeight: 1.7, marginBottom: 16, boxShadow: "0 2px 8px #815DFF06" },
  coachLabel: { fontSize: 9, color: B.purple, fontWeight: 700, display: "block", marginBottom: 4, letterSpacing: 2 },
  opt: (selected) => ({
    display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", width: "100%",
    background: selected ? `${B.purple}12` : "#fff",
    border: `1.5px solid ${selected ? B.purple : "#E8E2F0"}`,
    borderRadius: 14, cursor: "pointer", textAlign: "left", transition: "all 0.2s",
    marginBottom: 8, boxShadow: "0 1px 4px #815DFF06",
  }),
  optEm: { fontSize: 22, flexShrink: 0 },
  optTx: (selected) => ({ fontSize: 14, color: selected ? B.dark : B.gray, fontWeight: selected ? 600 : 400 }),
  btn: (active) => ({
    width: "100%", padding: "14px 24px",
    background: active ? B.purple : "#E8E2F0",
    color: active ? "#fff" : "#B8B0CC",
    border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700,
    cursor: active ? "pointer" : "default", fontFamily: "'Rubik', sans-serif",
    transition: "all 0.3s",
  }),
  input: { width: "100%", boxSizing: "border-box", padding: "14px 18px", background: "#fff", border: `2px solid ${B.purple}33`, borderRadius: 12, color: B.dark, fontSize: 16, fontWeight: 600, outline: "none", fontFamily: "'Rubik', sans-serif", marginBottom: 12 },
  progress: { display: "flex", gap: 3, marginBottom: 16, paddingTop: 8 },
  progDot: (active) => ({ flex: 1, height: 4, borderRadius: 2, background: active ? B.purple : "#ffffff88", transition: "background 0.3s" }),
  note: { fontSize: 11, color: B.gray, fontStyle: "italic", marginBottom: 12, padding: "6px 10px", background: "#fff", borderRadius: 6, border: "1px solid #E8E2F0" },
  card: { padding: 20, background: "#fff", borderRadius: 18, border: `1px solid #E8E2F0`, marginBottom: 12, boxShadow: "0 2px 12px #815DFF08" },
  backBtn: { background: "none", border: "none", color: B.purpleMid, fontSize: 13, cursor: "pointer", padding: "8px 0", display: "flex", alignItems: "center", gap: 4, fontFamily: "'Rubik', sans-serif", marginBottom: 4 },
};

// ═══ GREETINGS ═══
function getGreetings(name) {
  return [
  `${name.split(" ")[0]}, primera pregunta:`,
  "Bien, ahora dime:",
  `Interesante, ${name.split(" ")[0]}. Siguiente:`,
  "Ahora una pregunta clave:",
  "Casi a la mitad:",
  "Vamos con el impacto real:",
  "Una más sobre tu semana:",
  "Importante para el cálculo:",
  "Sobre tu semana:",
  "Penúltima:",
  "Última pregunta:",
  `Última cosa, ${name.split(" ")[0]}:`,
];
}

// ═══ ROLE OPTIONS ═══
const roleOpts = [
  { id: "entrepreneur", em: "🚀", lb: "Tengo mi propio negocio o emprendimiento" },
  { id: "freelancer", em: "💻", lb: "Trabajo de forma independiente (freelance, consultoría)" },
  { id: "leader", em: "👔", lb: "Lidero un equipo o área" },
  { id: "employee", em: "🏢", lb: "Trabajo en una empresa u organización" },
  { id: "other", em: "✦", lb: "Otro" },
];


export default function LeadMagnetQuiz() {
  const [step, setStep] = useState(0);
  // 0=welcome, 1=name, 2=role, 3-14=questions, 15=loading, 16=result, 17=ticket
  const [name, setName] = useState("");
  const [role, setRole] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [goal, setGoal] = useState("");
  const [profile, setProfile] = useState(null);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [sheetsSent, setSheetsSent] = useState(false);
  const [sliderHrs, setSliderHrs] = useState(null);
  

  useEffect(() => {
  }, [step]);

  const answer = (id) => {
    const qIdx = step - 3; // question index (0-10 for P1-P11)
    if (qIdx >= 0 && qIdx <= 10) {
      const newA = [...answers];
      newA[qIdx] = id;
      setAnswers(newA);
    } else {
      setAnswers([...answers, id]);
    }
    if (step < 14) setStep(step + 1);
    else {
      setStep(15);
    }
  };

  const goBack = () => {
    if (step === 14 || step === 15) {
      setStep(13);
    } else if (step >= 4 && step <= 13) {
      setStep(step - 1);
    } else if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
    } else if (step === 1) {
      setStep(0);
    }
  };

  const goForward = () => {
    if (step >= 3 && step <= 13) {
      const qIdx = step - 3;
      if (answers[qIdx] !== undefined) {
        setStep(step + 1);
      }
    }
  };

  // Check if there's a saved answer ahead (for showing forward button)
  const hasAnswerForCurrent = step >= 3 && step <= 13 && answers[step - 3] !== undefined;

  const submitGoal = () => {
    setStep(16); // loading
    setTimeout(() => {
      const p = getProfile(answers);
      setProfile(p);
      setCode(genCode(name));
      
      // Initialize slider with answer or default
      const hrsOpt2 = QUESTIONS[5].opts.find(o => o.id === answers[5]);
      setSliderHrs((hrsOpt2 ? hrsOpt2.hrs : 3));
      
      // Calculate cost
      const hrsOpt = QUESTIONS[5].opts.find(o => o.id === answers[5]);
      const rateOpt = QUESTIONS[7].opts.find(o => o.id === answers[7]);
      const hrs = (hrsOpt ? hrsOpt.hrs : 3);
      const rate = (rateOpt ? rateOpt.rate : 15);
      const monthlyCost = Math.round(hrs * 22 * rate);
      
      // Send to sheets
      if (!sheetsSent) {
        sendToSheets({
          timestamp: new Date().toISOString(),
          name,
          role,
          answers: answers.join(","),
          goal,
          profile_primary: p.primary === "optimizer" ? "Optimizador" : (PROFILES[p.primary] ? PROFILES[p.primary].name : ""),
          profile_secondary: p.secondary ? (PROFILES[p.secondary] ? PROFILES[p.secondary].name : "") : "N/A",
          monthly_cost: monthlyCost,
          hrs_lost_day: hrs,
          hrs_lost_day_original: (hrsOpt2 ? hrsOpt2.hrs : "unknown"),
          hourly_rate: rate,
          p1: answers[0], p2: answers[1], p3: answers[2], p4: answers[3],
          p5: answers[4], p6: answers[5], p7: answers[6], p8: answers[7],
          p9: answers[8], p10: answers[9], p11: answers[10],
        });
        setSheetsSent(true);
      }
      
      setStep(17);
    }, 2500);
  };

  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const submitEmail = () => {
    if (!isValidEmail(email)) return;
    // Send email + code to sheets
    sendToSheets({
      timestamp: new Date().toISOString(),
      type: "email_capture",
      name,
      email,
      code,
      code_expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    });
    setStep(18);
  };

  // Computed
  const hrsOpt = answers[5] ? QUESTIONS[5].opts.find(o => o.id === answers[5]) : null;
  const rateOpt = answers[7] ? QUESTIONS[7].opts.find(o => o.id === answers[7]) : null;
  const hrs = sliderHrs || (hrsOpt ? hrsOpt.hrs : 3);
  const rate = (rateOpt ? rateOpt.rate : 15);
  const monthlyCost = Math.round(hrs * 22 * rate);
  const yearlyCost = monthlyCost * 12;
  const monthlyHrs = Math.round(hrs * 22);
  const successOpt = answers[10];
  const ctaOpt = answers[9];
  const expiryDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
  const expiryStr = `${expiryDate.getDate()}/${expiryDate.getMonth() + 1}/${expiryDate.getFullYear()}`;

  const totalQs = 14; // name(1) + role(2) + 12 questions(3-14)
  const progress = Math.min(step, totalQs) / totalQs;

  const buildReport = (discountCode) => {
    if (!profile || profile.primary === "optimizer") return "";
    const p = PROFILES[profile.primary];
    const s = profile.secondary ? PROFILES[profile.secondary] : null;
    let r = "Hola Analia! Acabo de hacer el test de productividad.\n\n";
    r += "*Mi perfil:* " + p.name + "\n";
    if (s) r += "*Perfil secundario:* " + s.name + "\n";
    r += "*Estoy perdiendo:* ~$" + monthlyCost.toLocaleString() + "/mes\n";
    r += "*Lo que mas me frustra:* " + goal + "\n\n";
    if (discountCode) r += "Tengo el codigo de descuento: *" + discountCode + "*\n\n";
    r += "Me interesa saber mas sobre *Tomando el Control*.";
    return r;
  };

  // ═══ STYLES ═══


  return (
    <div style={S.wrap}>
      <link href="https://fonts.googleapis.com/css2?family=Jaro:opsz@6..72&family=Rubik:wght@300;400;500;600;700;800&family=DM+Serif+Text:ital@0;1&display=swap" rel="stylesheet" />
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}} @keyframes spin{to{transform:rotate(360deg)}} @keyframes slideIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:none}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}} @keyframes pop{0%{transform:scale(.8);opacity:0}50%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}} @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}} .qopt:hover{border-color:${B.purple}!important;background:${B.purple}08!important} @media(max-width:480px){.quiz-inner{padding:12px 16px 60px!important}} input[type=range]{-webkit-appearance:none;appearance:none} input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:28px;height:28px;border-radius:50%;background:${B.yellow};cursor:pointer;box-shadow:0 2px 8px #00000044;border:3px solid ${B.dark}} input[type=range]::-moz-range-thumb{width:28px;height:28px;border-radius:50%;background:${B.yellow};cursor:pointer;box-shadow:0 2px 8px #00000044;border:3px solid ${B.dark}}`}</style>

      <div style={S.inner} className="quiz-inner">

        {/* Progress bar */}
        {step >= 1 && step <= 15 && (
          <div style={S.progress}>
            {Array.from({ length: totalQs }).map((_, i) => (
              <div key={i} style={S.progDot(i < step)} />
            ))}
          </div>
        )}

        {/* ═══ WELCOME ═══ */}
        {step === 0 && (
          <div style={{ textAlign: "center", paddingTop: 32, animation: "fadeUp 0.6s ease" }}>
            <div style={{ marginBottom: 20 }}>
              <img src={`data:image/png;base64,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`} alt="PM On Demand" style={{ height: 72, margin: "0 auto", display: "block" }} />
            </div>
            <h1 style={{ ...S.h1, fontSize: 26, marginBottom: 14 }}>
              ¿Trabajas mucho pero sientes<br />que no avanzas?
            </h1>
            <p style={{ fontSize: 15, color: B.gray, margin: "0 auto 8px", maxWidth: 400, lineHeight: 1.6 }}>
              Este test es para ti si sientes que tu día te controla a ti en vez de tú controlarlo, o que terminas la semana agotado/a sin saber en qué se fue tu tiempo.
            </p>
            <p style={{ fontSize: 14, color: B.purpleDark, margin: "0 auto 20px", maxWidth: 380, lineHeight: 1.5, fontWeight: 500 }}>
              Descubre en 3 minutos:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 400, margin: "0 auto 24px", textAlign: "left" }}>
              {[
                { em: "🔍", t: "Tu patrón de productividad (5 perfiles posibles)" },
                { em: "💸", t: "El precio invisible de vivir sin sistema" },
                { em: "💡", t: "3 acciones concretas para esta semana" },
              ].map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#fff", borderRadius: 10, border: "1px solid #E8E2F0" }}>
                  <span style={{ fontSize: 18 }}>{t.em}</span>
                  <span style={{ fontSize: 13, color: B.text }}>{t.t}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(1)} style={{
              padding: "14px 40px", background: B.purple, color: "#fff",
              border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer",
            }}>
              Descubrir mi perfil — gratis ✦
            </button>
            <p style={{ fontSize: 11, color: "#B8B0CC", marginTop: 14 }}>Solo 12 preguntas · 100% gratis · Sin registro</p>
          </div>
        )}

        {/* ═══ NAME ═══ */}
        {step === 1 && (
          <div style={{ animation: "fadeUp 0.4s ease", paddingTop: 10 }}>
            <button onClick={goBack} style={S.backBtn}>← Atrás</button>
            <div style={S.coach}>
              <span style={S.coachLabel}>PRODUCTIVIDAD INTENCIONAL</span>
              ¡Empecemos! ¿Cómo te llamas?
            </div>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre..."
              onKeyDown={e => { if (e.key === "Enter" && name.trim()) setStep(2) }}
              style={S.input} autoFocus />
            <button onClick={() => setStep(2)} disabled={!name.trim()} style={S.btn(name.trim())}>
              Siguiente →
            </button>
          </div>
        )}

        {/* ═══ ROLE ═══ */}
        {step === 2 && (
          <div style={{ animation: "fadeUp 0.4s ease", paddingTop: 10 }}>
            <button onClick={goBack} style={S.backBtn}>← Atrás</button>
            <div style={S.coach}>
              <span style={S.coachLabel}>PRODUCTIVIDAD INTENCIONAL</span>
              {name.split(" ")[0]}, ¿a qué te dedicas?
            </div>
            {roleOpts.map((o, i) => {
              const isSelected = role === o.id;
              return (
              <button key={o.id} className={isSelected ? "" : "qopt"} onClick={() => { setRole(o.id); setStep(3); }}
                style={{
                  ...S.opt(isSelected),
                  animation: `slideIn 0.3s ${i * 0.06}s both`,
                  ...(isSelected ? { background: `${B.purple}18`, border: `2px solid ${B.purple}`, boxShadow: `0 0 0 2px ${B.purple}22` } : {})
                }}>
                <span style={S.optEm}>{o.em}</span>
                <span style={{ ...S.optTx(isSelected), flex: 1 }}>{o.lb}</span>
              </button>
              );
            })}
          </div>
        )}

        {/* ═══ QUESTIONS 1-11 (steps 3-13) ═══ */}
        {step >= 3 && step <= 13 && (() => {
          const qIdx = step - 3;
          const q = QUESTIONS[qIdx];
          return (
            <div style={{ animation: "fadeUp 0.3s ease", paddingTop: 10 }} key={step}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button onClick={goBack} style={S.backBtn}>← Atrás</button>
                {hasAnswerForCurrent && <button onClick={goForward} style={{ ...S.backBtn, color: B.purple }}>Siguiente →</button>}
              </div>
              <div style={S.coach}>
                <span style={S.coachLabel}>PRODUCTIVIDAD INTENCIONAL</span>
                <div style={{ fontSize: 13, color: B.gray, marginBottom: 4 }}>{getGreetings(name)[qIdx]}</div>
                <div style={{ fontSize: 16, color: B.dark, fontWeight: 600, lineHeight: 1.4 }}>{q.q}</div>
                {q.sub && <div style={{ fontSize: 12, color: B.purpleMid, marginTop: 4, fontStyle: "italic" }}>{q.sub}</div>}
              </div>
              {q.note && <div style={S.note}>ℹ️ {q.note}</div>}
              {q.opts.map((o, i) => {
                const prevAnswer = answers[qIdx];
                const isSelected = prevAnswer === o.id;
                return (
                <button key={o.id} className={isSelected ? "" : "qopt"} onClick={() => answer(o.id)}
                  style={{
                    ...S.opt(isSelected),
                    animation: `slideIn 0.3s ${i * 0.06}s both`,
                    ...(isSelected ? { background: `${B.purple}18`, border: `2px solid ${B.purple}`, boxShadow: `0 0 0 2px ${B.purple}22` } : {})
                  }}>
                  {o.em ? <span style={S.optEm}>{o.em}</span> : <span style={{ width: 8, flexShrink: 0 }} />}
                  <span style={{ ...S.optTx(isSelected), flex: 1 }}>{o.lb}</span>
                </button>
                );
              })}
            </div>
          );
        })()}

        {/* ═══ QUESTION 12 - GOAL (step 14) ═══ */}
        {step === 14 && (
          <div style={{ animation: "fadeUp 0.3s ease", paddingTop: 10 }}>
            <button onClick={goBack} style={S.backBtn}>← Atrás</button>
            <div style={S.coach}>
              <span style={S.coachLabel}>PRODUCTIVIDAD INTENCIONAL</span>
              <div style={{ fontSize: 13, color: B.gray, marginBottom: 4 }}>Última cosa, {name.split(" ")[0]}:</div>
              <div style={{ fontSize: 16, color: B.dark, fontWeight: 600, lineHeight: 1.4 }}>
                ¿Qué es lo que MÁS te frustra de cómo manejas tu tiempo hoy?
              </div>
            </div>
            <input value={goal} onChange={e => setGoal(e.target.value)}
              placeholder="Ej: Nunca termino lo que empiezo, siempre estoy apagando fuegos..."
              onKeyDown={e => { if (e.key === "Enter" && goal.trim()) { answer("goal"); submitGoal(); } }}
              style={S.input} />
            <button onClick={() => { answer("goal"); submitGoal(); }} disabled={!goal.trim()} style={S.btn(goal.trim())}>
              Descubrir mi perfil ✦
            </button>
          </div>
        )}

        {/* ═══ P12 already answered, submit goal (step 15) ═══ */}
        {step === 15 && (
          <div style={{ animation: "fadeUp 0.3s ease", paddingTop: 10 }}>
            <div style={S.coach}>
              <span style={S.coachLabel}>PRODUCTIVIDAD INTENCIONAL</span>
              Última cosa, {name.split(" ")[0]}. ¿Qué es lo que <strong>más te frustra</strong> de cómo manejas tu tiempo hoy?
            </div>
            <input value={goal} onChange={e => setGoal(e.target.value)}
              placeholder="Ej: Nunca termino lo que empiezo, siempre estoy apagando fuegos..."
              onKeyDown={e => { if (e.key === "Enter" && goal.trim()) submitGoal() }}
              style={S.input} autoFocus />
            <button onClick={submitGoal} disabled={!goal.trim()} style={S.btn(goal.trim())}>
              Descubrir mi perfil ✦
            </button>
          </div>
        )}

        {/* ═══ LOADING ═══ */}
        {step === 16 && (
          <div style={{ textAlign: "center", paddingTop: 100, animation: "fadeUp 0.4s ease" }}>
            <div style={{ width: 48, height: 48, border: `3px solid #E8E2F0`, borderTopColor: B.purple, borderRadius: "50%", margin: "0 auto 24px", animation: "spin 1s linear infinite" }} />
            <h2 style={{ fontFamily: "'Jaro', sans-serif", fontSize: 20, color: B.dark, margin: "0 0 8px" }}>Analizando tu perfil...</h2>
            <p style={{ fontSize: 13, color: B.gray, animation: "pulse 1.5s infinite" }}>Cruzando tus respuestas con patrones de productividad</p>
          </div>
        )}

        {/* ═══ RESULT ═══ */}
        {step === 17 && profile && (() => {
          const isOptimizer = profile.primary === "optimizer";
          const p = isOptimizer ? null : PROFILES[profile.primary];
          const s = profile.secondary ? PROFILES[profile.secondary] : null;

          return (
            <div style={{ animation: "fadeUp 0.5s ease", paddingTop: 16 }}>

              {/* Profile header */}
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 48, marginBottom: 8, animation: "pop 0.6s ease" }}>{isOptimizer ? "⭐" : p.emoji}</div>
                <div style={{ fontSize: 10, color: B.purple, letterSpacing: 3, fontWeight: 700, marginBottom: 4 }}>TU PERFIL DE PRODUCTIVIDAD</div>
                <h2 style={{ fontFamily: "'Jaro', sans-serif", fontSize: 26, color: B.dark, margin: "4px 0 6px" }}>
                  {isOptimizer ? "Optimizador" : p.name}
                </h2>
                <p style={{ fontSize: 14, color: B.gray, margin: "0 auto", maxWidth: 380, lineHeight: 1.5 }}>
                  {isOptimizer ? "Tu productividad está por encima del promedio. Tu oportunidad no es organizarte mejor — es elevar tu juego al siguiente nivel." : p.desc}
                </p>
              </div>

              {!isOptimizer && (
                <>
                  {/* Pattern + Frog in single card */}
                  <div style={S.card}>
                    <div style={{ fontSize: 10, color: B.purple, letterSpacing: 2, fontWeight: 700, marginBottom: 8 }}>TU PATRÓN</div>
                    <p style={{ fontSize: 13, color: B.text, lineHeight: 1.7, margin: "0 0 16px" }}>{p.pattern}</p>
                    <div style={{ padding: "12px 14px", background: B.lavender, borderRadius: 10, borderLeft: `3px solid ${B.purple}` }}>
                      <div style={{ fontSize: 10, color: B.purple, letterSpacing: 2, fontWeight: 700, marginBottom: 4 }}>TU TAREA MÁS IMPORTANTE</div>
                      <p style={{ fontSize: 13, color: B.dark, fontWeight: 500, lineHeight: 1.5, margin: 0 }}>{p.frog}</p>
                    </div>
                  </div>

                  {/* COST WITH SLIDER */}
                  <div style={{ padding: 24, background: `linear-gradient(135deg, ${B.dark} 0%, #2A2450 100%)`, borderRadius: 18, marginBottom: 12, textAlign: "center", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: -40, right: -30, width: 160, height: 160, borderRadius: "50%", background: `radial-gradient(circle, ${B.purple}25 0%, transparent 70%)` }} />
                    <div style={{ fontSize: 10, color: B.purple, letterSpacing: 3, fontWeight: 700, marginBottom: 12, position: "relative" }}>EL PRECIO INVISIBLE DE VIVIR SIN SISTEMA</div>
                    
                    <div style={{ fontFamily: "'Jaro', sans-serif", fontSize: 52, color: B.yellow, lineHeight: 1, marginBottom: 4, position: "relative", transition: "all 0.15s" }}>
                      ${monthlyCost.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 14, color: "#B8B0CC", marginBottom: 16, position: "relative" }}>al mes que no está trabajando para ti</div>
                    
                    {/* Slider */}
                    <div style={{ position: "relative", padding: "0 8px", marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#6B6580", marginBottom: 6 }}>
                        <span>0.5 hrs</span>
                        <span style={{ color: B.yellow, fontWeight: 600 }}>{hrs} horas no productivas/día</span>
                        <span>8 hrs</span>
                      </div>
                      <input type="range" min="1" max="16" value={hrs * 2} 
                        onChange={e => setSliderHrs(parseInt(e.target.value) / 2)}
                        style={{ 
                          width: "100%", height: 6, appearance: "none", background: `linear-gradient(90deg, ${B.purple} 0%, ${B.yellow} 100%)`, 
                          borderRadius: 3, outline: "none", cursor: "pointer",
                        }} />
                      <div style={{ fontSize: 11, color: "#8A80A0", marginTop: 6 }}>
                        Mueve el slider para ajustar tus horas
                      </div>
                    </div>
                    
                    {/* Breakdown */}
                    <div style={{ display: "flex", justifyContent: "center", gap: 20, fontSize: 12, color: "#8A80A0", position: "relative" }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#B8B0CC", fontFamily: "'Jaro', sans-serif" }}>{monthlyHrs}</div>
                        <div>hrs/mes</div>
                      </div>
                      <div style={{ width: 1, background: "#ffffff15" }} />
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: B.yellow, fontFamily: "'Jaro', sans-serif" }}>${yearlyCost.toLocaleString()}</div>
                        <div>al año</div>
                      </div>
                    </div>
                  </div>

                  {/* 3 Tips */}
                  <div style={S.card}>
                    <div style={{ fontSize: 10, color: B.purple, letterSpacing: 2, fontWeight: 700, marginBottom: 12 }}>3 ACCIONES PARA ESTA SEMANA</div>
                    {p.tips.map((tip, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < 2 ? 14 : 0, paddingBottom: i < 2 ? 14 : 0, borderBottom: i < 2 ? "1px solid #E8E2F0" : "none" }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: B.purple, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                        <p style={{ fontSize: 13, color: B.text, lineHeight: 1.6, margin: 0 }}>{tip}</p>
                      </div>
                    ))}
                  </div>

                  {/* Secondary - subtle */}
                  {s && (
                    <div style={{ ...S.card, background: "transparent", border: `1px dashed #D4D0E0`, boxShadow: "none" }}>
                      <div style={{ fontSize: 10, color: B.gray, letterSpacing: 2, fontWeight: 700, marginBottom: 6 }}>{s.emoji} TAMBIÉN TIENES RASGOS DE: {s.name.toUpperCase()}</div>
                      <p style={{ fontSize: 12, color: B.gray, lineHeight: 1.5, margin: 0 }}>{s.desc}</p>
                    </div>
                  )}

                </>
              )}

              {/* ═══ BRIDGE + TOMANDO EL CONTROL ═══ */}
              {/* Success vision - highlighted */}
              {successOpt && SUCCESS_MSGS[successOpt] && (
                <div style={{ padding: "16px 20px", borderRadius: 14, marginBottom: 8, textAlign: "center", background: `${B.purple}10`, border: `1px solid ${B.purple}22` }}>
                  <p style={{ fontSize: 16, color: B.purple, fontWeight: 400, lineHeight: 1.5, margin: 0, fontFamily: "'Jaro', sans-serif" }}>
                    {SUCCESS_MSGS[successOpt]}
                  </p>
                </div>
              )}

              {/* Emotional bridge */}
              <div style={{ padding: "14px 4px", marginBottom: 4 }}>
                <p style={{ fontSize: 14, color: B.text, lineHeight: 1.7, margin: "0 0 14px" }}>
                  Es posible. Pero seamos honestos/as: las 3 acciones de arriba funcionan <em>si las haces</em>. Pero mantener un sistema nuevo solo/a, sin acompañamiento — ahí es donde la mayoría se queda a mitad de camino.
                </p>
                <p style={{ fontSize: 16, color: B.dark, fontWeight: 600, lineHeight: 1.5, margin: "0 0 14px", textAlign: "center" }}>
                  ¿Y si no tuvieras que hacerlo solo/a?
                </p>
                <p style={{ fontSize: 14, color: B.text, lineHeight: 1.7, margin: 0, textAlign: "center" }}>
                  Por eso creé <span style={{ fontFamily: "'Jaro', sans-serif", fontSize: 18, color: B.dark }}>Tomando el Control</span>.
                </p>
              </div>

              {/* Program card */}
              <div style={{ ...S.card, borderLeft: `3px solid ${B.purple}` }}>
                <div style={{ fontFamily: "'Jaro', sans-serif", fontSize: 20, color: B.dark, marginBottom: 8 }}>
                  Tomando el Control
                </div>
                <p style={{ fontSize: 13, color: B.text, lineHeight: 1.7, margin: "0 0 12px" }}>
                  Un acompañamiento de 30 días donde construimos juntos/as tu sistema de productividad intencional. Empezamos con una sesión de diagnóstico de tu situación real. Te construyo un dashboard personalizado en Notion y un "coach virtual" que te guía cada mañana y cada noche. Nos vemos en 5 sesiones de planificación estratégica durante el mes, y recibirás recordatorios diarios por WhatsApp.
                </p>
                <p style={{ fontSize: 13, color: B.dark, fontWeight: 500, lineHeight: 1.6, margin: "0 0 14px" }}>
                  Al día 30, tienes un sistema que funciona — y el hábito de usarlo.
                </p>
                <div style={{ padding: "14px 16px", background: B.lavender, borderRadius: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div>
                      <span style={{ fontFamily: "'Jaro', sans-serif", fontSize: 24, color: B.purple }}>$450 <span style={{ fontSize: 12, fontFamily: "'Rubik', sans-serif", color: B.gray }}>USD</span></span>
                      <div style={{ fontSize: 9, color: B.purpleMid }}>+ ITBMS</div>
                    </div>
                    <span style={{ fontSize: 12, color: B.purpleDark, fontWeight: 500 }}>30 días</span>
                  </div>
                  <div style={{ fontSize: 12, color: B.gray, lineHeight: 2 }}>
                    <strong style={{ color: B.dark }}>Incluye:</strong><br/>
                    ✓ Sesión de diagnóstico<br/>
                    ✓ "Coach virtual" diario<br/>
                    ✓ Dashboard personalizado de Notion<br/>
                    ✓ 5 sesiones de planificación estratégica<br/>
                    ✓ Recordatorios diarios por WhatsApp
                  </div>
                  
                </div>
              </div>

              {/* WhatsApp CTA */}
              <button onClick={() => {
                const text = encodeURIComponent(buildReport());
                window.open(`https://wa.me/50766741296?text=${text}`, "_blank");
              }} style={{
                width: "100%", padding: "15px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: B.purple, color: "#fff",
                border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 10,
              }}>
                💬 Hablemos por WhatsApp
              </button>

              {/* Discount ticket CTA */}
              <div style={{ padding: 18, background: "#fff", borderRadius: 14, border: `1px dashed ${B.purple}44`, textAlign: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 13, color: B.dark, fontWeight: 600, marginBottom: 4 }}>
                  🎟️ ¿Quieres un 10% de descuento exclusivo?
                </div>
                <p style={{ fontSize: 12, color: B.gray, margin: "0 0 12px", lineHeight: 1.4 }}>
                  Déjame tu email y te genero tu ticket de descuento personal.
                </p>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com"
                  onKeyDown={e => { if (e.key === "Enter" && isValidEmail(email)) submitEmail() }}
                  style={{ ...S.input, fontSize: 14, fontFamily: "'Rubik', sans-serif", textAlign: "center", border: `2px solid ${B.purple}22` }} />
                <button onClick={submitEmail} disabled={!isValidEmail(email)}
                  style={{ ...S.btn(isValidEmail(email)), fontSize: 13 }}>
                  Generar mi ticket de descuento →
                </button>
              </div>

              {/* Restart */}
              <button onClick={() => { setStep(0); setName(""); setRole(null); setAnswers([]); setGoal(""); setProfile(null); setEmail(""); setSheetsSent(false); setSliderHrs(null); }}
                style={{ width: "100%", padding: "10px", background: "transparent", color: B.gray, border: `1px solid #E8E2F0`, borderRadius: 10, fontSize: 12, cursor: "pointer" }}>
                Hacer el test de nuevo
              </button>

              <div style={{ textAlign: "center", marginTop: 24, marginBottom: 8 }}>
                <p style={{ fontSize: 11, color: "#9E73AB", letterSpacing: 3, fontWeight: 600, marginBottom: 12 }}>ESTRATEGIA · ENERGÍA · ESTRUCTURA</p>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <img src={`data:image/png;base64,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`} alt="PM On Demand" style={{ height: 60 }} />
                </div>
              </div>
            </div>
          );
        })()}

        {/* ═══ TICKET ═══ */}
        {step === 18 && (
          <div style={{ animation: "pop 0.6s ease", paddingTop: 24 }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🎟️</div>
              <h2 style={{ fontFamily: "'Jaro', sans-serif", fontSize: 22, color: B.dark, margin: "0 0 6px" }}>¡Tu ticket está listo!</h2>
              <p style={{ fontSize: 13, color: B.gray }}>Haz screenshot o copia tu código</p>
            </div>

            {/* Ticket card */}
            <div style={{
              background: `linear-gradient(135deg, ${B.dark} 0%, #2A2450 100%)`,
              borderRadius: 20, padding: 0, overflow: "hidden", marginBottom: 16,
              boxShadow: "0 8px 32px #815DFF22",
            }}>
              {/* Ticket top */}
              <div style={{ padding: "24px 28px 20px", borderBottom: "2px dashed #ffffff15" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <img src={`data:image/png;base64,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`} alt="PM On Demand" style={{ height: 38, filter: "brightness(0) saturate(100%) invert(52%) sepia(13%) saturate(1119%) hue-rotate(232deg) brightness(91%) contrast(87%)" }} />
                  <div style={{ fontSize: 11, color: B.purpleMid }}>TICKET EXCLUSIVO</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 13, color: "#B8B0CC", marginBottom: 4 }}>DESCUENTO EN</div>
                  <div style={{ fontFamily: "'Jaro', sans-serif", fontSize: 24, color: "#fff", marginBottom: 4 }}>
                    Tomando <span style={{ color: B.yellow }}>el Control</span>
                  </div>
                </div>
              </div>
              {/* Ticket bottom */}
              <div style={{ padding: "20px 28px 24px" }}>
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <div style={{ fontFamily: "'Jaro', sans-serif", fontSize: 52, color: B.yellow, lineHeight: 1 }}>10%</div>
                  <div style={{ fontSize: 12, color: "#B8B0CC", marginTop: 4 }}>DE DESCUENTO</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 10, color: B.purpleMid, letterSpacing: 1 }}>PRECIO ORIGINAL</div>
                    <div style={{ fontSize: 16, color: "#8A80A0", textDecoration: "line-through" }}>$450</div>
                  </div>
                  <div style={{ fontSize: 24, color: "#ffffff22" }}>→</div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 10, color: B.lime, letterSpacing: 1 }}>TU PRECIO</div>
                    <div style={{ fontFamily: "'Jaro', sans-serif", fontSize: 28, color: B.lime }}>$405</div>
                    <div style={{ fontSize: 9, color: B.purpleMid }}>+ ITBMS</div>
                  </div>
                </div>
                {/* Code */}
                <div style={{ padding: "12px 16px", background: "#ffffff0a", borderRadius: 10, border: "1px dashed #ffffff22", textAlign: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 9, color: B.purpleMid, letterSpacing: 2, marginBottom: 4 }}>TU CÓDIGO</div>
                  <div style={{ fontFamily: "'Jaro', sans-serif", fontSize: 22, color: "#fff", letterSpacing: 3 }}>{code}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: B.purpleMid }}>
                  <span>Para: {name}</span>
                  <span>Válido hasta: {expiryStr}</span>
                </div>
              </div>
            </div>

            {/* Copy code */}
            <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 3000); }}
              style={{
                width: "100%", padding: "13px",
                background: copied ? "#3A9A6A" : B.purple,
                color: "#fff", border: "none", borderRadius: 12,
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                transition: "background 0.3s", marginBottom: 10,
              }}>
              {copied ? "✓ Código copiado" : "📋 Copiar código"}
            </button>

            {/* WhatsApp */}
            <button onClick={() => {
              const text = encodeURIComponent(buildReport(code));
              window.open(`https://wa.me/50766741296?text=${text}`, "_blank");
            }} style={{
              width: "100%", padding: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: B.purple, color: "#fff",
              border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 10,
            }}>
              💬 Usar mi descuento — WhatsApp
            </button>

            <button onClick={() => setStep(17)}
              style={{ width: "100%", padding: "10px", background: "transparent", color: B.gray, border: `1px solid #E8E2F0`, borderRadius: 10, fontSize: 12, cursor: "pointer" }}>
              ← Volver a mi resultado
            </button>

            <div style={{ textAlign: "center", marginTop: 24, marginBottom: 8 }}>
              <p style={{ fontSize: 11, color: "#9E73AB", letterSpacing: 3, fontWeight: 600, marginBottom: 12 }}>ESTRATEGIA · ENERGÍA · ESTRUCTURA</p>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <img src={`data:image/png;base64,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`} alt="PM On Demand" style={{ height: 60, filter: "brightness(0) saturate(100%) invert(52%) sepia(13%) saturate(1119%) hue-rotate(232deg) brightness(91%) contrast(87%)" }} />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
