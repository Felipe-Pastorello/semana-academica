import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { criarServidor } from '../src/servidor.js';

describe('Fatia 3 — Cancelamento e Lista de Espera', () => {
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

  test('(R6) POST /inscricoes/:id/cancelamento antes do início da atividade → 200 OK com status atualizado para cancelada', async () => {
    await fetch(`${servidor.url}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'ativ-1',
        capacidade: 1,
        status: 'aberta',
        inicio: '2026-12-10T10:00:00Z',
        fim: '2026-12-10T12:00:00Z'
      })
    });

    const resInscricao = await fetch(`${servidor.url}/atividades/ativ-1/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    const dadosInscricao = await resInscricao.json();

    const resposta = await fetch(`${servidor.url}/inscricoes/${dadosInscricao.id}/cancelamento`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });

    assert.equal(resposta.status, 200);
    const corpo = await resposta.json();
    assert.equal(corpo.status, 'cancelada');
  });

  test('(R6) POST /inscricoes/:id/cancelamento com atividade já iniciada → 422 ATIVIDADE_JA_INICIADA', async () => {
    await fetch(`${servidor.url}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'ativ-passada',
        capacidade: 1,
        status: 'aberta',
        inicio: '2020-01-01T10:00:00Z',
        fim: '2020-01-01T12:00:00Z'
      })
    });

    const resInscricao = await fetch(`${servidor.url}/atividades/ativ-passada/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    const dadosInscricao = await resInscricao.json();

    const resposta = await fetch(`${servidor.url}/inscricoes/${dadosInscricao.id}/cancelamento`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });

    assert.equal(resposta.status, 422);
    const corpo = await resposta.json();
    assert.equal(corpo.erro, 'ATIVIDADE_JA_INICIADA');
  });

  test('(R6) POST /inscricoes/:id/cancelamento de inscrição já inativa → 422 INSCRICAO_INATIVA', async () => {
    await fetch(`${servidor.url}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'ativ-1',
        capacidade: 1,
        status: 'aberta',
        inicio: '2026-12-10T10:00:00Z',
        fim: '2026-12-10T12:00:00Z'
      })
    });

    const resInscricao = await fetch(`${servidor.url}/atividades/ativ-1/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    const dadosInscricao = await resInscricao.json();

    // Primeiro cancelamento
    await fetch(`${servidor.url}/inscricoes/${dadosInscricao.id}/cancelamento`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });

    // Segundo cancelamento
    const resposta = await fetch(`${servidor.url}/inscricoes/${dadosInscricao.id}/cancelamento`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });

    assert.equal(resposta.status, 422);
    const corpo = await resposta.json();
    assert.equal(corpo.erro, 'INSCRICAO_INATIVA');
  });

  test('(R7) Convocação automática do primeiro da lista de espera ao cancelar vaga confirmada', async () => {
    await fetch(`${servidor.url}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'ativ-lotada',
        capacidade: 1,
        status: 'aberta',
        inicio: '2026-12-10T10:00:00Z',
        fim: '2026-12-10T12:00:00Z'
      })
    });

    const resCarla = await fetch(`${servidor.url}/atividades/ativ-lotada/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    const inscCarla = await resCarla.json();

    const resDiego = await fetch(`${servidor.url}/atividades/ativ-lotada/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-diego' }
    });
    const inscDiego = await resDiego.json();
    assert.equal(inscDiego.status, 'em_espera');

    await fetch(`${servidor.url}/inscricoes/${inscCarla.id}/cancelamento`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });

    // Tentar inscrever Elisa: se Diego foi promovido para confirmada, Elisa consegue entrar na vaga ou fica em espera? 
    // Como a capacidade é 1 e Carla saiu, Diego ocupou a vaga. Se Diego ocupou a vaga, a capacidade (1) está preenchida por Diego. 
    // Logo, se Elisa se inscrever agora, ela deve ir para a lista de espera.
    const resElisa = await fetch(`${servidor.url}/atividades/ativ-lotada/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-elisa' }
    });
    const inscElisa = await resElisa.json();
    assert.equal(inscElisa.status, 'em_espera');
  });
});
