import React, {useState} from 'react'

export default function QuestionCard({q}){
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(){
    setSubmitted(true)
    try{
      await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/attempts`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ user_id: 'anon', question_id: q.global_id, selected_option: selected, correct: selected===q.correct_option })
      })
    }catch(e){
      console.error(e)
    }
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="text-sm text-slate-600">Q{q.global_id}</div>
      <div className="mt-2">{q.question_text}</div>
      <div className="mt-3 space-y-2">
        {['option_a','option_b','option_c','option_d'].map((k,idx)=>{
          const label = ['A','B','C','D'][idx]
          const txt = q[k]
          return txt ? (
            <label key={k} className={`flex items-center p-2 border rounded ${submitted && q.correct_option===label? 'bg-green-50 border-green-300':''}`}>
              <input type="radio" name={`q-${q.global_id}`} value={label} disabled={submitted} onChange={()=>setSelected(label)} className="mr-2" />
              <span>{label}. {txt}</span>
            </label>
          ) : null
        })}
      </div>
      <div className="mt-3">
        <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={handleSubmit} disabled={!selected || submitted}>Submit</button>
        <button className="ml-2 px-3 py-1 border rounded" onClick={()=>alert(q.rationale || 'No rationale available')}>View rationale</button>
      </div>
    </div>
  )
}
