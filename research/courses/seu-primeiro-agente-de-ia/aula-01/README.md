# Aula 1 — Seu Primeiro Agente de IA

**Status:** `RESEARCHED / OPEN_FOR_DERIVATION`  
**Fonte:** workshop em vídeo analisado a partir de transcrição fornecida durante o estudo.  
**Material bruto:** não versionado neste repositório público.

## Objetivo deste registro

Preservar os conceitos extraídos da Aula 1, compará-los com o MCF e registrar derivações de produto sem confundir aprendizado externo com arquitetura oficial.

## Conceitos `SOURCE_DERIVED`

### 1. Três níveis de maturidade

A aula descreve uma progressão aproximada:

```text
pedido estruturado
      ↓
agente reutilizável
      ↓
processo automatizado com ferramentas
```

A ideia central é sair do uso ocasional de um chat para uma configuração persistente e, depois, para execução conectada a ferramentas.

### 2. Quatro pilares

O modelo pedagógico apresentado é:

```text
PAPEL    — quem o agente é
CONTEXTO — o que sabe, recebe e para quem trabalha
REGRAS   — o que deve verificar, fazer e nunca fazer
FORMATO  — como o resultado deve ser entregue
```

### 3. Critério para decidir se vale automatizar

A aula propõe três sinais principais:

```text
é repetitivo?
é padronizável?
é verificável?
```

Se uma resposta for negativa, a recomendação é melhorar o processo antes de transformá-lo em agente/automação.

### 4. Separação entre instruções e conhecimento

A aula diferencia instruções persistentes do agente e arquivos/base consultada para responder ou executar uma tarefa.

### 5. Builder por entrevista

É demonstrado um construtor que pergunta sobre negócio, serviços, preços, políticas, tom e restrições para produzir uma configuração mais completa do agente.

### 6. Valor orientado ao entregável

A aula enfatiza que uma resposta correta em formato inadequado ainda gera retrabalho. Os exemplos incluem dashboards, HTML, tabelas e relatórios.

## Comparação resumida com `MCF_CURRENT`

O MCF já vai além da configuração por prompt ao possuir runtime persistente, seleção por competência, skills executáveis, permissões, evidências, handoffs, recuperação e gates.

A principal diferença observada é:

```text
Aula 1:
como tornar uma capacidade de IA reutilizável e útil.

MCF:
como coordenar capacidades/agentes de forma governada e verificável.
```

## Derivações `HYPOTHESIS`

### HYP-001 — Agentification Gate

Expandir o teste repetitivo/padronizável/verificável para uma avaliação de automação com risco, autoridade, fontes e verificabilidade.

### HYP-002 — MCF Builder

Transformar a entrevista de criação de prompt em um compilador de intenção humana para contratos, skills, permissões, critérios de aceite e fluxo do MCF.

### HYP-003 — Virtual Professionals

Usar profissão/equipe como abstração de produto acima de agentes internos, permitindo ao usuário administrar profissionais e resultados enquanto o MCF administra a infraestrutura agentic.

### HYP-004 — Output Contract

Elevar "formato" de resposta para contrato de entrega com schema, artefato, critério de aceite, evidência e destino.

### HYP-005 — Workspace Isolation

Generalizar a recomendação de separar clientes/contextos para isolamento explícito de conhecimento, estado, autoridade e histórico.

## Questões em aberto antes da Aula 2

- Qual deve ser a unidade principal do produto: profissional, equipe, missão, projeto ou organização?
- O usuário deve contratar profissionais prontos ou descrever um objetivo e receber uma equipe montada dinamicamente?
- Um profissional virtual deve mapear 1:1 para um agente do MCF ou ser uma composição de agentes/skills?
- Como apresentar governança e HUMAN_GATE sem expor complexidade técnica desnecessária?
- Qual é o primeiro problema de mercado que justifica a agência de profissionais virtuais?
- Quanto da criação deve ser automática e quanto deve exigir configuração explícita?

## Regra de continuidade

A Aula 2 deve ser usada depois para **confirmar, enfraquecer ou ampliar** estas hipóteses. Ela não deve retroativamente transformar uma hipótese da Aula 1 em fato.
