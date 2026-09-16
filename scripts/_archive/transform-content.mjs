// Разовый трансформ: переводит секции сайта на useContent() (данные из админки).
import fs from "fs";
import path from "path";

const DIR = "D:/sfera/components/site";

const jobs = [
  { f: "Footer.tsx", fn: "Footer", strip: ["siteConfig", "footerLinks"], pats: ["siteConfig.", "footerLinks."] },
  { f: "Header.tsx", fn: "Header", strip: ["navItems", "siteConfig"], pats: ["navItems.", "siteConfig."] },
  { f: "EnrollmentForm.tsx", fn: "EnrollmentForm", strip: ["enrollmentInterests", "siteConfig"], pats: ["enrollmentInterests.", "siteConfig."] },
  { f: "About.tsx", fn: "About", strip: ["aboutContent"], pats: ["aboutContent."] },
  { f: "Gallery.tsx", fn: "Gallery", strip: ["gallery"], pats: ["gallery."] },
  { f: "CTA.tsx", fn: "CTA", strip: ["siteConfig"], pats: ["siteConfig."] },
  { f: "Hero.tsx", fn: "Hero", strip: ["heroContent", "programs"], pats: ["heroContent.", "programs."] },
  { f: "MobileCTA.tsx", fn: "MobileCTA", strip: ["siteConfig"], pats: ["siteConfig."] },
  { f: "Events.tsx", fn: "Events", strip: ["events", "siteConfig"], pats: ["events.", "siteConfig."] },
  { f: "LearningExperience.tsx", fn: "LearningExperience", strip: ["learningExperience"], pats: ["learningExperience."] },
  { f: "Contact.tsx", fn: "Contact", strip: ["siteConfig"], pats: ["siteConfig."] },
  { f: "ParentNavigator.tsx", fn: "ParentNavigator", strip: ["parentOptions", "programs"], pats: ["parentOptions.", "programs."] },
  { f: "Programs.tsx", fn: "Programs", strip: ["programs"], pats: ["programs."] },
  { f: "Reviews.tsx", fn: "Reviews", strip: ["reviews", "siteConfig"], pats: ["reviews.", "siteConfig."] },
  { f: "Teachers.tsx", fn: "Teachers", strip: ["teachers", "siteConfig"], pats: ["teachers.", "siteConfig."] },
];

for (const job of jobs) {
  const file = path.join(DIR, job.f);
  let src = fs.readFileSync(file, "utf8");

  // 1. Заменяем использования ДО правки импортов
  for (const p of job.pats) {
    src = src.split(p).join("content." + p);
  }

  // 2. Переписываем строку импорта из "@/data/site"
  const importRe = /import \{([^}]*)\} from "@\/data\/site";\n?/;
  const m = src.match(importRe);
  if (m) {
    const names = m[1].split(",").map((s) => s.trim()).filter(Boolean);
    const types = names.filter((n) => n.startsWith("type "));
    const values = names.filter((n) => !n.startsWith("type ") && !job.strip.includes(n));
    const keep = [...types, ...values.map((v) => v.replace(/^type /, ""))];
    let newImports = 'import { useContent } from "./ContentContext";\n';
    if (keep.length > 0) {
      newImports += `import { ${keep.join(", ")} } from "@/data/site";\n`;
    }
    src = src.replace(importRe, newImports);
  }

  // 3. Вставляем хук первой строкой компонента
  const fnRe = new RegExp(`(export function ${job.fn}\\(\\) \\{\\n)`);
  if (!fnRe.test(src)) {
    console.error("!! hook anchor not found in", job.f);
  } else {
    src = src.replace(fnRe, `$1  const content = useContent();\n`);
  }

  fs.writeFileSync(file, src, "utf8");
  console.log("OK", job.f);
}
console.log("done");
