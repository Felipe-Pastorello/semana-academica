# Entrevista — Módulo M2: Inscrições e Lista de Espera

## Rodada 1 — Levantamento de Requisitos e Regras de Negócio do M2

❓ **P1 — Inscrição em Atividade (`POST /atividades/:id/inscricoes`)**: Quem pode se inscrever e qual o perfil exigido?
- Opção A: Apenas participantes (`participante`), recusando organização com `403 SOMENTE_PARTICIPANTE`.
- Opção B: Qualquer usuário autenticado (participante ou organização).

➡️ Recomendação: Opção A (apenas participantes podem se inscrever; organização recebe `403 SOMENTE_PARTICIPANTE`).
**Decisão do usuário**: [PENDENTE]

---

❓ **P2 — Situação Inicial da Inscrição (Vagas e Lista de Espera)**: Quando um participante se inscreve em uma atividade com vagas disponíveis, qual o status inicial? E se estiver esgotada?
- Opção A: Havendo vaga, a inscrição nasce `confirmada`; sem vaga, nasce `em_espera`, no fim da fila. Lotação não é erro.
- Opção B: Todas entram em lista de espera primeiro.

➡️ Recomendação: Opção A (Havendo vaga, a inscrição nasce `confirmada`; sem vaga, nasce `em_espera`, no fim da fila. Lotação não é erro).
**Decisão do usuário**: Havendo vaga, a inscrição nasce `confirmada`; sem vaga, nasce `em_espera`, no fim da fila. Lotação não é erro (RN-205).

---

❓ **P3 — Validações de Inscrição (Erros e Impedimentos)**: Quais códigos de erro devem ser retornados na tentativa de inscrição (`POST /atividades/:id/inscricoes`)?
- Opção A: `ATIVIDADE_CANCELADA`, `INSCRICOES_ENCERRADAS`, `JA_INSCRITO`, `CONFLITO_DE_HORARIO`, `LIMITE_DE_MINICURSOS`.
- Opção B: Apenas `JA_INSCRITO` e `VAGAS_ ESGOTADAS`.

➡️ Recomendação: Opção A (todos os códigos previstos no contrato: cancelada, encerradas, já inscrito, conflito de horário, limite de minicursos, etc.).
**Decisão do usuário**: Opção A.

---

❓ **P4 — Regra de Conflito de Horário (`CONFLITO_DE_HORARIO`)**: O que constitui um conflito de horário para inscrições de um participante?
- Opção A: Ao ocupar vaga, o participante não pode ter outra inscrição que ocupe vaga com encontro sobreposto. Encostar não é conflito. Quem só entra na espera não é verificado.
- Opção B: Atividades no mesmo dia civil.

➡️ Recomendação: Opção A (Ao ocupar vaga, o participante não pode ter outra inscrição que ocupe vaga com encontro sobreposto. Encostar não é conflito. Quem só entra na espera não é verificado).
**Decisão do usuário**: Ao ocupar vaga, o participante não pode ter outra inscrição que ocupe vaga com encontro sobreposto. Encostar não é conflito. Quem só entra na espera não é verificado (RN-206).

---

❓ **P5 — Limite de Minicursos (`LIMITE_DE_MINICURSOS`)**: Existe restrição sobre a quantidade de minicursos em que um participante pode se inscrever ou participar?
- Opção A: Ao ocupar vaga, o participante pode ter no máximo 3 minicursos ocupando vaga. Palestra não conta; espera não conta.
- Opção B: Não há limite de minicursos.

➡️ Recomendação: Opção A (No máximo 3 minicursos ocupando vaga).
**Decisão do usuário**: Ao ocupar vaga, o participante pode ter no máximo 3 minicursos ocupando vaga. Palestra não conta; espera não conta (RN-207).

---

❓ **P6 — Cancelamento de Inscrição (`POST /inscricoes/:id/cancelamento`)**: Quais as regras e prazos para um participante cancelar a sua inscrição?
- Opção A: O participante cancela a própria inscrição até a atividade começar (`422 ATIVIDADE_JA_INICIADA`). Inscrição já cancelada ou expirada não é cancelada de novo (`422 INSCRICAO_INATIVA`).
- Opção B: Pode cancelar mesmo após o início da atividade.

➡️ Recomendação: Opção A (O participante cancela a própria inscrição até a atividade começar; inscrição já cancelada ou expirada retorna 422 INSCRICAO_INATIVA).
**Decisão do usuário**: O participante cancela a própria inscrição até a atividade começar (`422 ATIVIDADE_JA_INICIADA`). Inscrição já cancelada ou expirada não é cancelada de novo (`422 INSCRICAO_INATIVA`) (RN-209, RN-210).

---

❓ **P7 — Promoção Automática da Lista de Espera**: Quando uma inscrição confirmada é cancelada, o que acontece com o primeiro participante da lista de espera?
- Opção A: O prazo da convocação nunca passa do fechamento das inscrições; vaga liberada depois do fechamento não convoca ninguém.
- Opção B: Promovido diretamente sem prazo.

➡️ Recomendação: Opção A (O prazo da convocação nunca passa do fechamento das inscrições).
**Decisão do usuário**: O prazo da convocação nunca passa do fechamento das inscrições; vaga liberada depois do fechamento não convoca ninguém (RN-212).

---

❓ **P8 — Confirmação de Convocação (`POST /inscricoes/:id/confirmacao`)**: Como funciona a confirmação da convocação pelo participante?
- Opção A: A confirmação dentro do prazo refaz RN-206 e RN-207; se recusar, a convocação continua valendo até o prazo.
- Opção B: Confirmação sem validações.

➡️ Recomendação: Opção A (A confirmação dentro do prazo refaz RN-206 e RN-207; se recusar/falhar, a convocação continua valendo até o prazo).
**Decisão do usuário**: A confirmação dentro do prazo refaz RN-206 e RN-207; se recusar, a convocação continua valendo até o prazo (RN-214).
