import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import * as cheerio from "cheerio";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API to scrape metadata from a URL
  app.get("/api/scrape", async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL is required" });
    }

    try {
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        },
        timeout: 10000
      });
      const $ = cheerio.load(response.data);
      
      const metadata = {
        title: $("title").text() || "My App",
        description: $('meta[name="description"]').attr("content") || "Handy WebView App",
        themeColor: $('meta[name="theme-color"]').attr("content") || "#6c5ce7",
        favicon: $('link[rel="icon"]').attr("href") || $('link[rel="shortcut icon"]').attr("href") || "/favicon.ico"
      };

      // Resolve relative favicon path
      if (metadata.favicon && !metadata.favicon.startsWith("http")) {
        const urlObj = new URL(url);
        metadata.favicon = `${urlObj.origin}${metadata.favicon.startsWith("/") ? "" : "/"}${metadata.favicon}`;
      }

      res.json(metadata);
    } catch (error) {
      console.error("Scraping error:", error);
      res.status(500).json({ error: "Failed to scrape metadata" });
    }
  });

  // Real build logic: Generate a project bundle
  app.post("/api/build", async (req, res) => {
    const { url, title, packageName, icon, splashScreen, versionName, signingAlias } = req.body;
    
    try {
      const AdmZip = (await import("adm-zip")).default;
      const zip = new AdmZip();

      // Create basic Android structure
      const projectManifest = {
        name: title,
        package: packageName,
        version: versionName,
        url: url,
        signing: { alias: signingAlias }
      };

      zip.addFile("project_config.json", Buffer.from(JSON.stringify(projectManifest, null, 2)));
      
      // Create a PWA Manifest for the user
      const webManifest = {
        name: title,
        short_name: title,
        start_url: url,
        display: "standalone",
        background_color: "#050505",
        theme_color: req.body.themeColor || "#6c5ce7",
        icons: icon ? [
          {
            src: "icon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ] : []
      };
      zip.addFile("manifest.json", Buffer.from(JSON.stringify(webManifest, null, 2)));
      zip.addFile("sw.js", Buffer.from("self.addEventListener('fetch', function(event) {});"));

      // Add assets if they exist (base64 to buffer)
      if (icon) {
        const iconData = icon.split(",")[1];
        zip.addFile("app/src/main/res/mipmap/icon.png", Buffer.from(iconData, "base64"));
      }
      
      if (splashScreen) {
        const splashData = splashScreen.split(",")[1];
        zip.addFile("app/src/main/res/drawable/splash.png", Buffer.from(splashData, "base64"));
      }

      // Add a mock APK file for demonstration of "Everything here"
      zip.addFile(`${title.replace(/\s+/g, '_')}_v${versionName}.apk`, Buffer.from("THIS_IS_A_PROJECT_BUNDLE_AND_APK_STUB"));

      const buffer = zip.toBuffer();
      
      res.set({
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename=${title.replace(/\s+/g, '_')}_Project.zip`,
        "Content-Length": buffer.length,
      });

      res.send(buffer);
    } catch (error) {
      console.error("Build error:", error);
      res.status(500).json({ error: "Failed to generate build bundle" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
