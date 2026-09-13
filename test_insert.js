const { createClient } = require("@supabase/supabase-js");

const url = "https://itoztajspvplpemwkhcl.supabase.co";
const anon = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0b3p0YWpzcHZwbHBlbXdraGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NDM3ODcsImV4cCI6MjEwNDUxOTc4N30.Qi7DRR-OPIfl1mHrWa2Ze5BsJLyG2FwYcT18VapHhLE";
const service = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0b3p0YWpzcHZwbHBlbXdraGNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODk0Mzc4NywiZXhwIjoyMTA0NTE5Nzg3fQ.vSoOsivc7o8nTLXRrr7BsmwI_bxR_jx4KXjgY5lAKlU";

const anonClient = createClient(url, anon);
const adminClient = createClient(url, service);

(async () => {
  // 1) Insert as the public/anon key — exactly what the form does
  const { data, error } = await anonClient
    .from("enrollments")
    .insert({
      parent_name: "Тест Тестов",
      child_age: "7 лет",
      interest: "Подготовка к школе",
      interest_label: "Подготовка к школе",
      phone: "+7 999 123-45-67",
      comment: "авто-проверка схемы",
    })
    .select();

  if (error) {
    console.log("INSERT ERROR:", JSON.stringify(error));
    process.exit(1);
  }
  console.log("INSERT OK -> id:", data[0].id);

  // 2) Clean up the test row using the service-role key (anon can't delete)
  const { error: delErr } = await adminClient
    .from("enrollments")
    .delete()
    .eq("id", data[0].id);
  if (delErr) {
    console.log("DELETE WARN:", JSON.stringify(delErr));
  } else {
    console.log("CLEANUP OK (test row removed)");
  }
  process.exit(0);
})();
