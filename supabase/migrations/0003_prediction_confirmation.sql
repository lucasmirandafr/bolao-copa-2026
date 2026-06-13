-- Permite salvar o palpite como rascunho e confirmá-lo depois.
-- Se o jogo começar e o palpite não tiver sido confirmado, o valor salvo
-- continua sendo usado normalmente para a pontuação (a coluna "confirmed"
-- é apenas informativa para a interface).

alter table public.predictions
  add column confirmed boolean not null default false;
