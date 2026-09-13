# Spec — Grade de Atividades (M1)

## 1. Objetivo
Gerenciar a grade de atividades (palestras e minicursos) da Semana Acadêmica, permitindo o cadastro, alteração, cancelamento, listagem e consulta detalhada de atividades e salas, garantindo o controle rigoroso de horários, locais e capacidade.

## 2. Fora de escopo
- Inscrições e gerenciamento da lista de espera (Módulo M2).
- Leitura de QR code e controle de presença em encontros (Módulo M3).
- Emissão e verificação de certificados e extratos de horas (Módulo M4).
- Painel consolidado da organização, faltas e bloqueios (Módulo M5).
- Cadastro ou alteração de usuários e salas (dados pré-carregados estáticos).

## 3. Modelo

### Atividade
| Campo | Tipo | Origem | Descrição |
|---|---|---|---|
| `id` | String | Gerado | Identificador único (`atv_` + 8 hexadecimais minúsculos) |
| `titulo` | String | Informado | Título da atividade |
| `tipo` | String | Informado | `"palestra"` ou `"minicurso"` |
| `salaId` | String | Informado | ID da sala onde ocorrerá |
| `vagas` | Inteiro | Informado | Número total de vagas oferecidas |
| `encontros` | Array de Encontro | Informado / Gerado | Encontros da atividade com IDs gerados (`enc_` + 8 hexadecimais minúsculos) |
| `cargaHorariaMinutos` | Inteiro | Calculado | Soma da duração de todos os encontros em minutos |
| `situacao` | String | Calculado | `"prevista"`, `"em_andamento"`, `"encerrada"` ou `"cancelada"` |
| `ocupadas` | Inteiro | Calculado | Quantidade de vagas ocupadas (inscrições com status `"confirmada"` ou `"convocada"`) |
| `vagasRestantes` | Inteiro | Calculado | `vagas - ocupadas` (mínimo 0) |
| `emEspera` | Inteiro | Calculado | Quantidade de participantes na lista de espera |

### Encontro
| Campo | Tipo | Origem | Descrição |
|---|---|---|---|
| `id` | String | Gerado | Identificador único (`enc_` + 8 hexadecimais minúsculos) |
| `inicio` | String | Informado | Instante de início (ISO 8601 com fuso) |
| `fim` | String | Informado | Instante de término (ISO 8601 com fuso) |

### Sala
| Campo | Tipo | Origem | Descrição |
|---|---|---|---|
| `id` | String | Estático | Identificador único da sala |
| `nome` | String | Estático | Nome da sala |
| `capacidade` | Inteiro | Estático | Capacidade máxima da sala |

## 4. Endpoints

### GET /salas
- **Quem**: Todos os usuários autenticados.
- **Sucesso**: `200 OK` com array `[Sala]`.

### GET /atividades
- **Quem**: Todos os usuários autenticados.
- **Query Params**: `?dia=AAAA-MM-DD` (opcional), `?tipo=palestra|minicurso` (opcional).
- **Sucesso**: `200 OK` com array `[Atividade]`.

### GET /atividades/:id
- **Quem**: Todos os usuários autenticados.
- **Sucesso**: `200 OK` com `Atividade`.

### POST /atividades
- **Quem**: Organização (`organizacao`).
- **Corpo**: `{"titulo": "...", "tipo": "...", "salaId": "...", "vagas": 20, "encontros": [{"inicio": "...", "fim": "..."}]}`
- **Sucesso**: `201 Created` com `Atividade`.

### PATCH /atividades/:id
- **Quem**: Organização (`organizacao`).
- **Corpo**: Subconjunto dos campos editáveis (`titulo`, `vagas`).
- **Sucesso**: `200 OK` com `Atividade`.

### POST /atividades/:id/cancelamento
- **Quem**: Organização (`organizacao`).
- **Corpo**: Nenhum.
- **Sucesso**: `200 OK` com `Atividade`.

## 5. Regras

- **R1 (Identificação de Usuário)**: Toda requisição (exceto as de teste) exige o cabeçalho `X-Usuario` com ID de usuário válido. Caso ausente ou desconhecido, retorna `401 USUARIO_DESCONHECIDO`.
- **R2 (Perfil da Organização)**: `POST /atividades`, `PATCH /atividades/:id` e `POST /atividades/:id/cancelamento` só podem ser executados por usuários da organização. Se for participante, retorna `403 SOMENTE_ORGANIZACAO`.
- **R3 (Existência da Atividade)**: `GET /atividades/:id`, `PATCH /atividades/:id` e `POST /atividades/:id/cancelamento` retornam `404 NAO_ENCONTRADO` se o `:id` não existir.
- **R4 (Validação do Corpo)**: Corpo que não seja JSON válido, com campos obrigatórios ausentes ou tipos inválidos, retorna `422 DADOS_INVALIDOS`.
- **R5 (Quantidade de Encontros por Tipo)**: Em `POST /atividades`, palestra deve ter exatamente 1 encontro, e minicurso deve ter de 2 a 5 encontros (`2 <= encontros <= 5`). Se descumprido, retorna `422 QUANTIDADE_DE_ENCONTROS`.
- **R6 (Validação de Encontros)**: Em `POST /atividades`, cada encontro deve ter `inicio < fim`, duração mínima de 1h (60 min) e máxima de 4h (240 min), começar e terminar no mesmo dia civil (datas entre 19/10/2026 e 23/10/2026 em fuso -03:00), não se sobrepor a outros encontros da mesma atividade, e nenhum encontro pode ocorrer entre 23:00 e 00:30. Se inválido, retorna `422 ENCONTRO_INVALIDO`.
- **R7 (Capacidade da Sala)**: Em `POST /atividades` e `PATCH /atividades/:id`, `vagas` deve ser inteiro estritamente positivo (`vagas > 0`) e menor ou igual à `capacidade` da sala informada. Caso contrário, retorna `422 VAGAS_ACIMA_DA_CAPACIDADE`.
- **R8 (Intervalo Mínimo e Conflito de Sala)**: Em `POST /atividades`, deve haver no mínimo 15 minutos de intervalo entre o fim de um encontro e o início do seguinte na mesma sala (em relação a atividades não canceladas; encontros de atividades canceladas são ignorados). Se houver sobreposição ou intervalo < 15 min, retorna `409 CONFLITO_DE_SALA`.
- **R9 (Imutabilidade de Campos)**: Em `PATCH /atividades/:id`, os campos `id`, `tipo`, `salaId` e `encontros` são imutáveis. Tentar alterá-los retorna `422 CAMPO_NAO_EDITAVEL`.
- **R10 (Limite Mínimo de Vagas em Alteração)**: Em `PATCH /atividades/:id`, o novo valor de `vagas` não pode ser menor do que a quantidade de vagas ocupadas (`ocupadas` = confirmadas + convocadas, ou seja, `vagas >= ocupadas`). Se `vagas < ocupadas`, retorna `409 VAGAS_ABAIXO_DOS_INSCRITOS`.
- **R11 (Edição em Atividade Cancelada)**: Em `PATCH /atividades/:id`, se a atividade estiver cancelada, retorna `422 ATIVIDADE_CANCELADA`.
- **R12 (Restrições de Cancelamento)**: Em `POST /atividades/:id/cancelamento`, se a hora atual (`agora`) for `>= inicio` do 1º encontro, retorna `422 ATIVIDADE_JA_INICIADA`. Se a atividade já estiver cancelada, retorna `422 ATIVIDADE_CANCELADA`.
- **R13 (Cálculo da Situação da Atividade)**: O campo `situacao` é derivado de `agora`: `"cancelada"` se foi cancelada; `"prevista"` se `agora` < 1º início; `"em_andamento"` se `agora` >= 1º início e `agora` <= último fim; `"encerrada"` se `agora` > último fim.
- **R14 (Filtragem na Listagem)**: Em `GET /atividades`, `dia=AAAA-MM-DD` filtra atividades com encontros naquele dia e `tipo=palestra|minicurso` filtra pelo tipo exato.
- **R15 (Ordem de Precedência de Erros)**: Em `POST /atividades` e `PATCH /atividades/:id`, requisições com múltiplos erros devem retornar o primeiro erro na seguinte ordem: `401 USUARIO_DESCONHECIDO` → `403 SOMENTE_ORGANIZACAO` → `404 NAO_ENCONTRADO` (PATCH) → `422 DADOS_INVALIDOS` → `422 ATIVIDADE_CANCELADA` (PATCH) → `422 CAMPO_NAO_EDITAVEL` (PATCH) → `422 QUANTIDADE_DE_ENCONTROS` (POST) → `422 ENCONTRO_INVALIDO` (POST) → `422 VAGAS_ACIMA_DA_CAPACIDADE` → `409 VAGAS_ABAIXO_DOS_INSCRITOS` (PATCH) → `409 CONFLITO_DE_SALA` (POST).

## 6. Critérios de aceite

1. (R1) `GET /atividades` sem cabeçalho `X-Usuario` → `401 USUARIO_DESCONHECIDO`.
2. (R2) `POST /atividades` enviado por participante `p-carla` → `403 SOMENTE_ORGANIZACAO`.
3. (R3) `GET /atividades/atv_inexistente` enviado por `org-ana` → `404 NAO_ENCONTRADO`.
4. (R4) `POST /atividades` com JSON malformado enviado por `org-ana` → `422 DADOS_INVALIDOS`.
5. (R5) `POST /atividades` do tipo `minicurso` com 6 encontros enviado por `org-ana` → `422 QUANTIDADE_DE_ENCONTROS`.
6. (R6) `POST /atividades` com encontro de duração de 30 minutos, virando o dia, ou com término entre 23:00 e 00:30 enviado por `org-ana` → `422 ENCONTRO_INVALIDO`.
7. (R7) `POST /atividades` na `sala-101` (capacidade 40) com `vagas: 50` enviado por `org-ana` → `422 VAGAS_ACIMA_DA_CAPACIDADE`.
8. (R8) `POST /atividades` na `sala-101` com encontro iniciando 10 minutos após o término de outra atividade não cancelada na mesma sala enviado por `org-ana` → `409 CONFLITO_DE_SALA`.
9. (R9) `PATCH /atividades/atv_1a2b3c4d` tentando alterar `salaId` enviado por `org-ana` → `422 CAMPO_NAO_EDITAVEL`.
10. (R10) `PATCH /atividades/atv_1a2b3c4d` reduzindo `vagas` para um valor menor que a soma de confirmadas + convocadas (`ocupadas`) enviado por `org-ana` → `409 VAGAS_ABAIXO_DOS_INSCRITOS`.
11. (R11) `PATCH /atividades/atv_1a2b3c4d` em atividade já cancelada enviado por `org-ana` → `422 ATIVIDADE_CANCELADA`.
12. (R12) `POST /atividades/atv_1a2b3c4d/cancelamento` quando `agora` >= 1º início enviado por `org-ana` → `422 ATIVIDADE_JA_INICIADA`.
13. (R12) `POST /atividades/atv_1a2b3c4d/cancelamento` em atividade já cancelada enviado por `org-ana` → `422 ATIVIDADE_CANCELADA`.
14. (R13) `GET /atividades/atv_1a2b3c4d` retorna `situacao: "em_andamento"` quando `agora` está entre o início do 1º encontro e o fim do último.
15. (R14) `GET /atividades?dia=2026-10-19&tipo=minicurso` retorna apenas minicursos com encontro em 19/10/2026.
16. (R15) `POST /atividades` enviado por participante com 0 encontros retorna `403 SOMENTE_ORGANIZACAO` em vez de `QUANTIDADE_DE_ENCONTROS`.

## 7. Como isto será verificado
A verificação será realizada via requisições HTTP na costura externa exposta pela API (usando `criarServidor()` ou equivalente na stack de testes). Todos os testes observam exclusivamente os códigos HTTP, cabeçalhos e payloads JSON das respostas.

## 8. Fatias de entrega

1. **Fatia 1 — Consulta de Salas e Atividades**: Implementar `GET /salas` e `GET /atividades` (sem filtros), permitindo listar dados iniciais e atividades cadastradas.
2. **Fatia 2 — Criação de Atividades**: Implementar `POST /atividades` com validação de tipo (R5), encontros (R6), capacidade (R7) e conflito de sala/intervalo mínimo de 15 min (R8).
3. **Fatia 3 — Detalhamento, Filtros e Situação**: Implementar `GET /atividades/:id` e filtros `?dia=` e `?tipo=`, incluindo os cálculos de `cargaHorariaMinutos` e `situacao` (R13, R14).
4. **Fatia 4 — Alteração, Cancelamento e Precedência**: Implementar `PATCH /atividades/:id` e `POST /atividades/:id/cancelamento` garantindo imutabilidade (R9), verificação de vagas ocupadas (R10), regras de cancelamento (R11, R12) e precedência estrita de erros (R15).
