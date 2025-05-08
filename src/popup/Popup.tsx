import React, { useEffect, useState, useRef } from 'react'
import {
  Button,
  Card,
  List,
  Typography,
  Space,
  Select,
  Row,
  Col,
  message,
  Modal,
  Input,
  Tooltip,
  ConfigProvider,
  theme as antTheme
} from 'antd'
import {
  SaveOutlined,
  RollbackOutlined,
  DeleteOutlined,
  EditOutlined,
  StarOutlined,
  StarFilled,
  UploadOutlined,
  DownloadOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Option } = Select
const { Search } = Input

interface Session {
  name: string
  urls: string[]
  timestamp: number
  favorite?: boolean
}

type Lang = 'en' | 'pt' | 'es'
const i18n: Record<Lang, any> = {
  en: {
    title: 'Session Saver',
    sub: 'Manage your sessions',
    none: 'No sessions',
    save: 'Save',
    quickSave: 'Quick Save',
    restore: 'Restore',
    del: 'Delete',
    newName: 'New name',
    rename: 'Rename',
    limitMsg: 'You can only save up to 3 sessions.',
    validName: 'Enter a valid name',
    cancel: 'Cancel',
    filterPlaceholder: 'Search sessions',
    export: 'Export JSON',
    import: 'Import JSON',
    favorite: 'Favorite',
    unfavorite: 'Unfavorite',
    tooltipShortcut:
      'You can press Ctrl+Shift+S to quickly save your current session without opening the extension.',
    successImport: 'Imported successfully',
    failImport: 'Invalid JSON file',
    premiumMsg: 'Available only on the Premium Plan',
    upgrade:   'Learn more',
  },
  pt: {
    title: 'Session Saver',
    sub: 'Gerencie suas sessões',
    none: 'Nenhuma sessão',
    save: 'Salvar',
    quickSave: 'Salvar Rápido',
    restore: 'Restaurar',
    del: 'Excluir',
    newName: 'Novo nome',
    rename: 'Renomear',
    limitMsg: 'Você só pode salvar até 3 sessões.',
    validName: 'Informe um nome válido',
    cancel: 'Cancelar',
    filterPlaceholder: 'Buscar sessões',
    export: 'Exportar JSON',
    import: 'Importar JSON',
    favorite: 'Favoritar',
    unfavorite: 'Desfavoritar',
    tooltipShortcut:
      'Você pode pressionar Ctrl+Shift+S para salvar rapidamente sua sessão atual sem precisar abrir a extensão.',
    successImport: 'Importado com sucesso',
    failImport: 'Arquivo JSON inválido',
    premiumMsg: 'Disponível somente no Plano Premium',
    upgrade:   'Saiba mais',
  },
  es: {
    title: 'Session Saver',
    sub: 'Administra tus sesiones',
    none: 'No hay sesiones',
    save: 'Guardar',
    quickSave: 'Guardar rápido',
    restore: 'Restaurar',
    del: 'Eliminar',
    newName: 'Nuevo nombre',
    rename: 'Rebautizar',
    limitMsg: 'Solo puedes guardar hasta 3 sesiones.',
    validName: 'Introduzca un nombre válido',
    cancel: 'Cancelar',
    filterPlaceholder: 'Buscar sesiones',
    export: 'Exportar JSON',
    import: 'Importar JSON',
    favorite: 'Marcar favorito',
    unfavorite: 'Desmarcar favorito',
    tooltipShortcut:
      'Puede presionar Ctrl+Shift+S para guardar rápidamente su sesión actual sin necesidad de abrir la extensión.',
    successImport: 'Importado exitosamente',
    failImport: 'Archivo JSON no válido',
    premiumMsg: 'Disponible solo en el plan Premium',
    upgrade:   'Más información',
  }
}

const localeMap: Record<Lang, string> = {
  en: 'en-US',
  pt: 'pt-BR',
  es: 'es-ES'
}

export default function Popup() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [lang, setLang] = useState<Lang>('en')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isPremium, setIsPremium] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Detecta e aplica dark mode no body
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = (dark: boolean) => {
      setIsDarkMode(dark)
      document.body.style.backgroundColor = dark ? '#1e1e1e' : '#ffffff'
    }
    apply(mq.matches)
    mq.addEventListener('change', e => apply(e.matches))
    return () => mq.removeEventListener('change', e => apply(e.matches))
  }, [])

  useEffect(() => {
    // busca o flag que o background salvou
    chrome.storage.local.get({ isPremium: false }, res => {
      setIsPremium(res.isPremium);
    });
  }, []);

  // Carrega sessões e idioma
  useEffect(() => {
    chrome.storage.local.get({ sessions: [] }, result => {
      const norm: Session[] = result.sessions.map((s: any) => ({
        name: s.name,
        urls: s.urls,
        timestamp: s.timestamp ?? Date.parse(s.date),
        favorite: s.favorite ?? false
      }))
      setSessions(norm)
      chrome.storage.local.set({ sessions: norm })
    })
    chrome.storage.local.get({ lang: 'en' }, r => setLang(r.lang))
  }, [])

  const dateOpts: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }

  // Quick Save
  const quickSave = async () => {
    if (sessions.length >= 3) {
      message.warning(i18n[lang].limitMsg)
      return
    }
    const tabs = await chrome.tabs.query({ currentWindow: true })
    const now = Date.now()
    const name = `${i18n[lang].quickSave} ${new Date(now).toLocaleString(localeMap[lang], dateOpts)}`
    const newSession: Session = { name, urls: tabs.map(t => t.url!), timestamp: now }
    const updated = [...sessions, newSession]
    chrome.storage.local.set({ sessions: updated })
    setSessions(updated)
  }

  // Export JSON
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(sessions, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sessions.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Import JSON
  const importJSON = () => fileInputRef.current?.click()
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const imported: Session[] = JSON.parse(reader.result as string)
        if (!Array.isArray(imported)) throw Error()
        chrome.storage.local.set({ sessions: imported })
        setSessions(imported)
        message.success(i18n[lang].successImport)
      } catch {
        message.error(i18n[lang].failImport)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // Toggle favorite
  const toggleFavorite = (index: number) => {
    const updated = sessions.map((s, i) => ({
      ...s,
      favorite: i === index ? !s.favorite : false
    }))
    chrome.storage.local.set({ sessions: updated })
    setSessions(updated)
  }

  // Modal state & handlers
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalType, setModalType] = useState<'save' | 'rename'>('save')
  const [inputValue, setInputValue] = useState('')
  const [editIndex, setEditIndex] = useState<number | null>(null)

  const openSaveModal = () => {
    if (sessions.length >= 3) {
      message.warning(i18n[lang].limitMsg)
      return
    }
    setModalType('save')
    setInputValue('')
    setEditIndex(null)
    setIsModalVisible(true)
  }
  const openRenameModal = (i: number) => {
    setModalType('rename')
    setEditIndex(i)
    setInputValue(sessions[i].name)
    setIsModalVisible(true)
  }
  const handleOk = async () => {
    const name = inputValue.trim()
    if (!name) {
      message.error(i18n[lang].validName)
      return
    }
    if (modalType === 'save') {
      const tabs = await chrome.tabs.query({ currentWindow: true })
      const now = Date.now()
      const newSession: Session = { name, urls: tabs.map(t => t.url!), timestamp: now }
      const updated = [...sessions, newSession]
      chrome.storage.local.set({ sessions: updated })
      setSessions(updated)
    } else if (modalType === 'rename' && editIndex !== null) {
      const updated = sessions.map((s, idx) =>
        idx === editIndex ? { ...s, name } : s
      )
      chrome.storage.local.set({ sessions: updated })
      setSessions(updated)
    }
    setIsModalVisible(false)
  }
  const handleCancel = () => setIsModalVisible(false)
  const restoreSession = (i: number) =>
    sessions[i]?.urls.forEach(url => chrome.tabs.create({ url }))
  const deleteSession = (i: number) => {
    const updated = sessions.filter((_, idx) => idx !== i)
    chrome.storage.local.set({ sessions: updated })
    setSessions(updated)
  }
  const changeLang = (v: Lang) => {
    setLang(v)
    chrome.storage.local.set({ lang: v })
  }

  // Filter + favorite on top
  const visible = sessions
    .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0))

  return (
    <ConfigProvider theme={{
      algorithm: isDarkMode ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm
    }}>
      <div
        style={{
          backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
          minHeight: '100%',
          padding: 8,
          boxSizing: 'border-box'
        }}
      >
        <input
          type="file"
          accept="application/json"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <Card size="small" style={{ width: 480, background: isDarkMode ? '#1e1e1e' : undefined }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={5} style={{ color: isDarkMode ? '#fff' : undefined }}>
                  {i18n[lang].title}
                </Title>
              </Col>
              <Col style={{ display: 'flex', alignItems: 'center' }}>
                <Select
                  value={lang}
                  onChange={v => {
                    setLang(v)
                    chrome.storage.local.set({ lang: v })
                  }}
                  size="small"
                  style={{ width: 80, marginRight: 8 }}
                >
                  <Option value="en">EN</Option>
                  <Option value="pt">PT</Option>
                  <Option value="es">ES</Option>
                </Select>
                <Tooltip title={i18n[lang].tooltipShortcut}>
                  <QuestionCircleOutlined style={{ fontSize: 16, color: '#888' }} />
                </Tooltip>
              </Col>
            </Row>

            <Text type="secondary" style={{ color: isDarkMode ? '#bbb' : undefined }}>
              {i18n[lang].sub}
            </Text>

            <Space.Compact style={{ width: '100%' }}>
              <Search
                placeholder={i18n[lang].filterPlaceholder}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: 240 }}
                allowClear
              />
              <Button icon={<DownloadOutlined />} onClick={exportJSON}>
                {i18n[lang].export}
              </Button>
              <Button icon={<UploadOutlined />} onClick={importJSON}>
                {i18n[lang].import}
              </Button>
            </Space.Compact>

            <Space>
              <Button
                type="default"
                onClick={quickSave}
                block
                disabled={sessions.length >= 3}
              >
                {i18n[lang].quickSave}
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={openSaveModal}
                block
                disabled={sessions.length >= 3}
              >
                {i18n[lang].save}
              </Button>
              <Button
                type="primary"
                disabled={!isPremium}
                onClick={() => {console.log("teste")}}
              >
                Feature Premium
              </Button>

              {!isPremium && (
                <Text type="warning" style={{ marginTop: 4, textAlign: 'center' }}>
                  {i18n[lang].premiumMsg}{' '}
                  <a
                    href="https://www.youtube.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {i18n[lang].upgrade}
                  </a>
                </Text>
              )}
            </Space>

            {visible.length === 0 ? (
              <div style={{ textAlign: 'center', color: isDarkMode ? '#888' : '#888', padding: '1rem 0' }}>
                {i18n[lang].none}
              </div>
            ) : (
              <List
                dataSource={visible}
                renderItem={(sess, idx) => {
                  const formatted = new Date(sess.timestamp)
                    .toLocaleString(localeMap[lang], dateOpts)
                  const originalIndex = sessions.indexOf(sess)
                  return (
                    <List.Item
                      style={{ background: isDarkMode ? '#2a2a2a' : undefined }}
                      actions={[
                        sess.favorite
                          ? <StarFilled
                              key="fav"
                              style={{ color: '#faad14' }}
                              title={i18n[lang].unfavorite}
                              onClick={() => toggleFavorite(originalIndex)}
                            />
                          : <StarOutlined
                              key="fav"
                              title={i18n[lang].favorite}
                              onClick={() => toggleFavorite(originalIndex)}
                            />,
                        <EditOutlined
                          key="e"
                          title={i18n[lang].rename}
                          onClick={() => openRenameModal(originalIndex)}
                        />,
                        <RollbackOutlined
                          key="r"
                          title={i18n[lang].restore}
                          onClick={() => restoreSession(originalIndex)}
                        />,
                        <DeleteOutlined
                          key="d"
                          title={i18n[lang].del}
                          onClick={() => deleteSession(originalIndex)}
                          style={{ color: 'red' }}
                        />
                      ]}
                    >
                      <List.Item.Meta
                        title={<span style={{ color: isDarkMode ? '#fff' : undefined }}>{sess.name}</span>}
                        description={
                          <div>
                            <div style={{ color: isDarkMode ? '#ccc' : undefined }}>{formatted}</div>
                            <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                              {sess.urls.slice(0, 3).map(u => (
                                <img
                                  key={u}
                                  src={`chrome://favicon/size/16@1x/${u}`}
                                  style={{ width: 16, height: 16 }}
                                />
                              ))}
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )
                }}
              />
            )}
          </Space>
        </Card>

        <Modal
          title={modalType === 'save' ? i18n[lang].save : i18n[lang].rename}
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          okText="OK"
          cancelText={i18n[lang].cancel}
          width={300}
          centered
          bodyStyle={{ padding: 16, background: isDarkMode ? '#1e1e1e' : undefined }}
        >
          <Input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder={modalType === 'save' ? i18n[lang].save : i18n[lang].newName}
            onPressEnter={handleOk}
          />
        </Modal>
      </div>
    </ConfigProvider>
  )
}
