# STATUS — NexoGraph

Atualizado em: 2026-09-23
Estado: `DELIVERED_VERIFIED`

## Objetivo

Entregar uma aplicação web para equipes organizarem projetos, tarefas, dependências e decisões em um grafo interativo, com fluxo real de projeto → tarefa → dependência → conclusão.

## Revisão

- Repositório: `leon337/mcf-product-lab`
- Branch: `feat/nexograph-teamgraph-20260923`
- Commit de configuração/deploy previamente verificado: `8c1211634e1c0a76b5aa206f00af1fb79a419255`
- Aplicação: `experiments/nexograph/`

## Decisões

- Web estática modular em JavaScript ES Modules, HTML e CSS.
- Persistência local transacional via IndexedDB, com fallback localStorage.
- Sem backend ou serviço pago no MVP; colaboração remota autenticada fica fora deste boundary.
- Vercel usada como destino de publicação autorizado/conectado, no time `PREDIX AI BR`.

## Verificação executada

Comando: `npm run check`

Resultado observado no notebook autorizado:
- lint: PASS;
- testes: 5/5 PASS;
- build: PASS;
- fluxo projeto → tarefas → dependência → conclusão: PASS;
- prevenção de ciclo: PASS;
- restrição de viewer: PASS;
- gestão de papéis: PASS;
- decisão + exportação CSV: PASS.

## Publicação

- Projeto Vercel: `nexograph-teamgraph`
- Project ID: `prj_oLD7zPmBfe1ApL9D1cuonnuiGZLz`
- Deployment ID: `dpl_2Y1UTvAq6sWYkxToTr1dWne36pCa`
- Estado observado: `Ready`
- Produção: `https://nexograph-teamgraph.vercel.app`
- Verificação HTTP: `/`, `/app.mjs` e `/styles.css` responderam 200.

## Limitações conhecidas

- Papéis são regras do workspace local, não autenticação forte de usuários.
- Os dados persistem no navegador/dispositivo; não há sincronização multiusuário remota neste MVP.

## Próxima evolução possível

Adicionar autenticação e persistência compartilhada em PostgreSQL/Supabase, com RLS e colaboração remota, somente após boundary/custo/autorização específicos.
