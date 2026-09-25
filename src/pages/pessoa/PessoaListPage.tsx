import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { DataTable } from "../../components/common/DataTable";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { pessoaService } from "../../services/pessoaService";
import { extrairMensagemErro } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { TIPO_PESSOA_LABEL, TIPO_PESSOA_FISICA, TIPO_PESSOA_JURIDICA, type Pessoa } from "../../types/pessoa";
import { formatarData } from "../../utils/formatters";

export function PessoaListPage() {
  const { showToast } = useToast();
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [pessoaParaExcluir, setPessoaParaExcluir] = useState<Pessoa | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<"" | typeof TIPO_PESSOA_FISICA | typeof TIPO_PESSOA_JURIDICA>("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await pessoaService.listar({ nome: nome || undefined, tipo: tipo === "" ? undefined : tipo });
      setPessoas(dados);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setCarregando(false);
    }
  }, [nome, tipo]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function limparFiltros() {
    setNome("");
    setTipo("");
  }

  async function confirmarExclusao() {
    if (!pessoaParaExcluir) return;
    setExcluindo(true);
    try {
      await pessoaService.remover(pessoaParaExcluir.id);
      showToast("success", `Pessoa "${pessoaParaExcluir.nome}" removida com sucesso.`);
      setPessoaParaExcluir(null);
      carregar();
    } catch (error) {
      showToast("error", extrairMensagemErro(error));
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div>
      <PageHeader titulo="Pessoas" subtitulo="Cadastro geral de pessoas físicas e jurídicas." acaoLink="/pessoas/nova" acaoTexto="Nova pessoa" />

      <div className="filtros-card">
        <div className="filtros-grid">
          <div className="campo">
            <label htmlFor="filtroNome">Nome</label>
            <input id="filtroNome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Buscar por nome..." />
          </div>
          <div className="campo">
            <label htmlFor="filtroTipo">Tipo</label>
            <select id="filtroTipo" value={tipo} onChange={(e) => setTipo(e.target.value === "" ? "" : (Number(e.target.value) as typeof tipo))}>
              <option value="">Todos</option>
              <option value={TIPO_PESSOA_FISICA}>Física</option>
              <option value={TIPO_PESSOA_JURIDICA}>Jurídica</option>
            </select>
          </div>
          <div className="filtros-acoes">
            <button type="button" className="btn btn-secundario btn-sm" onClick={limparFiltros}>
              Limpar filtros
            </button>
          </div>
        </div>
      </div>

      {erro && <Alert mensagem={erro} />}

      {carregando ? (
        <Loading texto="Carregando pessoas..." />
      ) : (
        <DataTable
          data={pessoas}
          keyExtractor={(pessoa) => pessoa.id}
          mensagemVazia="Nenhuma pessoa encontrada para esse filtro."
          columns={[
            { header: "Nome", render: (pessoa) => pessoa.nome },
            { header: "Tipo", render: (pessoa) => TIPO_PESSOA_LABEL[pessoa.tipo] ?? pessoa.tipo },
            { header: "Documento", render: (pessoa) => pessoa.documento },
            { header: "Nascimento", render: (pessoa) => formatarData(pessoa.dataNascimento) },
            { header: "E-mail", render: (pessoa) => pessoa.email || "-" },
            { header: "Telefone", render: (pessoa) => pessoa.telefone || "-" },
            {
              header: "",
              className: "col-acoes",
              render: (pessoa) => (
                <>
                  <Link to={`/pessoas/${pessoa.id}/editar`} className="btn btn-secundario btn-sm btn-icone" title="Editar" aria-label={`Editar ${pessoa.nome}`}>
                    ✎
                  </Link>{" "}
                  <button
                    type="button"
                    className="btn btn-perigo btn-sm btn-icone"
                    title="Excluir"
                    aria-label={`Excluir ${pessoa.nome}`}
                    onClick={() => setPessoaParaExcluir(pessoa)}
                  >
                    🗑
                  </button>
                </>
              ),
            },
          ]}
        />
      )}

      <ConfirmDialog
        aberto={pessoaParaExcluir !== null}
        titulo="Excluir pessoa"
        mensagem={`Tem certeza de que deseja excluir "${pessoaParaExcluir?.nome}"? Essa ação não pode ser desfeita.`}
        carregando={excluindo}
        onCancelar={() => setPessoaParaExcluir(null)}
        onConfirmar={confirmarExclusao}
      />
    </div>
  );
}
