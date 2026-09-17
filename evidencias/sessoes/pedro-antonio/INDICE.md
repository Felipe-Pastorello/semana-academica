# Sessões — Pedro Antonio

Cada execução de teste é lida pelo que mudou desde a anterior:

- **Ciclo** — vermelho logo depois de mexer só em teste, e depois verde logo depois de mexer só em código. É o TDD.
- **Nasceu verde** — verde logo depois de mexer só em teste. Ou o comportamento já existia, ou o teste não testa o que diz.
- **Juntos** — teste e código mudaram antes da mesma execução. Não houve vermelho para ver.

**Alertas:** *colou* = prompt com 10 palavras seguidas ou mais iguais às do documento de requisitos (só aparece quando o resumo é gerado com `--requisitos`); *leu* = o agente acessou um arquivo de requisitos; *anexou* = o documento foi anexado à conversa.

Requisições são chamadas ao modelo: cada passo do agente é uma. Skills contam tanto a ferramenta `skill` quanto o comando `/nome`.

| Início | Sessão | Requisições | Skills | Subagentes | Vermelhas / verdes | Ciclos | Nasceu verde | Juntos | Alertas |
|---|---|---|---|---|---|---|---|---|---|
| 16/09 21:39 | [Implementação módulo 02 com grilling skill](ses_f53321ad8ffeMa36zQ8EnROG6x.md) | 11 | grilling | — | 0 / 0 | 0 | 0 | 0 | — |
| 16/09 21:59 | [Criação de specs/M2-inscricoes.md via skill-to-spec](ses_f53202898ffeZErmJn6oWDiwG0.md) | 4 | to-spec | — | 0 / 0 | 0 | 0 | 0 | — |
| 16/09 22:10 | [TDD da fatia 1 de specs/M2-inscricoes.md](ses_f5316186effeLv9xOZcPDE7w0x.md) | 29 | tdd | — | 2 / 4 | 2 | 1 | 0 | — |
| 16/09 22:14 | [TDD para fatia 2 de M2-inscricoes.md](ses_f5311a84affeZVh7pCGB7RBuzF.md) | 22 | tdd | — | 3 / 5 | 2 | 0 | 0 | — |
| 16/09 22:20 | [New session - 2026-09-17T01:20:32.379Z](ses_f530c8785ffemFBr6UOg2ugtOD.md) | 22 | tdd | auditor | 1 / 6 | 0 | 3 | 0 | — |
| 16/09 22:33 | [Skill frontend de inscrições e convocações](ses_f5300d684ffeTQdXvndTrIs3Wc.md) | 11 | customize-opencode, frontend, tdd | — | 0 / 0 | 0 | 0 | 0 | — |
| 16/09 22:40 | [Criação de telas do módulo m2](ses_f52fab5dcfferN1S4iG0kiHuVI.md) | 21 | frontend | — | 0 / 0 | 0 | 0 | 0 | — |
| 16/09 23:00 | [New session - 2026-09-17T02:00:44.243Z](ses_f52e7ba2fffeyGJn5zSopVcV5l.md) | 3 | novo-subagente | — | 0 / 0 | 0 | 0 | 0 | — |
| | **Total: 8 sessões** | 123 | grilling, to-spec, tdd (4), customize-opencode, frontend (2), novo-subagente | auditor | 6 / 15 | 4 | 4 | 0 | — |
