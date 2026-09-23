# NexoGraph

Aplicação web para equipes organizarem projetos, tarefas, dependências e decisões em um grafo interativo.

**Produção verificada:** https://nexograph-teamgraph.vercel.app

## Fluxo principal

1. Crie um projeto.
2. Crie duas ou mais tarefas no projeto.
3. Crie uma dependência escolhendo pré-requisito e tarefa dependente.
4. Tente concluir a dependente: o sistema bloqueia enquanto o pré-requisito estiver aberto.
5. Conclua o pré-requisito e depois a tarefa dependente.
6. Quando todas as tarefas estiverem concluídas, o projeto é concluído automaticamente e tudo aparece no histórico.

## Recursos

- múltiplos workspaces;
- papéis `owner`, `editor` e `viewer`;
- grafo interativo com drag, pan e zoom;
- projetos, tarefas, dependências e decisões;
- prevenção de ciclos de dependência;
- bloqueio de conclusão por pré-requisitos;
- histórico de alterações;
- busca e filtros por tipo/status/responsável;
- visão de cronograma;
- exportação JSON e CSV;
- persistência IndexedDB com fallback localStorage;
- layout responsivo.

## Executar

Requer Node.js 22+ somente para ferramentas locais.

```bash
npm run check
npm run serve
```

Acesse `http://localhost:4173`.

## Estrutura

```text
src/
  index.html
  styles.css
  app.mjs
  domain.mjs
  storage.mjs
tests/
  domain.test.mjs
docs/
  architecture.md
  STATUS.md
scripts/
  build.mjs
  lint.mjs
```

## Persistência e segurança

O MVP não envia dados para terceiros. Os dados ficam no IndexedDB do navegador (ou localStorage como fallback). Papéis são regras da aplicação, não identidades autenticadas; portanto a versão atual é indicada para uso individual/mesmo dispositivo ou demonstração de fluxo de equipe. Para colaboração remota real, consulte a evolução proposta em `docs/architecture.md`.
