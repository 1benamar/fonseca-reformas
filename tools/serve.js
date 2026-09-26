/* Servidor estatico minimo para previsualizar la web en local.
   Solo herramienta de desarrollo: no hace falta subirlo al hosting.
   Uso:  node tools/serve.js         ->  http://localhost:8765            */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PORT = process.argv[2] || process.env.PORT || 8765;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
  ".webm": "video/webm",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon"
};

http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split("?")[0]);
  if (rel.endsWith("/")) rel += "index.html";

  // Los .php solo funcionan en el hosting. Aquí se simulan para probar la
  // web: el formulario responde como si hubiera ido bien (o falla si el
  // nombre es "fallo" o "limite") y el contador no hace nada.
  if (rel.endsWith(".php")) {
    if (req.method !== "POST") {
      res.writeHead(405, { "Content-Type": "application/json; charset=utf-8" }).end('{"ok":false,"error":"metodo"}');
      return;
    }
    const trozos = [];
    req.on("data", (t) => trozos.push(t));
    req.on("end", () => {
      const cuerpo = Buffer.concat(trozos).toString("utf8");
      if (rel === "/enviar.php") {
        console.log("[simulación] formulario recibido:\n" + cuerpo.replace(/-{6,}\S*\r?\n/g, "").slice(0, 900));
        const nombre = (cuerpo.match(/name="name"\r?\n\r?\n([^\r\n]*)/) || [])[1] || "";
        const [codigo, json] =
          nombre === "fallo" ? [502, '{"ok":false,"error":"envio"}'] :
          nombre === "limite" ? [429, '{"ok":false,"error":"limite"}'] :
          [200, '{"ok":true}'];
        setTimeout(() => res.writeHead(codigo, { "Content-Type": "application/json; charset=utf-8" }).end(json), 700);
      } else {
        res.writeHead(204).end();
      }
    });
    return;
  }

  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT)) {
    res.writeHead(403).end("Forbidden");
    return;
  }
  // Como Apache: /ca lleva a /ca/
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    res.writeHead(301, { Location: rel + "/" }).end();
    return;
  }

  fs.readFile(file, (err, buf) => {
    if (err) {
      // Igual que en el hosting: lo que no existe muestra la 404 de la web.
      fs.readFile(path.join(ROOT, "404.html"), (e2, pagina) => {
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" }).end(e2 ? "404 " + rel : pagina);
      });
      return;
    }
    res.writeHead(200, {
      "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store"
    }).end(buf);
  });
}).listen(PORT, () => console.log("Preview en http://localhost:" + PORT));
