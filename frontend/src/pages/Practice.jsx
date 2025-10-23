import React, {useEffect, useState} from 'react'
import QuestionCard from '../components/QuestionCard'

export default function Practice(){
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    async function load(){
      const url = `${import.meta.env.VITE_BACKEND_URL || ''}/questions?limit=20&paper=paper1`
      const res = await fetch(url)
      const data = await res.json()
      setQuestions(data)
      setLoading(false)
    }
    load()
  },[])

  if(loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">Practice</h2>
      <div className="mt-4 grid gap-4">
        {questions.map(q=> <QuestionCard key={q.global_id} q={q} />)}
      </div>
    </div>
  )
}
