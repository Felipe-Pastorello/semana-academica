# TDD fatia 1 specs/M1-inscricoes.md

| | |
|---|---|
| Sessão | `ses_f5d761bd8fferrIkzjSJ5ylXwH` |
| Pasta | Desktop/Atividade-Final-Gustavo |
| Período | 14/09 21:49 → 14/09 22:20 |
| Modelo | google/gemini-3.6-flash |
| Requisições ao modelo | 22 |
| Tokens de entrada / saída | 215.321 / 9.247 |
| Skills | tdd |
| Subagentes | — |
| Execuções de teste | 6 vermelhas, 3 verdes |
| TDD | 2 ciclo(s) vermelho → verde · 0 teste(s) que já nasceram verdes · 0 vez(es) teste e código juntos |
| Arquivos editados | 2 de teste, 4 de código, 0 de entrevista, 0 de spec, 0 de contexto, 0 de auditoria |
| Alertas | — |

## Linha do tempo

- `14/09 21:49` **prompt** — Use a skill tdd. Implemente só a fatia 1 de specs/M1-inscricoes.md. Um teste por vez: escreva o teste, mostre ele falhando, e só então o código. A cada fatia, leiam os nomes dos testes contra as regras da spec. Commit, /new, próxima fatia.
- `14/09 21:49` carrega a skill **tdd**
- `14/09 21:49` roda `npm test` → **vermelho**
- `14/09 21:50` roda `node --test verificacoes/fatia1.spec.js` → **vermelho** (0 passaram, 1 falharam)
- `14/09 21:50` roda `node --test "verificacoes/*.spec.js"` → **vermelho**
- `14/09 21:50` edita código `semana-academica/api/package.json`
- `14/09 21:50` roda `npm test` → **vermelho** (0 passaram, 1 falharam)
- `14/09 21:50` edita código `semana-academica/api/src/servidor.js`
- `14/09 21:50` roda `npm test` → verde (1 passaram)
- `14/09 21:51` edita teste `semana-academica/api/verificacoes/fatia1.spec.js`
- `14/09 21:51` roda `npm test` → **vermelho** (1 passaram, 1 falharam) — _teste novo falhando, como deve ser_
- `14/09 21:51` edita código `semana-academica/api/src/servidor.js`
- `14/09 21:51` roda `npm test` → verde (2 passaram) — _fecha um ciclo vermelho → verde_
- `14/09 21:51` edita teste `semana-academica/api/verificacoes/fatia1.spec.js`
- `14/09 21:51` roda `npm test` → **vermelho** (2 passaram, 1 falharam) — _teste novo falhando, como deve ser_
- `14/09 22:20` **prompt** — Continue
- `14/09 22:20` edita código `semana-academica/api/src/servidor.js`
- `14/09 22:20` roda `npm test` → verde (3 passaram) — _fecha um ciclo vermelho → verde_
