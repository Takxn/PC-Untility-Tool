<div align="center">
  <img src="icon/logo.png" alt="PC Utility Tool Logo" width="120" />
</div>

# 💻 PC Utility Tool

**Desktop-Anwendung für Systemüberwachung, Logs, Einstellungen und automatische Updates.**

[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)](https://www.electronjs.org/)
[![Electron](https://img.shields.io/badge/Electron-28.x-2B2E3B?logo=electron)](https://www.electronjs.org/)

---

## ✨ Übersicht

PC Utility Tool ist eine schlanke **Electron-App** mit modernem, dunklem Design und roten Akzenten. Sie zeigt Systeminformationen, verwaltet Logs in einer lokalen Datenbank und unterstützt automatische Updates – ideal für den schnellen Überblick über deinen Rechner.

---

## 🚀 Funktionen

| Bereich | Beschreibung |
|--------|--------------|
| **🖥️ Systeminfos** | Betriebssystem, CPU, Arbeitsspeicher (mit Fortschrittsbalken), Festplatten, Netzwerk und System-Hersteller – basierend auf `systeminformation`. |
| **📋 Logs** | Alle App-Ereignisse werden in **SQLite** gespeichert. Logs anzeigen, durchsuchen und bei Bedarf leeren. |
| **⚙️ Einstellungen** | Design (Dark/Light), maximale Log-Anzahl, Start-Optionen. Speicherung in SQLite/JSON. |
| **🔄 Update** | Prüfung auf neue Versionen, Download und Installation mit einem Klick über **electron-updater**. |

Zusätzlich: **Partikel-Hintergrund**, **sanfte Animationen** und **angepasste Scrollbars** für ein angenehmes Nutzererlebnis.

---

## 🛠️ Tech-Stack

- **Electron** – Cross-Platform-Desktop-App
- **Node.js** – Backend und IPC
- **SQLite** (sql.js) – Logs und Einstellungen (keine native Kompilierung nötig)
- **systeminformation** – Hardware- und OS-Infos
- **electron-updater** – Update-Funktion
- **HTML/CSS/JS** – UI mit Dark/Light-Theme

---

## 📦 Installation & Start

### Voraussetzungen

- [Node.js](https://nodejs.org/) (z. B. LTS-Version)
- npm (wird mit Node.js mitgeliefert)

### Schritte

```bash
# Repository klonen (oder Ordner öffnen)
cd "Desktop Tool"

# Abhängigkeiten installieren
npm install

# Anwendung starten
npm start
```

Die Datenbank und Einstellungen liegen im App-Datenordner (z. B. unter Windows: `%APPDATA%\pc-utility-tool\`).

---

## 📤 Build (Windows)

Installierbare Version bauen:

```bash
npm run build
# oder explizit für Windows
npm run build:win
```

Die Ausgabe liegt im Ordner **`dist/`** (z. B. `.exe` und NSIS-Installer).

---

## 📁 Projektstruktur

```
Desktop Tool/
├── icon/
│   ├── logo.png          # App-Logo (Fenster & GitHub)
│   └── logo.ico          # Windows-Icon
├── src/
│   ├── index.html        # Hauptseite der App
│   ├── styles.css       # Layout, Dark/Light-Theme, Animationen
│   └── renderer.js       # UI-Logik, Tabs, Partikel, API-Aufrufe
├── main.js               # Electron Main Process, Fenster, IPC
├── preload.js            # Sichere Brücke (contextBridge) zum Renderer
├── database.js           # SQLite (sql.js): Logs & Einstellungen
├── systeminfo.js         # Systeminfos (systeminformation)
├── updater.js            # Update-Check und -Installation
├── package.json
└── README.md
```

---

## 📄 Lizenz

Dieses Projekt steht unter der **MIT-Lizenz**. Siehe [LICENSE](LICENSE) für Details.

---

<div align="center">
  <sub>Mit ❤️ und Electron gebaut</sub>
</div>
<img width="2880" height="1824" alt="image" src="https://github.com/user-attachments/assets/2eb0762a-1b21-4e2a-9be3-d110ee0dcdb4" />

<img width="2880" height="1824" alt="image" src="https://github.com/user-attachments/assets/a7809d59-f4aa-4f70-9b38-a9fcc28fe586" />
