// background.js

// 1) Função para checar licença na Chrome Web Store
async function checkLicense() {
  try {
    // obtém token silencioso do usuário
    const token = await chrome.identity.getAuthToken({ interactive: false });
    const url = `https://www.googleapis.com/chromewebstore/v1.1/userlicenses/${chrome.runtime.id}`;
    const res = await fetch(url, {
      headers: { Authorization: 'Bearer ' + token }
    });
    const data = await res.json();
    // data.result será "FREE" ou "FULL"
    const isPremium = data.result === 'FULL';
    await chrome.storage.local.set({ isPremium });
  } catch (err) {
    console.error('License check failed', err);
    // se falhar, marca como free
    await chrome.storage.local.set({ isPremium: false });
  }
}

// dispara no install e no startup
chrome.runtime.onInstalled.addListener(checkLicense);
chrome.runtime.onStartup.addListener(checkLicense);

// 2) Listener de atalho Ctrl+Shift+S (quick-save-session)
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'quick-save-session') return;

  // pega abas na janela atual
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const urls = tabs.map(t => t.url).filter(Boolean);
  const now = Date.now();

  // formata nome usando padrão americano
  const formatted = new Date(now).toLocaleString('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
  const name = `Quick Save ${formatted}`;

  // salva no storage
  chrome.storage.local.get({ sessions: [] }, ({ sessions }) => {
    const updated = [...sessions, { name, urls, timestamp: now }];
    chrome.storage.local.set({ sessions: updated });

    // notificação para o usuário
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Session Saver Pro',
      message: `Session saved: ${name}`
    });
  });
});
