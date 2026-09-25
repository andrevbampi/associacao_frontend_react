# Associação — Front-end (React)

Front-end em React + TypeScript para o back-end Spring Boot do sistema de gestão de associações. Consome os CRUDs de Pessoa, Usuário, Membro, Status de Membro, Tipo de Evento e Produto, o histórico de membros e o módulo de Comandas (vendas), além do login/autenticação JWT.

## Stack

- [Vite](https://vitejs.dev/) + React 19 + TypeScript
- [React Router](https://reactrouter.com/) para navegação
- [Axios](https://axios-http.com/) para chamadas HTTP

## Estrutura

```
src/
  components/
    auth/       # ProtectedRoute (guarda de rotas autenticadas)
    common/     # DataTable, ConfirmDialog, Loading, Alert, Toast, PageHeader
    layout/     # Layout com menu lateral/topo responsivo
  context/      # AuthContext (sessão/token) e ToastContext (mensagens de sucesso/erro)
  pages/        # Uma pasta por entidade: lista + formulário (criar/editar)
                # membro/ inclui MembroDetailPage (histórico em linha do tempo)
                # comanda/ inclui a tela tipo "frente de caixa"
  services/     # Cliente axios (api.ts, com interceptors de token) + um service por entidade
  types/        # Tipos TS espelhando os DTOs do back-end
  utils/        # Formatação de datas/moeda, storage do token, evento de sessão expirada
```

## Como rodar

Pré-requisitos: Node.js 20+ e o back-end Spring Boot rodando (repositório `associacao`).

```bash
npm install
npm run dev
```

A aplicação sobe em **http://localhost:4200** — porta fixada em `vite.config.ts` para bater com o CORS do back-end (`SecurityConfig`), que libera `http://localhost:4200`. Se quiser usar outra porta, ajuste os dois lados.

A URL da API vem de `VITE_API_URL` (arquivo `.env`, padrão `http://localhost:8080/api`). Copie `.env.example` para `.env` e ajuste se o back-end rodar em outro endereço.

```bash
npm run build     # build de produção em dist/
npm run preview   # serve o build localmente
npm run lint       # oxlint
```

## Autenticação

Tela de login em `/login`. Após autenticar, o token JWT fica em `localStorage` (`utils/authStorage.ts`) e é anexado automaticamente em toda chamada à API (interceptor em `services/api.ts`). Todas as rotas de cadastro ficam atrás de `ProtectedRoute`; sem sessão válida, o usuário é redirecionado para o login. Um 401 em qualquer chamada (token expirado/inválido) encerra a sessão automaticamente e mostra um aviso amigável.

## Funcionalidades

- CRUD completo de **Pessoas**, **Usuários**, **Membros**, **Status de Membro**, **Tipos de Evento** e **Produtos**.
- Tela de detalhe do **Membro** com linha do tempo do histórico (adicionar, editar, excluir eventos).
- Módulo de **Comandas**: abrir para uma pessoa cadastrada ou visitante, adicionar/editar/remover itens (preço de membro aplicado automaticamente quando o cliente é membro ativo), fechar com ou sem pagamento, cancelar, listar com filtro por status.
- Confirmação antes de excluir qualquer registro.
- Estados de carregamento e mensagens de erro/sucesso amigáveis (as mensagens de regra de negócio do back-end aparecem diretamente na tela).
- Layout responsivo, com menu lateral no desktop e menu retrátil no mobile.
