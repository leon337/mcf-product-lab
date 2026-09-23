import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialState, activeWorkspace, createProject, createTask, addDependency,
  setTaskStatus, createDecision, addMember, updateMemberRole, setCurrentMember,
  TASK_STATUSES, ROLES, canCompleteTask, tasksCsv
} from '../src/domain.mjs';

function setup() {
  const state=createInitialState();
  const ws=activeWorkspace(state);
  const project=createProject(ws,{title:'Projeto Alpha',description:'Fluxo de teste',startDate:'2026-09-23',dueDate:'2026-09-30'});
  return {state,ws,project};
}

test('fluxo projeto → tarefas → dependência → conclusão',()=>{
  const {ws,project}=setup();
  const a=createTask(ws,{projectId:project.id,title:'Planejar',priority:'high',startDate:'2026-09-23',dueDate:'2026-09-24'});
  const b=createTask(ws,{projectId:project.id,title:'Entregar',priority:'medium',startDate:'2026-09-24',dueDate:'2026-09-30'});
  addDependency(ws,{fromTaskId:a.id,toTaskId:b.id});
  assert.equal(canCompleteTask(ws,b.id).ok,false);
  assert.throws(()=>setTaskStatus(ws,b.id,TASK_STATUSES.DONE),/Bloqueada por/);
  setTaskStatus(ws,a.id,TASK_STATUSES.DONE);
  assert.equal(canCompleteTask(ws,b.id).ok,true);
  setTaskStatus(ws,b.id,TASK_STATUSES.DONE);
  assert.equal(project.status,'done');
  assert.ok(project.completedAt);
  assert.ok(ws.history.some((event)=>event.type==='dependency.created'));
  assert.ok(ws.history.some((event)=>event.type==='project.status.changed'));
});

test('dependência cíclica é rejeitada',()=>{
  const {ws,project}=setup();
  const a=createTask(ws,{projectId:project.id,title:'A'});
  const b=createTask(ws,{projectId:project.id,title:'B'});
  const c=createTask(ws,{projectId:project.id,title:'C'});
  addDependency(ws,{fromTaskId:a.id,toTaskId:b.id});
  addDependency(ws,{fromTaskId:b.id,toTaskId:c.id});
  assert.throws(()=>addDependency(ws,{fromTaskId:c.id,toTaskId:a.id}),/ciclo/);
});

test('viewer não pode alterar conteúdo',()=>{
  const {ws}=setup();
  const viewer=addMember(ws,{name:'Leitor Demo',role:ROLES.VIEWER});
  setCurrentMember(ws,viewer.id);
  assert.throws(()=>createProject(ws,{title:'Não permitido'}),/Leitores/);
});

test('owner gerencia papéis sem remover o último owner de si mesmo',()=>{
  const {ws}=setup();
  const editor=addMember(ws,{name:'Editor Demo',role:ROLES.EDITOR});
  updateMemberRole(ws,editor.id,ROLES.OWNER);
  assert.equal(editor.role,ROLES.OWNER);
  updateMemberRole(ws,actorOwnerId(ws),ROLES.EDITOR);
  assert.equal(ws.members.filter((m)=>m.role===ROLES.OWNER).length,1);
});

function actorOwnerId(ws){return ws.currentMemberId;}

test('decisão referencia tarefas do projeto e exportação CSV preserva dados',()=>{
  const {ws,project}=setup();
  const task=createTask(ws,{projectId:project.id,title:'Definir arquitetura',priority:'high'});
  const decision=createDecision(ws,{projectId:project.id,title:'Persistência local',summary:'Usar IndexedDB no MVP.',status:'accepted',relatedTaskIds:[task.id]});
  assert.deepEqual(decision.relatedTaskIds,[task.id]);
  const csv=tasksCsv(ws);
  assert.match(csv,/Definir arquitetura/);
  assert.match(csv,/Projeto Alpha/);
});
