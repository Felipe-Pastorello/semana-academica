# Sessões — Felipe P Rocha

Cada execução de teste é lida pelo que mudou desde a anterior:

- **Ciclo** — vermelho logo depois de mexer só em teste, e depois verde logo depois de mexer só em código. É o TDD.
- **Nasceu verde** — verde logo depois de mexer só em teste. Ou o comportamento já existia, ou o teste não testa o que diz.
- **Juntos** — teste e código mudaram antes da mesma execução. Não houve vermelho para ver.

**Alertas:** *colou* = prompt com 10 palavras seguidas ou mais iguais às do documento de requisitos (só aparece quando o resumo é gerado com `--requisitos`); *leu* = o agente acessou um arquivo de requisitos; *anexou* = o documento foi anexado à conversa.

Requisições são chamadas ao modelo: cada passo do agente é uma. Skills contam tanto a ferramenta `skill` quanto o comando `/nome`.

| Início | Sessão | Requisições | Skills | Subagentes | Vermelhas / verdes | Ciclos | Nasceu verde | Juntos | Alertas |
|---|---|---|---|---|---|---|---|---|---|
| 12/08 19:32 | [New session - 2026-08-12T22:32:48.529Z](ses_007e4ab6fffeEFwPa9rc2uCtD7.md) | 6 | — | — | 0 / 0 | 0 | 0 | 0 | — |
| 10/09 21:00 | [Implementação Módulo 1 em M1-inscricoes.md](ses_f723b8351ffe1o5THkjRd30Eeb.md) | 13 | — | — | 0 / 0 | 0 | 0 | 0 | — |
| 10/09 21:41 | [Especificação M1-inscricoes.md via skill-to-spec](ses_f7216000dffeYMP1siAOcSazCa.md) | 4 | — | — | 0 / 0 | 0 | 0 | 0 | — |
| 13/09 19:29 | [specs/M1-inscricoes.md via skill-to-spec](ses_f631c1be3ffePkNjQDN7A62rcI.md) | 11 | — | — | 0 / 0 | 0 | 0 | 0 | — |
| 13/09 20:16 | [TDD na fatia 1 de specs/M1-inscricoes.md](ses_f62f0e18cffeV8zxcK4JKNC0gd.md) | 12 | — | — | 0 / 0 | 0 | 0 | 0 | — |
| 14/09 21:49 | [TDD fatia 1 specs/M1-inscricoes.md](ses_f5d761bd8fferrIkzjSJ5ylXwH.md) | 22 | tdd | — | 6 / 3 | 2 | 0 | 0 | — |
| 14/09 22:58 | [TDD na fatia 1 de specs/M1-inscricoes.md](ses_f5d362f98ffe1G9U32DMWIHKUs.md) | 16 | tdd | — | 0 / 1 | 0 | 0 | 0 | — |
| 15/09 20:36 | [Auditoria do módulo M1](ses_f58922cd3ffeUVHwPXMA8zr31t.md) | 27 | customize-opencode, frontend | — | 0 / 1 | 0 | 0 | 0 | — |
| | **Total: 8 sessões** | 111 | tdd (2), customize-opencode, frontend | — | 6 / 5 | 2 | 0 | 0 | — |
