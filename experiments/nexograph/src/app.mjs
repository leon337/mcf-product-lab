import {
  ROLES, TASK_STATUSES, createInitialState, activeWorkspace, actor, createWorkspace, switchWorkspace,
  setCurrentMember, addMember, updateMemberRole, createProject, createTask, addDependency,
  setTaskStatus, createDecision, moveNode, filteredEntities, exportWorkspace, tasksCsv, canCompleteTask
} from './domain.mjs';
import { loadState, saveState } from './storage.mjs';

let state = await loadState() ?? createInitialState();
let activeTab = 'graph';
let selected = null;
let filters = { query: '', type: 'all', status: 'all', assigneeId: 'all' };
let graphView = { x: 0, y: 0, scale: 1 };

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const app = $('#app');

const roleLabel = { owner: 'Proprietário', editor: 'Editor', viewer: 'Leitor' };
const statusLabel = { active: 'Ativo', done: 'Concluído', todo: 'A fazer', doing: 'Em andamento', open: 'Aberta', accepted: 'Aceita', rejected: 'Rejeitada' };
const priorityLabel = { low: 'Baixa', medium: 'Média', high: 'Alta' };

function esc(value = '') {
  return String(value).replace(/[&<>'"]/g, (ch) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#039;', '"':'&quot;' }[ch]));
}

async function persist(message = '') {
  await saveState(state);
  render();
  if (message) toast(message);
}

function toast(message, kind = 'ok') {
  const node = document.createElement('div');
  node.className = `toast ${kind}`;
  node.textContent = message;
  document.body.append(node);
  setTimeout(() => node.remove(), 2600);
}

function mutate(action, success) {
  try {
    action();
    persist(success);
  } catch (error) {
    toast(error.message || 'Não foi possível concluir a ação.', 'error');
  }
}

function currentWs() { return activeWorkspace(state); }
function canEdit() { return actor(currentWs()).role !== ROLES.VIEWER; }
function isOwner() { return actor(currentWs()).role === ROLES.OWNER; }

function render() {
  const ws = currentWs();
  const currentActor = actor(ws);
  app.innerHTML = `
    <div class="shell">
      <header class="topbar">
        <div class="brand"><span class="brand-mark">N</span><div><strong>NexoGraph</strong><small>Projetos conectados</small></div></div>
        <div class="top-actions">
          <label class="field compact"><span>Workspace</span><select id="workspaceSelect">${state.workspaces.map((item) => `<option value="${item.id}" ${item.id===ws.id?'selected':''}>${esc(item.name)}</option>`).join('')}</select></label>
          <button class="icon-btn" id="newWorkspaceBtn" title="Novo workspace">＋</button>
          <label class="field compact"><span>Atuando como</span><select id="memberSelect">${ws.members.map((member) => `<option value="${member.id}" ${member.id===ws.currentMemberId?'selected':''}>${esc(member.name)}</option>`).join('')}</select></label>
          <span class="role-badge ${currentActor.role}">${roleLabel[currentActor.role]}</span>
          <button class="ghost" id="membersBtn">Membros</button>
          <button class="ghost" id="exportBtn">Exportar</button>
        </div>
      </header>
      <div class="body-grid">
        <aside class="sidebar">
          <section>
            <div class="section-kicker">Navegação</div>
            <div class="tabs vertical">
              <button data-tab="graph" class="${activeTab==='graph'?'active':''}">◉ Grafo</button>
              <button data-tab="timeline" class="${activeTab==='timeline'?'active':''}">⌁ Cronograma</button>
              <button data-tab="history" class="${activeTab==='history'?'active':''}">↺ Histórico</button>
            </div>
          </section>
          <section>
            <div class="section-kicker">Criar</div>
            <div class="stack">
              <button class="primary" id="createProjectBtn" ${!canEdit()?'disabled':''}>＋ Projeto</button>
              <button class="secondary" id="createTaskBtn" ${!canEdit()||ws.projects.length===0?'disabled':''}>＋ Tarefa</button>
              <button class="secondary" id="createDependencyBtn" ${!canEdit()||ws.tasks.length<2?'disabled':''}>↗ Dependência</button>
              <button class="secondary" id="createDecisionBtn" ${!canEdit()||ws.projects.length===0?'disabled':''}>◆ Decisão</button>
            </div>
          </section>
          <section>
            <div class="section-kicker">Filtrar</div>
            <label class="field"><span>Busca</span><input id="searchInput" value="${esc(filters.query)}" placeholder="Projeto, tarefa ou decisão"></label>
            <label class="field"><span>Tipo</span><select id="typeFilter">
              <option value="all">Todos</option><option value="project" ${filters.type==='project'?'selected':''}>Projetos</option><option value="task" ${filters.type==='task'?'selected':''}>Tarefas</option><option value="decision" ${filters.type==='decision'?'selected':''}>Decisões</option>
            </select></label>
            <label class="field"><span>Status</span><select id="statusFilter">
              <option value="all">Todos</option>
              ${['active','done','todo','doing','open','accepted','rejected'].map((s)=>`<option value="${s}" ${filters.status===s?'selected':''}>${statusLabel[s]}</option>`).join('')}
            </select></label>
            <label class="field"><span>Responsável</span><select id="assigneeFilter"><option value="all">Todos</option>${ws.members.map((member)=>`<option value="${member.id}" ${filters.assigneeId===member.id?'selected':''}>${esc(member.name)}</option>`).join('')}</select></label>
          </section>
          <section class="legend">
            <div class="section-kicker">Legenda</div>
            <span><i class="dot project"></i> Projeto</span><span><i class="dot task"></i> Tarefa</span><span><i class="dot decision"></i> Decisão</span>
          </section>
        </aside>
        <main class="main-panel">
          <div class="page-head">
            <div><p class="eyebrow">${esc(ws.name)}</p><h1>${activeTab === 'graph' ? 'Mapa de trabalho' : activeTab === 'timeline' ? 'Cronograma' : 'Histórico de alterações'}</h1></div>
            <div class="stats">${renderStats(ws)}</div>
          </div>
          <div id="content">${activeTab === 'graph' ? renderGraph(ws) : activeTab === 'timeline' ? renderTimeline(ws) : renderHistory(ws)}</div>
        </main>
        <aside class="inspector">${renderInspector(ws)}</aside>
      </div>
    </div>
    ${renderDialogs(ws)}
  `;
  bindEvents();
  if (activeTab === 'graph') requestAnimationFrame(() => { applyGraphTransform(); drawEdges(); bindGraphInteractions(); });
}

function renderStats(ws) {
  const done = ws.tasks.filter((task) => task.status === 'done').length;
  return `<span><b>${ws.projects.length}</b> projetos</span><span><b>${ws.tasks.length}</b> tarefas</span><span><b>${done}</b> concluídas</span>`;
}

function renderGraph(ws) {
  const visible = filteredEntities(ws, filters);
  const entities = [
    ...visible.projects.map((item) => ({ type:'project', item })),
    ...visible.tasks.map((item) => ({ type:'task', item })),
    ...visible.decisions.map((item) => ({ type:'decision', item }))
  ];
  if (ws.projects.length === 0) return renderOnboarding();
  return `
    <div class="graph-toolbar"><span>Arraste os nós. Use a roda para zoom e arraste o fundo para navegar.</span><button class="ghost small" id="resetGraphBtn">Centralizar</button></div>
    <div class="graph-viewport" id="graphViewport" tabindex="0" aria-label="Grafo interativo de projetos, tarefas, dependências e decisões">
      <div class="graph-layer" id="graphLayer">
        <svg class="edge-layer" id="edgeLayer" width="1600" height="1200" viewBox="0 0 1600 1200"></svg>
        ${entities.map(({type,item}) => renderNode(ws,type,item)).join('')}
      </div>
    </div>`;
}

function renderOnboarding() {
  return `<div class="empty-state"><div class="empty-icon">◎</div><h2>Comece pelo projeto</h2><p>O fluxo real é: criar projeto → criar tarefas → ligar uma dependência → concluir as tarefas na ordem correta.</p><button class="primary" id="emptyCreateProject" ${!canEdit()?'disabled':''}>Criar primeiro projeto</button></div>`;
}

function renderNode(ws, type, item) {
  const key = `${type}:${item.id}`;
  const pos = ws.layout[key] ?? { x: 100, y: 100 };
  const subtitle = type === 'project' ? `${ws.tasks.filter((task)=>task.projectId===item.id).length} tarefas` : type === 'task' ? `${priorityLabel[item.priority]} · ${ws.members.find((m)=>m.id===item.assigneeId)?.name ?? 'Sem responsável'}` : statusLabel[item.status];
  const status = statusLabel[item.status] ?? item.status;
  return `<button class="graph-node ${type} ${selected?.id===item.id?'selected':''}" data-node-key="${key}" data-type="${type}" data-id="${item.id}" style="left:${pos.x}px;top:${pos.y}px" aria-label="${esc(item.title)}">
    <span class="node-type">${type==='project'?'Projeto':type==='task'?'Tarefa':'Decisão'}</span>
    <strong>${esc(item.title)}</strong><small>${esc(subtitle)}</small><em class="status ${item.status}">${esc(status)}</em>
  </button>`;
}

function drawEdges() {
  const svg = $('#edgeLayer');
  if (!svg) return;
  const ws = currentWs();
  const visibleIds = new Set($$('.graph-node').map((node) => node.dataset.id));
  const lines = [];
  for (const task of ws.tasks) {
    if (!visibleIds.has(task.id) || !visibleIds.has(task.projectId)) continue;
    const a = centerFor(`project:${task.projectId}`); const b = centerFor(`task:${task.id}`);
    if (a && b) lines.push(edgePath(a,b,'contains'));
  }
  for (const dep of ws.dependencies) {
    if (!visibleIds.has(dep.fromTaskId) || !visibleIds.has(dep.toTaskId)) continue;
    const a = centerFor(`task:${dep.fromTaskId}`); const b = centerFor(`task:${dep.toTaskId}`);
    if (a && b) lines.push(edgePath(a,b,'dependency'));
  }
  for (const decision of ws.decisions) {
    for (const taskId of decision.relatedTaskIds) {
      if (!visibleIds.has(decision.id) || !visibleIds.has(taskId)) continue;
      const a = centerFor(`decision:${decision.id}`); const b = centerFor(`task:${taskId}`);
      if (a && b) lines.push(edgePath(a,b,'decision'));
    }
  }
  svg.innerHTML = `<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" /></marker></defs>${lines.join('')}`;
}

function centerFor(key) {
  const node = $(`[data-node-key="${CSS.escape(key)}"]`);
  if (!node) return null;
  return { x: node.offsetLeft + node.offsetWidth/2, y: node.offsetTop + node.offsetHeight/2 };
}
function edgePath(a,b,kind) {
  const bend = Math.max(40, Math.abs(b.x-a.x)*0.4);
  return `<path class="edge ${kind}" d="M ${a.x} ${a.y} C ${a.x+bend} ${a.y}, ${b.x-bend} ${b.y}, ${b.x} ${b.y}" marker-end="url(#arrow)" />`;
}

function renderTimeline(ws) {
  const tasks = filteredEntities(ws, { ...filters, type:'task' }).tasks;
  if (!tasks.length) return `<div class="empty-state compact"><h2>Sem tarefas no filtro atual</h2><p>Crie tarefas com datas para visualizar o cronograma.</p></div>`;
  const timestamps = tasks.flatMap((task) => [task.startDate, task.dueDate].filter(Boolean).map((d)=>new Date(`${d}T00:00:00`).getTime()));
  const today = new Date(); today.setHours(0,0,0,0);
  const min = timestamps.length ? Math.min(...timestamps, today.getTime()) : today.getTime();
  const max = timestamps.length ? Math.max(...timestamps, today.getTime()+13*86400000) : today.getTime()+13*86400000;
  const span = Math.max(86400000, max-min);
  const pct = (d) => d ? ((new Date(`${d}T00:00:00`).getTime()-min)/span)*100 : 0;
  return `<div class="timeline-card"><div class="timeline-scale"><span>${new Date(min).toLocaleDateString('pt-BR')}</span><span>${new Date(max).toLocaleDateString('pt-BR')}</span></div>
    ${tasks.map((task)=>{
      const project = ws.projects.find((p)=>p.id===task.projectId);
      const left = Math.max(0, pct(task.startDate || task.dueDate));
      const right = task.dueDate ? pct(task.dueDate) : Math.min(100,left+8);
      return `<button class="timeline-row" data-select-type="task" data-select-id="${task.id}"><div class="timeline-label"><strong>${esc(task.title)}</strong><small>${esc(project?.title ?? '')}</small></div><div class="timeline-track"><span class="timeline-bar ${task.status}" style="left:${left}%;width:${Math.max(3,right-left)}%"></span></div><span class="timeline-date">${esc(task.dueDate || 'sem prazo')}</span></button>`;
    }).join('')}</div>`;
}

function renderHistory(ws) {
  if (!ws.history.length) return `<div class="empty-state compact"><h2>Nenhuma alteração registrada</h2><p>Criações, dependências, mudanças de papel e conclusões aparecerão aqui.</p></div>`;
  return `<div class="history-list">${ws.history.map((event)=>{
    const member = ws.members.find((m)=>m.id===event.actorId);
    return `<article><div class="history-dot"></div><div><strong>${esc(event.summary)}</strong><p>${esc(member?.name ?? 'Membro')} · ${new Date(event.createdAt).toLocaleString('pt-BR')}</p></div></article>`;
  }).join('')}</div>`;
}

function renderInspector(ws) {
  if (!selected) return `<div class="inspector-empty"><span>↗</span><h3>Selecione um item</h3><p>Os detalhes e ações contextuais aparecem aqui.</p></div>`;
  const item = selected.type === 'project' ? ws.projects.find((x)=>x.id===selected.id) : selected.type === 'task' ? ws.tasks.find((x)=>x.id===selected.id) : ws.decisions.find((x)=>x.id===selected.id);
  if (!item) { selected = null; return `<div class="inspector-empty"><p>Item não encontrado.</p></div>`; }
  if (selected.type === 'task') {
    const project = ws.projects.find((p)=>p.id===item.projectId);
    const member = ws.members.find((m)=>m.id===item.assigneeId);
    const allowed = canCompleteTask(ws, item.id);
    return `<div class="inspector-card"><div class="node-type">Tarefa</div><h2>${esc(item.title)}</h2><p>${esc(item.description || 'Sem descrição.')}</p>
      <dl><dt>Projeto</dt><dd>${esc(project?.title ?? '')}</dd><dt>Status</dt><dd>${statusLabel[item.status]}</dd><dt>Prioridade</dt><dd>${priorityLabel[item.priority]}</dd><dt>Responsável</dt><dd>${esc(member?.name ?? 'Não atribuído')}</dd><dt>Prazo</dt><dd>${esc(item.dueDate || 'Sem prazo')}</dd></dl>
      ${item.status !== 'done' ? `<button class="primary wide" id="completeTaskBtn" ${!canEdit()||!allowed.ok?'disabled':''}>Concluir tarefa</button>${!allowed.ok?`<p class="warning">${esc(allowed.reason)}</p>`:''}` : `<div class="success-box">✓ Tarefa concluída</div>`}
    </div>`;
  }
  if (selected.type === 'project') {
    const tasks = ws.tasks.filter((task)=>task.projectId===item.id);
    return `<div class="inspector-card"><div class="node-type">Projeto</div><h2>${esc(item.title)}</h2><p>${esc(item.description || 'Sem descrição.')}</p><dl><dt>Status</dt><dd>${statusLabel[item.status]}</dd><dt>Tarefas</dt><dd>${tasks.filter(t=>t.status==='done').length}/${tasks.length} concluídas</dd><dt>Prazo</dt><dd>${esc(item.dueDate || 'Sem prazo')}</dd></dl>${item.status==='done'?`<div class="success-box">✓ Projeto concluído automaticamente</div>`:''}</div>`;
  }
  const project = ws.projects.find((p)=>p.id===item.projectId);
  return `<div class="inspector-card"><div class="node-type">Decisão</div><h2>${esc(item.title)}</h2><p>${esc(item.summary)}</p><dl><dt>Projeto</dt><dd>${esc(project?.title ?? '')}</dd><dt>Status</dt><dd>${statusLabel[item.status]}</dd><dt>Tarefas relacionadas</dt><dd>${item.relatedTaskIds.length}</dd></dl></div>`;
}

function renderDialogs(ws) {
  return `
    <dialog id="workspaceDialog"><form method="dialog" data-form="workspace"><div class="dialog-head"><div><span class="node-type">Workspace</span><h2>Novo espaço de trabalho</h2></div><button value="cancel" class="icon-btn">×</button></div><label class="field"><span>Nome</span><input name="name" maxlength="80" required placeholder="Ex.: Produto"></label><button class="primary wide" value="default">Criar workspace</button></form></dialog>
    <dialog id="projectDialog"><form method="dialog" data-form="project"><div class="dialog-head"><div><span class="node-type">Projeto</span><h2>Criar projeto</h2></div><button value="cancel" class="icon-btn">×</button></div><label class="field"><span>Título</span><input name="title" required maxlength="120"></label><label class="field"><span>Descrição</span><textarea name="description" rows="3"></textarea></label><div class="grid2"><label class="field"><span>Início</span><input type="date" name="startDate"></label><label class="field"><span>Prazo</span><input type="date" name="dueDate"></label></div><button class="primary wide" value="default">Criar projeto</button></form></dialog>
    <dialog id="taskDialog"><form method="dialog" data-form="task"><div class="dialog-head"><div><span class="node-type">Tarefa</span><h2>Criar tarefa</h2></div><button value="cancel" class="icon-btn">×</button></div><label class="field"><span>Projeto</span><select name="projectId" required>${ws.projects.map((p)=>`<option value="${p.id}">${esc(p.title)}</option>`).join('')}</select></label><label class="field"><span>Título</span><input name="title" required maxlength="140"></label><label class="field"><span>Descrição</span><textarea name="description" rows="2"></textarea></label><div class="grid2"><label class="field"><span>Prioridade</span><select name="priority"><option value="low">Baixa</option><option value="medium" selected>Média</option><option value="high">Alta</option></select></label><label class="field"><span>Responsável</span><select name="assigneeId"><option value="">Sem responsável</option>${ws.members.map((m)=>`<option value="${m.id}">${esc(m.name)}</option>`).join('')}</select></label></div><div class="grid2"><label class="field"><span>Início</span><input type="date" name="startDate"></label><label class="field"><span>Prazo</span><input type="date" name="dueDate"></label></div><button class="primary wide" value="default">Criar tarefa</button></form></dialog>
    <dialog id="dependencyDialog"><form method="dialog" data-form="dependency"><div class="dialog-head"><div><span class="node-type">Dependência</span><h2>Conectar tarefas</h2></div><button value="cancel" class="icon-btn">×</button></div><label class="field"><span>Pré-requisito</span><select name="fromTaskId">${taskOptions(ws)}</select></label><label class="field"><span>Tarefa dependente</span><select name="toTaskId">${taskOptions(ws)}</select></label><div class="info-box">A tarefa dependente só poderá ser concluída depois do pré-requisito. Ciclos são bloqueados.</div><button class="primary wide" value="default">Criar dependência</button></form></dialog>
    <dialog id="decisionDialog"><form method="dialog" data-form="decision"><div class="dialog-head"><div><span class="node-type">Decisão</span><h2>Registrar decisão</h2></div><button value="cancel" class="icon-btn">×</button></div><label class="field"><span>Projeto</span><select name="projectId" id="decisionProject">${ws.projects.map((p)=>`<option value="${p.id}">${esc(p.title)}</option>`).join('')}</select></label><label class="field"><span>Título</span><input name="title" required maxlength="140"></label><label class="field"><span>Resumo</span><textarea name="summary" rows="4" required></textarea></label><label class="field"><span>Status</span><select name="status"><option value="open">Aberta</option><option value="accepted">Aceita</option><option value="rejected">Rejeitada</option></select></label><fieldset><legend>Tarefas relacionadas</legend><div id="decisionTaskChecks">${decisionChecks(ws, ws.projects[0]?.id)}</div></fieldset><button class="primary wide" value="default">Registrar decisão</button></form></dialog>
    <dialog id="membersDialog"><form method="dialog" data-form="member"><div class="dialog-head"><div><span class="node-type">Equipe</span><h2>Membros e papéis</h2></div><button value="cancel" class="icon-btn">×</button></div><div class="member-list">${ws.members.map((m)=>`<div class="member-row"><strong>${esc(m.name)}</strong><select data-role-member="${m.id}" ${!isOwner()?'disabled':''}>${Object.values(ROLES).map((role)=>`<option value="${role}" ${m.role===role?'selected':''}>${roleLabel[role]}</option>`).join('')}</select></div>`).join('')}</div>${isOwner()?`<hr><label class="field"><span>Novo membro</span><input name="name" maxlength="80" placeholder="Nome"></label><label class="field"><span>Papel</span><select name="role"><option value="editor">Editor</option><option value="viewer">Leitor</option><option value="owner">Proprietário</option></select></label><button class="secondary wide" value="default">Adicionar membro</button>`:`<div class="info-box">Somente proprietários podem alterar papéis.</div>`}</form></dialog>
    <dialog id="exportDialog"><form method="dialog"><div class="dialog-head"><div><span class="node-type">Exportação</span><h2>Exportar workspace</h2></div><button value="cancel" class="icon-btn">×</button></div><p class="muted">Baixe um snapshot completo em JSON ou a tabela de tarefas em CSV.</p><div class="stack"><button type="button" class="primary" id="downloadJsonBtn">JSON completo</button><button type="button" class="secondary" id="downloadCsvBtn">CSV de tarefas</button></div></form></dialog>`;
}

function taskOptions(ws) { return ws.tasks.map((task)=>`<option value="${task.id}">${esc(ws.projects.find((p)=>p.id===task.projectId)?.title ?? '')} — ${esc(task.title)}</option>`).join(''); }
function decisionChecks(ws, projectId) { return ws.tasks.filter((t)=>t.projectId===projectId).map((t)=>`<label class="check"><input type="checkbox" name="relatedTaskIds" value="${t.id}"><span>${esc(t.title)}</span></label>`).join('') || '<p class="muted">Este projeto ainda não tem tarefas.</p>'; }

function bindEvents() {
  const ws = currentWs();
  $('#workspaceSelect')?.addEventListener('change', (e)=>mutate(()=>switchWorkspace(state,e.target.value)));
  $('#memberSelect')?.addEventListener('change', (e)=>mutate(()=>setCurrentMember(ws,e.target.value)));
  $('#newWorkspaceBtn')?.addEventListener('click', ()=>$('#workspaceDialog').showModal());
  $('#membersBtn')?.addEventListener('click', ()=>$('#membersDialog').showModal());
  $('#exportBtn')?.addEventListener('click', ()=>$('#exportDialog').showModal());
  $('#createProjectBtn')?.addEventListener('click', ()=>$('#projectDialog').showModal());
  $('#emptyCreateProject')?.addEventListener('click', ()=>$('#projectDialog').showModal());
  $('#createTaskBtn')?.addEventListener('click', ()=>$('#taskDialog').showModal());
  $('#createDependencyBtn')?.addEventListener('click', ()=>$('#dependencyDialog').showModal());
  $('#createDecisionBtn')?.addEventListener('click', ()=>$('#decisionDialog').showModal());
  $$('[data-tab]').forEach((btn)=>btn.addEventListener('click', ()=>{ activeTab=btn.dataset.tab; render(); }));
  $('#searchInput')?.addEventListener('input', (e)=>{
    filters.query=e.target.value;
    const cursor=e.target.selectionStart ?? filters.query.length;
    render();
    requestAnimationFrame(()=>{
      const input=$('#searchInput');
      input?.focus();
      input?.setSelectionRange?.(cursor, cursor);
    });
  });
  $('#typeFilter')?.addEventListener('change', (e)=>{ filters.type=e.target.value; render(); });
  $('#statusFilter')?.addEventListener('change', (e)=>{ filters.status=e.target.value; render(); });
  $('#assigneeFilter')?.addEventListener('change', (e)=>{ filters.assigneeId=e.target.value; render(); });
  $$('[data-select-type]').forEach((node)=>node.addEventListener('click', ()=>{ selected={type:node.dataset.selectType,id:node.dataset.selectId}; render(); }));
  $('#completeTaskBtn')?.addEventListener('click', ()=>mutate(()=>setTaskStatus(ws, selected.id, TASK_STATUSES.DONE),'Tarefa concluída.'));
  $('#resetGraphBtn')?.addEventListener('click', ()=>{ graphView={x:0,y:0,scale:1}; applyGraphTransform(); });

  $$('form[data-form]').forEach((form)=>form.addEventListener('submit', (e)=>{
    e.preventDefault();
    if (e.submitter?.value === 'cancel') { form.closest('dialog').close(); return; }
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    if (form.dataset.form === 'workspace') mutate(()=>createWorkspace(state,data.name),'Workspace criado.');
    if (form.dataset.form === 'project') mutate(()=>createProject(ws,data),'Projeto criado.');
    if (form.dataset.form === 'task') mutate(()=>createTask(ws,data),'Tarefa criada.');
    if (form.dataset.form === 'dependency') mutate(()=>addDependency(ws,data),'Dependência criada.');
    if (form.dataset.form === 'decision') {
      data.relatedTaskIds = fd.getAll('relatedTaskIds');
      mutate(()=>createDecision(ws,data),'Decisão registrada.');
    }
    if (form.dataset.form === 'member') {
      if (!data.name) return toast('Informe o nome do novo membro.','error');
      mutate(()=>addMember(ws,data),'Membro adicionado.');
    }
    form.closest('dialog').close();
  }));

  $$('[data-role-member]').forEach((select)=>select.addEventListener('change',(e)=>mutate(()=>updateMemberRole(ws,e.target.dataset.roleMember,e.target.value),'Papel atualizado.')));
  $('#decisionProject')?.addEventListener('change',(e)=>{ $('#decisionTaskChecks').innerHTML=decisionChecks(ws,e.target.value); });
  $('#downloadJsonBtn')?.addEventListener('click',()=>download(`${slug(ws.name)}-workspace.json`,exportWorkspace(ws),'application/json'));
  $('#downloadCsvBtn')?.addEventListener('click',()=>download(`${slug(ws.name)}-tarefas.csv`,tasksCsv(ws),'text/csv;charset=utf-8'));
}

function bindGraphInteractions() {
  const viewport = $('#graphViewport');
  if (!viewport) return;
  $$('.graph-node').forEach((node)=>{
    node.addEventListener('click',(e)=>{ e.stopPropagation(); selected={type:node.dataset.type,id:node.dataset.id}; render(); });
    node.addEventListener('pointerdown',(e)=>{
      if (e.button !== 0) return;
      e.stopPropagation();
      node.setPointerCapture(e.pointerId);
      const start = { x:e.clientX, y:e.clientY, left:node.offsetLeft, top:node.offsetTop };
      const move=(ev)=>{ node.style.left=`${start.left+(ev.clientX-start.x)/graphView.scale}px`; node.style.top=`${start.top+(ev.clientY-start.y)/graphView.scale}px`; drawEdges(); };
      const up=(ev)=>{ node.removeEventListener('pointermove',move); node.removeEventListener('pointerup',up); moveNode(currentWs(),node.dataset.nodeKey,parseFloat(node.style.left),parseFloat(node.style.top)); saveState(state); };
      node.addEventListener('pointermove',move); node.addEventListener('pointerup',up);
    });
  });
  viewport.addEventListener('wheel',(e)=>{
    e.preventDefault();
    const next=Math.min(1.6,Math.max(.55,graphView.scale*(e.deltaY<0?1.08:.92)));
    graphView.scale=next; applyGraphTransform();
  },{passive:false});
  viewport.addEventListener('pointerdown',(e)=>{
    if (e.target.closest('.graph-node')) return;
    viewport.setPointerCapture(e.pointerId);
    const start={x:e.clientX,y:e.clientY,gx:graphView.x,gy:graphView.y};
    const move=(ev)=>{graphView.x=start.gx+ev.clientX-start.x;graphView.y=start.gy+ev.clientY-start.y;applyGraphTransform();};
    const up=()=>{viewport.removeEventListener('pointermove',move);viewport.removeEventListener('pointerup',up);};
    viewport.addEventListener('pointermove',move);viewport.addEventListener('pointerup',up);
  });
}

function applyGraphTransform(){ const layer=$('#graphLayer'); if(layer) layer.style.transform=`translate(${graphView.x}px,${graphView.y}px) scale(${graphView.scale})`; }
function slug(value){return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'teamgraph';}
function download(filename,content,type){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);}

render();
