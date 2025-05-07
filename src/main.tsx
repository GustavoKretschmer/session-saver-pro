import React from 'react'
import { createRoot } from 'react-dom/client'
import Popup from './popup/Popup'
import 'antd/dist/reset.css' // ou 'antd/dist/antd.css'

const container = document.getElementById('root')!
createRoot(container).render(<Popup />)