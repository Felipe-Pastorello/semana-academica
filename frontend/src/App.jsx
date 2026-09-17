import React, { useState, useEffect } from 'react';

const USUARIOS = [
  { id: 'org-ana', nome: 'Ana (Organização)', perfil: 'organizacao' },
  { id: 'org-bruno', nome: 'Bruno (Organização)', perfil: 'organizacao' },
  { id: 'p-carla', nome: 'Carla (Participante)', perfil: 'participante' },
  { id: 'p-diego', nome: 'Diego (Participante)', perfil: 'participante' }
];

export default function App() {
  const [apiUrl, setApiUrl] = useState('http://localhost:3333');
  const [usuario, setUsuario] = useState('org-ana');
  const [atividades, setAtividades] = useState([]);
  const [salas, setSalas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(null);

  // Filtros
  const [diaFiltro, setDiaFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');

  // Detalhe / Modal
  const [atividadeSelecionada, setAtividadeSelecionada] = useState(null);
  const [modalDetalheAberto, setModalDetalheAberto] = useState(false);
  const [minhasInscricoes, setMinhasInscricoes] = useState([]);

  // Aba ativa: 'programacao' ou 'inscricoes'
  const [abaAtiva, setAbaAtiva] = useState('programacao');

  // Criar Atividade
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoTipo, setNovoTipo] = useState('palestra');
  const [novaSalaId, setNovaSalaId] = useState('sala-101');
  const [novasVagas, setNovasVagas] = useState(30);
  const [novoEncontroInicio, setNovoEncontroInicio] = useState('2026-10-19T09:00:00-03:00');
  const [novoEncontroFim, setNovoEncontroFim] = useState('2026-10-19T11:00:00-03:00');

  const usuarioAtualObj = USUARIOS.find(u => u.id === usuario);
  const isOrganizacao = usuarioAtualObj?.perfil === 'organizacao';

  async function carregarDados() {
    setLoading(true);
    setErro(null);
    try {
      const headers = { 'X-Usuario': usuario };
      
      // Carregar salas
      const resSalas = await fetch(`${apiUrl}/salas`, { headers });
      if (!resSalas.ok) throw new Error(`Erro ao carregar salas: ${resSalas.status}`);
      const dataSalas = await resSalas.json();
      setSalas(dataSalas);

      // Carregar atividades com filtros
      let urlAtv = `${apiUrl}/atividades?`;
      if (diaFiltro) urlAtv += `dia=${diaFiltro}&`;
      if (tipoFiltro) urlAtv += `tipo=${tipoFiltro}&`;

      const resAtv = await fetch(urlAtv, { headers });
      if (!resAtv.ok) {
        const errJson = await resAtv.json();
        throw new Error(errJson.mensagem || errJson.erro || `Erro ${resAtv.status}`);
      }
      const dataAtv = await resAtv.json();
      setAtividades(dataAtv);
    } catch (err) {
      setErro(err.message);
      setAtividades([]);
    } finally {
      setLoading(false);
    }
  }

  async function realizarInscricao(atividadeId) {
    setErro(null);
    setSucesso(null);
    try {
      const res = await fetch(`${apiUrl}/atividades/${atividadeId}/inscricoes`, {
        method: 'POST',
        headers: { 'X-Usuario': usuario }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(`[${data.erro || 'ERRO'}] ${data.mensagem || 'Falha na inscrição'}`);
      }
      if (data.status === 'confirmada') {
        setSucesso('Inscrição realizada com sucesso! Vaga confirmada.');
      } else {
        setSucesso('Inscrição realizada em fila de espera (vagas esgotadas).');
      }
      setModalDetalheAberto(false);
      carregarDados();
    } catch (err) {
      setErro(err.message);
    }
  }

  async function cancelarInscricao(inscricaoId) {
    if (!confirm('Deseja realmente cancelar esta inscrição?')) return;
    setErro(null);
    setSucesso(null);
    try {
      const res = await fetch(`${apiUrl}/inscricoes/${inscricaoId}/cancelamento`, {
        method: 'POST',
        headers: { 'X-Usuario': usuario }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(`[${data.erro || 'ERRO'}] ${data.mensagem || 'Falha ao cancelar inscrição'}`);
      }
      setSucesso('Inscrição cancelada com sucesso!');
      carregarDados();
      if (atividadeSelecionada) {
        verDetalhe(atividadeSelecionada.id);
      }
    } catch (err) {
      setErro(err.message);
    }
  }

  useEffect(() => {
    carregarDados();
  }, [apiUrl, usuario, diaFiltro, tipoFiltro]);

  async function verDetalhe(id) {
    setErro(null);
    try {
      const res = await fetch(`${apiUrl}/atividades/${id}`, {
        headers: { 'X-Usuario': usuario }
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.mensagem || errJson.erro || 'Erro ao carregar detalhe');
      }
      const data = await res.json();
      setAtividadeSelecionada(data);
      setModalDetalheAberto(true);
    } catch (err) {
      setErro(err.message);
    }
  }

  async function cancelarAtividade(id) {
    if (!confirm('Deseja realmente cancelar esta atividade?')) return;
    setErro(null);
    setSucesso(null);
    try {
      const res = await fetch(`${apiUrl}/atividades/${id}/cancelamento`, {
        method: 'POST',
        headers: { 'X-Usuario': usuario }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.mensagem || data.erro || 'Erro ao cancelar atividade');
      }
      setSucesso('Atividade cancelada com sucesso!');
      setModalDetalheAberto(false);
      carregarDados();
    } catch (err) {
      setErro(err.message);
    }
  }

  async function criarAtividadeSubmit(e) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);
    try {
      const corpo = {
        titulo: novoTitulo,
        tipo: novoTipo,
        salaId: novaSalaId,
        vagas: Number(novasVagas),
        encontros: [
          {
            inicio: novoEncontroInicio,
            fim: novoEncontroFim
          }
        ]
      };

      const res = await fetch(`${apiUrl}/atividades`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Usuario': usuario
        },
        body: JSON.stringify(corpo)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(`[${data.erro || 'ERRO'}] ${data.mensagem || 'Falha ao criar atividade'}`);
      }
      setSucesso('Atividade criada com sucesso!');
      setModalCriarAberto(false);
      setNovoTitulo('');
      carregarDados();
    } catch (err) {
      setErro(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded">M1</span>
            <h1 className="text-xl font-bold">Semana Acadêmica — Grade de Atividades</h1>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded border border-slate-700">
              <span className="text-slate-400">API:</span>
              <input 
                type="text" 
                value={apiUrl} 
                onChange={e => setApiUrl(e.target.value)} 
                className="bg-transparent text-white outline-none w-36"
              />
            </div>
            
            <div className="flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded border border-slate-700">
              <span className="text-slate-400">Usuário:</span>
              <select 
                value={usuario} 
                onChange={e => setUsuario(e.target.value)}
                className="bg-transparent text-white outline-none cursor-pointer"
              >
                {USUARIOS.map(u => (
                  <option key={u.id} value={u.id} className="bg-slate-800 text-white">
                    {u.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Alertas de Erro / Sucesso */}
        {erro && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm flex justify-between items-center">
            <div className="flex items-center">
              <div className="text-red-700 font-bold mr-2">Erro:</div>
              <div className="text-red-700 text-sm font-mono">{erro}</div>
            </div>
            <button onClick={() => setErro(null)} className="text-red-500 hover:text-red-700 font-bold">&times;</button>
          </div>
        )}

        {sucesso && (
          <div className="mb-6 bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded shadow-sm flex justify-between items-center">
            <div className="text-emerald-700 text-sm font-medium">{sucesso}</div>
            <button onClick={() => setSucesso(null)} className="text-emerald-500 hover:text-emerald-700 font-bold">&times;</button>
          </div>
        )}

        {/* Barra de Ações e Filtros */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Filtrar por Dia</label>
              <input 
                type="date" 
                value={diaFiltro} 
                onChange={e => setDiaFiltro(e.target.value)}
                className="border border-slate-300 rounded px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
              />
              {diaFiltro && (
                <button 
                  onClick={() => setDiaFiltro('')}
                  className="ml-2 text-xs text-indigo-600 hover:underline"
                >
                  Limpar
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Filtrar por Tipo</label>
              <select 
                value={tipoFiltro} 
                onChange={e => setTipoFiltro(e.target.value)}
                className="border border-slate-300 rounded px-3 py-1.5 text-sm outline-none focus:border-indigo-500 bg-white"
              >
                <option value="">Todos os tipos</option>
                <option value="palestra">Palestra</option>
                <option value="minicurso">Minicurso</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button 
              onClick={carregarDados}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium rounded transition"
            >
              Atualizar
            </button>

            {isOrganizacao ? (
              <button 
                onClick={() => setModalCriarAberto(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded shadow transition flex items-center gap-1"
              >
                <span>+ Nova Atividade</span>
              </button>
            ) : (
              <span className="text-xs text-slate-400 italic" title="Apenas organização pode criar atividades">
                (Modo Participante)
              </span>
            )}
          </div>
        </div>

        {/* Lista de Atividades */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Programação de Atividades</h2>

          {loading ? (
            <div className="text-center py-12 text-slate-500">Carregando atividades...</div>
          ) : atividades.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-500">
              Nenhuma atividade encontrada com os filtros selecionados.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {atividades.map(atv => {
                const salaObj = salas.find(s => s.id === atv.salaId);
                return (
                  <div 
                    key={atv.id} 
                    onClick={() => verDetalhe(atv.id)}
                    className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                          atv.tipo === 'palestra' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {atv.tipo}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          atv.situacao === 'prevista' ? 'bg-amber-100 text-amber-800' :
                          atv.situacao === 'em_andamento' ? 'bg-emerald-100 text-emerald-800' :
                          atv.situacao === 'encerrada' ? 'bg-slate-200 text-slate-700' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {atv.situacao}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base mb-2 line-clamp-2">{atv.titulo}</h3>
                      <p className="text-xs text-slate-500 mb-4">Sala: {salaObj ? salaObj.nome : atv.salaId}</p>
                    </div>

                    <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs text-slate-600">
                      <div>
                        <span className="font-semibold text-slate-900">{atv.vagasRestantes}</span> / {atv.vagas} vagas livres
                      </div>
                      <div className="text-indigo-600 font-semibold hover:underline">Ver detalhes &rarr;</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Modal de Detalhes */}
      {modalDetalheAberto && atividadeSelecionada && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setModalDetalheAberto(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-lg"
            >
              &times;
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                {atividadeSelecionada.tipo}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {atividadeSelecionada.situacao}
              </span>
              <span className="text-xs font-mono text-slate-400 ml-auto">{atividadeSelecionada.id}</span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-4">{atividadeSelecionada.titulo}</h2>

            <div className="space-y-3 text-sm mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Sala:</span>
                <span className="font-semibold text-slate-800">
                  {salas.find(s => s.id === atividadeSelecionada.salaId)?.nome || atividadeSelecionada.salaId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Carga Horária:</span>
                <span className="font-semibold text-slate-800">{atividadeSelecionada.cargaHorariaMinutos} minutos</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vagas Oferecidas:</span>
                <span className="font-semibold text-slate-800">{atividadeSelecionada.vagas}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vagas Ocupadas:</span>
                <span className="font-semibold text-slate-800">{atividadeSelecionada.ocupadas}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vagas Restantes:</span>
                <span className="font-semibold text-emerald-600">{atividadeSelecionada.vagasRestantes}</span>
              </div>
            </div>

            <h4 className="font-bold text-slate-800 text-sm mb-2">Cronograma de Encontros</h4>
            <div className="space-y-2 mb-6">
              {atividadeSelecionada.encontros?.map((enc, index) => (
                <div key={enc.id || index} className="text-xs bg-white border border-slate-200 p-3 rounded flex justify-between items-center">
                  <span className="font-mono text-slate-600">Encontro {index + 1}</span>
                  <div className="text-right">
                    <div>Início: {new Date(enc.inicio).toLocaleString()}</div>
                    <div>Fim: {new Date(enc.fim).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>

            {isOrganizacao && atividadeSelecionada.situacao !== 'cancelada' && (
              <div className="border-t border-slate-200 pt-4 flex justify-end">
                <button 
                  onClick={() => cancelarAtividade(atividadeSelecionada.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded transition shadow"
                >
                  Cancelar Atividade
                </button>
              </div>
            )}

            {!isOrganizacao && (
              <div className="border-t border-slate-200 pt-4 flex justify-end">
                <button 
                  onClick={() => realizarInscricao(atividadeSelecionada.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded transition shadow"
                >
                  Inscrever-se / Entrar na Espera
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Criar Atividade */}
      {modalCriarAberto && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setModalCriarAberto(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-lg"
            >
              &times;
            </button>

            <h2 className="text-xl font-bold text-slate-900 mb-4">Nova Atividade (Organização)</h2>

            <form onSubmit={criarAtividadeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Título</label>
                <input 
                  type="text" 
                  required
                  value={novoTitulo} 
                  onChange={e => setNovoTitulo(e.target.value)}
                  placeholder="Ex: Introdução ao Node.js"
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tipo</label>
                  <select 
                    value={novoTipo} 
                    onChange={e => setNovoTipo(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="palestra">Palestra</option>
                    <option value="minicurso">Minicurso</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Sala</label>
                  <select 
                    value={novaSalaId} 
                    onChange={e => setNovaSalaId(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500 bg-white"
                  >
                    {salas.map(s => (
                      <option key={s.id} value={s.id}>{s.nome} (Cap: {s.capacidade})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Número de Vagas</label>
                <input 
                  type="number" 
                  min="1"
                  required
                  value={novasVagas} 
                  onChange={e => setNovasVagas(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div className="border-t border-slate-200 pt-3">
                <h4 className="font-semibold text-xs text-slate-700 mb-2">Primeiro Encontro</h4>
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Início (ISO 8601)</label>
                    <input 
                      type="text"
                      required
                      value={novoEncontroInicio}
                      onChange={e => setNovoEncontroInicio(e.target.value)}
                      className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs font-mono outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Fim (ISO 8601)</label>
                    <input 
                      type="text"
                      required
                      value={novoEncontroFim}
                      onChange={e => setNovoEncontroFim(e.target.value)}
                      className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs font-mono outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setModalCriarAberto(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold rounded"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded shadow"
                >
                  Criar Atividade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
