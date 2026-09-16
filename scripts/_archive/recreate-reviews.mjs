import pg from "pg";
const c = new pg.Client({ connectionString: process.env.PGURL });
await c.connect();
await c.query("DROP TABLE IF EXISTS reviews");
await c.query(`create table reviews (
  id bigint generated always as identity primary key,
  author text not null default '',
  source text default '',
  source_url text default '',
  text text not null default '',
  child_info text default '',
  visible boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
)`);
const r = await c.query("select column_name from information_schema.columns where table_name='reviews' order by ordinal_position");
console.log("columns:", r.rows.map(x => x.column_name).join(", "));
await c.end();
