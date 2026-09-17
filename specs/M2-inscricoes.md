# Spec — Inscrições e Lista de Espera

## 1. Objetivo
Gerenciar a inscrição de participantes em atividades acadêmicas (palestras e minicursos), controlando vagas, filas de espera, conflitos de horário, limites de minicursos e o fluxo de cancelamento e convocação automática.

## 2. Fora de escopo
- Gestão de criacão e alteração de dados das atividades (módulo de atividades).
- Pagamento de taxas de inscrição (o evento é gratuito ou fora do escopo deste módulo).
- Presença e check-in (módulo de presença).

## 3. Modelo
- **Inscrição**:
  - `id`: identificador único (gerado pelo sistema, UUID ou serial)
  - `atividadeId`: ID da atividade vinculada (string/int)
  - `participanteId`: ID do usuário participante inscrito (string/int)
  - `status`: situação atual (`confirmada`, `em_espera`, `cancelada`, `expirada`)
  - `criadoEm`: data e hora da criação (calculado)

## 4. Endpoints
- `POST /atividades/:id/inscricoes` — Realiza a inscrição em uma atividade.
- `POST /inscricoes/:id/cancelamento` — Cancela uma inscrição existente.
- `POST /inscricoes/:id/confirmacao` — Confirma uma convocação da lista de espera.

## 5. Regras

- **R1 — Perfil Exigido**: Apenas usuários com perfil `participante` podem se inscrever. Organização recebe `403 SOMENTE_PARTICIPANTE`.
- **R2 — Situação Inicial e Vagas**: Havendo vaga disponível, a nova inscrição nasce `confirmada`. Sem vagas, nasce `em_espera` no fim da fila. Lotação não é erro.
- **R3 — Impedimentos de Inscrição**: A tentativa de inscrição deve recusar com os respectivos códigos se houver impedimento:
  - Atividade cancelada: `422 ATIVIDADE_CANCELADA`
  - Inscrições encerradas: `422 INSCRICOES_ENCERRADAS`
  - Já inscrito (ativa ou em espera): `422 JA_INSCRITO`
- **R4 — Conflito de Horário**: O participante não pode ocupar vaga em uma atividade se já possuir outra inscrição confirmada com encontro sobreposto (encostar horários não gera conflito). Apenas inscrições que ocupam vaga são verificadas (`406 CONFLITO_DE_HORARIO` ou `422`).
- **R5 — Limite de Minicursos**: O participante pode ter no máximo 3 minicursos ocupando vaga simultaneamente. Palestras e inscrições em espera não contam para este limite (`422 LIMITE_DE_MINICURSOS`).
- **R6 — Cancelamento de Inscrição**: O participante pode cancelar a própria inscrição até o início da atividade (`422 ATIVIDADE_JA_INICIADA`). Inscrição já cancelada ou expirada não pode ser cancelada novamente (`422 INSCRICAO_INATIVA`).
- **R7 — Convocação da Lista de Espera**: Quando uma vaga é liberada por cancelamento, o primeiro da lista de espera é convocado, desde que o prazo da convocação não ultrapasse o fechamento das inscrições da atividade.

## 6. Critérios de aceite

1. (R1) `POST /atividades/:id/inscricoes` por um usuário organização → `403 SOMENTE_PARTICIPANTE`.
2. (R2) `POST /atividades/:id/inscricoes` com vagas disponíveis → `201 Created` e status `confirmada`.
3. (R2) `POST /atividades/:id/inscricoes` com vagas esgotadas → `201 Created` e status `em_espera`.
4. (R3) `POST /atividades/:id/inscricoes` com atividade cancelada → `422 ATIVIDADE_CANCELADA`.
5. (R3) `POST /atividades/:id/inscricoes` após o encerramento → `422 INSCRICOES_ENCERRADAS`.
6. (R3) `POST /atividades/:id/inscricoes` já estando inscrito → `422 JA_INSCRITO`.
7. (R4) `POST /atividades/:id/inscricoes` com sobreposição de horário em vaga existente → `422 CONFLITO_DE_HORARIO`.
8. (R5) `POST /atividades/:id/inscricoes` ultrapassando o limite de 3 minicursos confirmados → `422 LIMITE_DE_MINICURSOS`.
9. (R6) `POST /inscricoes/:id/cancelamento` antes do início da atividade → `200 OK` (ou `204 No Content`) com status atualizado para `cancelada`.
10. (R6) `POST /inscricoes/:id/cancelamento` com atividade já iniciada → `422 ATIVIDADE_JA_INICIADA`.
11. (R6) `POST /inscricoes/:id/cancelamento` de inscrição já inativa → `422 INSCRICAO_INATIVA`.

## 7. Como isto será verificado
Testes automatizados integrados na camada HTTP (supertest / vitest / jest testando o servidor express ou equivalente do projeto).

## 8. Fatias de entrega
- **Fatia 1**: Endpoint base de inscrição (`POST /atividades/:id/inscricoes`), validação de perfil (`R1`), verificação de vagas e status inicial (`R2`), além de validações básicas (`R3`).
- **Fatia 2**: Regras avançadas de validação de vaga (`R4` Conflito de Horário e `R5` Limite de Minicursos).
- **Fatia 3**: Cancelamento de inscrições (`R6`) e gerenciamento da lista de espera / convocação automática (`R7`).
