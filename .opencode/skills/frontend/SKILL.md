---
name: frontend
description: Implementa e gerencia o desenvolvimento do frontend do projeto da Semana Acadêmica (programação por dia, filtros, detalhes, formulários e tratamento de erros e loading).
---

# Skill de Desenvolvimento Frontend — Semana Acadêmica

Esta skill orienta e implementa a interface web frontend para consumo da API da Semana Acadêmica (Módulo M1 e módulos correlatos).

## Diretrizes e Requisitos

1. **Sem Mocks**: O frontend deve se conectar diretamente à API real exposta pelo backend (respeitando o cabeçalho `X-Usuario` e o contrato de rotas).
2. **Funcionalidades Principais**:
   - **Programação por dia com filtro por tipo** (`GET /atividades?dia=...&tipo=...`).
   - **Detalhe da atividade** (`GET /atividades/:id`), exibindo encontros, vagas ocupadas/restantes, carga horária e situação (`prevista`, `em_andamento`, `encerrada`, `cancelada`).
   - **Formulário da organização** (`POST /atividades`) para criar atividades com validações de encontros e capacidade de salas (`GET /salas`).
   - **Exibição robusta de erros** da API (mapeando códigos como `401 USUARIO_DESCONHECIDO`, `403 SOMENTE_ORGANIZACAO`, `422 DADOS_INVALIDOS`, `422 ENCONTRO_INVALIDO`, `409 CONFLITO_DE_SALA`, etc.).
3. **UX / Design**:
   - Design limpo, moderno e responsivo (utilizando Tailwind CSS ou CSS moderno nativo/flexbox/grid).
   - Estados de *loading*, *empty states* e tratamento elegante de erros de rede ou de validação.
4. **Padrão do Projeto**:
   - Código idiomático, estruturado e aderente às convenções do repositório.
