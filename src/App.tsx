import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import VocabularyIndex from './pages/Vocabulary/Index'
import StudyPage from './pages/Vocabulary/Study'
import MistakeBook from './pages/Vocabulary/Mistakes'
import MyWords from './pages/Vocabulary/MyWords'
import WordDetail from './pages/WordDetail'
import Reading from './pages/Reading'
import Listening from './pages/Listening'

export default function App() {
  return (
    <BrowserRouter basename="/english-learner">
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vocabulary" element={<VocabularyIndex />} />
          <Route path="/vocabulary/study" element={<StudyPage />} />
          <Route path="/vocabulary/mistakes" element={<MistakeBook />} />
          <Route path="/vocabulary/my" element={<MyWords />} />
          <Route path="/word/:term" element={<WordDetail />} />
          <Route path="/reading" element={<Reading />} />
          <Route path="/listening" element={<Listening />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
