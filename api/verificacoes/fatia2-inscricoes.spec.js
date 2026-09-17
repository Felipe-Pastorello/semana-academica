import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { criarServidor } from '../src/servidor.js';

describe('Fatia 2 — Inscrições (Regras Avançadas)', () => {
  let servidor;

  before(async () => {
    servidor = await criarServidor();
  });

  after(async () => {
    await servidor.fechar();
  });

  beforeEach(async () => {
    await fetch(`${servidor.url}/_teste/reset`, { method: 'POST' });
  });

  test('(R4) POST /atividades/:id/inscricoes com sobreposição de horário em vaga existente → 422 CONFLITO_DE_HORARIO', async () => {
    await fetch(`${servidor.url}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'ativ-1',
        capacidade: 10,
        status: 'aberta',
        inicio: '2026-10-10T10:00:00Z',
        fim: '2026-10-10T12:00:00Z',
        tipo: 'palestra'
      })
    });

    await fetch(`${servidor.url}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'ativ-2',
        capacidade: 10,
        status: 'aberta',
        inicio: '2026-10-10T11:00:00Z',
        fim: '2026-10-10T13:00:00Z',
        tipo: 'palestra'
      })
    });

    // Inscrição na ativ-1
    await fetch(`${servidor.url}/atividades/ativ-1/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });

    // Inscrição na ativ-2 com sobreposição de horário
    const resposta = await fetch(`${servidor.url}/atividades/ativ-2/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });

    assert.equal(resposta.status, 422);
    const corpo = await resposta.json();
    assert.equal(corpo.erro, 'CONFLITO_DE_HORARIO');
  });

  test('(R5) POST /atividades/:id/inscricoes ultrapassando o limite de 3 minicursos confirmados → 422 LIMITE_DE_MINICURSOS', async () => {
    // Criar 4 minicursos com horários diferentes
    for (let i = 1; i <= 4; i++) {
      await fetch(`${servidor.url}/_teste/atividades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `mini-${i}`,
          capacidade: 10,
          status: 'aberta',
          tipo: 'minicurso',
          inicio: `2026-10-1${i}T10:00:00Z`,
          fim: `2026-10-1${i}T12:00:00Z`
        })
      });
    }

    // Inscrever em 3 minicursos (limite permitido)
    for (let i = 1; i <= 3; i++) {
      const resp = await fetch(`${servidor.url}/atividades/mini-${i}/inscricoes`, {
        method: 'POST',
        headers: { 'X-Usuario': 'p-elisa' }
      });
      assert.equal(resp.status, 201);
    }

    // Tentar o 4º minicurso
    const resposta = await fetch(`${servidor.url}/atividades/mini-4/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-elisa' }
    });

    assert.equal(resposta.status, 422);
    const corpo = await resposta.json();
    assert.equal(corpo.erro, 'LIMITE_DE_MINICURSOS');
  });
});
