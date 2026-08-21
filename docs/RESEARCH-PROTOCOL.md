# Research Protocol

**Status:** `ACTIVE`

Este protocolo define como conhecimento externo deve entrar no MCF Product Lab sem ser confundido com verdade implementada do MCF.

## Pipeline

```text
SOURCE
  ↓
EXTRACT
  ↓
COMPARE
  ↓
ABSTRACT
  ↓
HYPOTHESIZE
  ↓
VALIDATE
  ↓
DECIDE
  ↓
PROPOSE
```

## 1. SOURCE

Registrar a origem: curso, vídeo, artigo, produto, benchmark ou experimento.

Para material de terceiros, preferir referência, URL, timestamps e síntese própria. Não armazenar transcrição integral em repositório público.

## 2. EXTRACT

Separar o que a fonte efetivamente ensina do que inferimos a partir dela.

Cada estudo deve distinguir:

- `SOURCE_DERIVED` — afirmado ou demonstrado pela fonte;
- `MCF_CURRENT` — já comprovado no MCF oficial;
- `INFERENCE` — interpretação nossa;
- `HYPOTHESIS` — ideia candidata de produto/arquitetura;
- `DECISION` — somente após decisão explícita.

## 3. COMPARE

Perguntas mínimas:

1. O que está sendo ensinado?
2. O MCF já resolve isso?
3. Se resolve, em que nível?
4. A fonte faz algo melhor em UX, produto, linguagem ou processo?
5. Há alguma lacuna real no MCF?

## 4. ABSTRACT

Não copiar solução superficialmente. Identificar o princípio por trás dela.

Exemplo:

```text
Fonte: construtor de agentes gera prompt por entrevista.

Abstração:
intenção humana pode ser compilada para uma especificação estruturada.

Hipótese MCF:
entrevista → mission contract + agent/skill selection + permissions + acceptance criteria.
```

## 5. HYPOTHESIZE

Toda hipótese deve registrar:

- problema observado;
- origem;
- proposta;
- valor esperado;
- relação com MCF atual;
- riscos;
- forma de validar;
- status.

## 6. VALIDATE

Validação pode incluir:

- nova fonte;
- comparação com mercado;
- protótipo;
- experimento;
- entrevista com usuário;
- análise técnica;
- teste no MCF.

## 7. DECIDE

Estados recomendados:

```text
PROPOSED
UNDER_STUDY
VALIDATED
ACCEPTED
REJECTED
DEFERRED
SUPERSEDED
```

Uma ideia aceita no Product Lab ainda não é automaticamente implementação autorizada no repositório oficial do MCF.

## 8. PROPOSE

Somente ideias maduras devem ser promovidas para proposta formal no MCF oficial, respeitando a governança vigente daquele repositório.

## Regra de fonte de verdade

O Product Lab preserva descoberta de produto. Ele não substitui `leon337/multiagent-collaboration-framework` como fonte de verdade técnica, operacional ou de governança do MCF.
