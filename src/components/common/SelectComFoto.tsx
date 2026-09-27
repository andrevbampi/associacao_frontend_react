import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";

export interface OpcaoComFoto {
  value: number;
  label: string;
  icone: ReactNode;
}

interface SelectComFotoProps {
  id?: string;
  value: number | "";
  onChange: (value: number | "") => void;
  opcoes: OpcaoComFoto[];
  placeholder?: string;
  textoVazio?: string;
  disabled?: boolean;
}

const CONSULTA_MOBILE = "(max-width: 640px)";

// Combobox customizado (não é um <select> nativo) porque um <option> não pode
// conter uma <img>: é a única forma de mostrar a foto/ícone de cada pessoa ou
// produto dentro da lista de opções, junto com um campo de busca por nome.
//
// No celular vira uma folha deslizando de baixo (bottom sheet) em vez de um
// painel ancorado no campo: um dropdown comum nessa largura ou fica cortado
// perto da borda da tela, ou obriga itens pequenos demais para o dedo. A
// folha ocupa a largura toda, com itens grandes e busca fixa no topo.
export function SelectComFoto({ id, value, onChange, opcoes, placeholder = "Selecione...", textoVazio, disabled }: SelectComFotoProps) {
  const ehMobile = useMediaQuery(CONSULTA_MOBILE);
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [abrirParaCima, setAbrirParaCima] = useState(false);
  const raizRef = useRef<HTMLDivElement>(null);

  const selecionada = useMemo(() => opcoes.find((o) => o.value === value) ?? null, [opcoes, value]);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return opcoes;
    return opcoes.filter((o) => o.label.toLowerCase().includes(termo));
  }, [opcoes, busca]);

  function fechar() {
    setAberto(false);
    setBusca("");
  }

  useEffect(() => {
    if (!aberto || ehMobile) return;
    // No modo folha (mobile) o fechamento é só pelo botão/backdrop — clique
    // "fora" não se aplica porque a folha cobre a tela toda.
    function handleClickFora(event: MouseEvent) {
      if (raizRef.current && !raizRef.current.contains(event.target as Node)) {
        fechar();
      }
    }
    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape") fechar();
    }
    document.addEventListener("mousedown", handleClickFora);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickFora);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [aberto, ehMobile]);

  useEffect(() => {
    if (!aberto || !ehMobile) return;
    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape") fechar();
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [aberto, ehMobile]);

  // Trava o scroll da página por trás enquanto a folha mobile está aberta.
  useEffect(() => {
    if (!aberto || !ehMobile) return;
    const overflowOriginal = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflowOriginal;
    };
  }, [aberto, ehMobile]);

  function escolher(novoValor: number | "") {
    onChange(novoValor);
    fechar();
  }

  // Em telas pequenas (mas fora do modo folha, ex.: tablet) o campo pode
  // estar perto do fim da viewport; sem isso o painel abriria pra baixo e
  // ficaria cortado. Estima a altura do painel e decide o lado com base no
  // espaço realmente disponível.
  function alternarAberto() {
    if (!aberto && !ehMobile && raizRef.current) {
      const retangulo = raizRef.current.getBoundingClientRect();
      const alturaEstimadaPainel = 280;
      const espacoAbaixo = window.innerHeight - retangulo.bottom;
      const espacoAcima = retangulo.top;
      setAbrirParaCima(espacoAbaixo < alturaEstimadaPainel && espacoAcima > espacoAbaixo);
    }
    setAberto((atual) => !atual);
  }

  const listaOpcoes = (
    <ul className="select-foto-lista">
      {textoVazio !== undefined && (
        <li>
          <button type="button" className="select-foto-opcao" onClick={() => escolher("")}>
            <span className="select-foto-placeholder">{textoVazio}</span>
          </button>
        </li>
      )}
      {filtradas.length === 0 ? (
        <li className="select-foto-vazio">Nenhum resultado encontrado.</li>
      ) : (
        filtradas.map((opcao) => (
          <li key={opcao.value}>
            <button
              type="button"
              className={`select-foto-opcao ${opcao.value === value ? "select-foto-opcao-ativa" : ""}`}
              onClick={() => escolher(opcao.value)}
            >
              {opcao.icone}
              {opcao.label}
            </button>
          </li>
        ))
      )}
    </ul>
  );

  return (
    <div className="select-foto" ref={raizRef}>
      <button type="button" id={id} className="select-foto-gatilho" disabled={disabled} onClick={alternarAberto}>
        {selecionada ? (
          <span className="select-foto-selecionada">
            {selecionada.icone}
            {selecionada.label}
          </span>
        ) : (
          <span className="select-foto-placeholder">{textoVazio ?? placeholder}</span>
        )}
        <span className="select-foto-seta">▾</span>
      </button>

      {aberto &&
        !disabled &&
        (ehMobile ? (
          <div className="select-foto-overlay" onClick={fechar}>
            <div className="select-foto-folha" onClick={(e) => e.stopPropagation()}>
              <div className="select-foto-folha-alca" />
              <div className="select-foto-folha-cabecalho">
                <input
                  type="text"
                  className="select-foto-busca"
                  placeholder="Buscar..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  autoFocus
                />
                <button type="button" className="select-foto-folha-fechar" onClick={fechar} aria-label="Fechar">
                  ✕
                </button>
              </div>
              <div className="select-foto-folha-lista">{listaOpcoes}</div>
            </div>
          </div>
        ) : (
          <div className={`select-foto-painel ${abrirParaCima ? "select-foto-painel-cima" : ""}`}>
            <input
              type="text"
              className="select-foto-busca"
              placeholder="Buscar..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              autoFocus
            />
            {listaOpcoes}
          </div>
        ))}
    </div>
  );
}
