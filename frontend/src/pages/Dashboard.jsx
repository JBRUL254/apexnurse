import React from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Dashboard(){
  const nav = useNavigate()

  async function handleLogout(){
    await supabase.auth.signOut()
    nav('/')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="p-4 flex justify-between items-center bg-white shadow">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">ApexNurse</h2>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2">🔔</button>
          <button className="p-2">🌓</button>
          <img alt="avatar" className="w-8 h-8 rounded-full" src={`https://api.dicebear.com/6.x/initials/svg?seed=User`} />
        </div>
      </header>

      <main className="p-6 grid grid-cols-4 gap-6">
        <aside className="col-span-1 bg-white p-4 rounded shadow h-min">
          <nav className="space-y-2">
            <a href="/dashboard" className="block">Home</a>
            <a href="/practice" className="block">Practice Questions</a>
            <a href="/review" className="block">Performance</a>
            <a href="#" className="block">Settings</a>
            <button className="block text-red-600" onClick={handleLogout}>Logout</button>
          </nav>
        </aside>

        <section className="col-span-3">
          <h3 className="text-xl font-semibold">Welcome back</h3>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded shadow">Questions Attempted<br/><strong>120</strong></div>
            <div className="p-4 bg-white rounded shadow">Accuracy Rate<br/><strong>78%</strong></div>
            <div className="p-4 bg-white rounded shadow">Time Spent<br/><strong>3h 20m</strong></div>
          </div>

          <div className="mt-6">
            <button onClick={()=>nav('/practice')} className="px-4 py-2 bg-blue-600 text-white rounded">Continue Practice</button>
            <button onClick={()=>nav('/practice')} className="ml-3 px-4 py-2 border rounded">Take New Test</button>
          </div>
        </section>
      </main>
    </div>
  )
}
