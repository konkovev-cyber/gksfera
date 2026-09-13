import pg from "pg";
const c = new pg.Client({ connectionString: process.env.PGURL });
await c.connect();
const r = await c.query(
  "select column_name,data_type from information_schema.columns where table_name='programs' order by ordinal_position"
);
console.log(r.rows.map((x) => x.column_name + ":" + x.data_type).join(", "));
const s = await c.query("select * from programs order by sort_order nulls last limit 1");
console.log(JSON.stringify(s.rows, null, 1).slice(0, 900));
await c.end();
