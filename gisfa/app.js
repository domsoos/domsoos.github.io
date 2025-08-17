/* gisfa — static router + chat demo */
const $ = (sel) => document.querySelector(sel);
const yearEl = $("#year"); yearEl.textContent = new Date().getFullYear();

const agents = [
  {
    id: "tech",
    name: "Nova (Tech)",
    avatar: "💡",
    tagline: "Gadgets, PCs, and creator gear.",
    badges: ["Laptops", "Audio", "Monitors"],
    matcher: /tech|laptop|pc|monitor|headphones|camera|keyboard|gpu|gaming/i
  },
  {
    id: "fashion",
    name: "Vera (Fashion)",
    avatar: "👗",
    tagline: "Style that sells itself.",
    badges: ["Women", "Men", "Accessories"],
    matcher: /fashion|dress|shirt|sneakers|shoes|jeans|jacket|outfit|wear/i
  },
  {
    id: "home",
    name: "Atlas (Home)",
    avatar: "🏠",
    tagline: "Make home feel amazing.",
    badges: ["Kitchen", "Coffee", "Smart home"],
    matcher: /home|kitchen|sofa|bed|lamp|espresso|coffee|vacuum|air fryer|cook/i
  },
  {
    id: "fitness",
    name: "Bolt (Fitness)",
    avatar: "🏋️",
    tagline: "Gear up. Level up.",
    badges: ["Wearables", "Recovery", "Training"],
    matcher: /fitness|gym|yoga|run|running|bike|cycling|watch|smartwatch|supplement/i
  },
  {
    id: "general",
    name: "Echo (Generalist)",
    avatar: "🧩",
    tagline: "If it exists, I’ll help you buy it.",
    badges: ["Discovery", "Bundles", "Deals"],
    matcher: /.*/i
  }
];

// Tiny local “catalog” (replace with your products or a real API later)
const catalog = [
  { id:"p1", title:"Apex 15” Gaming Laptop", price:1499, tags:["laptop","gaming","tech"], agent:"tech", pitch:"144Hz display, RTX graphics—smooth play + productivity." },
  { id:"p2", title:"Nimbus ANC Headphones", price:199, tags:["audio","headphones","tech"], agent:"tech", pitch:"Active noise canceling and 40h battery for deep focus." },
  { id:"p3", title:"Riviera Summer Dress", price:89, tags:["dress","fashion","summer"], agent:"fashion", pitch:"Lightweight, breezy, and photogenic. Sizes XS–XL." },
  { id:"p4", title:"Street Glide Sneakers", price:129, tags:["sneakers","fashion"], agent:"fashion", pitch:"All-day comfort with a clean silhouette." },
  { id:"p5", title:"Barista Pro Espresso Machine", price:499, tags:["espresso","coffee","home","kitchen"], agent:"home", pitch:"Café-grade crema, microfoam, and temp precision." },
  { id:"p6", title:"Aurora Smart Lamp", price:59, tags:["lamp","smart home","home"], agent:"home", pitch:"Schedule scenes, sunrise mode, voice control." },
  { id:"p7", title:"Pulse S2 Fitness Watch", price:179, tags:["watch","fitness","running"], agent:"fitness", pitch:"GPS, HRV, recovery insights, 7-day battery." },
  { id:"p8", title:"Recovery Foam Roller", price:29, tags:["recovery","fitness"], agent:"fitness", pitch:"Deep tissue relief for post-workout soreness." }
];

const searchForm = $("#searchForm");
const queryInput = $("#query");
const agentPanel = $("#agentPanel");
const agentAvatar = $("#agentAvatar");
const agentName = $("#agentName");
const agentTagline = $("#agentTagline");
const agentBadges = $("#agentBadges");
const chatStream = $("#chatStream");
const chatForm = $("#chatForm");
const userMsgInput = $("#userMsg");

// Quick chips
document.querySelectorAll(".chip").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    queryInput.value = btn.dataset.demo;
    searchForm.requestSubmit();
  });
});

// Route to agent
searchForm.addEventListener("submit", (e)=>{
  e.preventDefault();
  const q = (queryInput.value || "").trim();
  if(!q) return;
  const agent = pickAgent(q);
  showAgent(agent);
  startChat(agent, q);
});

function pickAgent(query){
  // Priority route: first agent whose matcher is satisfied (excluding general until last)
  const specific = agents.filter(a=>a.id!=="general").find(a=>a.matcher.test(query));
  return specific || agents.find(a=>a.id==="general");
}

function showAgent(agent){
  agentPanel.classList.remove("hidden");
  agentAvatar.textContent = agent.avatar;
  agentName.textContent = agent.name;
  agentTagline.textContent = agent.tagline;
  agentBadges.innerHTML = "";
  agent.badges.forEach(b=>{
    const el = document.createElement("span");
    el.className = "badge";
    el.textContent = b;
    agentBadges.appendChild(el);
  });
  chatStream.innerHTML = ""; // reset
}

function startChat(agent, initialQuery){
  // Agent greeting + targeted teaser
  pushAgent(agent, greeting(agent, initialQuery));
  // If we have immediate picks, surface 2
  const picks = suggestProducts(agent, initialQuery, 2);
  if(picks.length){
    pushAgent(agent, formatSuggestions(picks));
  }
}

function greeting(agent, q){
  const opener = {
    tech: "I’ve got specs and deals for days. What matters most—performance, portability, or price?",
    fashion: "Let’s lock the vibe and fit. What’s the occasion and budget?",
    home: "Function meets cozy. Kitchen, lighting, or cleanup—where should we start?",
    fitness: "Goals first. Are we talking training, recovery, or wearables?",
    general: "Tell me what you’re after and your budget—I’ll do the rest."
  }[agent.id] || "How can I help?";
  return `You said: “${q}”. ${opener}`;
}

function suggestProducts(agent, text, limit=3){
  const terms = text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  return catalog
    .filter(p=>p.agent===agent.id)
    .map(p=>({score: score(p, terms), p}))
    .filter(x=>x.score>0)
    .sort((a,b)=>b.score-a.score)
    .slice(0, limit)
    .map(x=>x.p);
}

function score(product, terms){
  let s = 0;
  for(const t of terms){
    if(product.title.toLowerCase().includes(t)) s+=3;
    if(product.tags.some(tag=>tag.includes(t))) s+=2;
  }
  // small bias to higher priced items (demo “upsell”)
  s += Math.min(product.price/1000, 2);
  return s;
}

function formatSuggestions(items){
  if(!items.length) return "I don’t have a perfect match yet, but tell me more about what you need.";
  const lines = items.map(i=>`• **${i.title}** — $${i.price}\n  ${i.pitch}`);
  return `Here are a couple I’d pitch first:\n\n${lines.join("\n")}\n\nWant specs, pics, or alternatives?`;
}

// Chat UX
chatForm.addEventListener("submit", (e)=>{
  e.preventDefault();
  const msg = (userMsgInput.value || "").trim();
  if(!msg) return;
  const agent = currentAgent();
  pushYou(msg);
  userMsgInput.value = "";
  // demo “thinking”
  setTimeout(()=>{
    const reply = agentReply(agent, msg);
    pushAgent(agent, reply);
  }, 250);
});

function currentAgent(){
  const name = agentName.textContent || "";
  return agents.find(a=>name.startsWith(a.name.split(" ")[0])) || agents.find(a=>a.id==="general");
}

function pushYou(text){
  const row = document.createElement("div");
  row.className = "msg you";
  row.innerHTML = `<div class="bubble">${md(text)}</div>`;
  chatStream.appendChild(row);
  chatStream.scrollTop = chatStream.scrollHeight;
}

function pushAgent(agent, text){
  const row = document.createElement("div");
  row.className = "msg agent";
  row.innerHTML = `
    <div class="avatar">${agent.avatar}</div>
    <div class="bubble">${md(text)}</div>
  `;
  chatStream.appendChild(row);
  chatStream.scrollTop = chatStream.scrollHeight;
}

function agentReply(agent, msg){
  // quick intent parsing
  const wantsAlt = /alternatives?|else|another|other/i.test(msg);
  const wantsPrice = /price|budget|cost|under|over|\$\d+/i.test(msg);
  const wantsSpecs = /specs?|details?|compare|comparison/i.test(msg);

  let picks = suggestProducts(agent, msg, 3);
  if(!picks.length) picks = catalog.filter(p=>p.agent===agent.id).slice(0,3);

  if(wantsAlt){
    const alts = picks.slice(0,3);
    return formatSuggestions(alts);
  }
  if(wantsSpecs){
    const p = picks[0];
    return `**${p.title}** — $${p.price}\n\nWhy it’s good: ${p.pitch}\n\nWho it’s for: If you value ${personaPitch(agent)}.\n\nWant me to compare it to two similar options?`;
  }
  if(wantsPrice){
    const tiers = [100, 300, 800, 1500, 3000];
    const bucket = tiers.find(t => new RegExp(`\\b(under|below)\\s*${t}\\b|\\$?${t}`, 'i').test(msg)) || null;
    const filtered = bucket ? catalog.filter(p=>p.agent===agent.id && p.price <= bucket) : picks;
    return formatSuggestions(filtered.slice(0,3));
  }
  return formatSuggestions(picks.slice(0,2));
}

function personaPitch(agent){
  return ({
    tech: "performance without compromising value",
    fashion: "a clean look and versatile styling",
    home: "ease of use and dependable build",
    fitness: "actionable training data and recovery",
    general: "balanced value and reliability"
  })[agent.id] || "overall value";
}

// ultra-tiny markdown (bold + bullets + line breaks)
function md(text){
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/^•\s/gm, "• ")
    .replace(/\n/g, "<br>");
}

// Keyboard niceties
queryInput.addEventListener("keydown", (e)=>{
  if(e.key==="Enter" && e.metaKey){ searchForm.requestSubmit(); }
});
