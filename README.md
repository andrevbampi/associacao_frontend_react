# Associação — Front-end (React)

Front-end em React + TypeScript para o back-end Spring Boot do sistema de gestão de associações. Consome os CRUDs de Pessoa, Usuário, Membro e Status de Membro.

## Stack

- [Vite](https://vitejs.dev/) + React 19 + TypeScript
- [React Router](https://reactrouter.com/) para navegação
- [Axios](https://axios-http.com/) para chamadas HTTP

## Estrutura

```
src/
  components/
    common/     # DataTable, ConfirmDialog, Loading, Alert, Toast, PageHeader
    layout/     # Layout com menu lateral/topo responsivo
  context/      # ToastContext (mensagens de sucesso/erro)
  pages/        # Uma pasta por entidade: lista + formulário (criar/editar)
  services/     # Cliente axios (api.ts) + um service por entidade
  types/        # Tipos TS espelhando os DTOs do back-end
  utils/        # Formatação de datas
```

## Como rodar

Pré-requisitos: Node.js 20+ e o back-end Spring Boot rodando (repositório `associacao`).

```bash
npm install
npm run dev
```

A aplicação sobe em **http://localhost:4200** — porta fixada em `vite.config.ts` para bater com o `CorsConfig` do back-end, que libera `http://localhost:4200`. Se quiser usar outra porta, ajuste os dois lados.

A URL da API vem de `VITE_API_URL` (arquivo `.env`, padrão `http://localhost:8080/api`). Copie `.env.example` para `.env` e ajuste se o back-end rodar em outro endereço.

```bash
npm run build     # build de produção em dist/
npm run preview   # serve o build localmente
npm run lint       # oxlint
```

## Funcionalidades

- Listagem em tabela, criação e edição de **Pessoas**, **Usuários**, **Membros** e **Status de Membro**.
- Confirmação antes de excluir qualquer registro.
- Estados de carregamento e mensagens de erro/sucesso amigáveis (as mensagens de regra de negócio do back-end, como "Já existe um usuário com o login X", aparecem diretamente na tela).
- Layout responsivo, com menu lateral no desktop e menu retrátil no mobile.
