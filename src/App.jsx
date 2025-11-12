import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function ChatCard() {
  const [childId, setChildId] = useState('demo-child-1')
  const [text, setText] = useState('')
  const [history, setHistory] = useState([])
  const [positivity, setPositivity] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE}/api/positivity`).then(r => r.json()).then(setPositivity).catch(()=>{})
  }, [])

  const send = async () => {
    if (!text.trim()) return
    setLoading(true)
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ child_id: childId, text })
    })
    const data = await res.json()
    setHistory(h => [...h, { from: 'child', text }, { from: 'assistant', text: data.response, emotion: data.emotion, risk: data.risk_score }])
    setText('')
    setLoading(false)
  }

  return (
    <div className="w-full max-w-xl bg-white/80 backdrop-blur border border-white/50 rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Child Assistant</h2>
        {positivity && (
          <div className="text-sm text-gray-600 hidden sm:block">
            <span className="mr-2">💬 {positivity.affirmation}</span>
          </div>
        )}
      </div>
      <div className="h-64 overflow-y-auto space-y-3 mb-4 pr-1">
        {history.length === 0 && (
          <div className="text-gray-500 text-sm">Say hi and share how you feel today 💜</div>
        )}
        {history.map((m, i) => (
          <div key={i} className={`flex ${m.from === 'child' ? 'justify-end' : 'justify-start'}`}>
            <div className={`${m.from === 'child' ? 'bg-indigo-500 text-white' : 'bg-gray-100'} px-3 py-2 rounded-lg max-w-[80%]`}>
              <div className="text-sm whitespace-pre-wrap">{m.text}</div>
              {m.from !== 'child' && (
                <div className="text-[10px] mt-1 text-gray-500">emotion: {m.emotion} · risk: {m.risk?.toFixed?.(2)}</div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Type a message" className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        <button onClick={send} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg disabled:opacity-50">{loading ? 'Sending...' : 'Send'}</button>
      </div>
      {positivity && (
        <div className="mt-4 text-sm text-gray-600">
          <div>✨ Quote: {positivity.quote}</div>
          <div>😄 Joke: {positivity.joke}</div>
        </div>
      )}
    </div>
  )
}

function ParentCard() {
  const [childId, setChildId] = useState('demo-child-1')
  const [messages, setMessages] = useState([])
  const [events, setEvents] = useState([])

  const load = async () => {
    const [m, e] = await Promise.all([
      fetch(`${API_BASE}/api/messages?child_id=${childId}&limit=20`).then(r=>r.json()),
      fetch(`${API_BASE}/api/risk-events?child_id=${childId}&limit=20`).then(r=>r.json())
    ])
    setMessages(m.items || [])
    setEvents(e.items || [])
  }

  useEffect(()=>{ load() }, [])

  return (
    <div className="w-full max-w-xl bg-white/80 backdrop-blur border border-white/50 rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Parent Overview</h2>
        <button onClick={load} className="text-sm text-indigo-600 hover:underline">Refresh</button>
      </div>
      <div className="mb-3">
        <div className="text-sm text-gray-600">Recent Risk Events</div>
        <div className="mt-2 space-y-2 max-h-32 overflow-y-auto pr-1">
          {events.length === 0 && <div className="text-xs text-gray-500">No events yet</div>}
          {events.map((ev)=> (
            <div key={ev._id} className={`text-xs px-2 py-1 rounded border ${ev.level==='high'?'border-red-300 bg-red-50':ev.level==='medium'?'border-amber-300 bg-amber-50':'border-gray-200 bg-gray-50'}`}>
              <div className="font-medium">{ev.level.toUpperCase()} · {new Date(ev.occurred_at||ev.created_at).toLocaleString()}</div>
              <div>{ev.reason} (score {Number(ev.score).toFixed(2)})</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-sm text-gray-600">Recent Messages</div>
        <div className="mt-2 space-y-2 max-h-40 overflow-y-auto pr-1">
          {messages.map((m)=> (
            <div key={m._id} className="text-xs px-2 py-1 rounded border border-gray-200 bg-gray-50">
              <div className="text-gray-700">“{m.text}”</div>
              <div className="text-[10px] text-gray-500">emotion {m.emotion} · risk {Number(m.risk_score).toFixed(2)} · {new Date(m.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 py-10">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-start">
        <div className="">
          <ChatCard />
        </div>
        <div className="">
          <ParentCard />
        </div>
      </div>
      <div className="text-center mt-6 text-xs text-gray-500">
        Demo only. Not a substitute for professional help. In an emergency, call local emergency services.
      </div>
    </div>
  )
}

export default App
