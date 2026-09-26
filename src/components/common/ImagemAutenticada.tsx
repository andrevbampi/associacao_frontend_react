import { useEffect, useState, type ReactNode } from "react";
import { api } from "../../services/api";

interface ImagemAutenticadaProps {
  src: string | null;
  alt: string;
  className?: string;
  placeholder?: ReactNode;
}

/**
 * <img> para endpoints protegidos por JWT (foto de pessoa/produto, etc.).
 * Uma tag <img> comum não manda o header Authorization, então a imagem
 * é buscada via axios (que já anexa o token) e convertida em object URL.
 */
export function ImagemAutenticada({ src, alt, className, placeholder = null }: ImagemAutenticadaProps) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!src) {
      setUrl(null);
      return;
    }

    let objectUrl: string | null = null;
    let cancelado = false;

    api
      .get(src, { responseType: "blob" })
      .then((resposta) => {
        if (cancelado) return;
        objectUrl = URL.createObjectURL(resposta.data);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelado) setUrl(null);
      });

    return () => {
      cancelado = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (!url) return <>{placeholder}</>;
  return <img src={url} alt={alt} className={className} />;
}
