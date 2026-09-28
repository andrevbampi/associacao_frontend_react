import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Tema = "light" | "dark";

const CHAVE_ARMAZENAMENTO = "associacao:tema";

interface ThemeContextValue {
  tema: Tema;
  alternarTema: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function temaInicial(): Tema {
  try {
    const salvo = localStorage.getItem(CHAVE_ARMAZENAMENTO);
    if (salvo === "light" || salvo === "dark") return salvo;
  } catch {
    // localStorage indisponível (modo privado, navegador bloqueando etc.) —
    // cai no padrão do sistema operacional/navegador do usuário.
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// Preferência por usuário (guardada no navegador, não é um parâmetro do
// sistema): cada pessoa escolhe o tema pra si mesma.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(temaInicial);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", tema);
    try {
      localStorage.setItem(CHAVE_ARMAZENAMENTO, tema);
    } catch {
      // Sem storage disponível: o tema ainda funciona nesta sessão, só não
      // persiste pra próxima visita.
    }
  }, [tema]);

  function alternarTema() {
    setTema((atual) => (atual === "dark" ? "light" : "dark"));
  }

  return <ThemeContext.Provider value={{ tema, alternarTema }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme precisa ser usado dentro de um ThemeProvider.");
  }
  return context;
}
