alter table orders add column if not exists is_portfolio boolean not null default false;
alter table orders add column if not exists portfolio_industry text;
alter table orders add column if not exists portfolio_description text;
alter table orders add column if not exists portfolio_screenshot_url text;

alter table orders add column if not exists lead_status text not null default 'new'
  check (lead_status in ('new','contacted','qualified','proposal_sent','won','lost'));
