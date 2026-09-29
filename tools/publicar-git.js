#!/usr/bin/env node
/* Publica la web en la rama "web" de GitHub. Hostinger la tiene conectada
   con despliegue automático: cada envío a esa rama se copia a public_html.

   1. Genera la versión optimizada (tools/preparar-subida.js).
   2. Copia ese resultado, tal cual, a una carpeta de trabajo de la rama "web".
   3. Hace un commit y lo envía a GitHub.

   inc/ajustes.php nunca entra en la rama: lleva la clave del panel y el
   repositorio es público. Vive solo en el servidor, fuera del control de git,
   y el despliegue no lo toca.

   Uso: node tools/publicar-git.js ["mensaje del commit"] */
"use strict";
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const RAIZ = path.resolve(__dirname, "..");
const WEB = path.join(require("os").homedir(), "Desktop", "fonseca-web-publicar");
const TRABAJO = path.join(RAIZ, ".web");
const RAMA = "web";
const sh = (cmd, cwd = RAIZ) => execSync(cmd, { cwd, stdio: ["ignore", "pipe", "inherit"] }).toString().trim();

const mensaje = process.argv[2] || "Publicar: " + sh("git log -1 --format=%s");

execSync("node tools/preparar-subida.js", { cwd: RAIZ, stdio: "inherit" });

// Carpeta de trabajo de la rama "web" (se crea la primera vez)
if (!fs.existsSync(TRABAJO)) {
  const existe = sh(`git ls-remote --heads origin ${RAMA}`);
  if (existe) {
    sh(`git fetch origin ${RAMA}:${RAMA}`);
    sh(`git worktree add "${TRABAJO}" ${RAMA}`);
  } else {
    sh(`git worktree add --detach "${TRABAJO}"`);
    sh(`git checkout --orphan ${RAMA}`, TRABAJO);
  }
}

// Vaciar (menos .git) y copiar la versión optimizada
for (const n of fs.readdirSync(TRABAJO)) if (n !== ".git") fs.rmSync(path.join(TRABAJO, n), { recursive: true, force: true });
fs.cpSync(WEB, TRABAJO, { recursive: true, filter: s => path.relative(WEB, s).split(path.sep).join("/") !== "inc/ajustes.php" });
fs.writeFileSync(path.join(TRABAJO, ".gitignore"), "# Clave del panel: solo en el servidor\ninc/ajustes.php\n");

sh("git add -A", TRABAJO);
if (!sh("git status --porcelain", TRABAJO)) { console.log("\nNada nuevo que publicar."); process.exit(0); }
execSync(`git commit -q -m ${JSON.stringify(mensaje)}`, { cwd: TRABAJO, stdio: "inherit" });
execSync(`git push -q origin ${RAMA}`, { cwd: TRABAJO, stdio: "inherit" });
console.log(`\nEnviado a GitHub (rama ${RAMA}). Hostinger lo publica en unos segundos.`);
