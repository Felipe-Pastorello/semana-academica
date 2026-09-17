import http from 'node:http';

const USUARIOS_VALIDOS = new Set([
  'org-ana', 'org-bruno', 'p-carla', 'p-diego', 'p-elisa',
  'p-fabio', 'p-gabriela', 'p-heitor', 'p-isadora', 'p-joao'
]);

const SALAS = [
  { id: 'auditorio', nome: 'Auditório Central', capacidade: 200 },
  { id: 'sala-101', nome: 'Sala 101', capacidade: 40 },
  { id: 'sala-102', nome: 'Sala 102', capacidade: 40 },
  { id: 'lab-3', nome: 'Laboratório 3', capacidade: 20 }
];

let atividades = [];
let inscricoes = [];
let contadorInscricoes = 1;

export function tratarRequisicao(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  if (pathname === '/_teste/reset' && req.method === 'POST') {
    atividades = [];
    inscricoes = [];
    contadorInscricoes = 1;
    res.writeHead(204);
    res.end();
    return;
  }

  if (pathname === '/_teste/atividades' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const ativ = JSON.parse(body);
      atividades.push(ativ);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(ativ));
    });
    return;
  }

  if (!pathname.startsWith('/_teste/')) {
    const usuario = req.headers['x-usuario'];
    if (!usuario || !USUARIOS_VALIDOS.has(usuario)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ erro: 'USUARIO_DESCONHECIDO', mensagem: 'Usuário não fornecido ou inválido' }));
      return;
    }
  }

  if (req.method === 'GET' && pathname === '/salas') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(SALAS));
    return;
  }

  if (req.method === 'GET' && pathname === '/atividades') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(atividades));
    return;
  }

  if (req.method === 'POST' && /^\/atividades\/[^/]+\/inscricoes$/.test(pathname)) {
    const usuario = req.headers['x-usuario'];
    if (usuario.startsWith('org-')) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ erro: 'SOMENTE_PARTICIPANTE', mensagem: 'Apenas participantes podem se inscrever' }));
      return;
    }

    const match = pathname.match(/^\/atividades\/([^/]+)\/inscricoes$/);
    const atividadeId = match[1];
    const atividade = atividades.find(a => a.id === atividadeId);

    if (!atividade) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ erro: 'ATIVIDADE_NAO_ENCONTRADA' }));
      return;
    }

    if (atividade.status === 'cancelada') {
      res.writeHead(422, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ erro: 'ATIVIDADE_CANCELADA' }));
      return;
    }

    if (atividade.status === 'encerrada') {
      res.writeHead(422, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ erro: 'INSCRICOES_ENCERRADAS' }));
      return;
    }

    const jaInscrito = inscricoes.some(i => i.atividadeId === atividadeId && i.participanteId === usuario && (i.status === 'confirmada' || i.status === 'em_espera'));
    if (jaInscrito) {
      res.writeHead(422, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ erro: 'JA_INSCRITO' }));
      return;
    }

    // R4 — Conflito de Horário: O participante não pode ocupar vaga em uma atividade se já possuir outra inscrição confirmada com encontro sobreposto (encostar horários não gera conflito). Apenas inscrições que ocupam vaga são verificadas.
    if (atividade.inicio && atividade.fim) {
      const minhasConfirmadas = inscricoes.filter(i => i.participanteId === usuario && i.status === 'confirmada');
      for (const insc of minhasConfirmadas) {
        const ativExistente = atividades.find(a => a.id === insc.atividadeId);
        if (ativExistente && ativExistente.inicio && ativExistente.fim) {
          const inicio1 = new Date(atividade.inicio).getTime();
          const fim1 = new Date(atividade.fim).getTime();
          const inicio2 = new Date(ativExistente.inicio).getTime();
          const fim2 = new Date(ativExistente.fim).getTime();

          // Sobreposição se início1 < fim2 e inicio2 < fim1
          if (inicio1 < fim2 && inicio2 < fim1) {
            res.writeHead(422, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ erro: 'CONFLITO_DE_HORARIO' }));
            return;
          }
        }
      }
    }

    // R5 — Limite de Minicursos: O participante pode ter no máximo 3 minicursos ocupando vaga simultaneamente. Palestras e inscrições em espera não contam para este limite.
    if (atividade.tipo === 'minicurso') {
      const minicursosConfirmados = inscricoes.filter(i => {
        if (i.participanteId !== usuario || i.status !== 'confirmada') return false;
        const a = atividades.find(act => act.id === i.atividadeId);
        return a && a.tipo === 'minicurso';
      }).length;

      if (minicursosConfirmados >= 3) {
        res.writeHead(422, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ erro: 'LIMITE_DE_MINICURSOS' }));
        return;
      }
    }
    const vagasOcupadas = inscricoes.filter(i => i.atividadeId === atividadeId && i.status === 'confirmada').length;
    const status = vagasOcupadas < atividade.capacidade ? 'confirmada' : 'em_espera';

    const novaInscricao = {
      id: String(contadorInscricoes++),
      atividadeId,
      participanteId: usuario,
      status,
      criadoEm: new Date().toISOString()
    };
    inscricoes.push(novaInscricao);

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(novaInscricao));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ erro: 'NAO_ENCONTRADO', mensagem: 'Rota não encontrada' }));
}

export async function criarServidor(opcoes = {}) {
  const modoTeste = opcoes.modoTeste ?? process.env.MODO_TESTE ?? '1';
  process.env.MODO_TESTE = modoTeste;

  const server = http.createServer(tratarRequisicao);
  await new Promise((resolve) => server.listen(0, resolve));
  const porta = server.address().port;
  return {
    url: `http://localhost:${porta}`,
    fechar: () => new Promise((resolve) => server.close(resolve))
  };
}
