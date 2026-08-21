# Hypothesis Registry

Este diretório registra hipóteses de produto/arquitetura derivadas de pesquisa. Hipótese não equivale a decisão ou implementação autorizada.

| ID | Hipótese | Origem inicial | Status |
|---|---|---|---|
| HYP-001 | Agentification Gate | Aula 1 | `PROPOSED` |
| HYP-002 | MCF Builder | Aula 1 | `PROPOSED` |
| HYP-003 | Virtual Professionals | visão de produto + Aula 1 | `PROPOSED` |
| HYP-004 | Output Contract | Aula 1 | `PROPOSED` |
| HYP-005 | Workspace Isolation | Aula 1 | `PROPOSED` |

## HYP-001 — Agentification Gate

**Problema:** nem toda atividade deve virar agente ou automação.

**Hipótese:** antes de criar uma capacidade agentic, o MCF pode avaliar repetição, padrão, verificabilidade, risco, autoridade e fontes disponíveis.

**Pergunta de validação:** esse gate reduz automações frágeis sem criar atrito excessivo?

## HYP-002 — MCF Builder

**Problema:** a arquitetura do MCF é poderosa, porém complexa para configuração direta por usuários não técnicos.

**Hipótese:** uma entrevista guiada pode transformar intenção humana em contratos e configurações governadas do MCF.

**Saída candidata:** objetivo, papel, contexto, regras, formato, fontes, riscos, acceptance criteria, permissions, skills e escalation triggers.

**Pergunta de validação:** usuários conseguem especificar uma missão/profissional confiável sem conhecer a terminologia interna do MCF?

## HYP-003 — Virtual Professionals

**Problema:** "agente" é uma abstração técnica e ambígua para usuários finais.

**Hipótese:** "profissionais virtuais" e "equipes" podem ser a abstração de produto, enquanto agentes/skills permanecem internos.

**Pergunta de validação:** usuários compreendem e compram melhor resultados quando a interface usa profissões, responsabilidades e entregáveis?

## HYP-004 — Output Contract

**Problema:** respostas tecnicamente corretas ainda podem exigir retrabalho quando formato, destino ou evidência não correspondem à necessidade.

**Hipótese:** entregas devem ser descritas por contrato estruturado com formato, schema, artefato, acceptance criteria, evidência e destino.

**Pergunta de validação:** contratos de output aumentam previsibilidade e automação downstream?

## HYP-005 — Workspace Isolation

**Problema:** clientes/projetos diferentes podem ter conhecimento, histórico, identidade e permissões incompatíveis.

**Hipótese:** workspaces/tenants isolados devem impedir compartilhamento implícito de estado entre contextos independentes.

**Pergunta de validação:** qual é o boundary mínimo necessário — organização, cliente, projeto, missão ou combinação?

## Regra de promoção

Uma hipótese só deve mudar para `VALIDATED` ou `ACCEPTED` quando houver evidência registrada. `ACCEPTED` no Product Lab ainda não autoriza implementação no repositório oficial do MCF.
