import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

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

// Combobox customizado (não é um <select> nativo) porque um <option> não pode
// conter uma <img>: é a única forma de mostrar a foto/ícone de cada pessoa ou
// produto dentro da lista de opções, junto com um campo de busca por nome.
export function SelectComFoto({ id, value, onChange, opcoes, placeholder = "Selecione...", textoVazio, disabled }: SelectComFotoProps) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const raizRef = useRef<HTMLDivElement>(null);

  const selecionada = useMemo(() => opcoes.find((o) => o.value === value) ?? null, [opcoes, value]);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return opcoes;
    return opcoes.filter((o) => o.label.toLowerCase().includes(termo));
  }, [opcoes, busca]);

  useEffect(() => {
    if (!aberto) return;
    function handleClickFora(event: MouseEvent) {
      if (raizRef.current && !raizRef.current.contains(event.target as Node)) {
        setAberto(false);
        setBusca("");
      }
    }
    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAberto(false);
        setBusca("");
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickFora);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [aberto]);

  function escolher(novoValor: number | "") {
    onChange(novoValor);
    setAberto(false);
    setBusca("");
  }

  return (
    <div className="select-foto" ref={raizRef}>
      <button
        type="button"
        id={id}
        className="select-foto-gatilho"
        disabled={disabled}
        onClick={() => setAberto((atual) => !atual)}
      >
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

      {aberto && !disabled && (
        <div className="select-foto-painel">
          <input
            type="text"
            className="select-foto-busca"
            placeholder="Buscar..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            autoFocus
          />
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
        </div>
      )}
    </div>
  );
}
