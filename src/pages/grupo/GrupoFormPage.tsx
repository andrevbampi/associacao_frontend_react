import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading, LoadingInline } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { grupoService } from "../../services/grupoService";
import { extrairMensagemErro } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import type { PermissaoItem } from "../../types/acesso";
import "./Grupo.css";

export function GrupoFormPage() {
  const { id } = useParams();
  const emEdicao = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [administrador, setAdministrador] = useState(false);
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());
  const [catalogo, setCatalogo] = useState<PermissaoItem[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        setCatalogo(await grupoService.listarPermissoes());
        if (emEdicao) {
          const grupo = await grupoService.buscar(Number(id));
          setNome(grupo.nome);
          setDescricao(grupo.descricao ?? "");
          setAtivo(grupo.ativo);
          setAdministrador(grupo.administrador);
          setSelecionadas(new Set(grupo.permissoes));
        }
      } catch (error) {
        setErro(extrairMensagemErro(error));
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [id, emEdicao]);

  const modulos = useMemo(() => {
    const mapa = new Map<string, PermissaoItem[]>();
    for (const item of catalogo) {
      const lista = mapa.get(item.modulo) ?? [];
      lista.push(item);
      mapa.set(item.modulo, lista);
    }
    return Array.from(mapa.entries());
  }, [catalogo]);

  function alternar(item: PermissaoItem, marcada: boolean) {
    setSelecionadas((atual) => {
      const novo = new Set(atual);
      if (marcada) {
        novo.add(item.codigo);
        // "Criar/editar/..." sem "visualizar" não funcionaria: marca também a consulta do módulo.
        const prefixo = item.codigo.split(":")[0];
        const visualizar = `${prefixo}:visualizar`;
        if (item.codigo !== visualizar && catalogo.some((c) => c.codigo === visualizar)) {
          novo.add(visualizar);
        }
      } else {
        novo.delete(item.codigo);
        // Tirar "visualizar" tira as demais ações do módulo, que dependem dela.
        if (item.codigo.endsWith(":visualizar")) {
          const prefixo = item.codigo.split(":")[0];
          for (const c of catalogo) {
            if (c.codigo.startsWith(`${prefixo}:`)) novo.delete(c.codigo);
          }
        }
      }
      return novo;
    });
  }

  function alternarModulo(itens: PermissaoItem[], marcar: boolean) {
    setSelecionadas((atual) => {
      const novo = new Set(atual);
      for (const item of itens) {
        if (marcar) novo.add(item.codigo);
        else novo.delete(item.codigo);
      }
      return novo;
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      const payload = { nome, descricao, ativo, administrador, permissoes: Array.from(selecionadas) };
      if (emEdicao) {
        await grupoService.atualizar({ ...payload, id: Number(id) });
        showToast("success", "Grupo atualizado com sucesso.");
      } else {
        await grupoService.criar(payload);
        showToast("success", "Grupo cadastrado com sucesso.");
      }
      navigate("/grupos");
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <Loading texto="Carregando grupo..." />;

  return (
    <div>
      <PageHeader titulo={emEdicao ? "Editar grupo" : "Novo grupo"} />

      {erro && <Alert mensagem={erro} />}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="campo">
            <label htmlFor="nome">Nome *</label>
            <input id="nome" type="text" value={nome} maxLength={100} onChange={(e) => setNome(e.target.value)} required />
          </div>
          <div className="campo campo-largo">
            <label htmlFor="descricao">Descrição</label>
            <input id="descricao" type="text" value={descricao} maxLength={255} onChange={(e) => setDescricao(e.target.value)} />
          </div>
          <div className="campo">
            <label className="campo-checkbox-inline">
              <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
              Grupo ativo
            </label>
            <span className="campo-ajuda">Grupo inativo não concede nenhuma permissão.</span>
          </div>
          <div className="campo">
            <label className="campo-checkbox-inline">
              <input type="checkbox" checked={administrador} onChange={(e) => setAdministrador(e.target.checked)} />
              Administrador (acesso total)
            </label>
            <span className="campo-ajuda">Recebe todas as permissões, inclusive as criadas no futuro.</span>
          </div>
        </div>

        <h2 className="membro-detalhe-subtitulo">Permissões</h2>
        {administrador && <p className="campo-ajuda">Este grupo é administrador: tem todas as permissões, independentemente da seleção abaixo.</p>}

        <div className="grupo-modulos">
          {modulos.map(([modulo, itens]) => {
            const todasMarcadas = itens.every((i) => selecionadas.has(i.codigo));
            return (
              <fieldset key={modulo} className="grupo-modulo" disabled={administrador}>
                <legend>{modulo}</legend>
                <button type="button" className="btn btn-secundario btn-sm" onClick={() => alternarModulo(itens, !todasMarcadas)}>
                  {todasMarcadas ? "Desmarcar todas" : "Marcar todas"}
                </button>
                {itens.map((item) => (
                  <label key={item.codigo} className="campo-checkbox-inline grupo-permissao">
                    <input type="checkbox" checked={selecionadas.has(item.codigo)} onChange={(e) => alternar(item, e.target.checked)} />
                    <span>
                      {item.descricao}
                      <small> {item.codigo}</small>
                    </span>
                  </label>
                ))}
              </fieldset>
            );
          })}
        </div>

        <div className="form-acoes">
          <button type="button" className="btn btn-secundario" onClick={() => navigate("/grupos")} disabled={salvando}>
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
