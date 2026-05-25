-- Add posicao column to tarefas table for drag/drop ordering
ALTER TABLE public.tarefas ADD COLUMN posicao INTEGER DEFAULT 0;

-- Create index for efficient ordering
CREATE INDEX idx_tarefas_posicao ON public.tarefas(user_id, posicao);

-- Initialize posicao values based on creation order
UPDATE public.tarefas
SET posicao = (
  SELECT COUNT(*)
  FROM public.tarefas t2
  WHERE t2.user_id = public.tarefas.user_id
    AND t2.created_at <= public.tarefas.created_at
) - 1
WHERE posicao = 0;
