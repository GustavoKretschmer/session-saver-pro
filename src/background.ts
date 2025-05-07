// src/background.ts

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'quick-save-session') {
    // pega abas ativas
    const tabs = await chrome.tabs.query({ currentWindow: true })
    const urls = tabs.map(t => t.url!).filter(Boolean) as string[]
    const now = Date.now()

    // formata nome
    const formatted = new Date(now).toLocaleString('en-US', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    })
    const name = `Quick Save ${formatted}`

    // salva no storage
    chrome.storage.local.get({ sessions: [] }, ({ sessions }) => {
      const updated = [...sessions, { name, urls, timestamp: now }]
      chrome.storage.local.set({ sessions: updated })

      // notificação
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Session Saver Pro',
        message: `Session saved: ${name}`
      })
    })
  }
})
