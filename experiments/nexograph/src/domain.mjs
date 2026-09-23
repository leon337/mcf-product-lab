export const ROLES = Object.freeze({ OWNER: 'owner', EDITOR: 'editor', VIEWER: 'viewer' });
export const TASK_STATUSES = Object.freeze({ TODO: 'todo', DOING: 'doing', DONE: 'done' });
export const PROJECT_STATUSES = Object.freeze({ ACTIVE: 'active', DONE: 'done' });
export const DECISION_STATUSES = Object.freeze({ OPEN: 'open', ACCEPTED: 'accepted', REJECTED: 'rejected' });

export function nowIso() { return new Date().toISOString(); }
export function id(prefix = 'id') {
  return `${prefix}_${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
}

export function createInitialState() {
  const owner = { id: id('member'), name: 'Você', role: ROLES.OWNER };
  const workspace = {
    id: id('ws'),
    name: 'Equipe',
    createdAt: nowIso(),
    currentMemberId: owner.id,
    members: [owner],
    projects: [],
    tasks: [],
    dependencies: [],
    decisions: [],
    history: [],
    layout: {}
  };
  return { version: 1, currentWorkspaceId: workspace.id, workspaces: [workspace] };
}

export function activeWorkspace(state) {
  const ws = state.workspaces.find((item) => item.id === state.currentWorkspaceId);
  if (!ws) throw new Error('Workspace ativo não encontrado.');
  return ws;
}

export function actor(ws) {
  const member = ws.members.find((item) => item.id === ws.currentMemberId);
  if (!member) throw new Error('Membro atual não encontrado.');
  return member;
}

function assertText(value, label, max = 160) {
  const normalized = String(value ?? '').trim();
  if (!normalized) throw new Error(`${label} é obrigatório.`);
  if (normalized.length > max) throw new Error(`${label} excede ${max} caracteres.`);
  return normalized;
}

function assertDate(value, label) {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) throw new Error(`${label} inválida.`);
  return value;
}

function assertCanEdit(ws) {
  if (actor(ws).role === ROLES.VIEWER) throw new Error('Leitores não podem alterar o workspace.');
}

function assertOwner(ws) {
  if (actor(ws).role !== ROLES.OWNER) throw new Error('Somente proprietários podem gerenciar membros e papéis.');
}

function addHistory(ws, type, summary, entityId = '') {
  ws.history.unshift({
    id: id('history'),
    actorId: actor(ws).id,
    type,
    summary,
    entityId,
    createdAt: nowIso()
  });
}

export function createWorkspace(state, name) {
  const workspaceOwner = { id: id('member'), name: 'Você', role: ROLES.OWNER };
  const workspace = {
    id: id('ws'),
    name: assertText(name, 'Nome do workspace', 80),
    createdAt: nowIso(),
    currentMemberId: workspaceOwner.id,
    members: [workspaceOwner],
    projects: [], tasks: [], dependencies: [], decisions: [], history: [], layout: {}
  };
  state.workspaces.push(workspace);
  state.currentWorkspaceId = workspace.id;
  addHistory(workspace, 'workspace.created', `Workspace “${workspace.name}” criado.`, workspace.id);
  return workspace;
}

export function switchWorkspace(state, workspaceId) {
  if (!state.workspaces.some((ws) => ws.id === workspaceId)) throw new Error('Workspace não encontrado.');
  state.currentWorkspaceId = workspaceId;
}

export function setCurrentMember(ws, memberId) {
  if (!ws.members.some((member) => member.id === memberId)) throw new Error('Membro não encontrado.');
  ws.currentMemberId = memberId;
}

export function addMember(ws, input) {
  assertOwner(ws);
  const role = Object.values(ROLES).includes(input.role) ? input.role : ROLES.EDITOR;
  const member = { id: id('member'), name: assertText(input.name, 'Nome do membro', 80), role };
  ws.members.push(member);
  addHistory(ws, 'member.created', `Membro “${member.name}” adicionado como ${role}.`, member.id);
  return member;
}

export function updateMemberRole(ws, memberId, role) {
  assertOwner(ws);
  if (!Object.values(ROLES).includes(role)) throw new Error('Papel inválido.');
  const member = ws.members.find((item) => item.id === memberId);
  if (!member) throw new Error('Membro não encontrado.');
  if (member.id === ws.currentMemberId && member.role === ROLES.OWNER && role !== ROLES.OWNER) {
    const owners = ws.members.filter((item) => item.role === ROLES.OWNER);
    if (owners.length === 1) throw new Error('O workspace precisa manter ao menos um proprietário.');
  }
  member.role = role;
  addHistory(ws, 'member.role.changed', `Papel de “${member.name}” alterado para ${role}.`, member.id);
  return member;
}

export function createProject(ws, input) {
  assertCanEdit(ws);
  const startDate = assertDate(input.startDate, 'Data inicial');
  const dueDate = assertDate(input.dueDate, 'Prazo');
  if (startDate && dueDate && dueDate < startDate) throw new Error('O prazo não pode ser anterior à data inicial.');
  const project = {
    id: id('project'),
    title: assertText(input.title, 'Título do projeto', 120),
    description: String(input.description ?? '').trim().slice(0, 1000),
    status: PROJECT_STATUSES.ACTIVE,
    startDate,
    dueDate,
    createdAt: nowIso(),
    completedAt: ''
  };
  ws.projects.push(project);
  ws.layout[`project:${project.id}`] = nextLayoutPosition(ws, 'project');
  addHistory(ws, 'project.created', `Projeto “${project.title}” criado.`, project.id);
  return project;
}

export function createTask(ws, input) {
  assertCanEdit(ws);
  const project = ws.projects.find((item) => item.id === input.projectId);
  if (!project) throw new Error('Projeto não encontrado.');
  const startDate = assertDate(input.startDate, 'Data inicial');
  const dueDate = assertDate(input.dueDate, 'Prazo');
  if (startDate && dueDate && dueDate < startDate) throw new Error('O prazo não pode ser anterior à data inicial.');
  if (input.assigneeId && !ws.members.some((member) => member.id === input.assigneeId)) throw new Error('Responsável não encontrado.');
  const task = {
    id: id('task'),
    projectId: project.id,
    title: assertText(input.title, 'Título da tarefa', 140),
    description: String(input.description ?? '').trim().slice(0, 1000),
    status: TASK_STATUSES.TODO,
    priority: ['low', 'medium', 'high'].includes(input.priority) ? input.priority : 'medium',
    assigneeId: input.assigneeId || '',
    startDate,
    dueDate,
    createdAt: nowIso(),
    completedAt: ''
  };
  ws.tasks.push(task);
  ws.layout[`task:${task.id}`] = nextLayoutPosition(ws, 'task');
  addHistory(ws, 'task.created', `Tarefa “${task.title}” criada em “${project.title}”.`, task.id);
  return task;
}

function adjacency(ws, extra) {
  const map = new Map();
  for (const dep of [...ws.dependencies, ...(extra ? [extra] : [])]) {
    if (!map.has(dep.fromTaskId)) map.set(dep.fromTaskId, []);
    map.get(dep.fromTaskId).push(dep.toTaskId);
  }
  return map;
}

function hasPath(map, start, target) {
  const seen = new Set();
  const stack = [start];
  while (stack.length) {
    const current = stack.pop();
    if (current === target) return true;
    if (seen.has(current)) continue;
    seen.add(current);
    for (const next of map.get(current) ?? []) stack.push(next);
  }
  return false;
}

export function addDependency(ws, input) {
  assertCanEdit(ws);
  const from = ws.tasks.find((task) => task.id === input.fromTaskId);
  const to = ws.tasks.find((task) => task.id === input.toTaskId);
  if (!from || !to) throw new Error('As duas tarefas precisam existir.');
  if (from.id === to.id) throw new Error('Uma tarefa não pode depender dela mesma.');
  if (from.projectId !== to.projectId) throw new Error('No MVP, dependências só podem conectar tarefas do mesmo projeto.');
  if (ws.dependencies.some((dep) => dep.fromTaskId === from.id && dep.toTaskId === to.id)) throw new Error('Essa dependência já existe.');
  const candidate = { id: id('dep'), projectId: from.projectId, fromTaskId: from.id, toTaskId: to.id, createdAt: nowIso() };
  if (hasPath(adjacency(ws), to.id, from.id)) throw new Error('Dependência rejeitada: criaria um ciclo.');
  ws.dependencies.push(candidate);
  addHistory(ws, 'dependency.created', `“${to.title}” agora depende de “${from.title}”.`, candidate.id);
  return candidate;
}

export function prerequisites(ws, taskId) {
  return ws.dependencies
    .filter((dep) => dep.toTaskId === taskId)
    .map((dep) => ws.tasks.find((task) => task.id === dep.fromTaskId))
    .filter(Boolean);
}

export function canCompleteTask(ws, taskId) {
  const task = ws.tasks.find((item) => item.id === taskId);
  if (!task) return { ok: false, reason: 'Tarefa não encontrada.' };
  const blocking = prerequisites(ws, taskId).filter((item) => item.status !== TASK_STATUSES.DONE);
  if (blocking.length) return { ok: false, reason: `Bloqueada por: ${blocking.map((item) => item.title).join(', ')}.` };
  return { ok: true, reason: '' };
}

export function setTaskStatus(ws, taskId, status) {
  assertCanEdit(ws);
  if (!Object.values(TASK_STATUSES).includes(status)) throw new Error('Status de tarefa inválido.');
  const task = ws.tasks.find((item) => item.id === taskId);
  if (!task) throw new Error('Tarefa não encontrada.');
  if (status === TASK_STATUSES.DONE) {
    const allowed = canCompleteTask(ws, taskId);
    if (!allowed.ok) throw new Error(allowed.reason);
    task.completedAt = nowIso();
  } else {
    task.completedAt = '';
  }
  task.status = status;
  addHistory(ws, 'task.status.changed', `Tarefa “${task.title}” movida para ${status}.`, task.id);
  reconcileProjectStatus(ws, task.projectId);
  return task;
}

function reconcileProjectStatus(ws, projectId) {
  const project = ws.projects.find((item) => item.id === projectId);
  if (!project) return;
  const tasks = ws.tasks.filter((task) => task.projectId === projectId);
  const allDone = tasks.length > 0 && tasks.every((task) => task.status === TASK_STATUSES.DONE);
  const next = allDone ? PROJECT_STATUSES.DONE : PROJECT_STATUSES.ACTIVE;
  if (project.status !== next) {
    project.status = next;
    project.completedAt = allDone ? nowIso() : '';
    addHistory(ws, 'project.status.changed', `Projeto “${project.title}” ${allDone ? 'concluído' : 'reaberto'}.`, project.id);
  }
}

export function createDecision(ws, input) {
  assertCanEdit(ws);
  const project = ws.projects.find((item) => item.id === input.projectId);
  if (!project) throw new Error('Projeto não encontrado.');
  const relatedTaskIds = [...new Set(input.relatedTaskIds ?? [])];
  if (relatedTaskIds.some((taskId) => !ws.tasks.some((task) => task.id === taskId && task.projectId === project.id))) {
    throw new Error('Uma decisão só pode referenciar tarefas do mesmo projeto.');
  }
  const decision = {
    id: id('decision'),
    projectId: project.id,
    title: assertText(input.title, 'Título da decisão', 140),
    summary: assertText(input.summary, 'Resumo da decisão', 1000),
    status: Object.values(DECISION_STATUSES).includes(input.status) ? input.status : DECISION_STATUSES.OPEN,
    relatedTaskIds,
    createdAt: nowIso()
  };
  ws.decisions.push(decision);
  ws.layout[`decision:${decision.id}`] = nextLayoutPosition(ws, 'decision');
  addHistory(ws, 'decision.created', `Decisão “${decision.title}” registrada.`, decision.id);
  return decision;
}

export function nextLayoutPosition(ws, type) {
  const count = Object.keys(ws.layout).filter((key) => key.startsWith(`${type}:`)).length;
  const baseX = type === 'project' ? 80 : type === 'task' ? 420 : 820;
  return { x: baseX + (count % 2) * 40, y: 90 + (count % 8) * 120 };
}

export function moveNode(ws, key, x, y) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return;
  ws.layout[key] = { x: Math.round(x), y: Math.round(y) };
}

export function filteredEntities(ws, filters = {}) {
  const q = String(filters.query ?? '').trim().toLocaleLowerCase('pt-BR');
  const type = filters.type || 'all';
  const status = filters.status || 'all';
  const assigneeId = filters.assigneeId || 'all';
  const matchesText = (entity) => !q || `${entity.title ?? ''} ${entity.description ?? ''} ${entity.summary ?? ''}`.toLocaleLowerCase('pt-BR').includes(q);
  const projects = ws.projects.filter((item) => (type === 'all' || type === 'project') && (status === 'all' || item.status === status) && matchesText(item));
  const tasks = ws.tasks.filter((item) => (type === 'all' || type === 'task') && (status === 'all' || item.status === status) && (assigneeId === 'all' || item.assigneeId === assigneeId) && matchesText(item));
  const decisions = ws.decisions.filter((item) => (type === 'all' || type === 'decision') && (status === 'all' || item.status === status) && matchesText(item));
  return { projects, tasks, decisions };
}

export function exportWorkspace(ws) {
  return JSON.stringify({ exportedAt: nowIso(), workspace: ws }, null, 2);
}

export function tasksCsv(ws) {
  const esc = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const header = ['Projeto', 'Tarefa', 'Status', 'Prioridade', 'Responsável', 'Início', 'Prazo'];
  const rows = ws.tasks.map((task) => {
    const project = ws.projects.find((item) => item.id === task.projectId);
    const member = ws.members.find((item) => item.id === task.assigneeId);
    return [project?.title ?? '', task.title, task.status, task.priority, member?.name ?? '', task.startDate, task.dueDate].map(esc).join(',');
  });
  return [header.map(esc).join(','), ...rows].join('\n');
}
