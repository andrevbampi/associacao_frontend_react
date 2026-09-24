export interface StatusMembro {
  id: number;
  descricao: string;
}

export type StatusMembroFormData = Omit<StatusMembro, "id"> & { id?: number };

export const statusMembroVazio: StatusMembroFormData = {
  descricao: "",
};
