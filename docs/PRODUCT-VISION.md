# Product Vision — MCF

**Status:** `DRAFT / UNDER_STUDY`  
**Natureza:** visão de produto em descoberta; não altera o estado canônico do MCF.

## Hipótese central

O MCF pode evoluir de um framework de coordenação multiagente para a infraestrutura de uma **agência de profissionais virtuais**.

A proposta de abstração é simples:

```text
O usuário administra:
- profissionais;
- equipes;
- projetos;
- objetivos;
- entregas.

O MCF administra:
- agentes;
- skills;
- handoffs;
- contexto;
- ferramentas;
- permissões;
- evidências;
- recuperação de falhas;
- runtime.
```

## Produto por cima, infraestrutura por baixo

```text
┌─────────────────────────────────────┐
│ Agência de Profissionais Virtuais   │
│ profissionais • equipes • projetos  │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│ Product Layer                       │
│ onboarding • builder • templates    │
│ workspaces • entregas • controle    │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│ MCF Core                            │
│ missão • agentes • skills • gates   │
│ evidence • CAF • permissions        │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│ Modelos e ferramentas externas      │
└─────────────────────────────────────┘
```

## Distinção crítica: agente interno vs profissional virtual

Um **agente interno do MCF** é uma unidade de coordenação/competência da infraestrutura.

Um **profissional virtual** é uma abstração de produto orientada ao usuário e pode ser implementada por um ou mais agentes, skills, ferramentas e políticas do MCF.

Exemplo:

```text
"Desenvolvedor Virtual"
        │
        ├── arquitetura
        ├── implementação
        ├── revisão
        └── testes

Por baixo, o MCF pode acionar múltiplas competências e agentes.
```

## Princípio de UX

O usuário não deveria precisar conhecer a terminologia interna do MCF para obter valor.

Em vez de configurar diretamente runtime, handoffs ou evidence validators, ele deveria conseguir expressar algo como:

> "Quero uma equipe para lançar meu SaaS."

O produto traduziria essa intenção em contratos, competências, skills, permissões, critérios de aceite e fluxo de execução.

## Hipóteses derivadas até agora

1. **MCF Builder** — entrevista o usuário e compila intenção em estruturas governadas do MCF.
2. **Agentification Gate** — avalia se uma atividade deve realmente ser automatizada.
3. **Virtual Professionals** — profissionais como abstração superior a agentes técnicos.
4. **Templates/Teams** — equipes prontas por problema ou profissão.
5. **Output Contracts** — entregáveis formalizados, não apenas respostas textuais.
6. **Workspace Isolation** — isolamento explícito por cliente, empresa, projeto ou contexto.

## Não decidido

- modelo comercial;
- público-alvo inicial;
- catálogo inicial de profissionais;
- interface principal;
- modelo multi-tenant;
- relação entre Mission Control e a camada de produto;
- quais capacidades serão core e quais serão integrações;
- arquitetura de implementação.

Esses pontos permanecem em discovery e não devem ser tratados como requisitos aprovados.
