import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading, LoadingInline } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { grupoService } from "../../services/grupoService";
import { usuarioAcessoService } from "../../services/usuarioAcessoService";
import { extrairMensagemErro } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import type { EfeitoPermissao, Grupo, PermissaoEfetiva, PermissaoItem } from "../../types/acesso";
import "../grupo/Grupo.css";

type Excecoes = Record<string, EfeitoPermissao>;

export function UsuarioAcessoPage() {
  const { id } = useParams();
  const idUsuario = Number(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [login, setLogin] = useState("");
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [catalogo, setCatalogo] = useState<PermissaoItem[]>([]);
  const [idsGrupos, setIdsGrupos] = useState<Set<number>>(new Set());
  const [excecoes, setExcecoes] = useState<Excecoes>({});
  const [efetivas, setEfetivas] = useState<PermissaoEfetiva[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function aplicar(acesso: Awaited<ReturnType<typeof usuarioAcessoService.obter>>) {
    setLogin(acesso.login);
    setIdsGrupos(new Set(acesso.idsGrupos));
    setExcecoes(Object.fromEntries(acesso.excecoes.map((e) => [e.codigo, e.efeito])));
    setEfetivas(acesso.permissoesEfetivas);
  }

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        const [listaGrupos, permissoes, acesso] = await Promise.all([
          grupoService.listar(),
          grupoService.listarPermissoes(),
          usuarioAcessoService.obter(idUsuario),
        ]);
        setGrupos(listaGrupos);
        setCatalogo(permissoes);
        aplicar(acesso);
      } catch (error) {
        setErro(extrairMensagemErro(error));
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [idUsuario]);

  const modulos = useMemo(() => {
    const mapa = new Map<string, PermissaoItem[]>();
    for (const item of catalogo) {
      const lista = mapa.get(item.modulo) ?? [];
      lista.push(item);
      mapa.set(item.modulo, lista);
    }
    return Array.from(mapa.entries());
  }, [catalogo]);

  const efetivasPorModulo = useMemo(() => {
    const descricoes = new Map(catalogo.map((c) => [c.codigo, c]));
    const mapa = new Map<string, { descricao: string; origem: string }[]>();
    for (const e of efetivas) {
      const item = descricoes.get(e.codigo);
      if (!item) continue;
      const lista = mapa.get(item.modulo) ?? [];
      lista.push({ descricao: item.descricao, origem: e.origem });
      mapa.set(item.modulo, lista);
    }
    return Array.from(mapa.entries());
  }, [catalogo, efetivas]);

  function alternarGrupo(idGrupo: number, marcado: boolean) {
    setIdsGrupos((atual) => {
      const novo = new Set(atual);
      if (marcado) novo.add(idGrupo);
      else novo.delete(idGrupo);
      return novo;
    });
  }

  function definirExcecao(codigo: string, valor: string) {
    setExcecoes((atual) => {
      const novo = { ...atual };
      if (valor === "") delete novo[codigo];
      else novo[codigo] = valor as EfeitoPermissao;
      return novo;
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      const acesso = await usuarioAcessoService.salvar(idUsuario, {
        idsGrupos: Array.from(idsGrupos),
        excecoes: Object.entries(excecoes).map(([codigo, efeito]) => ({ codigo, efeito })),
      });
      aplicar(acesso);
      showToast("success", "Acesso do usuário atualizado.");
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <Loading texto="Carregando acesso do usuário..." />;

  return (
    <div>
      <PageHeader titulo={`Acesso de ${login}`} subtitulo="Grupos do usuário e exceções individuais. A negação do usuário sempre vence a permissão do grupo." />

      {erro && <Alert mensagem={erro} />}

      <form className="form-card" onSubmit={handleSubmit}>
        <h2 className="membro-detalhe-subtitulo">Grupos</h2>
        {grupos.length === 0 ? (
          <p className="campo-ajuda">Nenhum grupo cadastrado.</p>
        ) : (
          <div className="acesso-excecoes">
            {grupos.map((grupo) => (
              <label key={grupo.id} className="campo-checkbox-inline">
                <input type="checkbox" checked={idsGrupos.has(grupo.id)} onChange={(e) => alternarGrupo(grupo.id, e.target.checked)} />
                <span>
                  {grupo.nome}
                  {grupo.administrador && " (administrador)"}
                  {!grupo.ativo && " (inativo)"}
                  {grupo.descricao && <small className="campo-ajuda"> — {grupo.descricao}</small>}
                </span>
              </label>
            ))}
          </div>
        )}

        <h2 className="membro-detalhe-subtitulo">Exceções individuais</h2>
        <p className="campo-ajuda">
          &quot;Herdar&quot; segue o que os grupos concedem. &quot;Permitir&quot; acrescenta a permissão; &quot;Negar&quot; remove, mesmo que um grupo conceda.
        </p>
        <div className="grupo-modulos">
          {modulos.map(([modulo, itens]) => (
            <fieldset key={modulo} className="grupo-modulo">
              <legend>{modulo}</legend>
              {itens.map((item) => (
                <div key={item.codigo} className="acesso-excecao">
                  <span className={excecoes[item.codigo] === "PERMITIR" ? "acesso-excecao-permitir" : excecoes[item.codigo] === "NEGAR" ? "acesso-excecao-negar" : undefined}>
                    {item.descricao}
                  </span>
                  <select
                    aria-label={`Exceção para ${item.descricao}`}
                    value={excecoes[item.codigo] ?? ""}
                    onChange={(e) => definirExcecao(item.codigo, e.target.value)}
                  >
                    <option value="">Herdar</option>
                    <option value="PERMITIR">Permitir</option>
                    <option value="NEGAR">Negar</option>
                  </select>
                </div>
              ))}
            </fieldset>
          ))}
        </div>

        <div className="form-acoes">
          <button type="button" className="btn btn-secundario" onClick={() => navigate("/usuarios")} disabled={salvando}>
            Voltar
          </button>
          <button type="submit" className="btn btn-primario" disabled={salvando}>
            {salvando ? <LoadingInline /> : "Salvar acesso"}
          </button>
        </div>
      </form>

      <div className="form-card">
        <h2 className="membro-detalhe-subtitulo">Permissões efetivas (resultado salvo)</h2>
        {efetivas.length === 0 ? (
          <p className="campo-ajuda">Este usuário não tem nenhuma permissão.</p>
        ) : (
          <div className="grupo-modulos">
            {efetivasPorModulo.map(([modulo, lista]) => (
              <fieldset key={modulo} className="grupo-modulo">
                <legend>{modulo}</legend>
                {lista.map((e) => (
                  <span key={e.descricao}>
                    {e.descricao}
                    <small className="campo-ajuda"> — {e.origem}</small>
                  </span>
                ))}
              </fieldset>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
