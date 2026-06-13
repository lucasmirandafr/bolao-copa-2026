# Bolão Copa do Mundo 2026

App web mobile-first para um bolão de Copa do Mundo: cada usuário cria uma conta,
dá palpites de placar para os jogos e acompanha um ranking geral de pontuação.

Stack: **Next.js (App Router) + TypeScript + Tailwind CSS + Supabase** (Auth + Postgres).

## Como configurar

### 1. Criar o projeto no Supabase
1. Crie um projeto em https://supabase.com.
2. No **SQL Editor**, rode o conteúdo de `supabase/migrations/0001_init.sql`.
   Isso cria as tabelas (`profiles`, `matches`, `predictions`), as políticas de
   segurança (RLS), o cálculo automático de pontos e a view `ranking`.
3. Edite `supabase/seed.sql` substituindo os jogos de exemplo pela lista real
   dos jogos da Copa do Mundo 2026 e rode-o no SQL Editor.

### 2. Configurar variáveis de ambiente
Copie `.env.local.example` para `.env.local` e preencha com os dados do seu
projeto Supabase (Project Settings → API):

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

### 3. Rodar o app

```bash
npm install
npm run dev
```

Abra http://localhost:3000 — o app já está pronto para uso em mobile (teste
pelo modo responsivo do navegador ou direto pelo celular).

## Fluxo do app
- **/cadastro** e **/login**: criação de conta e autenticação (e-mail/senha).
- **/** (Jogos): lista de jogos agrupados por fase, com campos para o placar
  do palpite. Os palpites ficam bloqueados depois que o jogo começa.
- **/ranking**: classificação geral por pontos.
- **/perfil**: dados do jogador, posição no ranking e histórico de palpites.

## Atualizando resultados (administração)
Não há painel de administração: para registrar o resultado oficial de um jogo,
edite a linha correspondente na tabela `matches` pelo **Table Editor** do
Supabase, preenchendo `home_score`, `away_score` e mudando `status` para
`finished`. Um trigger no banco recalcula automaticamente os pontos de todos os
palpites daquele jogo.

### Regras de pontuação (padrão)
- Placar exato: **10 pontos**
- Resultado certo (vitória/empate/derrota), placar diferente: **5 pontos**
- Resultado errado: **0 pontos**

Para mudar essas regras, edite a função `calculate_points_for_match` em
`supabase/migrations/0001_init.sql` (e rode a alteração no SQL Editor do seu
projeto).
