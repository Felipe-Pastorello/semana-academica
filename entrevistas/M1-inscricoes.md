# Entrevista — Módulo M1: Grade de Atividades

## Rodada 1 — Levantamento de Requisitos e Regras de Negócio do M1

❓ **P1 — Limite de Encontros por Tipo**: Para `POST /atividades`, qual a regra exata da quantidade de encontros para cada tipo de atividade?
- Opção A: Palestra deve ter exatamente 1 encontro; Minicurso deve ter no mínimo 2 encontros.
- Opção B: Palestra deve ter de 1 a 2 encontros; Minicurso deve ter de 1 a 5 encontros.
- Opção C: Palestra 1 encontro; Minicurso 1 ou mais encontros.

➡️ Recomendação: Opção A (Palestra = exatamente 1 encontro; Minicurso = no mínimo 2 encontros).
**Decisão do usuário**: Opção A (Palestra: 1 encontro; Minicurso: >= 2 encontros).

---

❓ **P2 — Validação de Encontros (`ENCONTRO_INVALIDO`)**: O que torna um elemento de `encontros` inválido ao criar/editar uma atividade?
- Opção A: `inicio` >= `fim`, data fora do período do evento (19/10/2026 a 23/10/2026 em fuso -03:00), ou encontros de minicurso fora da ordem cronológica.
- Opção B: Apenas se `inicio` >= `fim`.
- Opção C: Se a duração do encontro for menor que 30 minutos ou maior que 4 horas.

➡️ Recomendação: Opção A (`inicio` >= `fim`, fora do período de 19 a 23/10/2026, ou fora de ordem cronológica gera 422 `ENCONTRO_INVALIDO`).
**Decisão do usuário**: O encontro é inválido se for realizado das 23:00 às 00:30 (além de `inicio` >= `fim` e fora das datas do evento).

---

❓ **P3 — Vagas vs Capacidade da Sala (`VAGAS_ACIMA_DA_CAPACIDADE`)**: Como é validada a quantidade de vagas?
- Opção A: `vagas` deve ser inteiro estritamente positivo (> 0) e `vagas` <= `capacidade` da sala informada (`salaId`).
- Opção B: `vagas` pode exceder a capacidade em até 10%.

➡️ Recomendação: Opção A (`vagas` > 0 e `vagas` <= `capacidade` da sala; do contrário 422 `VAGAS_ACIMA_DA_CAPACIDADE`).
**Decisão do usuário**: Opção A (`vagas` > 0 e `vagas` <= `capacidade`).

---

❓ **P4 — Sobreposição / Conflito de Sala (`CONFLITO_DE_SALA`)**: Quando ocorre `409 CONFLITO_DE_SALA`?
- Opção A: Quando houver qualquer sobreposição de intervalo de horário entre um encontro da nova atividade e qualquer encontro de atividade já existente (não cancelada) na mesma sala.
- Opção B: Apenas se os encontros começarem no mesmo minuto exato.

➡️ Recomendação: Opção A (sobreposição parcial ou total de horários na mesma salaId gera 409 `CONFLITO_DE_SALA`).
**Decisão do usuário**: Na mesma sala, entre o fim de um encontro e o início do seguinte há no mínimo 15 min de intervalo.

---

❓ **P5 — Edição de Campos em `PATCH /atividades/:id` (`CAMPO_NAO_EDITAVEL`)**: Quais campos NÃO podem ser alterados após a criação da atividade?
- Opção A: `id`, `tipo`, `salaId` e `encontros` são imutáveis; apenas `titulo` e `vagas` podem ser alterados via PATCH.
- Opção B: Apenas o `id` é imutável, todos os outros campos podem ser editados.
- Opção C: `id` e `tipo` são imutáveis; `salaId` e `encontros` podem mudar se não houver inscritos.

➡️ Recomendação: Opção A (`id`, `tipo`, `salaId` e `encontros` são não editáveis; tentar alterá-los gera 422 `CAMPO_NAO_EDITAVEL`).
**Decisão do usuário**: Opção A (`id`, `tipo`, `salaId`, `encontros` são imutáveis).

---

❓ **P6 — Redução de Vagas em Atividade Com Inscritos (`VAGAS_ABAIXO_DOS_INSCRITOS`)**: Qual a regra ao alterar `vagas` em um PATCH?
- Opção A: O novo valor de `vagas` não pode ser menor que a quantidade atual de vagas ocupadas (`ocupadas`). Se for menor, retorna 409 `VAGAS_ABAIXO_DOS_INSCRITOS`.
- Opção B: Não é permitido alterar o número de vagas se houver qualquer inscrito.

➡️ Recomendação: Opção A (não permite reduzir `vagas` para um número menor que `ocupadas`).
**Decisão do usuário**: Opção A (`vagas` >= `ocupadas`).

---

❓ **P7 — Regras para Cancelamento de Atividade (`ATIVIDADE_JA_INICIADA` e `ATIVIDADE_CANCELADA`)**: Quais as restrições ao chamar `POST /atividades/:id/cancelamento`?
- Opção A: Recusar com 422 `ATIVIDADE_JA_INICIADA` se a hora atual (`agora` do relógio) for >= `inicio` do primeiro encontro; e recusar com 422 `ATIVIDADE_CANCELADA` se a atividade já estiver cancelada.
- Opção B: Permitir cancelamento até o fim do último encontro.

➡️ Recomendação: Opção A (se `agora` >= `inicio` do 1º encontro -> 422 `ATIVIDADE_JA_INICIADA`; se já cancelada -> 422 `ATIVIDADE_CANCELADA`).
**Decisão do usuário**: Opção A (se `agora` >= 1º inicio -> `ATIVIDADE_JA_INICIADA`; se já cancelada -> `ATIVIDADE_CANCELADA`).

---

❓ **P8 — Edição em Atividade Cancelada (`ATIVIDADE_CANCELADA`)**: O que acontece ao tentar `PATCH /atividades/:id` em uma atividade que já foi cancelada?
- Opção A: Retorna 422 `ATIVIDADE_CANCELADA`.
- Opção B: Retorna 400 `DADOS_INVALIDOS`.

➡️ Recomendação: Opção A (retorna 422 `ATIVIDADE_CANCELADA`).
**Decisão do usuário**: Opção A (`422 ATIVIDADE_CANCELADA`).

---

❓ **P9 — Regra de Cálculo da Situação da Atividade (`situacao`)**: Como é determinada a propriedade `situacao` da atividade?
- Opção A: 
  - `"cancelada"`: se foi cancelada por `POST /atividades/:id/cancelamento`.
  - `"prevista"`: se não foi cancelada e `agora` < `inicio` do primeiro encontro.
  - `"em_andamento"`: se não foi cancelada, `agora` >= `inicio` do primeiro encontro e `agora` <= `fim` do último encontro.
  - `"encerrada"`: se não foi cancelada e `agora` > `fim` do último encontro.
- Opção B: `"em_andamento"` apenas durante os minutos exatos dos encontros, `"prevista"` nos intervalos entre encontros de um minicurso.

➡️ Recomendação: Opção A (`situacao` baseada no primeiro início e último fim em relação ao relógio `agora`).
**Decisão do usuário**: Opção A (`situacao` calculada baseada em `agora`).

---

❓ **P10 — Ordem de Precedência de Erros**: Em `POST /atividades` e `PATCH /atividades/:id`, quando requisições apresentarem múltiplos problemas, qual é a ordem de verificação?
- Opção A: Identificação (`401 USUARIO_DESCONHECIDO`) → Perfil (`403 SOMENTE_ORGANIZACAO`) → Existência (`404 NAO_ENCONTRADO` no PATCH) → Corpo/JSON (`422 DADOS_INVALIDOS`) → `ATIVIDADE_CANCELADA` (PATCH) → `CAMPO_NAO_EDITAVEL` (PATCH) → `QUANTIDADE_DE_ENCONTROS` (POST) → `ENCONTRO_INVALIDO` (POST) → `VAGAS_ACIMA_DA_CAPACIDADE` (POST/PATCH) → `VAGAS_ABAIXO_DOS_INSCRITOS` (PATCH) → `CONFLITO_DE_SALA` (POST).
- Opção B: Checar conflito de sala antes das validações de encontro.

➡️ Recomendação: Opção A (ordem estrita seguindo a especificação do contrato).
**Decisão do usuário**: Opção A (ordem estrita).
