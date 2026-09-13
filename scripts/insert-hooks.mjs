// Вставляет хук useContent в компоненты с CRLF-окончаниями (идемпотентно).
import fs from "fs";
import path from "path";

const DIR = "D:/sfera/components/site";
const fns = ["Footer", "Header", "About", "Gallery", "CTA", "MobileCTA", "Events", "LearningExperience", "Contact", "ParentNavigator", "Programs", "Reviews", "Teachers"];

for (const fn of fns) {
  const file = path.join(DIR, fn + ".tsx");
  let src = fs.readFileSync(file, "utf8");
  if (src.includes("const content = useContent();")) {
    console.log("skip (уже есть):", fn);
    continue;
  }
  const re = new RegExp(`(export function ${fn}\\(\\) \\{\\r?\\n)`);
  if (!re.test(src)) {
    console.error("!! anchor not found:", fn);
    continue;
  }
  src = src.replace(re, "$1  const content = useContent();\r\n");
  fs.writeFileSync(file, src, "utf8");
  console.log("OK", fn);
}
console.log("done");
