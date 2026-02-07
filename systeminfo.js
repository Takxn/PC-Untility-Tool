const si = require('systeminformation');

async function getSystemInfo() {
  const [osInfo, cpu, mem, diskLayout, networkInterfaces, system] = await Promise.all([
    si.osInfo(),
    si.cpu(),
    si.mem(),
    si.diskLayout().catch(() => []),
    si.networkInterfaces().catch(() => []),
    si.system().catch(() => ({})),
  ]);

  const totalMem = mem.total;
  const usedMem = mem.used;
  const freeMem = mem.free;

  return {
    os: {
      platform: osInfo.platform,
      distro: osInfo.distro,
      release: osInfo.release,
      arch: osInfo.arch,
      hostname: osInfo.hostname,
      kernel: osInfo.kernel,
    },
    cpu: {
      manufacturer: cpu.manufacturer,
      brand: cpu.brand,
      cores: cpu.cores,
      physicalCores: cpu.physicalCores,
      speed: cpu.speed,
      speedMax: cpu.speedMax,
    },
    memory: {
      total: totalMem,
      used: usedMem,
      free: freeMem,
      usedPercent: totalMem ? Math.round((usedMem / totalMem) * 100) : 0,
      totalGB: (totalMem / 1024 / 1024 / 1024).toFixed(2),
      usedGB: (usedMem / 1024 / 1024 / 1024).toFixed(2),
      freeGB: (freeMem / 1024 / 1024 / 1024).toFixed(2),
    },
    disks: diskLayout.slice(0, 5).map((d) => ({
      name: d.name,
      type: d.type,
      size: (d.size / 1024 / 1024 / 1024).toFixed(2) + ' GB',
      vendor: d.vendor,
    })),
    network: networkInterfaces.filter((n) => !n.internal).slice(0, 5).map((n) => ({
      iface: n.iface,
      ip4: n.ip4,
      mac: n.mac,
    })),
    system: {
      manufacturer: system.manufacturer,
      model: system.model,
      uuid: system.uuid,
    },
  };
}

module.exports = { getSystemInfo };
