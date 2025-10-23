import React, {useState, useEffect} from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  useEffect(()=>{
    // If user already signed in, redirect
    supabase.auth.getSession().then(({ data })=>{
      if(data?.session) nav('/dashboard')
    })
    supabase.auth.onAuthStateChange((event, session)=>{
      if(session?.user) nav('/dashboard')
    })
  },[])

  async function handleSignIn(e){
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if(error) return alert(error.message)
    nav('/dashboard')
  }

  async function handleSocial(provider){
    // provider: 'google' or 'azure' (microsoft)
    await supabase.auth.signInWithOAuth({ provider })
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="login-box">
        <h1 className="text-3xl font-semibold text-center">ApexNurse</h1>
        <p className="text-center text-sm text-slate-500">Your personalized space for mastering every question</p>

        <form onSubmit={handleSignIn} className="mt-6 space-y-4">
          <input className="w-full p-3 border rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input type="password" className="w-full p-3 border rounded" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />

          <div className="flex justify-between text-sm text-slate-600">
            <a href="#" onClick={async ()=>{ const { data, error } = await supabase.auth.resetPasswordForEmail(email); alert('If account exists you will receive an email')}}>Forgot password</a>
            <a href="#" onClick={()=> supabase.auth.signUp({ email, password }).then(res => alert(res.error ? res.error.message : 'Check email to confirm'))}>Sign up</a>
          </div>

          <button className="w-full p-3 bg-blue-600 text-white rounded" disabled={loading}>{loading? 'Signing...' : 'Log In'}</button>

          <div className="flex gap-2 mt-4">
            <button type="button" onClick={()=>handleSocial('google')} className="flex-1 p-2 border rounded">Continue with Google</button>
            <button type="button" onClick={()=>handleSocial('azure')} className="flex-1 p-2 border rounded">Microsoft</button>
          </div>

          <div className="text-center mt-3">
            <a href="/dashboard" className="text-sm text-blue-600">Get Started</a>
          </div>
        </form>
      </div>
    </div>
  )
}
