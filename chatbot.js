/* Blue Chain Aqua — Farmer Assistant
   Voice input/output + multilingual chat + browser chat history.
   History is stored locally on the user's device. */
(function(){
  if(document.getElementById('bcaChatbot')) return;

  const STORAGE_KEY='blueChainAquaChatHistory_v2';
  const LANG_KEY='blueChainAquaChatLanguage_v1';
  const LANGS={
    en:{label:'English',locale:'en-IN'},
    te:{label:'తెలుగు',locale:'te-IN'},
    hi:{label:'हिन्दी',locale:'hi-IN'}
  };

  const root=document.createElement('div');
  root.id='bcaChatbot';
  root.innerHTML=`
    <button class="bca-chat-launch" id="bcaChatLaunch" aria-label="Open Blue Chain Aqua Assistant" aria-expanded="false">
      <span class="bca-chat-icon">✦</span><span class="bca-chat-launch-text">Ask Blue Chain Aqua</span>
    </button>
    <section class="bca-chat-panel" id="bcaChatPanel" aria-label="Blue Chain Aqua Assistant" aria-hidden="true">
      <header class="bca-chat-head">
        <div><strong>Blue Chain Aqua Assistant</strong><small>Ask by typing or speaking</small></div>
        <div class="bca-head-actions">
          <button class="bca-history-toggle" id="bcaHistoryToggle" type="button" aria-label="Show chat history">History</button>
          <button id="bcaChatClose" aria-label="Close assistant">×</button>
        </div>
      </header>
      <div class="bca-chat-tools">
        <label>Language
          <select id="bcaLanguage" aria-label="Assistant language">
            <option value="en">English</option>
            <option value="te">తెలుగు</option>
            <option value="hi">हिन्दी</option>
          </select>
        </label>
        <button id="bcaClearHistory" type="button">Clear chat</button>
      </div>
      <aside class="bca-history" id="bcaHistory" hidden>
        <div class="bca-history-title"><strong>Chat history</strong><span>Saved on this device</span></div>
        <div id="bcaHistoryList" class="bca-history-list"></div>
      </aside>
      <div class="bca-chat-status"><span></span> Current scheme and regulation questions can be checked online when the assistant is connected.</div>
      <div class="bca-chat-messages" id="bcaChatMessages" aria-live="polite"></div>
      <div class="bca-quick" id="bcaQuick">
        <button data-q="I have 2 acres. What aquaculture project could I consider?">2-acre project</button>
        <button data-q="What should I check before constructing a fish or shrimp pond?">Pond planning</button>
        <button data-q="What government schemes or subsidies are currently available for aquaculture in India?">Latest schemes</button>
        <button data-q="How can I prevent common fish and shrimp diseases?">Disease prevention</button>
      </div>
      <form class="bca-chat-form" id="bcaChatForm">
        <button class="bca-voice-btn" id="bcaVoiceBtn" type="button" aria-label="Speak your question" title="Speak your question">🎙️</button>
        <input id="bcaChatInput" autocomplete="off" placeholder="Ask your farming question..." aria-label="Your question">
        <button class="bca-send-btn" type="submit" aria-label="Send">➤</button>
      </form>
      <div class="bca-voice-status" id="bcaVoiceStatus" aria-live="polite"></div>
      <div class="bca-chat-note">Voice recognition and speech playback use your browser. Chat history is stored locally on this device.</div>
    </section>`;
  document.body.appendChild(root);

  const launch=root.querySelector('#bcaChatLaunch'), panel=root.querySelector('#bcaChatPanel'), close=root.querySelector('#bcaChatClose');
  const messages=root.querySelector('#bcaChatMessages'), form=root.querySelector('#bcaChatForm'), input=root.querySelector('#bcaChatInput'), quick=root.querySelector('#bcaQuick');
  const languageSelect=root.querySelector('#bcaLanguage'), voiceBtn=root.querySelector('#bcaVoiceBtn'), voiceStatus=root.querySelector('#bcaVoiceStatus');
  const historyPanel=root.querySelector('#bcaHistory'), historyToggle=root.querySelector('#bcaHistoryToggle'), historyList=root.querySelector('#bcaHistoryList'), clearHistoryBtn=root.querySelector('#bcaClearHistory');

  let conversation=[];
  let savedHistory=[];
  let recognition=null;
  let listening=false;
  let selectedLanguage=localStorage.getItem(LANG_KEY)||'en';
  if(!LANGS[selectedLanguage]) selectedLanguage='en';
  languageSelect.value=selectedLanguage;

  const welcome={
    en:'Namaste! 👋 I can help with fish/shrimp farming, pond preparation, hatcheries, feed, disease management, project planning and government schemes. You can type or speak your question.',
    te:'నమస్తే! 👋 చేపలు/రొయ్యల పెంపకం, చెరువు తయారీ, హ్యాచరీ, ఫీడ్, వ్యాధి నిర్వహణ, ప్రాజెక్ట్ ప్లానింగ్ మరియు ప్రభుత్వ పథకాల గురించి నేను సహాయం చేయగలను. మీరు టైప్ చేయవచ్చు లేదా మాట్లాడవచ్చు.',
    hi:'नमस्ते! 👋 मैं मछली/झींगा पालन, तालाब की तैयारी, हैचरी, फ़ीड, रोग प्रबंधन, प्रोजेक्ट प्लानिंग और सरकारी योजनाओं में मदद कर सकता हूँ। आप अपना सवाल टाइप या बोल सकते हैं।'
  };

  const localAnswers=[
    [/2 acres|two acres/i,'For a 2-acre farm, the right project depends on your location, water source, soil, species, electricity, market access and available investment. A site and water assessment should come before finalizing the design or species.' ],
    [/pond|pond preparation/i,'Before pond construction, assess soil suitability, water availability and quality, drainage, flood risk, access, electricity and the intended culture system. The pond design should include suitable inlet, outlet and aeration/drainage arrangements.' ],
    [/disease|sick|not eating/i,'Start by checking water quality, dissolved oxygen, temperature, pH, ammonia and feeding behaviour. Avoid self-medicating stock. If unusual mortality or persistent symptoms occur, get a qualified fisheries/aquaculture professional or aquatic animal health specialist to examine the stock.' ],
    [/hatchery|seed/i,'A hatchery normally covers broodstock management, spawning, larval/seed rearing, water quality management, biosecurity and quality seed handling. Species-specific design and operating parameters should be prepared before investment.' ],
    [/feed|nutrition/i,'Feed choice and feeding rate depend on species, size, stocking density, water temperature and culture system. Good feed management also means observing feeding response and adjusting quantity rather than overfeeding.' ]
  ];

  function loadSaved(){
    try{ savedHistory=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]'); }catch(e){savedHistory=[];}
    if(!Array.isArray(savedHistory)) savedHistory=[];
  }
  function saveSaved(){
    try{ localStorage.setItem(STORAGE_KEY,JSON.stringify(savedHistory.slice(-100))); }catch(e){}
  }
  function persistConversation(){
    if(!conversation.length) return;
    const now=new Date();
    const first=conversation.find(x=>x.role==='user');
    const title=(first?.content||'New conversation').slice(0,70);
    const existing=savedHistory.findIndex(x=>x.id===conversationId);
    const item={id:conversationId,title,language:selectedLanguage,updatedAt:now.toISOString(),messages:conversation.slice(-40)};
    if(existing>=0) savedHistory[existing]=item; else savedHistory.push(item);
    saveSaved(); renderHistory();
  }
  let conversationId='c_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);

  function openChat(){panel.classList.add('open');panel.setAttribute('aria-hidden','false');launch.setAttribute('aria-expanded','true');setTimeout(()=>input.focus(),120)}
  function closeChat(){stopListening();panel.classList.remove('open');panel.setAttribute('aria-hidden','true');launch.setAttribute('aria-expanded','false');persistConversation()}
  launch.addEventListener('click',()=>panel.classList.contains('open')?closeChat():openChat());
  close.addEventListener('click',closeChat);

  function addMessage(text,type='bot',sources=[],opts={save:true}){
    const el=document.createElement('div');el.className='bca-msg '+type;
    const body=document.createElement('div');
    body.className='bca-msg-body';
    body.innerHTML=type==='user'?escapeHtml(text).replace(/\n/g,'<br>'):formatBot(text);
    el.appendChild(body);
    if(type==='bot'){
      const speak=document.createElement('button');
      speak.type='button';speak.className='bca-speak';speak.setAttribute('aria-label','Speak this answer');speak.title='Speak this answer';speak.textContent='🔊';
      speak.addEventListener('click',()=>speakText(text));
      el.appendChild(speak);
    }
    if(sources.length){const box=document.createElement('div');box.className='bca-sources';box.innerHTML='<small>Sources</small>'+sources.slice(0,5).map(s=>`<a href="${escapeAttr(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.title||s.url)}</a>`).join('');el.appendChild(box)}
    messages.appendChild(el);messages.scrollTop=messages.scrollHeight;
    if(opts.save){conversation.push({role:type==='user'?'user':'model',content:text,sources:sources||[],ts:Date.now()});persistConversation();}
    return el;
  }
  function formatBot(t){return escapeHtml(t).replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>')}
  function escapeHtml(t){return String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function escapeAttr(t){return escapeHtml(t)}
  function localAnswer(q){const hit=localAnswers.find(([re])=>re.test(q));return hit?hit[1]:null}
  function typing(){const el=document.createElement('div');el.className='bca-msg bot bca-typing';el.innerHTML='<i></i><i></i><i></i>';messages.appendChild(el);messages.scrollTop=messages.scrollHeight;return el}

  function speakText(text){
    if(!('speechSynthesis' in window)){voiceStatus.textContent='Speech playback is not supported by this browser.';return;}
    window.speechSynthesis.cancel();
    const clean=String(text).replace(/[*#`]/g,'').replace(/\n+/g,'. ');
    const utter=new SpeechSynthesisUtterance(clean);
    utter.lang=LANGS[selectedLanguage].locale;
    const voices=window.speechSynthesis.getVoices();
    const prefix=selectedLanguage==='en'?'en':selectedLanguage==='te'?'te':'hi';
    const voice=voices.find(v=>v.lang?.toLowerCase().startsWith(prefix));
    if(voice) utter.voice=voice;
    utter.rate=0.95;utter.pitch=1;
    utter.onstart=()=>voiceStatus.textContent='🔊 Speaking…';
    utter.onend=()=>voiceStatus.textContent='';
    utter.onerror=()=>voiceStatus.textContent='Could not play speech on this browser.';
    window.speechSynthesis.speak(utter);
  }
  if('speechSynthesis' in window) window.speechSynthesis.onvoiceschanged=()=>{};

  function setupRecognition(){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR) return null;
    const r=new SR();r.continuous=false;r.interimResults=true;r.maxAlternatives=1;
    r.onstart=()=>{listening=true;voiceBtn.classList.add('listening');voiceStatus.textContent='🎙️ Listening… speak your question';};
    r.onresult=e=>{
      let finalText='';let interim='';
      for(let i=e.resultIndex;i<e.results.length;i++){
        const text=e.results[i][0].transcript;
        if(e.results[i].isFinal) finalText+=text; else interim+=text;
      }
      input.value=(finalText||interim).trim();
      if(finalText) voiceStatus.textContent='Voice captured. Sending…';
    };
    r.onerror=e=>{listening=false;voiceBtn.classList.remove('listening');voiceStatus.textContent=e.error==='not-allowed'?'Microphone permission was blocked. Please allow microphone access.':'Voice input could not be started.';};
    r.onend=()=>{const text=input.value.trim();listening=false;voiceBtn.classList.remove('listening');if(text){voiceStatus.textContent='';ask(text);}else voiceStatus.textContent='';};
    return r;
  }
  function startListening(){
    if(!recognition) recognition=setupRecognition();
    if(!recognition){voiceStatus.textContent='Voice input is not supported here. Try Chrome or Edge over HTTPS.';return;}
    if(listening){stopListening();return;}
    recognition.lang=LANGS[selectedLanguage].locale;
    try{recognition.start();}catch(e){}
  }
  function stopListening(){if(recognition&&listening){try{recognition.stop();}catch(e){}}listening=false;voiceBtn.classList.remove('listening');}
  voiceBtn.addEventListener('click',startListening);

  languageSelect.addEventListener('change',()=>{
    selectedLanguage=languageSelect.value;localStorage.setItem(LANG_KEY,selectedLanguage);
    voiceStatus.textContent=selectedLanguage==='en'?'English selected':selectedLanguage==='te'?'తెలుగు ఎంచుకోబడింది':'हिन्दी चुनी गई';
    setTimeout(()=>voiceStatus.textContent='',1200);
  });

  function renderHistory(){
    historyList.innerHTML='';
    if(!savedHistory.length){historyList.innerHTML='<div class="bca-history-empty">No saved conversations yet.</div>';return;}
    savedHistory.slice().reverse().forEach(item=>{
      const row=document.createElement('button');row.type='button';row.className='bca-history-item';
      const date=new Date(item.updatedAt);const label=LANGS[item.language]?.label||item.language||'English';
      row.innerHTML=`<strong>${escapeHtml(item.title||'Conversation')}</strong><small>${escapeHtml(label)} · ${date.toLocaleDateString()}</small>`;
      row.addEventListener('click',()=>loadConversation(item));historyList.appendChild(row);
    });
  }
  function loadConversation(item){
    stopListening();window.speechSynthesis?.cancel();conversationId=item.id;conversation=Array.isArray(item.messages)?item.messages.slice():[];selectedLanguage=LANGS[item.language]?item.language:'en';languageSelect.value=selectedLanguage;messages.innerHTML='';
    conversation.forEach(m=>addMessage(m.content,m.role==='user'?'user':'bot',m.sources||[],{save:false}));
    historyPanel.hidden=true;
  }
  historyToggle.addEventListener('click',()=>{historyPanel.hidden=!historyPanel.hidden;renderHistory();});
  clearHistoryBtn.addEventListener('click',()=>{
    if(!confirm('Clear all saved Blue Chain Aqua chat history from this device?')) return;
    savedHistory=[];saveSaved();conversation=[];conversationId='c_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);messages.innerHTML='';showWelcome();renderHistory();
  });

  function showWelcome(){addMessage(welcome[selectedLanguage],'bot',[],{save:false});}
  loadSaved();renderHistory();showWelcome();

  async function ask(q){
    q=q.trim();if(!q)return;
    stopListening();addMessage(q,'user');input.value='';
    const type=typing();
    try{
      const apiHistory=conversation.slice(0,-1).filter(x=>['user','model'].includes(x.role)).slice(-10).map(x=>({role:x.role,content:x.content}));
      const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:q,history:apiHistory,language:selectedLanguage})});
      if(!res.ok) throw new Error('API unavailable');
      const data=await res.json();type.remove();
      const answer=data.answer||'I could not prepare an answer right now.';
      addMessage(answer,'bot',data.sources||[]);
      speakText(answer);
    }catch(e){
      type.remove();
      const local=localAnswer(q);
      let answer;
      if(local) answer=local+'\n\nFor current schemes, subsidies, regulations or other time-sensitive information, connect the assistant to the web-enabled backend before relying on the answer.';
      else answer=selectedLanguage==='te'?'నేను సాధారణ ఆక్వాకల్చర్ ప్రశ్నలకు సహాయం చేయగలను. తాజా సమాచారం కోసం వెబ్-enabled backend కు Gemini API key కనెక్ట్ చేయాలి.':selectedLanguage==='hi'?'मैं सामान्य एक्वाकल्चर सवालों में मदद कर सकता हूँ। नवीनतम जानकारी के लिए वेबसाइट के backend में Gemini API key जोड़ना आवश्यक है।':'I can answer general aquaculture questions, but the live assistant is not connected yet. Please configure the Gemini API key for the website backend so I can check current government schemes, regulations and other latest updates.';
      addMessage(answer,'bot');speakText(answer);
    }
  }
  form.addEventListener('submit',e=>{e.preventDefault();ask(input.value)});
  quick.addEventListener('click',e=>{const b=e.target.closest('button');if(b)ask(b.dataset.q)});
})();
