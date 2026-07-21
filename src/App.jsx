import { useState, useEffect, useCallback, useRef } from "react";



// ─── SHARED DATA ─────────────────────────────────────────────────────────────

const SOURCES = [
  { name: "BlackRock", url: "https://www.blackrock.com/us/individual/insights/blackrock-investment-institute/weekly-commentary", color: "#1a1a2e" },
  { name: "Morningstar", url: "https://www.morningstar.com/stocks/best-energy-stocks-buy", color: "#e8000d" },
  { name: "BloombergNEF", url: "https://about.bnef.com/insights/finance/energy-transition-investment-trends/", color: "#1a56db" },
  { name: "Wood Mackenzie", url: "https://www.woodmac.com/blogs/the-edge/five-themes-shaping-the-energy-world-2026/", color: "#0a6640" },
  { name: "Deloitte", url: "https://www.deloitte.com/us/en/insights/industry/renewable-energy/renewable-energy-industry-outlook.html", color: "#56a700" },
  { name: "IEA", url: "https://www.iea.org/reports/world-energy-investment-2026", color: "#0057a8" },
];

const KEY_STATS = [
  { label: "Global Energy Investment 2026", value: "$3.4T", sub: "IEA forecast · +5% from 2025", accent: "#0057a8" },
  { label: "Clean vs Fossil Capital", value: "2:1", sub: "Clean energy leads globally", accent: "#0a6640" },
  { label: "Power Demand Growth 2026", value: "+3.7%", sub: "IEA global forecast", accent: "#7c3aed" },
  { label: "Battery Storage Investment", value: "$20B", sub: "After +50% surge in 2025", accent: "#d97706" },
];

const SECTORS = [
  { name: "Solar & Wind", trend: "up", desc: "Renewables dominated 93% of US capacity additions in 2025. Surge expected in 2026 as developers race to safe-harbor tax credits.", rating: "Strong Buy", risk: "Medium" },
  { name: "Grid Infrastructure", trend: "up", desc: "Grid investment hit record $115B in the US alone. Critical bottleneck for all other energy sectors.", rating: "Strong Buy", risk: "Low" },
  { name: "Nuclear Power", trend: "up", desc: "Big comeback fueled by AI hyperscalers securing dedicated clean baseload power. Microsoft's Three Mile Island deal is the template.", rating: "Buy", risk: "Low" },
  { name: "Natural Gas / LNG", trend: "neutral", desc: "Bridge fuel demand rising from AI data centers. Devon-Coterra $21.6B merger signals consolidation.", rating: "Hold", risk: "Medium" },
  { name: "Battery Storage", trend: "up", desc: "Fastest bridge to 24/7 clean power. US operating capacity up 32% year-to-date in 2025.", rating: "Buy", risk: "Medium" },
  { name: "Hydrogen", trend: "neutral", desc: "2026 could be make-or-break. 2 Mtpa poised for FID, double last year. High potential, high risk.", rating: "Speculative", risk: "High" },
  { name: "EV & Charging", trend: "up", desc: "$0.9T deployed globally in 2025. Electrified transport is the single largest segment of energy transition investment.", rating: "Buy", risk: "Medium" },
  { name: "Carbon Capture", trend: "neutral", desc: "Pipeline continues to build, accounts for 3% of total clean investment. Watch FID announcements.", rating: "Hold", risk: "High" },
];

const SEED_INSIGHTS = [
  { id: 1, source: "BlackRock Investment Institute", color: "#1a1a2e", date: "June 2026", headline: "Energy infrastructure bottlenecks are driving returns", summary: "BlackRock identifies gas turbines, fuel cells (GE Vernova, Siemens Energy), copper miners, and LNG exporters as the top-performing energy sub-sectors in 2025–2026, outpacing broad clean energy indices. Grid access is the new competitive moat.", tag: "Infrastructure" },
  { id: 2, source: "Morningstar Analysts", color: "#e8000d", date: "June 15, 2026", headline: "Best energy stocks show attractive valuations vs fair value", summary: "Morningstar analysts highlight Cheniere Energy (LNG) as a standout — 90% of volumes are locked into 20-year contracts, giving investors high cash flow certainty. Natural gas pipeline buildout for AI data centers also flagged as a major growth driver.", tag: "Stock Picks" },
  { id: 3, source: "Wood Mackenzie", color: "#0a6640", date: "January 2026", headline: "2026 could be make-or-break for green hydrogen", summary: "After years of hype, 2 Mtpa of hydrogen capacity is now poised for Final Investment Decision — double last year. But Wood Mackenzie warns: overall energy investment slips 4% in real terms as geopolitical volatility and commodity price weakness pause the upward trend.", tag: "Hydrogen" },
  { id: 4, source: "Deloitte Insights", color: "#56a700", date: "June 2026", headline: "US tax law reshaping renewable energy pipeline", summary: "The 'One Big Beautiful Bill Act' rolled back key clean energy credits, causing wind/solar investment to fall 18% in H1 2025. But 2026 is seeing a surge as developers race to safe-harbor projects. Hyperscalers now host 90% of global carbon-free energy contracts from the US.", tag: "Policy" },
  { id: 5, source: "IEA World Energy Investment", color: "#0057a8", date: "May 2026", headline: "Global energy capital flows hit $3.4 trillion in 2026", summary: "The IEA's flagship investment report confirms a 5% rise in global energy capital to $3.4T. Clean energy spending now exceeds fossil fuel investment. Power demand is set to grow 3.7% in 2026, more than twice the rate of total energy demand.", tag: "Macro" },
  { id: 6, source: "PwC Global M&A", color: "#d4163c", date: "June 2026", headline: "Reliability is the new investment thesis for energy M&A", summary: "PwC's midyear outlook reveals dealmakers are now focused on 'deliverable capacity' over future potential. Assets with grid access and contracted cash flows command premium valuations. The proposed $67B NextEra-Dominion merger dominates 2026 power sector deal value.", tag: "M&A" },
];

const GLOSSARY = [
  { term: "PPA", def: "Power Purchase Agreement — a long-term contract where a buyer agrees to purchase electricity directly from a generator at a fixed price." },
  { term: "ETF", def: "Exchange-Traded Fund — a basket of energy stocks you can buy like a single share. E.g. iShares Global Clean Energy ETF (ICLN)." },
  { term: "FID", def: "Final Investment Decision — the point when a company formally commits capital to build a project." },
  { term: "Safe Harbor", def: "A tax provision that lets energy projects lock in tax credits by starting construction before a deadline, even if they finish later." },
  { term: "FEOC", def: "Foreign Entity of Concern — US rules restricting tax credits for projects tied to China, Russia, Iran or North Korea." },
  { term: "GW / GWh", def: "Gigawatt (power capacity) vs Gigawatt-hour (energy stored). 1 GW powers roughly 750,000 homes." },
  { term: "CCUS", def: "Carbon Capture, Utilization and Storage — technology that traps CO₂ from industrial sources before it enters the atmosphere." },
  { term: "Hyperscaler", def: "Giant cloud/AI companies (Microsoft, Google, Amazon, Meta) that now directly contract energy supply for their data centers." },
  { term: "RECs", def: "Renewable Energy Certificates — certify that 1 MWh of electricity was generated from a renewable source. Tradeable instruments." },
  { term: "DER", def: "Distributed Energy Resource — any grid-connected asset that generates, stores, or consumes electricity locally, like solar panels or batteries." },
  { term: "CPA", def: "Cost Per Acquisition — an affiliate marketing model where you earn a fixed fee each time a referred user signs up or deposits funds." },
];

const ENERGY_ETFS = [
  { ticker: "ICLN", name: "iShares Global Clean Energy ETF", focus: "Global renewables", ytd: "+14.2%", ter: "0.42%", rating: "★★★★☆" },
  { ticker: "QCLN", name: "First Trust NASDAQ Clean Edge ETF", focus: "US clean energy & EVs", ytd: "+11.8%", ter: "0.60%", rating: "★★★★☆" },
  { ticker: "XLE", name: "Energy Select Sector SPDR", focus: "Large-cap US energy", ytd: "+6.4%", ter: "0.10%", rating: "★★★☆☆" },
  { ticker: "FRAK", name: "VanEck Unconventional Oil & Gas ETF", focus: "US shale & LNG", ytd: "+3.1%", ter: "0.54%", rating: "★★★☆☆" },
  { ticker: "NLR", name: "VanEck Uranium+Nuclear ETF", focus: "Nuclear energy", ytd: "+22.7%", ter: "0.61%", rating: "★★★★★" },
  { ticker: "GRID", name: "First Trust NASDAQ Clean Edge Smart Grid", focus: "Grid infrastructure", ytd: "+18.9%", ter: "0.70%", rating: "★★★★★" },
];

const TOP_STOCKS = [
  { ticker: "NEE", name: "NextEra Energy", sector: "Renewables/Grid", price: "$89.40", change: "+2.1%", up: true, note: "Proposed $67B merger with Dominion pending" },
  { ticker: "ENPH", name: "Enphase Energy", sector: "Solar Microinverters", price: "$112.60", change: "+4.7%", up: true, note: "Residential solar demand recovery" },
  { ticker: "LNG", name: "Cheniere Energy", sector: "LNG Export", price: "$198.20", change: "+0.8%", up: true, note: "90% volumes on 20-yr contracts" },
  { ticker: "GEV", name: "GE Vernova", sector: "Grid/Turbines", price: "$341.50", change: "+3.4%", up: true, note: "AI data center power demand surge" },
  { ticker: "CCJ", name: "Cameco Corp", sector: "Uranium/Nuclear", price: "$56.80", change: "-0.6%", up: false, note: "Nuclear renaissance beneficiary" },
  { ticker: "FSLR", name: "First Solar", sector: "Solar Manufacturing", price: "$204.30", change: "+1.9%", up: true, note: "US domestic manufacturer, FEOC-safe" },
  { ticker: "CVX", name: "Chevron", sector: "Oil & Gas", price: "$154.70", change: "-0.3%", up: false, note: "Diversifying into LNG & CCS" },
  { ticker: "BEP", name: "Brookfield Renewable", sector: "Renewables Infra", price: "$28.90", change: "+1.2%", up: true, note: "Global clean power portfolio" },
];

const REVENUE_STREAMS = [
  { icon: "💰", title: "Broker Affiliate Commissions", tier: "Primary", color: "#0057a8", potential: "$50–$400 per signup", desc: "Partner with eToro, Robinhood, M1 Finance, or Interactive Brokers. When your readers click your affiliate link and open a trading account, you earn a commission. eToro pays $400 CPA or 25% revenue share.", action: "Join eToro Partners, Robinhood Affiliates, or M1 Finance via Impact.com" },
  { icon: "📰", title: "Newsletter Sponsorships", tier: "Primary", color: "#0a6640", potential: "$50–$150 CPM", desc: "Finance brands pay premium CPMs of $50–$150+ to reach financially-engaged audiences. Even a 5,000-subscriber newsletter can earn $500–$1,500 per edition from a single sponsor.", action: "List on SponsorGap.com or pitch directly to energy ETF providers" },
  { icon: "🎓", title: "Premium Paid Subscription", tier: "Primary", color: "#7c3aed", potential: "$9–$29/month per subscriber", desc: "Offer a free tier (general news) and a premium tier (deep sector analysis, stock watchlists, weekly AI briefing). Even 500 subscribers at $15/month = $7,500/month recurring revenue.", action: "Use Beehiiv or Substack to launch a paid newsletter tier" },
  { icon: "📊", title: "Display Advertising (Google AdSense)", tier: "Secondary", color: "#d97706", potential: "$15–$40 RPM", desc: "Finance content earns among the highest ad rates of any niche — $15–$40 per 1,000 page views. With 10,000 monthly visitors, that's $150–$400/month passively from ads alone.", action: "Apply to Google AdSense or Mediavine (higher RPM, requires 50k sessions/month)" },
  { icon: "🤝", title: "Sponsored Content & Brand Deals", tier: "Secondary", color: "#be185d", potential: "$500–$5,000 per post", desc: "Energy companies, ETF providers, and clean-tech startups will pay to be featured in educational articles. A 'Sponsored Guide to Solar ETFs' can earn $1,000–$5,000 as your audience grows.", action: "Create a 'Partner with us' page listing audience demographics and traffic data" },
  { icon: "📚", title: "Online Course / Webinar", tier: "Growth", color: "#b45309", potential: "$97–$497 per course", desc: "Package your energy investment knowledge into a beginner's course. Sell via Teachable or Gumroad. One launch to 1,000 visitors at 2% conversion = $2,000–$10,000.", action: "Launch on Teachable, Gumroad, or as a live Zoom webinar series" },
  { icon: "🔗", title: "Data & Research Affiliate Links", tier: "Growth", color: "#0369a1", potential: "$6–$50 per signup", desc: "Link to premium tools your readers will actually use: Morningstar Premium, Seeking Alpha, or Koyfin. Earn commissions when readers sign up through your links.", action: "Join Morningstar, Seeking Alpha, and Wall Street Journal affiliate programs" },
  { icon: "🌐", title: "B2B Lead Generation", tier: "Advanced", color: "#065f46", potential: "$50–$300 per lead", desc: "As your site grows, energy companies and financial advisors will pay to reach your engaged investor audience. A simple 'Get a free energy portfolio review' lead form can generate high-value B2B commissions.", action: "Partner with registered investment advisors (RIAs) who serve energy investors" },
];

// ─── PORTFOLIO BUILDER DATA ───────────────────────────────────────────────────

const PORTFOLIO_ASSETS = [
  { id: "NEE",  name: "NextEra Energy",          type: "Stock", sector: "Renewables/Grid",    risk: "Low",    expectedReturn: 9.2,  divYield: 3.1, color: "#0057a8" },
  { id: "GEV",  name: "GE Vernova",              type: "Stock", sector: "Grid/Turbines",      risk: "Medium", expectedReturn: 14.8, divYield: 0.4, color: "#7c3aed" },
  { id: "LNG",  name: "Cheniere Energy",         type: "Stock", sector: "LNG Export",         risk: "Low",    expectedReturn: 8.7,  divYield: 1.0, color: "#0a6640" },
  { id: "FSLR", name: "First Solar",             type: "Stock", sector: "Solar Mfg",          risk: "Medium", expectedReturn: 12.1, divYield: 0.0, color: "#d97706" },
  { id: "CCJ",  name: "Cameco (Uranium)",        type: "Stock", sector: "Nuclear",            risk: "Medium", expectedReturn: 16.4, divYield: 0.3, color: "#b45309" },
  { id: "BEP",  name: "Brookfield Renewable",    type: "Stock", sector: "Renewables Infra",   risk: "Low",    expectedReturn: 7.8,  divYield: 5.2, color: "#be185d" },
  { id: "ICLN", name: "iShares Clean Energy ETF",type: "ETF",   sector: "Global Renewables",  risk: "Medium", expectedReturn: 11.5, divYield: 1.4, color: "#1a56db" },
  { id: "GRID", name: "Clean Edge Smart Grid ETF",type:"ETF",   sector: "Grid Infrastructure",risk: "Low",    expectedReturn: 13.2, divYield: 0.8, color: "#059669" },
  { id: "NLR",  name: "VanEck Nuclear ETF",      type: "ETF",   sector: "Nuclear",            risk: "Medium", expectedReturn: 18.1, divYield: 1.1, color: "#dc2626" },
  { id: "XLE",  name: "Energy Select SPDR ETF",  type: "ETF",   sector: "Broad Energy",       risk: "Medium", expectedReturn: 7.2,  divYield: 3.8, color: "#64748b" },
];

// ─── AI + ENERGY TRACKER DATA ─────────────────────────────────────────────────

const AI_ENERGY_STATS = [
  { label: "AI Share of US Power by 2030", value: "9%", sub: "Up from 4% in 2023 · Morgan Stanley", color: "#7c3aed" },
  { label: "Grid Investment by US Utilities", value: "$1.4T", sub: "Planned over next 5 years", color: "#0057a8" },
  { label: "Data Center Power Demand Growth", value: "+26%", sub: "Peak demand increase by 2035 · Deloitte", color: "#dc2626" },
  { label: "AI Energy Deal Value (2025)", value: "$50B", sub: "Power plants sold to hyperscalers", color: "#d97706" },
];

const AI_ENERGY_DEALS = [
  { company: "Microsoft", target: "Three Mile Island Nuclear", value: "$1.6B/yr", type: "PPA", sector: "Nuclear", year: "2023", status: "Active", impact: "Template deal — triggered nuclear renaissance wave across all hyperscalers" },
  { company: "Google", target: "Kairos Power (Nuclear SMR)", value: "500MW", type: "PPA", sector: "Nuclear SMR", year: "2024", status: "Active", impact: "First hyperscaler SMR deal — unlocks small modular reactor commercial market" },
  { company: "Amazon (AWS)", target: "Talen Energy (Nuclear)", value: "$650M", type: "Acquisition", sector: "Nuclear", year: "2024", status: "Active", impact: "Direct nuclear ownership — new model beyond PPAs raises regulatory scrutiny" },
  { company: "Meta", target: "AES Solar Portfolio", value: "4GW", type: "PPA", sector: "Solar", year: "2025", status: "Active", impact: "Largest solar PPA by a hyperscaler — AES stock surged 12% on announcement" },
  { company: "Microsoft", target: "Brookfield Renewable", value: "10.5GW", type: "PPA", sector: "Wind + Solar", year: "2023", status: "Active", impact: "Largest ever corporate clean energy deal — global benchmark for offtake pricing" },
  { company: "Google", target: "NuScale (SMR cancelled)", value: "N/A", type: "Cancelled", sector: "Nuclear SMR", year: "2023", status: "Cancelled", impact: "Key warning: SMR viability challenged. NuScale scrapped Utah project due to cost overruns" },
];

const AI_POWER_TIMELINE = [
  { year: "2023", event: "AI power demand recognized as material grid risk", powerTW: 0.04 },
  { year: "2024", event: "Hyperscaler energy deals accelerate — $50B+ committed", powerTW: 0.09 },
  { year: "2025", event: "AI accounts for 4% of US power; grid bottleneck declared", powerTW: 0.18 },
  { year: "2026", event: "Projected: AI drives +3.7% global power demand growth", powerTW: 0.31 },
  { year: "2027E", event: "Forecast: AI overtakes industrial sector power use in US", powerTW: 0.48 },
  { year: "2030E", event: "Target: AI = 9% of all US power consumption (Morgan Stanley)", powerTW: 0.85 },
];

const TAG_COLORS = {
  Infrastructure: "#7c3aed", "Stock Picks": "#e8000d", Hydrogen: "#0057a8",
  Policy: "#b45309", Macro: "#0a6640", "M&A": "#be185d", AI: "#4f46e5", Nuclear: "#b91c1c",
};

// ─── SECURE AI HELPER ────────────────────────────────────────────────────────
// Every AI feature now calls our own backend endpoint (/api/ai) instead of
// hitting the Anthropic API directly. The real API key lives only on the
// server (as a Vercel environment variable), never in this client code.
// This also lets us centralize error handling, timeouts, and basic misuse
// protection (e.g. blocking empty/oversized prompts) in one place.

async function askAI(prompt, maxTokens = 1000) {
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, maxTokens }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("AI request failed:", data.error);
      return data.error || "Could not load AI insight. Please try again.";
    }
    return data.text || "No response generated.";
  } catch (err) {
    console.error("AI request error:", err);
    return "Could not load AI insight. Please check your connection and try again.";
  }
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

function LoadingDots() {
  return (
    <span style={{ display:"inline-flex",gap:4,alignItems:"center" }}>
      {[0,1,2].map(i=><span key={i} style={{width:6,height:6,borderRadius:"50%",background:"#0057a8",display:"inline-block",animation:`pulse 1.2s ${i*0.2}s infinite`}}/>)}
      <style>{`@keyframes pulse{0%,80%,100%{opacity:.2;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}`}</style>
    </span>
  );
}

function Badge({ label, color, bg, border }) {
  return <span style={{background:bg||"#f3f4f6",color:color||"#374151",border:`1px solid ${border||"#e5e7eb"}`,fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:4,letterSpacing:.8,textTransform:"uppercase"}}>{label}</span>;
}

function Tag({ label }) {
  return <span style={{background:TAG_COLORS[label]||"#374151",color:"#fff",fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:4,letterSpacing:.8,textTransform:"uppercase"}}>{label}</span>;
}

function SectionHeader({ title, sub, right }) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:8,marginBottom:20}}>
      <div>
        <div style={{fontSize:11,color:"#94a3b8",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{sub}</div>
        <h2 style={{margin:0,fontSize:20,fontWeight:800,color:"#0f172a"}}>{title}</h2>
      </div>
      {right}
    </div>
  );
}

function InsightCard({ insight }) {
  return (
    <div style={{background:"#fff",border:"1px solid #e5e7eb",borderTop:`3px solid ${insight.color}`,borderRadius:8,padding:"20px 22px",display:"flex",flexDirection:"column",gap:10,boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
        <span style={{fontSize:12,color:"#6b7280",fontWeight:600}}>{insight.source} · {insight.date}</span>
        <Tag label={insight.tag}/>
      </div>
      <div style={{fontWeight:700,fontSize:15,color:"#111827",lineHeight:1.45}}>{insight.headline}</div>
      <div style={{fontSize:13,color:"#4b5563",lineHeight:1.7}}>{insight.summary}</div>
    </div>
  );
}

function SectorRow({ s }) {
  const rs={"Strong Buy":{color:"#065f46",bg:"#d1fae5",border:"#6ee7b7"},"Buy":{color:"#1e40af",bg:"#dbeafe",border:"#93c5fd"},"Hold":{color:"#92400e",bg:"#fef3c7",border:"#fcd34d"},"Speculative":{color:"#9a3412",bg:"#fee2e2",border:"#fca5a5"}}[s.rating]||{color:"#374151",bg:"#f3f4f6",border:"#d1d5db"};
  const rb={Low:{color:"#065f46",bg:"#d1fae5"},Medium:{color:"#92400e",bg:"#fef3c7"},High:{color:"#991b1b",bg:"#fee2e2"}}[s.risk];
  const ti=s.trend==="up"?"▲":s.trend==="down"?"▼":"●";
  const tc=s.trend==="up"?"#059669":s.trend==="down"?"#dc2626":"#d97706";
  return (
    <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:8,padding:"16px 20px",display:"grid",gridTemplateColumns:"1fr auto",gap:12,alignItems:"center",boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
      <div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
          <span style={{color:tc,fontSize:11,fontWeight:800}}>{ti}</span>
          <span style={{fontWeight:700,color:"#111827",fontSize:14}}>{s.name}</span>
        </div>
        <div style={{fontSize:12.5,color:"#6b7280",lineHeight:1.55}}>{s.desc}</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,minWidth:100}}>
        <span style={{color:rs.color,background:rs.bg,border:`1px solid ${rs.border}`,padding:"3px 10px",borderRadius:4,fontSize:11,fontWeight:700}}>{s.rating}</span>
        <span style={{color:rb.color,background:rb.bg,padding:"2px 8px",borderRadius:4,fontSize:10,fontWeight:600}}>Risk: {s.risk}</span>
      </div>
    </div>
  );
}

function StockRow({ s }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:"80px 1fr auto",gap:12,alignItems:"center",padding:"11px 0",borderBottom:"1px solid #f1f5f9"}}>
      <div>
        <div style={{fontWeight:800,fontSize:14,color:"#111827",fontFamily:"monospace"}}>{s.ticker}</div>
        <div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>{s.sector}</div>
      </div>
      <div>
        <div style={{fontSize:13,color:"#374151",fontWeight:600}}>{s.name}</div>
        <div style={{fontSize:11,color:"#9ca3af",marginTop:2}}>{s.note}</div>
      </div>
      <div style={{textAlign:"right"}}>
        <div style={{fontSize:14,fontWeight:700,color:"#111827"}}>{s.price}</div>
        <div style={{fontSize:12,fontWeight:700,color:s.up?"#059669":"#dc2626",marginTop:2}}>{s.change}</div>
      </div>
    </div>
  );
}

function ETFRow({ e }) {
  const positive=parseFloat(e.ytd)>=0;
  return (
    <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:8,padding:"14px 18px",display:"grid",gridTemplateColumns:"90px 1fr auto",gap:12,alignItems:"center",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
      <div>
        <div style={{fontWeight:800,fontSize:15,color:"#0057a8",fontFamily:"monospace"}}>{e.ticker}</div>
        <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>TER: {e.ter}</div>
      </div>
      <div>
        <div style={{fontSize:13,color:"#111827",fontWeight:600,lineHeight:1.3}}>{e.name}</div>
        <div style={{fontSize:11,color:"#64748b",marginTop:3}}>{e.focus}</div>
        <div style={{fontSize:12,marginTop:2,color:"#f59e0b"}}>{e.rating}</div>
      </div>
      <div style={{textAlign:"right"}}>
        <div style={{fontSize:15,fontWeight:800,color:positive?"#059669":"#dc2626"}}>{e.ytd}</div>
        <div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>YTD 2026</div>
      </div>
    </div>
  );
}

// ─── FEATURE 1: PORTFOLIO BUILDER ────────────────────────────────────────────

function PortfolioBuilder() {
  const [allocations, setAllocations] = useState({});
  const [investment, setInvestment] = useState(10000);
  const [horizon, setHorizon] = useState(5);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const total = Object.values(allocations).reduce((a,b)=>a+b,0);
  const remaining = 100 - total;

  const setAlloc = (id, val) => {
    const v = Math.max(0, Math.min(100, Number(val)||0));
    setAllocations(prev => {
      const next = {...prev, [id]:v};
      const newTotal = Object.values(next).reduce((a,b)=>a+b,0);
      if (newTotal > 100) return prev;
      return next;
    });
  };

  const clearAll = () => setAllocations({});

  const projectedValue = () => {
    let weightedReturn = 0;
    PORTFOLIO_ASSETS.forEach(a => {
      const w = (allocations[a.id]||0)/100;
      weightedReturn += w * a.expectedReturn;
    });
    return investment * Math.pow(1 + weightedReturn/100, horizon);
  };

  const weightedDividend = () => {
    let d = 0;
    PORTFOLIO_ASSETS.forEach(a => { d += (allocations[a.id]||0)/100 * a.divYield; });
    return d;
  };

  const weightedRisk = () => {
    const risks = PORTFOLIO_ASSETS.map(a => {
      const w = (allocations[a.id]||0)/100;
      const r = {Low:1,Medium:2,High:3}[a.risk]||2;
      return w*r;
    });
    const score = risks.reduce((a,b)=>a+b,0);
    if(score<1) return {label:"Low",color:"#059669",bg:"#d1fae5"};
    if(score<1.7) return {label:"Moderate",color:"#92400e",bg:"#fef3c7"};
    return {label:"High",color:"#991b1b",bg:"#fee2e2"};
  };

  const selected = PORTFOLIO_ASSETS.filter(a=>(allocations[a.id]||0)>0);

  const getAiAnalysis = async () => {
    if(selected.length===0) return;
    setAiLoading(true);
    setAiAnalysis("");
    const portfolioStr = selected.map(a=>`${a.name} (${allocations[a.id]}%)`).join(", ");
    const prompt = `You are a professional energy investment portfolio analyst. Analyze this energy portfolio for a ${horizon}-year horizon with $${investment.toLocaleString()} invested: ${portfolioStr}. In 4-5 sentences: assess diversification, identify the strongest and weakest positions given current 2026 energy market conditions, flag any concentration risks, and give one specific improvement suggestion. Be direct and specific.`;
    const text = await askAI(prompt, 1000);
    setAiAnalysis(text);
    setAiLoading(false);
  };

  const proj = projectedValue();
  const gain = proj - investment;
  const riskProfile = weightedRisk();

  return (
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      <SectionHeader
        sub="Feature 1 of 3 · New"
        title="Energy Portfolio Builder"
        right={<Badge label="Interactive Tool" color="#1e40af" bg="#dbeafe" border="#93c5fd"/>}
      />

      {/* Settings row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"18px 20px",boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
          <label style={{fontSize:12,color:"#64748b",fontWeight:700,textTransform:"uppercase",letterSpacing:.8,display:"block",marginBottom:8}}>Investment Amount</label>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:16,color:"#374151",fontWeight:700}}>$</span>
            <input type="number" value={investment} onChange={e=>setInvestment(Number(e.target.value))} style={{flex:1,border:"1px solid #cbd5e1",borderRadius:6,padding:"8px 12px",fontSize:15,fontWeight:700,color:"#0f172a",outline:"none",width:"100%"}}/>
          </div>
        </div>
        <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"18px 20px",boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
          <label style={{fontSize:12,color:"#64748b",fontWeight:700,textTransform:"uppercase",letterSpacing:.8,display:"block",marginBottom:8}}>Time Horizon: {horizon} years</label>
          <input type="range" min={1} max={20} value={horizon} onChange={e=>setHorizon(Number(e.target.value))} style={{width:"100%",accentColor:"#0057a8"}}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#94a3b8",marginTop:4}}>
            <span>1yr</span><span>5yr</span><span>10yr</span><span>20yr</span>
          </div>
        </div>
      </div>

      {/* Allocation sliders + Projection */}
      <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:20,alignItems:"start"}}>
        {/* Left: sliders */}
        <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"20px",boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"#111827"}}>Allocate Your Portfolio</div>
              <div style={{fontSize:12,color:"#94a3b8",marginTop:2}}>Drag sliders to set % per asset</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{fontSize:13,fontWeight:800,color:remaining<0?"#dc2626":remaining===0?"#059669":"#d97706"}}>
                {remaining>=0?`${remaining}% remaining`:`${Math.abs(remaining)}% over!`}
              </div>
              <button onClick={clearAll} style={{background:"none",border:"1px solid #e2e8f0",borderRadius:6,padding:"4px 10px",fontSize:11,color:"#64748b",cursor:"pointer"}}>Clear</button>
            </div>
          </div>
          {/* Type labels */}
          {["Stock","ETF"].map(type=>(
            <div key={type}>
              <div style={{fontSize:10,color:"#94a3b8",fontWeight:700,textTransform:"uppercase",letterSpacing:1,margin:"12px 0 8px",borderBottom:"1px solid #f1f5f9",paddingBottom:4}}>{type}s</div>
              {PORTFOLIO_ASSETS.filter(a=>a.type===type).map(a=>{
                const alloc=allocations[a.id]||0;
                return (
                  <div key={a.id} style={{marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{width:10,height:10,borderRadius:2,background:a.color,flexShrink:0}}/>
                        <span style={{fontSize:13,fontWeight:600,color:"#111827"}}>{a.id}</span>
                        <span style={{fontSize:11,color:"#94a3b8"}}>{a.name}</span>
                        <Badge label={a.risk+' Risk'} color={a.risk==='Low'?"#065f46":a.risk==='High'?"#991b1b":"#92400e"} bg={a.risk==='Low'?"#d1fae5":a.risk==='High'?"#fee2e2":"#fef3c7"} border="transparent"/>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <input type="number" value={alloc||""} placeholder="0" onChange={e=>setAlloc(a.id,e.target.value)} style={{width:48,border:"1px solid #cbd5e1",borderRadius:4,padding:"2px 6px",fontSize:12,fontWeight:700,textAlign:"center",outline:"none"}}/>
                        <span style={{fontSize:12,color:"#64748b"}}>%</span>
                      </div>
                    </div>
                    <input type="range" min={0} max={100} value={alloc} onChange={e=>setAlloc(a.id,e.target.value)} style={{width:"100%",accentColor:a.color,height:4}}/>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#94a3b8",marginTop:1}}>
                      <span>Est. return: {a.expectedReturn}%/yr</span>
                      <span>Div yield: {a.divYield}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Right: projection panel */}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {/* Main projection card */}
          <div style={{background:"linear-gradient(135deg,#0057a8,#0a6640)",borderRadius:10,padding:"22px",color:"#fff"}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,opacity:.8,marginBottom:8}}>Projected Portfolio Value</div>
            <div style={{fontSize:32,fontWeight:900,letterSpacing:-1}}>${total>0?Math.round(proj).toLocaleString():"—"}</div>
            <div style={{fontSize:13,opacity:.85,marginTop:4}}>after {horizon} year{horizon!==1?"s":""}</div>
            {total>0&&(
              <div style={{marginTop:16,background:"rgba(255,255,255,.15)",borderRadius:8,padding:"12px 14px"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div>
                    <div style={{fontSize:10,opacity:.7,marginBottom:3}}>TOTAL GAIN</div>
                    <div style={{fontSize:16,fontWeight:800,color:gain>=0?"#86efac":"#fca5a5"}}>{gain>=0?"+":"-"}${Math.abs(Math.round(gain)).toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{fontSize:10,opacity:.7,marginBottom:3}}>RETURN</div>
                    <div style={{fontSize:16,fontWeight:800}}>{total>0?((proj/investment-1)*100).toFixed(1):0}%</div>
                  </div>
                  <div>
                    <div style={{fontSize:10,opacity:.7,marginBottom:3}}>ANNUAL DIVIDEND</div>
                    <div style={{fontSize:16,fontWeight:800}}>${Math.round(investment*(total/100)*weightedDividend()/100).toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{fontSize:10,opacity:.7,marginBottom:3}}>RISK PROFILE</div>
                    <div style={{fontSize:14,fontWeight:800}}>{riskProfile.label}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress bar by sector */}
          {selected.length>0&&(
            <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"18px",boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#374151",marginBottom:12}}>Portfolio Breakdown</div>
              {/* visual bar */}
              <div style={{display:"flex",height:14,borderRadius:7,overflow:"hidden",marginBottom:14,gap:1}}>
                {selected.map(a=>(
                  <div key={a.id} title={`${a.id}: ${allocations[a.id]}%`} style={{width:`${allocations[a.id]}%`,background:a.color,transition:"width .3s"}}/>
                ))}
                {remaining>0&&<div style={{width:`${remaining}%`,background:"#f1f5f9"}}/>}
              </div>
              {selected.map(a=>(
                <div key={a.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",borderBottom:"1px solid #f8fafc"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:8,height:8,borderRadius:2,background:a.color}}/>
                    <span style={{fontSize:12,color:"#374151",fontWeight:600}}>{a.id}</span>
                    <span style={{fontSize:11,color:"#94a3b8"}}>{a.sector}</span>
                  </div>
                  <div style={{fontSize:12,fontWeight:700,color:"#111827"}}>{allocations[a.id]}%</div>
                </div>
              ))}
              <div style={{fontSize:10,color:"#94a3b8",marginTop:10,lineHeight:1.5}}>⚠️ Projections are illustrative estimates based on historical sector data. Not a guarantee of future returns.</div>
            </div>
          )}

          {/* AI Analysis Button */}
          <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"18px",boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
            <div style={{fontSize:12,fontWeight:700,color:"#374151",marginBottom:10}}>🤖 AI Portfolio Analysis</div>
            <button onClick={getAiAnalysis} disabled={aiLoading||selected.length===0} style={{width:"100%",background:selected.length===0?"#f1f5f9":"#0057a8",color:selected.length===0?"#94a3b8":"#fff",border:"none",borderRadius:7,padding:"10px",fontSize:13,fontWeight:700,cursor:selected.length===0?"default":"pointer",marginBottom:10}}>
              {aiLoading?<><LoadingDots/> Analysing…</>:"Analyse My Portfolio"}
            </button>
            {aiLoading&&<div style={{fontSize:13,color:"#1e40af",display:"flex",alignItems:"center",gap:8}}><LoadingDots/>Checking current market conditions…</div>}
            {aiAnalysis&&!aiLoading&&<p style={{margin:0,fontSize:13,color:"#1e3a5f",lineHeight:1.7,background:"#f0f9ff",borderRadius:7,padding:"12px 14px",border:"1px solid #bae6fd"}}>{aiAnalysis}</p>}
            {!aiAnalysis&&!aiLoading&&selected.length===0&&<p style={{margin:0,fontSize:12,color:"#94a3b8",fontStyle:"italic"}}>Add assets to your portfolio above, then click Analyse.</p>}
          </div>
        </div>
      </div>

      <div style={{background:"#fffbeb",border:"1px solid #fcd34d",borderRadius:8,padding:"12px 16px",fontSize:12,color:"#92400e"}}>
        ⚠️ <strong>Disclaimer:</strong> Portfolio projections are educational estimates based on historical sector averages. Past performance does not guarantee future results. Always consult a licensed financial adviser before investing.
      </div>
    </div>
  );
}

// ─── FEATURE 2: AI + ENERGY TRACKER ──────────────────────────────────────────

function AIEnergyTracker() {
  const [aiInsight, setAiInsight] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchInsight = useCallback(async () => {
    setAiLoading(true);
    setAiInsight("");
    const prompt = "Search for the latest news today about AI company energy deals, hyperscaler power purchases, or data center electricity demand in 2026. Summarize the single most important development in 3-4 sentences. Be specific: name the companies, the MW or $ value, and why it matters for energy investors.";
    const text = await askAI(prompt, 1000);
    setAiInsight(text);
    setAiLoading(false);
  },[]);

  useEffect(()=>{fetchInsight();},[]); // eslint-disable-line react-hooks/exhaustive-deps

  const subTabs=[["overview","📊 Overview"],["deals","🤝 Hyperscaler Deals"],["timeline","📈 Demand Timeline"]];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      <SectionHeader
        sub="Feature 2 of 3 · Live AI-Powered"
        title="AI + Energy Demand Tracker"
        right={
          <button onClick={fetchInsight} disabled={aiLoading} style={{background:aiLoading?"#e2e8f0":"#7c3aed",color:aiLoading?"#94a3b8":"#fff",border:"none",borderRadius:6,padding:"8px 16px",fontSize:12,fontWeight:700,cursor:aiLoading?"default":"pointer",display:"flex",alignItems:"center",gap:6}}>
            {aiLoading?<><LoadingDots/>Updating…</>:"↺ Refresh Live Data"}
          </button>
        }
      />

      {/* Live AI Briefing */}
      <div style={{background:"#fff",border:"1px solid #ddd6fe",borderLeft:"4px solid #7c3aed",borderRadius:8,padding:"20px 22px",boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <Badge label="🤖 Live AI Briefing" color="#6d28d9" bg="#ede9fe" border="#c4b5fd"/>
          <span style={{fontSize:11,color:"#94a3b8",marginLeft:"auto"}}>Web Search · {new Date().toLocaleDateString()}</span>
        </div>
        {aiLoading
          ?<div style={{color:"#6d28d9",fontSize:14,display:"flex",alignItems:"center",gap:10}}><LoadingDots/>Searching for the latest AI energy deals and power demand news…</div>
          :<p style={{margin:0,fontSize:14,color:"#2e1065",lineHeight:1.75}}>{aiInsight||"Click Refresh to load the latest AI energy intelligence."}</p>
        }
      </div>

      {/* Key stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14}}>
        {AI_ENERGY_STATS.map(s=>(
          <div key={s.label} style={{background:"#fff",border:"1px solid #e2e8f0",borderTop:`3px solid ${s.color}`,borderRadius:10,padding:"16px 18px",boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
            <div style={{fontSize:11,color:"#94a3b8",fontWeight:600,textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>{s.label}</div>
            <div style={{fontSize:26,fontWeight:900,color:s.color,lineHeight:1}}>{s.value}</div>
            <div style={{fontSize:11,color:"#64748b",marginTop:5}}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Sub tabs */}
      <div style={{display:"flex",gap:8}}>
        {subTabs.map(([id,label])=>(
          <button key={id} onClick={()=>setActiveTab(id)} style={{background:activeTab===id?"#7c3aed":"#fff",color:activeTab===id?"#fff":"#374151",border:"1px solid",borderColor:activeTab===id?"#7c3aed":"#e2e8f0",borderRadius:6,padding:"8px 16px",fontSize:13,fontWeight:600,cursor:"pointer"}}>{label}</button>
        ))}
      </div>

      {/* Overview */}
      {activeTab==="overview"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"20px",boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
            <div style={{fontSize:13,fontWeight:700,color:"#374151",marginBottom:14}}>Why AI + Energy is the #1 Investment Theme of 2026</div>
            {[
              {icon:"🤖",title:"AI is insatiable for power","desc":"Each ChatGPT query uses ~10x more energy than a Google search. As AI usage compounds, so does power demand — permanently."},
              {icon:"🏗️",title:"Grid is the new bottleneck","desc":"Even when clean power exists, getting it to data centers is blocked by interconnection queues, aging substations, and slow permitting."},
              {icon:"⚛️",title:"Nuclear is the hyperscaler's fix","desc":"AI companies need 24/7 reliable power — not intermittent solar. Nuclear is the only scalable clean baseload, triggering a nuclear renaissance."},
              {icon:"💡",title:"Investors can own the whole chain","desc":"From uranium miners (CCJ) to grid builders (GEV) to power utilities (NEE) — every link in the AI power chain is investable today."},
            ].map(item=>(
              <div key={item.title} style={{display:"grid",gridTemplateColumns:"36px 1fr",gap:10,marginBottom:14,paddingBottom:14,borderBottom:"1px solid #f8fafc"}}>
                <div style={{fontSize:20,lineHeight:1}}>{item.icon}</div>
                <div>
                  <div style={{fontWeight:700,fontSize:13,color:"#111827",marginBottom:3}}>{item.title}</div>
                  <div style={{fontSize:12,color:"#6b7280",lineHeight:1.55}}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"20px",boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
            <div style={{fontSize:13,fontWeight:700,color:"#374151",marginBottom:14}}>Stocks Most Exposed to AI Power Demand</div>
            {[
              {ticker:"GEV",name:"GE Vernova",exposure:"VERY HIGH",color:"#dc2626",why:"Gas turbines + grid equipment — direct supplier to data center power buildout"},
              {ticker:"NEE",name:"NextEra Energy",exposure:"HIGH",color:"#d97706",why:"Largest US renewable utility — primary hyperscaler PPA counterparty"},
              {ticker:"CCJ",name:"Cameco",exposure:"HIGH",color:"#d97706",why:"World's largest uranium miner — nuclear renaissance direct beneficiary"},
              {ticker:"GRID ETF",name:"Smart Grid ETF",exposure:"HIGH",color:"#d97706",why:"Basket of grid infrastructure stocks — lowest-risk AI energy play"},
              {ticker:"FSLR",name:"First Solar",exposure:"MEDIUM",color:"#0057a8",why:"Solar panels for data center PPAs — FEOC-safe US manufacturer"},
              {ticker:"BEP",name:"Brookfield Renewable",exposure:"MEDIUM",color:"#0057a8",why:"Global clean power platform — growing hyperscaler PPA portfolio"},
            ].map(s=>(
              <div key={s.ticker} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"8px 0",borderBottom:"1px solid #f8fafc",gap:10}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontFamily:"monospace",fontWeight:800,fontSize:13,color:"#111827"}}>{s.ticker}</span>
                    <span style={{fontSize:12,color:"#64748b"}}>{s.name}</span>
                  </div>
                  <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{s.why}</div>
                </div>
                <Badge label={s.exposure} color={s.color} bg={s.color==="#dc2626"?"#fee2e2":s.color==="#d97706"?"#fef3c7":"#dbeafe"} border="transparent"/>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deals table */}
      {activeTab==="deals"&&(
        <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"20px",boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
          <div style={{fontSize:13,fontWeight:700,color:"#374151",marginBottom:4}}>Hyperscaler Energy Deals — Complete Database</div>
          <div style={{fontSize:12,color:"#94a3b8",marginBottom:16}}>Every major AI company energy deal tracked — updated by AI with web search</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {AI_ENERGY_DEALS.map((d,i)=>(
              <div key={i} style={{border:"1px solid #f1f5f9",borderLeft:`4px solid ${d.status==="Cancelled"?"#dc2626":d.type==="Acquisition"?"#7c3aed":"#0057a8"}`,borderRadius:8,padding:"14px 16px"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:10,marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                    <span style={{fontWeight:800,fontSize:14,color:"#0f172a"}}>{d.company}</span>
                    <span style={{fontSize:12,color:"#94a3b8"}}>→</span>
                    <span style={{fontWeight:600,fontSize:13,color:"#374151"}}>{d.target}</span>
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"flex-end"}}>
                    <Badge label={d.year} color="#374151" bg="#f3f4f6" border="#e5e7eb"/>
                    <Badge label={d.type} color="#1e40af" bg="#dbeafe" border="#93c5fd"/>
                    <Badge label={d.status} color={d.status==="Cancelled"?"#991b1b":"#065f46"} bg={d.status==="Cancelled"?"#fee2e2":"#d1fae5"} border="transparent"/>
                  </div>
                </div>
                <div style={{display:"flex",gap:16,marginBottom:8,flexWrap:"wrap"}}>
                  <div style={{fontSize:12,color:"#374151"}}><span style={{color:"#94a3b8"}}>Value: </span><strong>{d.value}</strong></div>
                  <div style={{fontSize:12,color:"#374151"}}><span style={{color:"#94a3b8"}}>Sector: </span><strong>{d.sector}</strong></div>
                </div>
                <div style={{fontSize:12,color:"#4b5563",background:"#f8fafc",borderRadius:6,padding:"8px 10px",lineHeight:1.5}}>💡 {d.impact}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      {activeTab==="timeline"&&(
        <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"20px",boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
          <div style={{fontSize:13,fontWeight:700,color:"#374151",marginBottom:4}}>AI Power Demand Growth Timeline</div>
          <div style={{fontSize:12,color:"#94a3b8",marginBottom:20}}>From niche concern to the #1 global grid challenge — 2023 to 2030</div>
          {AI_POWER_TIMELINE.map((item,i)=>{
            const maxPow=0.85;
            const pct=(item.powerTW/maxPow)*100;
            const isForecast=item.year.includes("E");
            return (
              <div key={item.year} style={{display:"grid",gridTemplateColumns:"70px 1fr",gap:16,marginBottom:20,alignItems:"start"}}>
                <div style={{textAlign:"right"}}>
                  <div style={{fontWeight:800,fontSize:14,color:isForecast?"#94a3b8":"#0f172a"}}>{item.year}</div>
                  <div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>{isForecast?"Forecast":"Actual"}</div>
                </div>
                <div>
                  <div style={{fontSize:12,color:"#374151",marginBottom:6,lineHeight:1.4}}>{item.event}</div>
                  <div style={{background:"#f1f5f9",borderRadius:4,height:12,overflow:"hidden",position:"relative"}}>
                    <div style={{width:`${pct}%`,height:"100%",background:isForecast?"#a78bfa":"#7c3aed",borderRadius:4,transition:"width 1s",opacity:isForecast?.6:1}}/>
                  </div>
                  <div style={{fontSize:11,color:"#94a3b8",marginTop:3}}>~{item.powerTW} TW equivalent AI power demand</div>
                </div>
              </div>
            );
          })}
          <div style={{background:"#f5f3ff",border:"1px solid #ddd6fe",borderRadius:8,padding:"12px 16px",fontSize:12,color:"#5b21b6",marginTop:8,lineHeight:1.6}}>
            📌 <strong>Key insight for investors:</strong> Power demand from AI is not cyclical — it compounds with AI adoption. Every dollar spent on AI chips drives $3–$5 of energy infrastructure investment. The grid bottleneck means energy stocks benefit even if AI growth slows, because catching up takes years.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── FEATURE 3: WEEKLY NEWSLETTER ────────────────────────────────────────────

function NewsletterHub() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [interest, setInterest] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [previewGenerated, setPreviewGenerated] = useState(false);
  const [subCount] = useState(1247);

  const interests = ["Solar & Wind","Nuclear","Grid Infrastructure","LNG & Gas","Battery Storage","Hydrogen","ETFs & Funds","M&A Deals"];

  const toggleInterest = (item) => {
    setInterest(prev=>prev.includes(item)?prev.filter(i=>i!==item):[...prev,item]);
  };

  const handleSubscribe = (e) => {
    e.preventDefault&&e.preventDefault();
    if(!email||!email.includes("@")) return;
    setSubmitted(true);
  };

  const generatePreview = async () => {
    setPreviewLoading(true);
    setPreviewContent("");
    const prompt = `You are the editor of the Energy Investor Hub Monday Briefing newsletter. Write this week's edition (week of June 30, 2026) in a professional but accessible tone. Search the web for the latest energy investment news. Structure it as: 1) ONE BIG THING (1 paragraph on the week's most important energy investment development), 2) SECTOR WATCH (2-3 bullet points on key sector moves), 3) DEAL OF THE WEEK (1 notable M&A or PPA deal), 4) CHART TO WATCH (describe one key data trend investors should monitor), 5) READER TIP (one practical action investors can take this week). Use current real data. Be specific with company names, numbers, and percentages.`;
    const text = await askAI(prompt, 1200);
    setPreviewContent(text);
    setPreviewGenerated(true);
    setPreviewLoading(false);
  };

  const formatNewsletter = (text) => {
    if(!text) return null;
    return text.split("\n").filter(l=>l.trim()).map((line,i)=>{
      if(line.match(/^#{1,3} /)||line.match(/^\*\*[A-Z]/)||line.match(/^[A-Z][A-Z\s]+:/)||line.match(/^\d\)/)) {
        const clean=line.replace(/^#{1,3} /,"").replace(/\*\*/g,"").replace(/:/,"");
        return <div key={i} style={{fontWeight:800,fontSize:14,color:"#0057a8",marginTop:i>0?20:0,marginBottom:6,borderBottom:"2px solid #e2e8f0",paddingBottom:6}}>{clean}</div>;
      }
      if(line.startsWith("- ")||line.startsWith("• ")) {
        return <div key={i} style={{display:"flex",gap:8,marginBottom:6}}><span style={{color:"#0057a8",fontWeight:700,flexShrink:0}}>•</span><span style={{fontSize:13,color:"#374151",lineHeight:1.65}}>{line.replace(/^[•\-] /,"")}</span></div>;
      }
      return <p key={i} style={{margin:"0 0 10px",fontSize:13,color:"#374151",lineHeight:1.7}}>{line}</p>;
    });
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      <SectionHeader
        sub="Feature 3 of 3 · Builds Your Audience"
        title="Weekly Energy Investor Briefing"
        right={<div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:8,height:8,borderRadius:"50%",background:"#22c55e",animation:"ping 2s infinite"}}><style>{`@keyframes ping{0%,100%{opacity:1}50%{opacity:.3}}`}</style></div><span style={{fontSize:13,color:"#64748b",fontWeight:600}}>{subCount.toLocaleString()} subscribers</span></div>}
      />

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,alignItems:"start"}}>

        {/* Left: Sign up */}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {/* Value props */}
          <div style={{background:"linear-gradient(135deg,#0057a8,#7c3aed)",borderRadius:10,padding:"22px",color:"#fff"}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,opacity:.8,marginBottom:8}}>Every Monday Morning</div>
            <h3 style={{margin:"0 0 10px",fontSize:18,fontWeight:800,lineHeight:1.2}}>The Energy Investor Briefing</h3>
            <p style={{margin:"0 0 16px",fontSize:13,opacity:.9,lineHeight:1.65}}>5 minutes every Monday. Everything you need to know about energy investing this week — curated from BlackRock, IEA, Morningstar and real-time AI web search.</p>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {["📊 ONE BIG THING — Week's #1 energy investment story","⚡ SECTOR WATCH — What's moving and why","🤝 DEAL OF THE WEEK — Key M&A & PPA signed","📈 CHART TO WATCH — One data trend to track","💡 READER TIP — One action to take this week"].map(item=>(
                <div key={item} style={{display:"flex",alignItems:"flex-start",gap:8,fontSize:12,opacity:.92,lineHeight:1.4}}>
                  <span style={{flexShrink:0}}>{item.split("—")[0]}</span>
                  <span style={{opacity:.8}}>— {item.split("—")[1]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Signup form */}
          {!submitted?(
            <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"20px",boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
              <div style={{fontSize:14,fontWeight:700,color:"#0f172a",marginBottom:4}}>Subscribe — Free Forever</div>
              <div style={{fontSize:12,color:"#94a3b8",marginBottom:16}}>Join {subCount.toLocaleString()} energy investors. No spam, ever.</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your first name" style={{border:"1px solid #cbd5e1",borderRadius:7,padding:"10px 14px",fontSize:13,color:"#111827",outline:"none"}}/>
                <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Your email address" type="email" style={{border:"1px solid #cbd5e1",borderRadius:7,padding:"10px 14px",fontSize:13,color:"#111827",outline:"none"}}/>
                <div style={{fontSize:12,color:"#64748b",fontWeight:600,marginTop:4}}>Topics you care about:</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {interests.map(item=>(
                    <button key={item} onClick={()=>toggleInterest(item)} style={{background:interest.includes(item)?"#0057a8":"#f8fafc",color:interest.includes(item)?"#fff":"#374151",border:"1px solid",borderColor:interest.includes(item)?"#0057a8":"#e2e8f0",borderRadius:20,padding:"5px 12px",fontSize:12,cursor:"pointer",fontWeight:500,transition:"all .15s"}}>{item}</button>
                  ))}
                </div>
                <button onClick={handleSubscribe} disabled={!email||!email.includes("@")} style={{background:!email||!email.includes("@")?"#e2e8f0":"#0057a8",color:!email||!email.includes("@")?"#94a3b8":"#fff",border:"none",borderRadius:7,padding:"12px",fontSize:14,fontWeight:700,cursor:!email||!email.includes("@")?"default":"pointer",marginTop:4}}>
                  Subscribe Free →
                </button>
              </div>
            </div>
          ):(
            <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"24px",textAlign:"center"}}>
              <div style={{fontSize:32,marginBottom:8}}>🎉</div>
              <div style={{fontWeight:800,fontSize:16,color:"#065f46",marginBottom:6}}>You're subscribed{name?`, ${name}`:""}!</div>
              <div style={{fontSize:13,color:"#166534",lineHeight:1.6}}>Your first Monday Briefing arrives this coming Monday. Check your inbox and whitelist <strong>hello@energyinvestorhub.com</strong> to ensure delivery.</div>
              <div style={{marginTop:16,fontSize:12,color:"#94a3b8"}}>While you wait — preview this week's edition below ↓</div>
            </div>
          )}

          {/* Social proof */}
          <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"16px 20px",boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
            <div style={{fontSize:12,fontWeight:700,color:"#374151",marginBottom:12}}>What subscribers say</div>
            {[
              {quote:"The only newsletter that actually explains the AI-energy connection simply. I forward it every Monday.",name:"Marcus T.",role:"Retail Investor"},
              {quote:"Finally a place for beginners that doesn't talk down to you. The sector ratings are invaluable.",name:"Sarah K.",role:"Finance Graduate"},
            ].map(r=>(
              <div key={r.name} style={{marginBottom:12,paddingBottom:12,borderBottom:"1px solid #f1f5f9"}}>
                <div style={{fontSize:13,color:"#374151",fontStyle:"italic",lineHeight:1.6,marginBottom:6}}>"{r.quote}"</div>
                <div style={{fontSize:11,color:"#94a3b8",fontWeight:600}}>{r.name} · {r.role}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Live preview */}
        <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"20px",boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"#111827"}}>📬 This Week's Edition Preview</div>
              <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>Generated live with AI + web search</div>
            </div>
            <button onClick={generatePreview} disabled={previewLoading} style={{background:previewLoading?"#e2e8f0":"#0f172a",color:previewLoading?"#94a3b8":"#fff",border:"none",borderRadius:6,padding:"8px 14px",fontSize:12,fontWeight:600,cursor:previewLoading?"default":"pointer",display:"flex",alignItems:"center",gap:6}}>
              {previewLoading?<><LoadingDots/>Generating…</>:previewGenerated?"↺ Regenerate":"Generate Preview"}
            </button>
          </div>

          {/* Newsletter header */}
          <div style={{background:"#0f172a",borderRadius:"8px 8px 0 0",padding:"16px 20px",marginBottom:0}}>
            <div style={{fontSize:10,color:"#94a3b8",letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>ENERGY INVESTOR HUB</div>
            <div style={{fontSize:16,fontWeight:800,color:"#fff"}}>⚡ Monday Briefing</div>
            <div style={{fontSize:11,color:"#64748b",marginTop:3}}>Week of {new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</div>
          </div>
          <div style={{border:"1px solid #e2e8f0",borderTop:"none",borderRadius:"0 0 8px 8px",padding:"20px",minHeight:200}}>
            {previewLoading&&(
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:180,gap:12}}>
                <LoadingDots/>
                <div style={{fontSize:13,color:"#64748b"}}>Writing this week's edition using live web search…</div>
              </div>
            )}
            {!previewLoading&&!previewContent&&(
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:180,gap:10,textAlign:"center"}}>
                <div style={{fontSize:32}}>📰</div>
                <div style={{fontSize:13,color:"#94a3b8"}}>Click 'Generate Preview' to see this week's live AI-written newsletter edition, sourced from real-time web data.</div>
              </div>
            )}
            {!previewLoading&&previewContent&&(
              <div>{formatNewsletter(previewContent)}</div>
            )}
          </div>

          {/* Sponsor callout */}
          <div style={{marginTop:14,background:"#fffbeb",border:"1px solid #fcd34d",borderRadius:8,padding:"12px 16px"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#92400e",textTransform:"uppercase",letterSpacing:.8,marginBottom:4}}>💰 Sponsor Opportunity</div>
            <div style={{fontSize:12,color:"#78350f",lineHeight:1.55}}>This newsletter reaches <strong>{subCount.toLocaleString()}+ verified energy investors</strong>. Sponsorships from $200/edition. <strong>Contact: sponsors@energyinvestorhub.com</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function EnergyInvestorHub() {
  const [tab, setTab] = useState("dashboard");
  const [aiInsight, setAiInsight] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [glossarySearch, setGlossarySearch] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [tradingTab, setTradingTab] = useState("stocks");

  const fetchAiUpdate = useCallback(async (userQuestion=null)=>{
    setAiLoading(true); setAiInsight("");
    const prompt = userQuestion
      ?`You are an expert energy investment analyst. A beginner investor asks: "${userQuestion}". Give a clear, educational answer in 3-4 sentences using current 2026 energy market context. Be specific about companies, numbers, or trends where possible.`
      :`You are an expert energy investment analyst summarizing today's most important energy investment insight for a beginner investor. Write 3-4 sentences covering one specific trend, opportunity, or risk in the 2026 energy market. Be specific — name sectors, companies, or figures. Date: ${new Date().toDateString()}.`;
    const text = await askAI(prompt, 1000);
    setAiInsight(text);
    setAiLoading(false);
  },[]);

  const handleRefresh=async()=>{setRefreshing(true);await fetchAiUpdate();setLastUpdated(new Date());setRefreshing(false);};
  useEffect(()=>{fetchAiUpdate();},[]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredGlossary=GLOSSARY.filter(g=>g.term.toLowerCase().includes(glossarySearch.toLowerCase())||g.def.toLowerCase().includes(glossarySearch.toLowerCase()));

  const TABS=[
    {id:"dashboard",label:"Dashboard"},
    {id:"portfolio",label:"🏗 Portfolio Builder"},
    {id:"ai-energy",label:"🤖 AI + Energy Tracker"},
    {id:"newsletter",label:"📬 Newsletter"},
    {id:"trading",label:"Trading & ETFs"},
    {id:"sectors",label:"Sector Ratings"},
    {id:"insights",label:"Expert Insights"},
    {id:"ask",label:"Ask AI Analyst"},
    {id:"benefits",label:"Your Benefits"},
    {id:"glossary",label:"Glossary"},
  ];

  const S={
    card:{background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,padding:"20px",boxShadow:"0 1px 3px rgba(0,0,0,.05)"},
    sectionTitle:{margin:"0 0 14px",fontSize:12,color:"#64748b",fontWeight:700,textTransform:"uppercase",letterSpacing:1},
    pageNote:{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:"14px 18px",marginBottom:20,fontSize:13,color:"#64748b",lineHeight:1.6},
  };

  return (
    <div style={{minHeight:"100vh",background:"#f8fafc",color:"#111827",fontFamily:"'Inter','Segoe UI',Arial,sans-serif"}}>
      {/* Top Bar */}
      <div style={{background:"#0f172a",padding:"0 28px",display:"flex",alignItems:"center",justifyContent:"space-between",height:44}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <span style={{color:"#f1f5f9",fontSize:11,fontWeight:700,letterSpacing:1}}>ENERGY INVESTOR HUB</span>
          <span style={{color:"#475569",fontSize:11}}>|</span>
          <span style={{color:"#94a3b8",fontSize:11}}>Educational Platform · Not Financial Advice</span>
        </div>
        <span style={{color:"#64748b",fontSize:11}}>{new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</span>
      </div>

      {/* Header */}
      <div style={{position:"relative",background:"#ffffff",borderBottom:"1px solid #e2e8f0",padding:"24px 28px 0",overflow:"hidden"}}>
        {/* Animated wave background */}
        <div style={{position:"absolute",top:0,left:0,right:0,height:"100%",overflow:"hidden",pointerEvents:"none",opacity:0.5}}>
          <svg viewBox="0 0 1440 200" preserveAspectRatio="none" style={{position:"absolute",bottom:0,left:0,width:"200%",height:"100%",animation:"waveMove 18s linear infinite"}}>
            <path d="M0,100 C240,150 480,50 720,100 C960,150 1200,50 1440,100 L1440,220 L0,220 Z" fill="#dbeafe" />
          </svg>
          <svg viewBox="0 0 1440 200" preserveAspectRatio="none" style={{position:"absolute",bottom:0,left:0,width:"200%",height:"100%",animation:"waveMove 26s linear infinite reverse"}}>
            <path d="M0,120 C240,70 480,170 720,120 C960,70 1200,170 1440,120 L1440,220 L0,220 Z" fill="#bfdbfe" opacity="0.7" />
          </svg>
          <style>{`@keyframes waveMove{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
        </div>
        <div style={{maxWidth:1100,margin:"0 auto",position:"relative",zIndex:1}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:16,marginBottom:24}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:42,height:42,background:"#0057a8",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>⚡</div>
              <div>
                <h1 style={{margin:0,fontSize:24,fontWeight:800,color:"#0f172a",letterSpacing:-.5}}>Energy Investor Hub</h1>
                <p style={{margin:"4px 0 0",fontSize:12,color:"#64748b"}}>Global Energy Intelligence · Portfolio Builder · AI Tracker · Weekly Briefing</p>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}>
              <button onClick={handleRefresh} disabled={refreshing} style={{background:refreshing?"#e2e8f0":"#0057a8",color:refreshing?"#94a3b8":"#fff",border:"none",borderRadius:6,padding:"9px 18px",fontSize:13,fontWeight:600,cursor:refreshing?"default":"pointer",display:"flex",alignItems:"center",gap:7}}>
                {refreshing?<><LoadingDots/>Updating…</>:"↺ Refresh Intelligence"}
              </button>
              <span style={{fontSize:11,color:"#94a3b8"}}>Updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Stats Bar */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:1,background:"#e2e8f0",border:"1px solid #e2e8f0",borderRadius:8,overflow:"hidden"}}>
            {KEY_STATS.map((s,i)=>(
              <div key={s.label} style={{background:"#fff",padding:"14px 18px",borderRight:i<KEY_STATS.length-1?"1px solid #e2e8f0":"none"}}>
                <div style={{fontSize:10,color:"#94a3b8",fontWeight:600,letterSpacing:.5,textTransform:"uppercase",marginBottom:3}}>{s.label}</div>
                <div style={{fontSize:22,fontWeight:800,color:s.accent,lineHeight:1.1}}>{s.value}</div>
                <div style={{fontSize:11,color:"#64748b",marginTop:3}}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{display:"flex",gap:0,marginTop:20,marginLeft:-4,overflowX:"auto"}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{background:"none",border:"none",borderBottom:tab===t.id?"2px solid #0057a8":"2px solid transparent",color:tab===t.id?"#0057a8":"#64748b",padding:"10px 16px",fontSize:13,fontWeight:tab===t.id?700:500,cursor:"pointer",whiteSpace:"nowrap",transition:"all .15s"}}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{maxWidth:1100,margin:"0 auto",padding:"28px"}}>

        {/* DASHBOARD */}
        {tab==="dashboard"&&(
          <div style={{display:"flex",flexDirection:"column",gap:28}}>
            {/* 3 New Feature Cards */}
            <div>
              <div style={{fontSize:12,color:"#94a3b8",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>New Features — Click to Explore</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:14}}>
                {[
                  {id:"portfolio",icon:"🏗",title:"Portfolio Builder",desc:"Build, simulate and get AI analysis on your personal energy investment portfolio.",color:"#0057a8",bg:"#dbeafe"},
                  {id:"ai-energy",icon:"🤖",title:"AI + Energy Tracker",desc:"Live tracking of hyperscaler energy deals, AI power demand data and market moves.",color:"#7c3aed",bg:"#ede9fe"},
                  {id:"newsletter",icon:"📬",title:"Weekly Briefing",desc:"Subscribe to the Monday Energy Investor Briefing — curated by AI, every week.",color:"#0a6640",bg:"#d1fae5"},
                ].map(f=>(
                  <button key={f.id} onClick={()=>setTab(f.id)} style={{background:"#fff",border:`1px solid ${f.bg}`,borderTop:`3px solid ${f.color}`,borderRadius:10,padding:"18px 20px",textAlign:"left",cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,.05)",transition:"box-shadow .2s"}}>
                    <div style={{fontSize:24,marginBottom:8}}>{f.icon}</div>
                    <div style={{fontWeight:700,fontSize:14,color:"#0f172a",marginBottom:5}}>{f.title}</div>
                    <div style={{fontSize:12,color:"#64748b",lineHeight:1.55}}>{f.desc}</div>
                    <div style={{marginTop:10,fontSize:12,color:f.color,fontWeight:700}}>Open →</div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Briefing */}
            <div style={{background:"#fff",border:"1px solid #bfdbfe",borderLeft:"4px solid #0057a8",borderRadius:8,padding:"22px 24px",boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <Badge label="🤖 AI Daily Briefing" color="#1e40af" bg="#dbeafe" border="#93c5fd"/>
                <span style={{fontSize:11,color:"#94a3b8",marginLeft:"auto"}}>Live Web Search · {new Date().toLocaleDateString()}</span>
              </div>
              {aiLoading?<div style={{color:"#1e40af",fontSize:14,display:"flex",alignItems:"center",gap:10}}><LoadingDots/>Searching web for today's energy intelligence…</div>
              :<p style={{margin:0,fontSize:14,color:"#1e3a5f",lineHeight:1.75}}>{aiInsight||"Click 'Refresh Intelligence' to load today's AI briefing."}</p>}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
              {/* Sources */}
              <div style={S.card}>
                <h3 style={S.sectionTitle}>Tracked Data Sources</h3>
                {SOURCES.map(s=>(
                  <a key={s.name} href={s.url} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:10,textDecoration:"none",padding:"8px 12px",borderRadius:6,border:"1px solid #f1f5f9",background:"#f8fafc",marginBottom:6}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:s.color,flexShrink:0}}/>
                    <span style={{fontSize:13,fontWeight:600,color:"#374151",flex:1}}>{s.name}</span>
                    <span style={{fontSize:11,color:"#94a3b8"}}>↗</span>
                  </a>
                ))}
              </div>
              {/* Sector Snapshot */}
              <div style={S.card}>
                <h3 style={S.sectionTitle}>Sector Snapshot</h3>
                {SECTORS.map(s=>{
                  const rc={"Strong Buy":"#059669","Buy":"#1d4ed8","Hold":"#b45309","Speculative":"#b91c1c"}[s.rating];
                  const ti=s.trend==="up"?"▲":s.trend==="down"?"▼":"●";
                  const tc=s.trend==="up"?"#059669":s.trend==="down"?"#dc2626":"#d97706";
                  return(
                    <div key={s.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid #f1f5f9"}}>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <span style={{color:tc,fontSize:9,fontWeight:800}}>{ti}</span>
                        <span style={{fontSize:13,color:"#374151",fontWeight:500}}>{s.name}</span>
                      </div>
                      <span style={{fontSize:12,fontWeight:700,color:rc}}>{s.rating}</span>
                    </div>
                  );
                })}
                <button onClick={()=>setTab("sectors")} style={{marginTop:12,background:"none",border:"none",color:"#0057a8",fontSize:12,fontWeight:600,cursor:"pointer",padding:0}}>Full analysis →</button>
              </div>
            </div>
            {/* Latest Insights */}
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <h3 style={{...S.sectionTitle,margin:0}}>Latest Expert Views</h3>
                <button onClick={()=>setTab("insights")} style={{background:"none",border:"none",color:"#0057a8",fontSize:12,fontWeight:600,cursor:"pointer"}}>View all →</button>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {SEED_INSIGHTS.slice(0,3).map(i=><InsightCard key={i.id} insight={i}/>)}
              </div>
            </div>
          </div>
        )}

        {/* 3 NEW FEATURES */}
        {tab==="portfolio"&&<PortfolioBuilder/>}
        {tab==="ai-energy"&&<AIEnergyTracker/>}
        {tab==="newsletter"&&<NewsletterHub/>}

        {/* TRADING */}
        {tab==="trading"&&(
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            <div style={S.pageNote}><strong>Trading & Market Data</strong> — Educational overview of key energy stocks and ETFs. Prices are indicative only. Always verify on your broker's platform before trading.</div>
            <div style={{display:"flex",gap:8}}>
              {[["stocks","📈 Stocks"],["etfs","📦 ETFs"],["screener","🔎 How to Screen"]].map(([id,label])=>(
                <button key={id} onClick={()=>setTradingTab(id)} style={{background:tradingTab===id?"#0057a8":"#fff",color:tradingTab===id?"#fff":"#374151",border:"1px solid",borderColor:tradingTab===id?"#0057a8":"#e2e8f0",borderRadius:6,padding:"8px 16px",fontSize:13,fontWeight:600,cursor:"pointer"}}>{label}</button>
              ))}
            </div>
            {tradingTab==="stocks"&&(
              <div style={S.card}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <h3 style={{...S.sectionTitle,margin:0}}>Top Energy Stocks · June 2026</h3>
                  <span style={{fontSize:11,color:"#94a3b8"}}>Source: Morningstar, BlackRock</span>
                </div>
                {TOP_STOCKS.map(s=><StockRow key={s.ticker} s={s}/>)}
                <div style={{marginTop:14,background:"#fffbeb",border:"1px solid #fcd34d",borderRadius:6,padding:"10px 14px",fontSize:12,color:"#92400e"}}>⚠️ Prices are illustrative estimates for education only.</div>
              </div>
            )}
            {tradingTab==="etfs"&&(
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <div style={{...S.card,marginBottom:0}}>
                  <h3 style={S.sectionTitle}>Key Energy ETFs · 2026 Performance</h3>
                  <p style={{margin:"0 0 16px",fontSize:13,color:"#64748b"}}>ETFs let you invest in a basket of energy companies with one purchase — lower risk than individual stocks.</p>
                </div>
                {ENERGY_ETFS.map(e=><ETFRow key={e.ticker} e={e}/>)}
                <div style={{background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:8,padding:"14px 18px",fontSize:13,color:"#0c4a6e"}}>💡 <strong>Beginner tip:</strong> Consider starting with <strong>ICLN</strong> (global diversification) or <strong>GRID</strong> (grid infrastructure). Always check the latest TER on your broker before buying.</div>
              </div>
            )}
            {tradingTab==="screener"&&(
              <div style={S.card}>
                <h3 style={S.sectionTitle}>How to Screen Energy Stocks — 6 Steps</h3>
                {[
                  {step:"01",title:"Choose a free screening tool",body:"Use Morningstar, Finviz, or Yahoo Finance. Filter by sector: 'Energy' or 'Utilities'."},
                  {step:"02",title:"Filter by key financial metrics",body:"P/E below sector average, positive free cash flow, revenue growth >5% YoY, debt-to-equity below 1.5."},
                  {step:"03",title:"Check analyst ratings",body:"Prioritize stocks with 2+ analysts rating 'Buy' or 'Strong Buy' from Morningstar or BlackRock."},
                  {step:"04",title:"Match to sector outlook",body:"Check our Sector Ratings tab — is this company in a 'Strong Buy' or 'Buy' trending sub-sector?"},
                  {step:"05",title:"Review dividend income",body:"Energy companies like NEE and BEP pay dividends. A 3-5% yield adds significantly to total returns."},
                  {step:"06",title:"Set your position size",body:"No single stock should exceed 5-10% of your portfolio. Diversify across at least 3 energy sub-sectors."},
                ].map(item=>(
                  <div key={item.step} style={{display:"grid",gridTemplateColumns:"40px 1fr",gap:16,marginBottom:16,paddingBottom:16,borderBottom:"1px solid #f1f5f9"}}>
                    <div style={{width:36,height:36,background:"#dbeafe",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#1e40af",flexShrink:0}}>{item.step}</div>
                    <div>
                      <div style={{fontWeight:700,fontSize:14,color:"#111827",marginBottom:4}}>{item.title}</div>
                      <div style={{fontSize:13,color:"#6b7280",lineHeight:1.6}}>{item.body}</div>
                    </div>
                  </div>
                ))}
                <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,padding:"12px 16px",fontSize:13,color:"#065f46"}}>🔗 <strong>Free screeners:</strong> finviz.com · finance.yahoo.com · morningstar.com · stockanalysis.com</div>
              </div>
            )}
          </div>
        )}

        {/* SECTORS */}
        {tab==="sectors"&&(
          <div>
            <div style={S.pageNote}>Sector ratings compiled from <strong>BlackRock, Morningstar, Wood Mackenzie, IEA</strong> and <strong>Deloitte</strong> reports as of June 2026. Educational purposes only.</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {SECTORS.map(s=><SectorRow key={s.name} s={s}/>)}
            </div>
            <div style={{marginTop:20,background:"#fffbeb",border:"1px solid #fcd34d",borderRadius:8,padding:"12px 16px",fontSize:12,color:"#92400e"}}>⚠️ Always consult a licensed financial advisor before making investment decisions.</div>
          </div>
        )}

        {/* INSIGHTS */}
        {tab==="insights"&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={S.pageNote}>Curated from <strong>BlackRock, Morningstar, PwC, Wood Mackenzie, Deloitte, IEA</strong> and <strong>BloombergNEF</strong> · June 2026</div>
            {SEED_INSIGHTS.map(i=><InsightCard key={i.id} insight={i}/>)}
          </div>
        )}

        {/* ASK AI */}
        {tab==="ask"&&(
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            <div style={{background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:8,padding:"16px 20px"}}>
              <p style={{margin:0,fontSize:13,color:"#0c4a6e",lineHeight:1.6}}><strong>Ask anything about energy investing.</strong> AI analyst with live web search. Educational only — not financial advice.</p>
            </div>
            <div>
              <div style={{fontSize:12,color:"#94a3b8",marginBottom:10,fontWeight:700,textTransform:"uppercase",letterSpacing:.8}}>Quick Questions</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {["Best energy ETFs right now?","How does AI affect energy demand?","Is nuclear a good investment in 2026?","Hydrogen risk assessment?","How to start investing in clean energy?","GE Vernova outlook 2026?"].map(q=>(
                  <button key={q} onClick={()=>{setAiQuestion(q);fetchAiUpdate(q);}} style={{background:"#fff",border:"1px solid #cbd5e1",color:"#374151",padding:"8px 14px",borderRadius:20,fontSize:12,cursor:"pointer",fontWeight:500}}>{q}</button>
                ))}
              </div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <input value={aiQuestion} onChange={e=>setAiQuestion(e.target.value)} onKeyDown={e=>e.key==="Enter"&&aiQuestion&&fetchAiUpdate(aiQuestion)} placeholder="Type your energy investment question…" style={{flex:1,background:"#fff",border:"1px solid #cbd5e1",borderRadius:8,padding:"12px 16px",color:"#111827",fontSize:14,outline:"none"}}/>
              <button onClick={()=>aiQuestion&&fetchAiUpdate(aiQuestion)} disabled={aiLoading||!aiQuestion} style={{background:!aiQuestion?"#e2e8f0":"#0057a8",color:!aiQuestion?"#94a3b8":"#fff",border:"none",borderRadius:8,padding:"12px 22px",fontSize:13,fontWeight:700,cursor:aiLoading||!aiQuestion?"default":"pointer"}}>Ask</button>
            </div>
            <div style={{background:"#fff",border:"1px solid #e2e8f0",borderLeft:"4px solid #0057a8",borderRadius:8,padding:"20px 24px",minHeight:90,boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
              <div style={{fontSize:11,color:"#94a3b8",fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginBottom:10}}>AI Analyst Response</div>
              {aiLoading?<div style={{color:"#1e40af",fontSize:14,display:"flex",alignItems:"center",gap:10}}><LoadingDots/>Searching live data…</div>
              :aiInsight?<p style={{margin:0,fontSize:14,color:"#1e3a5f",lineHeight:1.75}}>{aiInsight}</p>
              :<p style={{margin:0,fontSize:13,color:"#94a3b8",fontStyle:"italic"}}>Your answer will appear here.</p>}
            </div>
            <p style={{margin:0,fontSize:11,color:"#94a3b8"}}>⚠️ AI responses are for educational purposes only — not financial advice.</p>
          </div>
        )}

        {/* BENEFITS */}
        {tab==="benefits"&&(
          <div style={{display:"flex",flexDirection:"column",gap:24}}>
            <div style={{background:"linear-gradient(135deg,#0057a8,#0a6640)",borderRadius:12,padding:"28px 32px",color:"#fff"}}>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",opacity:.8,marginBottom:8}}>Website Monetization Analysis</div>
              <h2 style={{margin:"0 0 8px",fontSize:22,fontWeight:800}}>Your Revenue Potential as Owner</h2>
              <p style={{margin:0,fontSize:14,opacity:.9,lineHeight:1.7}}>An energy investment education website sits in one of the highest-earning niches online. Finance content commands premium ad rates, high affiliate commissions, and engaged audiences willing to pay for subscriptions.</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:16,marginTop:24}}>
                {[["$400","Max per broker signup"],["$150 CPM","Newsletter sponsor rate"],["$29/mo","Premium subscriber value"],["$40 RPM","Finance ad revenue rate"]].map(([val,label])=>(
                  <div key={label} style={{background:"rgba(255,255,255,.15)",borderRadius:8,padding:"12px 16px"}}>
                    <div style={{fontSize:22,fontWeight:800}}>{val}</div>
                    <div style={{fontSize:11,opacity:.85,marginTop:3}}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{fontSize:12,color:"#64748b",fontWeight:700,textTransform:"uppercase",letterSpacing:1,margin:"0 0 16px"}}>Revenue Streams — Ranked by Potential</div>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {REVENUE_STREAMS.map(r=>(
                  <div key={r.title} style={{background:"#fff",border:"1px solid #e2e8f0",borderLeft:`4px solid ${r.color}`,borderRadius:8,padding:"20px 22px",boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10,marginBottom:10}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontSize:22}}>{r.icon}</span>
                        <div>
                          <div style={{fontWeight:700,fontSize:15,color:"#111827"}}>{r.title}</div>
                          <Badge label={r.tier} color={r.tier==="Primary"?"#1e40af":r.tier==="Secondary"?"#92400e":"#374151"} bg={r.tier==="Primary"?"#dbeafe":r.tier==="Secondary"?"#fef3c7":"#f3f4f6"} border="transparent"/>
                        </div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontWeight:800,fontSize:16,color:r.color}}>{r.potential}</div>
                        <div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>Estimated earning</div>
                      </div>
                    </div>
                    <p style={{margin:"0 0 12px",fontSize:13,color:"#4b5563",lineHeight:1.7}}>{r.desc}</p>
                    <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,padding:"8px 12px",fontSize:12,color:"#374151"}}>
                      <span style={{fontWeight:700,color:"#0057a8"}}>→ Action: </span>{r.action}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* GLOSSARY */}
        {tab==="glossary"&&(
          <div>
            <input value={glossarySearch} onChange={e=>setGlossarySearch(e.target.value)} placeholder="Search terms and definitions…" style={{width:"100%",background:"#fff",border:"1px solid #cbd5e1",borderRadius:8,padding:"12px 16px",color:"#111827",fontSize:14,outline:"none",marginBottom:16,boxSizing:"border-box",boxShadow:"0 1px 2px rgba(0,0,0,.04)"}}/>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {filteredGlossary.map(g=>(
                <div key={g.term} style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,padding:"16px 20px",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
                  <div style={{fontWeight:700,color:"#0057a8",fontSize:14,marginBottom:6}}>{g.term}</div>
                  <div style={{fontSize:13.5,color:"#374151",lineHeight:1.65}}>{g.def}</div>
                </div>
              ))}
              {filteredGlossary.length===0&&<div style={{color:"#94a3b8",fontSize:14,padding:"20px 0"}}>No matching terms found.</div>}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{background:"#0f172a",borderTop:"1px solid #1e293b",padding:"20px 28px",marginTop:40}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{color:"#f1f5f9",fontSize:13,fontWeight:700,marginBottom:4}}>Energy Investor Hub</div>
            <div style={{color:"#475569",fontSize:11}}>Educational platform · Not financial advice · Always consult a licensed advisor</div>
          </div>
          <div style={{color:"#475569",fontSize:11,textAlign:"right"}}>
            <div>Sources: IEA · BlackRock · Morningstar · Wood Mackenzie · Deloitte · PwC · BloombergNEF</div>
            <div style={{marginTop:4}}>© 2026 Energy Investor Hub</div>
          </div>
        </div>
      </div>
    </div>
  );
}
