(function () {
  // —— Partikel-Hintergrund ——
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const particles = [];
    const particleCount = 70;
    const connectionDist = 140;

    function getParticleColor() {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      if (isLight) return { r: 196, g: 30, b: 30, dotAlpha: 0.18, lineAlpha: 0.06 };
      return { r: 220, g: 38, b: 38, dotAlpha: 0.35, lineAlpha: 0.12 };
    }

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    }

    function initParticles() {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: 1.2 + Math.random() * 1.2,
        });
      }
    }

    function draw() {
      if (!ctx || !canvas.width) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        p.x = Math.max(0, Math.min(canvas.width, p.x));
        p.y = Math.max(0, Math.min(canvas.height, p.y));

        const color = getParticleColor();
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d = Math.hypot(dx, dy);
          if (d < connectionDist) {
            const alpha = (1 - d / connectionDist) * color.lineAlpha;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.dotAlpha})`;
        ctx.fill();
      }

      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    draw();
  }

  const panels = {
    system: document.getElementById('panel-system'),
    logs: document.getElementById('panel-logs'),
    settings: document.getElementById('panel-settings'),
    update: document.getElementById('panel-update'),
  };

  const tabs = document.querySelectorAll('.tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const id = tab.dataset.tab;
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      Object.keys(panels).forEach((key) => {
        const panel = panels[key];
        const isActive = key === id;
        panel.classList.toggle('active', isActive);
        panel.hidden = !isActive;
      });
      if (id === 'logs') loadLogs();
      if (id === 'settings') loadSettings();
    });
  });

  // —— Systeminfos ——
  async function renderSystemInfo() {
    const el = document.getElementById('system-content');
    el.innerHTML = '<div class="loading">Lade Systeminfos…</div>';
    try {
      const info = await window.api.system.getInfo();
      if (info.error) {
        el.innerHTML = `<div class="error-msg">${escapeHtml(info.error)}</div>`;
        return;
      }
      el.innerHTML = `
        <div class="card">
          <h3 class="card-title">Betriebssystem</h3>
          <div class="card-body">
            <dl>
              <dt>Plattform</dt><dd>${escapeHtml(info.os.platform)}</dd>
              <dt>Distribution</dt><dd>${escapeHtml(info.os.distro)}</dd>
              <dt>Release</dt><dd>${escapeHtml(info.os.release)}</dd>
              <dt>Architektur</dt><dd>${escapeHtml(info.os.arch)}</dd>
              <dt>Hostname</dt><dd>${escapeHtml(info.os.hostname)}</dd>
              <dt>Kernel</dt><dd>${escapeHtml(info.os.kernel || '–')}</dd>
            </dl>
          </div>
        </div>
        <div class="card">
          <h3 class="card-title">Prozessor</h3>
          <div class="card-body">
            <dl>
              <dt>Hersteller</dt><dd>${escapeHtml(info.cpu.manufacturer)}</dd>
              <dt>Modell</dt><dd>${escapeHtml(info.cpu.brand)}</dd>
              <dt>Kerne</dt><dd>${info.cpu.cores} (${info.cpu.physicalCores} physisch)</dd>
              <dt>Takt</dt><dd>${info.cpu.speed} GHz (max ${info.cpu.speedMax || '–'} GHz)</dd>
            </dl>
          </div>
        </div>
        <div class="card">
          <h3 class="card-title">Arbeitsspeicher</h3>
          <div class="card-body">
            <dl>
              <dt>Gesamt</dt><dd>${info.memory.totalGB} GB</dd>
              <dt>Belegt</dt><dd>${info.memory.usedGB} GB (${info.memory.usedPercent} %)</dd>
              <dt>Frei</dt><dd>${info.memory.freeGB} GB</dd>
            </dl>
            <div class="memory-bar-wrap">
              <div class="memory-bar" style="width:${info.memory.usedPercent}%"></div>
            </div>
          </div>
        </div>
        <div class="card">
          <h3 class="card-title">System</h3>
          <div class="card-body">
            <dl>
              <dt>Hersteller</dt><dd>${escapeHtml(info.system.manufacturer || '–')}</dd>
              <dt>Modell</dt><dd>${escapeHtml(info.system.model || '–')}</dd>
              <dt>UUID</dt><dd>${escapeHtml(info.system.uuid || '–')}</dd>
            </dl>
          </div>
        </div>
        ${(info.disks && info.disks.length) ? `
        <div class="card">
          <h3 class="card-title">Festplatten</h3>
          <div class="card-body">
            ${info.disks.map((d) => `
              <dl style="margin-bottom:10px">
                <dt>${escapeHtml(d.name)}</dt>
                <dd>${escapeHtml(d.type)} · ${d.size} · ${escapeHtml(d.vendor || '')}</dd>
              </dl>
            `).join('')}
          </div>
        </div>
        ` : ''}
        ${(info.network && info.network.length) ? `
        <div class="card">
          <h3 class="card-title">Netzwerk</h3>
          <div class="card-body">
            ${info.network.map((n) => `
              <dl style="margin-bottom:10px">
                <dt>${escapeHtml(n.iface)}</dt>
                <dd>${escapeHtml(n.ip4 || '–')} · ${escapeHtml(n.mac || '')}</dd>
              </dl>
            `).join('')}
          </div>
        </div>
        ` : ''}
      `;
    } catch (e) {
      el.innerHTML = `<div class="error-msg">${escapeHtml(e.message)}</div>`;
    }
  }

  document.getElementById('btn-refresh-system').addEventListener('click', renderSystemInfo);

  // —— Logs ——
  async function loadLogs() {
    const list = document.getElementById('logs-list');
    const countEl = document.getElementById('logs-count');
    try {
      const limit = parseInt(document.getElementById('setting-logs-limit').value, 10) || 200;
      const logs = await window.api.logs.get(limit);
      countEl.textContent = `${logs.length} Einträge`;
      if (logs.length === 0) {
        list.innerHTML = '<div class="logs-empty">Keine Log-Einträge.</div>';
        return;
      }
      list.innerHTML = logs.map((entry) => {
        const time = entry.created_at.replace('T', ' ').substring(0, 19);
        return `
          <div class="log-entry">
            <span class="time">${escapeHtml(time)}</span>
            <span class="level ${entry.level}">${escapeHtml(entry.level)}</span>
            <span class="msg">[${escapeHtml(entry.category)}] ${escapeHtml(entry.message)}</span>
          </div>
        `;
      }).join('');
    } catch (e) {
      list.innerHTML = `<div class="logs-empty error-msg">${escapeHtml(e.message)}</div>`;
    }
  }

  document.getElementById('btn-clear-logs').addEventListener('click', async () => {
    if (!confirm('Alle Logs wirklich löschen?')) return;
    await window.api.logs.clear();
    loadLogs();
  });

  // —— Einstellungen ——
  function loadSettings() {
    window.api.settings.get().then((s) => {
      const savedTheme = (s.theme && String(s.theme).toLowerCase()) === 'light' ? 'light' : 'dark';
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const theme = savedTheme || currentTheme || 'dark';
      document.getElementById('setting-theme').value = theme;
      if (s.logsLimit != null) document.getElementById('setting-logs-limit').value = s.logsLimit;
      if (s.startMinimized != null) document.getElementById('setting-start-minimized').checked = s.startMinimized;
      applyTheme(theme);
    }).catch(() => {
      const theme = document.documentElement.getAttribute('data-theme') || document.getElementById('setting-theme').value || 'dark';
      applyTheme(theme);
    });
  }

  function applyTheme(theme) {
    const value = (theme && String(theme).toLowerCase()) === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', value);
  }

  document.getElementById('setting-theme').addEventListener('change', (e) => {
    applyTheme(e.target.value);
  });

  document.getElementById('btn-save-settings').addEventListener('click', async () => {
    const themeRaw = document.getElementById('setting-theme').value;
    const theme = (themeRaw && String(themeRaw).toLowerCase()) === 'light' ? 'light' : 'dark';
    const logsLimit = parseInt(document.getElementById('setting-logs-limit').value, 10) || 200;
    const startMinimized = document.getElementById('setting-start-minimized').checked;
    await window.api.settings.set('theme', theme);
    await window.api.settings.set('logsLimit', logsLimit);
    await window.api.settings.set('startMinimized', startMinimized);
    applyTheme(theme);
    alert('Einstellungen gespeichert.');
  });

  // —— Update ——
  function setUpdateUI(state) {
    const msg = document.getElementById('update-message');
    const actions = document.getElementById('update-actions');
    const btnDownload = document.getElementById('btn-download-update');
    const btnInstall = document.getElementById('btn-install-update');
    if (state.checking) {
      msg.textContent = 'Suche nach Updates…';
      actions.hidden = true;
      return;
    }
    if (state.available) {
      msg.textContent = `Version ${state.version} ist verfügbar.`;
      actions.hidden = false;
      btnDownload.hidden = state.downloading || state.downloaded;
      btnInstall.hidden = !state.downloaded;
      if (state.downloading) msg.textContent = 'Update wird heruntergeladen…';
      if (state.downloaded) msg.textContent = 'Update heruntergeladen. App neu starten zum Installieren.';
      return;
    }
    if (state.error) {
      msg.textContent = 'Fehler: ' + state.error;
      actions.hidden = true;
      return;
    }
    msg.textContent = state.message || 'Keine Updates gefunden. Du bist auf dem neuesten Stand.';
    actions.hidden = true;
  }

  window.api.update.onAvailable((data) => setUpdateUI({ available: true, version: data?.version }));
  window.api.update.onDownloaded(() => setUpdateUI({ available: true, downloaded: true }));

  document.getElementById('btn-check-update').addEventListener('click', async () => {
    setUpdateUI({ checking: true });
    const result = await window.api.update.check();
    if (result.error) {
      setUpdateUI({ error: result.error });
      return;
    }
    if (result.updateAvailable) {
      setUpdateUI({
        available: true,
        version: result.version,
        message: `Version ${result.version} verfügbar.`,
      });
      document.getElementById('update-actions').hidden = false;
      document.getElementById('btn-download-update').hidden = false;
      document.getElementById('btn-install-update').hidden = true;
    } else {
      setUpdateUI({ message: result.message || 'Keine Updates gefunden.' });
    }
  });

  document.getElementById('btn-download-update').addEventListener('click', async () => {
    setUpdateUI({ available: true, downloading: true });
    document.getElementById('btn-download-update').hidden = true;
    await window.api.update.download();
  });

  document.getElementById('btn-install-update').addEventListener('click', () => {
    window.api.update.install();
  });

  // Version anzeigen
  window.api.app.getVersion().then((v) => {
    document.getElementById('current-version').textContent = v;
    const footer = document.querySelector('.footer span');
    if (footer) footer.textContent = `PC Utility Tool v${v}`;
  }).catch(() => {
    document.getElementById('current-version').textContent = '1.0.0';
  });

  // Init – Theme nur aus loadSettings anwenden (dort wird applyTheme aufgerufen)
  renderSystemInfo();
  loadSettings();

  function escapeHtml(str) {
    if (str == null) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})();
