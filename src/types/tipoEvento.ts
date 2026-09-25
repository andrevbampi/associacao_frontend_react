export interface TipoEvento {
  id: number;
  descricao: string;
}

export type TipoEventoFormData = Omit<TipoEvento, "id"> & { id?: number };

export const tipoEventoVazio: TipoEventoFormData = {
  descricao: "",
};
