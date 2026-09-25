import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading, LoadingInline } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { membroService } from "../../services/membroService";
import { pessoaService } from "../../services/pessoaService";
import { statusMembroService } from "../../services/statusMembroService";
import { extrairMensagemErro } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { membroVazio, type MembroFormData, type MembroRequest } from "../../types/membro";
import type { Pessoa } from "../../types/pessoa";
import type { StatusMembro } from "../../types/statusMembro";
import { paraDataInput } from "../../utils/formatters";

export function MembroFormPage() {
  const { id } = useParams();
  const emEdicao = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState<MembroFormData>(membroVazio);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [statusList, setStatusList] = useState<StatusMembro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        // Ao criar, só mostra pessoas que ainda não são membros. Ao editar,
        // mostra todas, senão a própria pessoa já vinculada a este membro
        // desapareceria do combobox.
        const [listaPessoas, listaStatus] = await Promise.all([
          pessoaService.listar(emEdicao ? undefined : { semMembro: true }),
          statusMembroService.listar(),
        ]);
        setPessoas(listaPessoas);
        setStatusList(listaStatus);

        if (emEdicao) {
          const membros = await membroService.listar();
          const membro = membros.find((m) => m.id === Number(id));
          if (!membro) {
            setErro("Membro não encontrado.");
            return;
          }
          setForm({
            id: membro.id,
            idPessoa: membro.pessoa.id,
            idStatus: membro.status.id,
            ativo: membro.ativo,
            dataInclusao: paraDataInput(membro.dataInclusao),
            dataSaida: paraDataInput(membro.dataSaida),
          });
        }
      } catch (error) {
        setErro(extrairMensagemErro(error));
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, [id, emEdicao]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);

    if (form.idPessoa === "" || form.idStatus === "") {
      setErro("Selecione a pessoa e o status do membro.");
      return;
    }

    setSalvando(true);
    const payload: MembroRequest = {
      idPessoa: Number(form.idPessoa),
      idStatus: Number(form.idStatus),
      ativo: form.ativo,
      dataInclusao: form.dataInclusao || null,
      dataSaida: form.dataSaida || null,
    };

    try {
      if (emEdicao) {
        await membroService.atualizar({ ...payload, id: Number(id) });
        showToast("success", "Membro atualizado com sucesso.");
      } else {
        await membroService.criar(payload);
        showToast("success", "Membro cadastrado com sucesso.");
      }
      navigate("/membros");
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <Loading texto="Carregando dados do membro..." />;

  return (
    <div>
      <PageHeader titulo={emEdicao ? "Editar membro" : "Novo membro"} />

      {erro && <Alert mensagem={erro} />}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="campo campo-largo">
            <label htmlFor="idPessoa">Pessoa *</label>
            <select
              id="idPessoa"
              value={form.idPessoa}
              onChange={(e) => setForm({ ...form, idPessoa: e.target.value ? Number(e.target.value) : "" })}
              required
            >
              <option value="">Selecione uma pessoa...</option>
              {pessoas.map((pessoa) => (
                <option key={pessoa.id} value={pessoa.id}>
                  {pessoa.nome} ({pessoa.documento})
                </option>
              ))}
            </select>
          </div>

          <div className="campo campo-largo">
            <label htmlFor="idStatus">Status *</label>
            {statusList.length === 0 ? (
              <span className="campo-ajuda">
                Nenhum status cadastrado. Cadastre um em "Status de Membro" antes de continuar.
              </span>
            ) : (
              <select
                id="idStatus"
                value={form.idStatus}
                onChange={(e) => setForm({ ...form, idStatus: e.target.value ? Number(e.target.value) : "" })}
                required
              >
                <option value="">Selecione um status...</option>
                {statusList.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.descricao}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="campo">
            <label htmlFor="dataInclusao">Data de inclusão</label>
            <input
              id="dataInclusao"
              type="date"
              value={form.dataInclusao}
              onChange={(e) => setForm({ ...form, dataInclusao: e.target.value })}
            />
            <span className="campo-ajuda">Se não informada, será usada a data de hoje.</span>
          </div>

          <div className="campo">
            <label htmlFor="dataSaida">Data de saída</label>
            <input
              id="dataSaida"
              type="date"
              value={form.dataSaida}
              onChange={(e) => setForm({ ...form, dataSaida: e.target.value })}
            />
          </div>

          <div className="campo campo-checkbox campo-largo">
            <input
              id="ativo"
              type="checkbox"
              checked={form.ativo}
              onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
            />
            <label htmlFor="ativo">Membro ativo</label>
          </div>
        </div>

        <div className="form-acoes">
          <button type="button" className="btn btn-secundario" onClick={() => navigate("/membros")} disabled={salvando}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primario" disabled={salvando}>
            {salvando ? <LoadingInline /> : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
