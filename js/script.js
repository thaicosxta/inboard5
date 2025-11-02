// script.js — v5 final
(function(){
  const qs = (s, el=document) => el.querySelector(s);
  const qsa = (s, el=document) => Array.from((el||document).querySelectorAll(s));

  const THEME_MAP = {
    colaborador: { accent: '#2b6ef6', accentRgb: '43,110,246' },
    gestor: { accent: '#111827', accentRgb: '17,24,39' },
    rh: { accent: '#16a34a', accentRgb: '22,163,74' }
  };

  /* ---------- demo data persistence ---------- */
  function loadDemoData(){
    if (sessionStorage.getItem('inboard_demo')) return;
    const demo = {
      users: [
        { id: 'u1', name:'Ana Silva', email:'ana.colaborador@empresa.com', role:'colaborador', team:'Marketing', manager:'João', photoColor:'#d946ef' },
        { id: 'u2', name:'Carlos Souza', email:'carlos@empresa.com', role:'colaborador', team:'Produto', manager:'João', photoColor:'#f97316' },
        { id: 'u3', name:'Mariana Lopes', email:'mariana@empresa.com', role:'colaborador', team:'Design', manager:'Paula', photoColor:'#06b6d4' },
        { id: 'g1', name:'João Gestor', email:'joao.gestor@empresa.com', role:'gestor', team:'Marketing' },
        { id:'rh1', name:'Maria RH', email:'maria.rh@empresa.com', role:'rh' }
      ],
      modules: [
        { id:'m1', title:'Onboarding Geral', desc:'Introdução à empresa', status:{} },
        { id:'m2', title:'Políticas Internas', desc:'Normas e condutas', status:{} },
        { id:'m3', title:'Segurança e Compliance', desc:'Boas práticas', status:{} }
      ],
      quizzes: [
        { id:'q1', title:'Quiz de Alinhamento', questions:[
            {q:'Qual valor mais representamos?', options:['Rentabilidade','Colaboração','Burocracia','Velocidade'], answer:1}
          ], results:{} },
        { id:'q2', title:'Quiz Cultura', questions:[
            {q:'Qual é nossa prioridade?', options:['Lucro','Pessoas','Processos','Marketing'], answer:1}
          ], results:{} },
        { id:'q3', title:'Quiz Segurança', questions:[
            {q:'O que devo fazer em caso de suspeita de phishing?', options:['Ignorar','Abrir email','Reportar ao RH','Compartilhar'], answer:2}
          ], results:{} }
      ],
      reports: [
        { id:'r1', title:'Relatório Inicial', status:'enviado', date:'2025-01-15' },
        { id:'r2', title:'Relatório Mensal', status:'pendente', date:'2025-03-01' },
        { id:'r3', title:'Autoavaliação', status:'enviado', date:'2025-04-10' }
      ],
      vacancies: [
        { id:'v1', title:'Analista de Marketing', status:'aberta', candidates:[{name:'João C', status:'avaliando'},{name:'Lara S', status:'entrevista'}] }
      ],
      inbox: [
        { id:'in1', from:'Ana Silva', message:'Preciso de ajuda com o módulo 2', date:'2025-04-20', status:'pendente', to:'rh' },
        { id:'in2', from:'João Gestor', message:'Favor avaliar novo membro', date:'2025-04-21', status:'pendente', to:'rh' }
      ],
      bordo: [],
      evaluations: [] // {id, fromManagerName, toUserEmail, text, date}
    };
    sessionStorage.setItem('inboard_demo', JSON.stringify(demo));
  }
  function demo(){ return JSON.parse(sessionStorage.getItem('inboard_demo')) || {}; }
  function saveDemo(d){ sessionStorage.setItem('inboard_demo', JSON.stringify(d)); }

  /* ---------------- INDEX / WELCOME ---------------- */
  if (document.body.classList.contains('page-login')) {
    loadDemoData();

    // open login modal when clicking card
    const cards = qsa('.role-card, .enter-btn');
    const modal = qs('#loginModal');
    const modalClose = qs('#loginModalClose');
    const loginCancel = qs('#loginCancel');
    const modalForm = qs('#modalLoginForm');
    const modalEmail = qs('#modalEmail');
    const modalPassword = qs('#modalPassword');
    const modalProfileHint = qs('#modalProfileHint');
    let selectedRole = null;

    function openLogin(role){
      selectedRole = role;
      const presets = { colaborador:'ana.colaborador@empresa.com', gestor:'joao.gestor@empresa.com', rh:'maria.rh@empresa.com' };
      modal.setAttribute('aria-hidden','false');
      modal.style.display = 'flex';
      modalEmail.value = presets[role] || '';
      modalPassword.value = '';
      modalProfileHint.textContent = role.charAt(0).toUpperCase() + role.slice(1);
    }
    function closeLogin(){ modal.setAttribute('aria-hidden','true'); modal.style.display = 'none'; selectedRole = null; }

    cards.forEach(c => c.addEventListener('click', (ev) => {
      const role = ev.currentTarget.dataset.role || ev.currentTarget.closest('[data-role]')?.dataset.role;
      if (!role) return;
      openLogin(role);
    }));

    if (modalClose) modalClose.addEventListener('click', closeLogin);
    if (loginCancel) loginCancel.addEventListener('click', closeLogin);

    qs('#forgotPassword').addEventListener('click', (e)=>{ e.preventDefault(); alert('Instruções de recuperação de senha enviadas ao e-mail (simulado).'); });

    modalForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const email = modalEmail.value.trim();
      const role = selectedRole;
      if (!email || !role) return alert('Preencha o e-mail');
      const name = email.split('@')[0].replace(/[._]/g,' ').replace(/\b\w/g,s=>s.toUpperCase());
      sessionStorage.setItem('inboard_user', JSON.stringify({ email, name, profile: role }));
      // redirect to chosen profile dashboard
      const target = role === 'colaborador' ? 'colaborador.html' : role === 'gestor' ? 'gestor.html' : 'rh.html';
      location.href = target;
    });

    return;
  }

  /* ---------------- DASHBOARD COMMON ---------------- */
  loadDemoData();
  const user = JSON.parse(sessionStorage.getItem('inboard_user') || '{}');
  const profile = user.profile || 'colaborador';
  const theme = THEME_MAP[profile] || THEME_MAP.colaborador;
  document.documentElement.style.setProperty('--accent', theme.accent);
  document.documentElement.style.setProperty('--accent-rgb', theme.accentRgb);
  const logo = qs('.logo-sq'); if (logo){ logo.style.background = theme.accent; }
  const nameSpan = qs('#userName'); if (nameSpan) nameSpan.textContent = user.name || 'Usuário';

  // Generic SPA behavior (sidebar)
  const sidebarLinks = qsa('.sidebar nav a[data-section]');
  const contentArea = qs('.content-area');
  function showSection(sectionId, pushHistory = false){
    if (!contentArea) return;
    const panes = qsa('.section-pane', contentArea);
    panes.forEach(p => {
      if (p.id === sectionId) p.classList.add('active-section'), p.setAttribute('aria-hidden','false');
      else p.classList.remove('active-section'), p.setAttribute('aria-hidden','true');
    });
    sidebarLinks.forEach(a => a.classList.toggle('active', a.dataset.section === sectionId));
    if (pushHistory) history.pushState({section:sectionId}, '', `#${sectionId}`);
  }
  sidebarLinks.forEach(a => a.addEventListener('click', (ev)=>{ ev.preventDefault(); showSection(a.dataset.section, true); }));
  const initialHash = location.hash.replace('#',''); if (initialHash) showSection(initialHash); else { if (contentArea){ const first=qsa('.section-pane', contentArea)[0]; if(first) showSection(first.id); } }
  window.addEventListener('popstate', ev => { const s = (ev.state && ev.state.section) || location.hash.replace('#',''); if (s) showSection(s,false); });

  // modal helpers
  const modal = qs('#modal');
  const modalContent = qs('#modalContent');
  const modalClose = qs('#modalClose');
  function openModal(html){ if(!modal) return; modalContent.innerHTML = html; modal.setAttribute('aria-hidden','false'); modal.style.display='flex'; }
  function closeModal(){ if(!modal) return; modal.setAttribute('aria-hidden','true'); modal.style.display='none'; modalContent.innerHTML=''; }
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  // Logout
  const logout = qs('#logout'); if (logout) logout.addEventListener('click', ()=>{ sessionStorage.removeItem('inboard_user'); });

  /* ---------------- COLABORADOR FEATURES ---------------- */
  if (profile === 'colaborador' && document.body.classList.contains('page-dashboard')) {
    const d = demo();

    // compute progress for current user
    function computeProgressForUser(){
      const u = d.users.find(x=>x.email===user.email);
      if (!u) return 0;
      const total = d.modules.length;
      let done = 0;
      d.modules.forEach(m => { if (m.status && m.status[u.id] === 'done') done++; });
      return Math.round((done/total)*100);
    }
    function updateMiniProgress(){
      const fill = qs('#miniProgress .fill');
      if(fill) fill.style.width = computeProgressForUser() + '%';
      const status = qs('#userStatus'); if (status) status.textContent = `Progresso: ${computeProgressForUser()}%`;
    }

    // HOME: Next always enabled (user asked that after checking, Next stays available)
    const welcomeDone = qs('#welcomeDone');
    const homeNext = qs('#homeNext');
    if (welcomeDone && homeNext){
      welcomeDone.addEventListener('change', ()=> {
        // keep Next available regardless — but can show check feedback
        if (welcomeDone.checked) { homeNext.classList.add('active'); }
        else { homeNext.classList.remove('active'); }
      });
      homeNext.addEventListener('click', ()=> {
        showSection('modulos', true);
      });
    }

    // Received evaluations in HOME
    const receivedEvals = qs('#receivedEvals');
    function refreshEvaluations(){
      const evs = d.evaluations.filter(e => e.toUserEmail === user.email);
      if (!receivedEvals) return;
      if (evs.length === 0) { receivedEvals.innerHTML = ''; return; }
      receivedEvals.innerHTML = `<h4>Avaliações recebidas</h4>${evs.map(ev=>`<div class="report-card"><strong>De: ${ev.fromManagerName}</strong><div class="small">${ev.date}</div><p>${ev.text}</p></div>`).join('')}`;
    }
    refreshEvaluations();

    // TIME: render only team, with photo placeholder and modal on click (no messaging)
    const timeList = qs('#timeList');
    if (timeList){
      const users = d.users.filter(u=>u.role === 'colaborador');
      timeList.innerHTML = users.map(u => `
        <div class="team-row" data-id="${u.id}" role="button">
          <div class="team-left">
            <div class="profile-placeholder" style="background:${u.photoColor||'#ddd'}">${u.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
            <div><strong>${u.name}</strong><div class="small">${u.team}</div></div>
          </div>
          <div class="small">${u.email}</div>
        </div>
      `).join('');
      timeList.addEventListener('click', (ev) => {
        const row = ev.target.closest('.team-row'); if (!row) return;
        const id = row.dataset.id; const u = d.users.find(x=>x.id===id);
        openModal(`<h3>${u.name}</h3><p><strong>Função:</strong> ${u.team}</p><p><strong>E-mail:</strong> ${u.email}</p><p><strong>Progresso:</strong> ${computeProgressForUser()}%</p>`);
      });
    }

    // MODULES: mark complete updates progress
    const modulesList = qs('#modulesList');
    if (modulesList){
      const currUser = d.users.find(x=>x.email===user.email);
      modulesList.innerHTML = '';
      d.modules.forEach(m=>{
        const status = (m.status && m.status[currUser?.id]) || 'locked';
        const locked = status === 'locked';
        const done = status === 'done';
        const html = `<div class="module-card" data-id="${m.id}">
          <strong>${m.title}</strong>
          <div class="small">${m.desc}</div>
          <div class="meta"><div class="module-badge">${status}</div>
          <div class="action">
            <button class="btn link openModule" data-id="${m.id}" ${locked?'disabled':''}>Abrir</button>
            <button class="btn secondary finishModule" data-id="${m.id}" ${done?'disabled':''}>Marcar Concluído</button>
          </div></div>
        </div>`;
        modulesList.insertAdjacentHTML('beforeend', html);
      });

      modulesList.addEventListener('click', (ev)=>{
        const open = ev.target.closest('.openModule');
        if (open){
          const id = open.dataset.id; const m = d.modules.find(x=>x.id===id);
          openModal(`<h3>${m.title}</h3><p>${m.desc}</p><p>Conteúdo simulado.</p><div style="margin-top:10px"><button class="btn primary" id="startModule">Iniciar</button></div>`);
          setTimeout(()=>{ const s = qs('#startModule'); if(s) s.addEventListener('click', ()=>{ alert('Módulo iniciado — progresso simulado'); closeModal(); }); },50);
        }
        const mark = ev.target.closest('.finishModule');
        if (mark){
          const id = mark.dataset.id;
          const d2 = demo();
          const cu = d2.users.find(x=>x.email===user.email);
          const m = d2.modules.find(x=>x.id===id);
          if (cu && m){ if(!m.status) m.status = {}; m.status[cu.id] = 'done'; saveDemo(d2); alert('Módulo marcado como concluído'); updateMiniProgress(); location.reload(); }
        }
      });
    }

    // QUIZZES: 3 quizzes, open each
    const quizzesList = qs('#quizzesList');
    if (quizzesList){
      quizzesList.innerHTML = '';
      d.quizzes.forEach(qz => {
        const card = `<div class="module-card"><strong>${qz.title}</strong><div class="small">Questionário</div>
          <div class="meta"><div class="module-badge">quiz</div><div class="action"><button class="btn link openQuiz" data-id="${qz.id}">Abrir</button></div></div></div>`;
        quizzesList.insertAdjacentHTML('beforeend', card);
      });
      quizzesList.addEventListener('click', (ev)=> {
        const open = ev.target.closest('.openQuiz'); if(!open) return;
        const qid = open.dataset.id; const qz = d.quizzes.find(x=>x.id===qid);
        const q = qz.questions[0];
        openModal(`<h3>${qz.title}</h3><p><strong>${q.q}</strong></p>
          <form id="qForm">${q.options.map((o,i)=>`<label><input type="radio" name="opt" value="${i}"/> ${o}</label><br/>`).join('')}
          <div style="margin-top:8px"><button class="btn primary" type="submit">Enviar</button></div></form><div id="qResult" style="margin-top:8px"></div>`);
        setTimeout(()=> {
          const qForm = qs('#qForm');
          qForm.addEventListener('submit', (e)=> {
            e.preventDefault();
            const sel = Number(qs('[name="opt"]:checked')?.value);
            const r = qs('#qResult');
            if (isNaN(sel)) return alert('Escolha uma opção');
            if (sel === q.answer) r.innerHTML = `<div class="small">Parabéns — resposta correta ✅</div>`;
            else r.innerHTML = `<div class="small">Resposta incorreta — a resposta correta é "${q.options[q.answer]}".</div>`;
          });
        },50);
      });
    }

    // REPORTS: Emitir & Solicitar avaliação
    const reportCards = qs('#reportCards');
    if (reportCards){
      reportCards.innerHTML = d.reports.map(rep => `<div class="report-card" data-id="${rep.id}"><strong>${rep.title}</strong><div class="small">Status: ${rep.status} • ${rep.date}</div>
        <div class="report-actions"><button class="btn primary emitReport" data-id="${rep.id}">Emitir Relatório</button><button class="btn link requestManager" data-id="${rep.id}">Solicitar Avaliação do Gestor</button></div></div>`).join('');
      reportCards.addEventListener('click', (ev)=>{
        const em = ev.target.closest('.emitReport');
        if (em){ const id=em.dataset.id; alert('Relatório gerado (simulado)'); return; }
        const req = ev.target.closest('.requestManager');
        if (req){ const id=req.dataset.id; const d2 = demo(); d2.inbox.push({ id:'in'+Date.now(), from:user.name, message:`Solicitação: avaliar progresso (${id})`, date:new Date().toLocaleString(), status:'pendente', to:'gestor' }); saveDemo(d2); alert('Solicitação enviada ao gestor (simulada)'); }
      });
    }

    // BORDO TRI submission
    const bordoForm = qs('#bordoForm');
    if (bordoForm){
      bordoForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        const q1 = qs('#bt_q1').value; const q2 = qs('#bt_q2').value; const q3=qs('#bt_q3').value;
        const dd = demo(); dd.bordo.push({userEmail:user.email, q1, q2, q3, date:new Date().toLocaleString()}); saveDemo(dd);
        qs('#bordoResult').textContent = 'Obrigado! Sua avaliação foi enviada.';
        bordoForm.reset();
      });
    }

    // SUPPORT: show only messages from current user (and those assigned to RH for this user)
    const supportList = qs('#supportList');
    function renderSupport(){
      const dd = demo();
      const myMsgs = dd.inbox.filter(it => it.from === user.name || (it.to === 'rh' && it.from === user.name));
      supportList.innerHTML = myMsgs.map(it => `<div class="support-item ${it.status==='respondido'?'respondido':''}" data-id="${it.id}">
        <div><strong>${it.from}</strong><div class="small">${it.message}</div><div class="small">${it.date}</div></div>
        <div class="status">${it.status}</div>
      </div>`).join('');
    }
    renderSupport();
    const supportForm = qs('#supportForm');
    if (supportForm){
      supportForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        const txt = qs('#supportInput').value.trim();
        if(!txt) return;
        const d2 = demo(); const id = 'in'+Date.now();
        d2.inbox.push({ id, from:user.name, message:txt, date:new Date().toLocaleString(), status:'pendente', to:'rh' });
        saveDemo(d2);
        renderSupport();
        qs('#supportInput').value = '';
        alert('Solicitação enviada (simulada). O RH responderá pelo inbox.');
      });
    }

    // PROFILE: summary sidebar values
    function refreshProfileSidebar(){
      const d2 = demo();
      const me = d2.users.find(x=>x.email===user.email) || {name:user.name,email:user.email,team:'—',photoColor:'#d946ef'};
      if (qs('#sidebarName')) qs('#sidebarName').textContent = me.name;
      if (qs('#sidebarRole')) qs('#sidebarRole').textContent = me.team;
      if (qs('#sidebarPhoto')) qs('#sidebarPhoto').style.background = me.photoColor || '#d946ef';
      if (qs('#profileName')) qs('#profileName').textContent = me.name;
      if (qs('#profileRole')) qs('#profileRole').textContent = me.team;
      if (qs('#profilePhoto')) qs('#profilePhoto').style.background = me.photoColor || '#d946ef';
      if (qs('#pf_name')) qs('#pf_name').value = me.name;
      if (qs('#pf_email')) qs('#pf_email').value = me.email;
      if (qs('#pf_role')) qs('#pf_role').value = me.team;
    }
    refreshProfileSidebar();

    const editProfileForm = qs('#editProfileForm');
    if (editProfileForm){
      editProfileForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        const n = qs('#pf_name').value.trim(); const em = qs('#pf_email').value.trim(); const rl = qs('#pf_role').value.trim();
        const d2 = demo(); const u = d2.users.find(x=>x.email===user.email);
        if (u){ u.name = n || u.name; u.email = em || u.email; u.team = rl || u.team; saveDemo(d2); alert('Perfil atualizado (simulado)'); location.reload(); }
      });
      qs('#pf_cancel').addEventListener('click', ()=> refreshProfileSidebar());
    }

    // quick: open modules/quizzes removed from sidebar (user asked), but keep navigation as before via side menu
    updateMiniProgress();
    refreshEvaluations();
    function refreshEvaluations(){ const dd = demo(); const evs = dd.evaluations.filter(e => e.toUserEmail === user.email); if (qs('#receivedEvals')) qs('#receivedEvals').innerHTML = evs.length ? `<h4>Avaliações recebidas</h4>${evs.map(ev=>`<div class="report-card"><strong>De: ${ev.fromManagerName}</strong><div class="small">${ev.date}</div><p>${ev.text}</p></div>`).join('')}` : ''; }
  }

  /* ---------------- GESTOR FEATURES ---------------- */
  if (profile === 'gestor' && document.body.classList.contains('page-dashboard')){
    const d = demo();

    // Visão: evaluate opens modal with comment—persist evaluation to demo.evaluations and it will be visible to collaborator
    const newHires = qs('#newHires');
    if (newHires){
      const recent = d.users.filter(u=>u.role==='colaborador').slice(0,5);
      newHires.innerHTML = recent.map(u=>`<div class="report-card"><strong>${u.name}</strong><div class="small">${u.team} • ${u.email}</div>
        <div style="margin-top:8px"><button class="btn primary evaluate" data-id="${u.id}">Avaliar</button></div></div>`).join('');
      newHires.addEventListener('click', (ev)=>{
        const btn = ev.target.closest('.evaluate'); if(!btn) return;
        const id = btn.dataset.id; const u = d.users.find(x=>x.id===id);
        openModal(`<h3>Avaliar — ${u.name}</h3>
          <label>Integração</label><select id="eval_integ"><option>Ótimo</option><option>Bom</option><option>Regular</option></select>
          <label style="margin-top:8px">Comentário do Gestor</label>
          <textarea id="eval_text" rows="4"></textarea>
          <div style="margin-top:10px"><button class="btn primary" id="sendEval">Enviar avaliação</button></div>`);
        setTimeout(()=> {
          const send = qs('#sendEval');
          if (send) send.addEventListener('click', ()=> {
            const text = qs('#eval_text').value.trim();
            if (!text) return alert('Escreva uma avaliação');
            const demoData = demo();
            demoData.evaluations.push({ id:'ev'+Date.now(), fromManagerName:user.name, toUserEmail:u.email, text, date:new Date().toLocaleString() });
            saveDemo(demoData);
            alert('Avaliação enviada');
            closeModal();
          });
        },50);
      });
    }

    // Atalhos: "Solicitar ao RH" opens modal to fill request
    const solicitRH = qs('#solicitRH');
    if (solicitRH){
      solicitRH.addEventListener('click', ()=> {
        openModal(`<h3>Solicitar ao RH</h3><label>Nome do Membro</label><input id="req_name"/><label>Cargo</label><input id="req_role"/><label>Justificativa</label><textarea id="req_msg" rows="3"></textarea><div style="margin-top:8px"><button class="btn primary" id="sendReq">Enviar solicitação</button></div>`);
        setTimeout(()=> { const sv = qs('#sendReq'); if(sv) sv.addEventListener('click', ()=> { const nm=qs('#req_name').value.trim(); const rl=qs('#req_role').value.trim(); const ms=qs('#req_msg').value.trim(); if(!nm||!ms) return alert('Preencha'); const d2 = demo(); d2.inbox.push({ id:'in'+Date.now(), from:user.name, message:`Solicitação RH: criar membro ${nm} - ${rl}. ${ms}`, date:new Date().toLocaleString(), status:'pendente', to:'rh' }); saveDemo(d2); alert('Solicitação enviada ao RH'); closeModal(); }); },50);
      });
    }

    // Contratações: create vacancy modal with more fields and "Criar e encaminhar ao RH"
    const newVacancy = qs('#newVacancy');
    if (newVacancy){
      newVacancy.addEventListener('click', ()=> {
        openModal(`<h3>Criar Vaga</h3><label>Título</label><input id="vacTitle"/><label>Descrição</label><textarea id="vacDesc" rows="3"></textarea><label>Requisitos</label><input id="vacReq"/><label>Tipo de contrato</label><select id="vacType"><option>CLT</option><option>PJ</option><option>Freelancer</option></select><div style="margin-top:10px"><button class="btn primary" id="saveVac">Criar e encaminhar ao RH</button></div>`);
        setTimeout(()=> { const sv = qs('#saveVac'); if(sv) sv.addEventListener('click', ()=> { const t=qs('#vacTitle').value; const desc=qs('#vacDesc').value; if(!t) return alert('Preencha título'); const d2 = demo(); d2.vacancies.push({id:'v'+Date.now(), title:t, status:'aberta', candidates:[]}); d2.inbox.push({ id:'in'+Date.now(), from:user.name, message:`Vaga criada: ${t}. Descrição: ${desc}`, date:new Date().toLocaleString(), status:'pendente', to:'rh' }); saveDemo(d2); alert('Vaga criada e encaminhada ao RH'); closeModal(); location.reload(); }); },50);
      });
    }

    // viewReports shortcut
    const viewReports = qs('#viewReports');
    if (viewReports){ viewReports.addEventListener('click', ()=> { const r = demo().reports || []; const html = `<h3>Relatórios</h3>${r.map(rr=>`<div class="report-card"><strong>${rr.title}</strong><div class="small">Status: ${rr.status}</div></div>`).join('')}`; openModal(html); }); }
  }

  /* ---------------- RH FEATURES ---------------- */
  if (profile === 'rh' && document.body.classList.contains('page-dashboard')){
    const d = demo();

    // add collaborator reactivated
    const addCollaborator = qs('#addCollaborator');
    const collabList = qs('#collabList');
    function renderCollabList(){
      const cols = d.users.filter(u=>u.role==='colaborador');
      if (collabList) collabList.innerHTML = cols.map(c=>`<div class="team-row" data-id="${c.id}"><div><strong>${c.name}</strong><div class="small">${c.team}</div></div><div class="small">${c.email}</div></div>`).join('');
    }
    renderCollabList();
    if (addCollaborator){
      addCollaborator.addEventListener('click', ()=> {
        openModal(`<h3>Adicionar Colaborador</h3>
          <label>Nome</label><input id="c_name"/><label>E-mail</label><input id="c_email"/><label>Time</label><input id="c_team"/><label>Gestor</label><input id="c_manager"/>
          <div style="margin-top:10px"><button class="btn primary" id="saveCollab">Adicionar</button></div>`);
        setTimeout(()=> { const sv = qs('#saveCollab'); if(sv) sv.addEventListener('click', ()=> { const n=qs('#c_name').value; const e=qs('#c_email').value; const t=qs('#c_team').value; const m=qs('#c_manager').value; if(!n||!e) return alert('Preencha'); const id='u'+Date.now(); d.users.push({id,name:n,email:e,role:'colaborador',team:t,manager:m,photoColor:'#'+(Math.random().toString(16).slice(-6))}); saveDemo(d); alert('Colaborador criado'); closeModal(); location.reload(); }); },50);
      });
    }

    // editOnboarding area (same)
    const editOnboarding = qs('#editOnboarding');
    if (editOnboarding){
      const cols = d.users.filter(u=>u.role==='colaborador');
      editOnboarding.innerHTML = cols.map(c=>`<div class="report-card"><strong>${c.name}</strong><div class="small">${c.team}</div><div style="margin-top:8px"><button class="btn link editOn" data-id="${c.id}">Editar Onboarding</button></div></div>`).join('');
      editOnboarding.addEventListener('click', (ev)=> {
        const btn = ev.target.closest('.editOn'); if(!btn) return;
        const id = btn.dataset.id; const c = d.users.find(u=>u.id===id);
        const modulesHtml = d.modules.map(m=>`<label><input type="checkbox" name="mod" value="${m.id}" /> ${m.title}</label><br/>`).join('');
        openModal(`<h3>Editar Onboarding — ${c.name}</h3><form id="editOnForm">${modulesHtml}<div style="margin-top:10px"><button class="btn primary" id="saveOn">Salvar</button></div></form>`);
        setTimeout(()=> { const sv = qs('#saveOn'); if(sv) sv.addEventListener('click', ()=>{ alert('Onboarding atualizado para ' + c.name); closeModal(); }); },50);
      });
    }

    // CREATE: create modules/quizzes/reports and accept attachments (simulated)
    const createForm = qs('#createForm');
    if (createForm){
      createForm.addEventListener('submit', (e)=> {
        e.preventDefault();
        const t = qs('#createTitle').value; const ty = qs('#createType').value; const desc = qs('#createDesc').value; const attach = qs('#createAttach').value;
        if (!t) return alert('Título é obrigatório');
        const dd = demo();
        if (ty === 'module') dd.modules.push({id:'m'+Date.now(), title:t, desc, status:{}} );
        if (ty === 'report') dd.reports.push({id:'r'+Date.now(), title:t, status:'pendente', date:new Date().toLocaleDateString()});
        if (ty === 'quiz') dd.quizzes.push({id:'q'+Date.now(), title:t, questions:[], results:{}});
        if (!dd.created) dd.created = [];
        dd.created.push({title:t, type:ty, attach});
        saveDemo(dd);
        qs('#createdItems').innerHTML = `<div class="small">Item criado: ${t} (${ty})</div>`;
        createForm.reset();
      });
    }

    // Cronograma & Painel
    const cronogramaList = qs('#cronogramaList');
    if (cronogramaList){
      const tasks = [
        { date:'2025-05-01', task:'Onboarding — Novo membro Marketing' },
        { date:'2025-05-10', task:'Avaliação mensal Squad Produto' },
        { date:'2025-06-15', task:'Bordo TRI — Trimestral' }
      ];
      cronogramaList.innerHTML = tasks.map(t=>`<div class="report-card"><strong>${t.date}</strong><div class="small">${t.task}</div></div>`).join('');
    }
    const panelOverview = qs('#panelOverview');
    if (panelOverview){
      const users = d.users.filter(u=>u.role==='colaborador');
      panelOverview.innerHTML = users.map(u=>`<div class="report-card panel-item" data-id="${u.id}"><strong>${u.name}</strong><div class="small">Time: ${u.team} — Gestor: ${u.manager || '—'}</div><div class="small">Progresso: simulado</div></div>`).join('');
      panelOverview.addEventListener('click', (ev)=> {
        const item = ev.target.closest('.panel-item'); if(!item) return;
        const id = item.dataset.id; const u = d.users.find(x=>x.id===id);
        openModal(`<h3>${u.name}</h3><p><strong>Progresso:</strong> simulado</p><p><strong>Gestor:</strong> ${u.manager||'—'}</p>`);
      });
    }

    // Inbox: open message and reply; when responded set status respondido and gray out
    const inboxList = qs('#inboxList');
    if (inboxList){
      function renderInbox(){
        const dd = demo();
        inboxList.innerHTML = dd.inbox.filter(m=>m.to==='rh' || m.to===undefined).map(msg=>`<div class="report-card inbox-item ${msg.status==='respondido'?'respondido':''}" data-id="${msg.id}"><strong>${msg.from}</strong><div class="small">${msg.date}</div><p>${msg.message}</p><div class="small">Status: ${msg.status}</div></div>`).join('');
      }
      renderInbox();
      inboxList.addEventListener('click', (ev)=> {
        const it = ev.target.closest('.inbox-item'); if(!it) return;
        const id = it.dataset.id; const dd = demo(); const msg = dd.inbox.find(x=>x.id===id);
        openModal(`<h3>Mensagem de ${msg.from}</h3><p>${msg.message}</p><label>Responder</label><textarea id="replyText" rows="4"></textarea><div style="margin-top:10px"><button class="btn primary" id="sendReply">Enviar</button></div>`);
        setTimeout(()=> {
          const send = qs('#sendReply'); if (send) send.addEventListener('click', ()=> {
            const text = qs('#replyText').value.trim(); if (!text) return alert('Escreva uma resposta');
            msg.status = 'respondido';
            if(!msg.responses) msg.responses = [];
            msg.responses.push({from:'RH', text, date:new Date().toLocaleString()});
            saveDemo(dd);
            alert('Resposta enviada');
            closeModal();
            renderInbox();
          });
        },50);
      });
    }

    // help box monitoring
    const helpBox = qs('#helpBox');
    if (helpBox){
      const r = d.reports || [];
      helpBox.innerHTML = `<div class="small">Relatórios: ${r.length} • Pendentes: ${r.filter(x=>x.status==='pendente').length}</div>`;
    }
  }

})();
