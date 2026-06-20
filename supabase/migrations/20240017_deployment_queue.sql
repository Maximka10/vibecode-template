create table if not exists deployment_queue (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','building','deploying','deployed','failed','cancelled')),
  deploy_url text,
  preview_url text,
  vercel_deployment_id text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists deployment_logs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references deployment_queue(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

alter table deployment_queue enable row level security;
alter table deployment_logs enable row level security;

create policy "admin_all_deployment_queue" on deployment_queue
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "admin_all_deployment_logs" on deployment_logs
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create index if not exists deployment_queue_order_id_idx on deployment_queue(order_id);
create index if not exists deployment_queue_status_idx on deployment_queue(status);
create index if not exists deployment_logs_job_id_idx on deployment_logs(job_id);
