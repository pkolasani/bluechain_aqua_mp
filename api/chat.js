// Vercel serverless endpoint for the Blue Chain Aqua Farmer Assistant.
// Set GEMINI_API_KEY in Vercel Project Settings -> Environment Variables.
// Gemini Google Search grounding is used so time-sensitive scheme/regulation answers can be checked online.
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  const key=process.env.GEMINI_API_KEY;
  if(!key) return res.status(503).json({error:'GEMINI_API_KEY is not configured'});
  try{
    const body=req.body||{};
    const message=String(body.message||'').trim();
    if(!message) return res.status(400).json({error:'Message is required'});
    const history=Array.isArray(body.history)?body.history.slice(-10):[];
    const language=String(body.language||'en');
    const languageName={en:'English',te:'Telugu',hi:'Hindi'}[language]||'English';
    const contents=[...history.filter(x=>x&&['user','model'].includes(x.role)).map(x=>({role:x.role,parts:[{text:String(x.content||'')}]})),{role:'user',parts:[{text:message}]}];
    const systemInstruction={parts:[{text:`You are the Blue Chain Aqua Farmer Assistant for an Indian aquaculture and fisheries consultancy. Answer in simple, practical language that a farmer can understand. Support English, Telugu and Hindi. Reply in the user's selected language when possible. If the user writes Telugu or Tanglish, reply in Telugu when Telugu is selected; if Hindi is selected, reply in Hindi. Keep technical terms understandable for farmers. Topics include fish farming, shrimp farming, pond/site planning, hatcheries, seed, feed and nutrition, water quality, disease prevention, harvesting, processing, market/supply-chain planning, project feasibility and government schemes.

The selected response language is ${languageName}.

For current, time-sensitive questions (schemes, subsidies, eligibility, regulations, government announcements, prices, deadlines, current programmes), use Google Search grounding and prefer authoritative sources such as Government of India departments, PMMSY/Department of Fisheries, NFDB, NABARD/NABCONS, state fisheries departments and other official institutional websites. Clearly distinguish current sourced facts from general guidance. Never invent a subsidy, eligibility rule, project approval, price or deadline. If the user asks for a project-specific financial/technical decision, explain what information is needed and recommend professional verification. Do not claim Blue Chain Aqua has approved, sanctioned or completed a project unless that information is explicitly supplied in the conversation. Keep answers concise, actionable and farmer-friendly.`}]};
    const response=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify({systemInstruction,contents,tools:[{google_search:{}}]})});
    const data=await response.json();
    if(!response.ok) return res.status(response.status).json({error:data?.error?.message||'Gemini request failed'});
    const answer=data?.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join(' ').trim()||'I could not prepare an answer right now.';
    const chunks=data?.candidates?.[0]?.groundingMetadata?.groundingChunks||[];
    const sources=[]; const seen=new Set();
    for(const c of chunks){const w=c?.web;if(w?.uri&&!seen.has(w.uri)){seen.add(w.uri);sources.push({title:w.title||w.uri,url:w.uri});}}
    return res.status(200).json({answer,sources});
  }catch(err){return res.status(500).json({error:'Assistant request failed'});}
}
