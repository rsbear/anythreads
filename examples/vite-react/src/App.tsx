import { useState } from 'react'
import './App.css'

import { createAnythreads } from '@anythreads/api'

import { AnythreadsProvider, Thread } from '@anythreads/react/csr'
import { useThreads } from '@anythreads/react/csr'

const anythreads = createAnythreads({ 
  adapter: {
    fetch: { 
      url: "http://localhost:3000/anythreads",
      credentials: "include"
    }
  }
})

function App() {

  return (
    <AnythreadsProvider value={anythreads}>
      <Main />
    </AnythreadsProvider>
  )
}

function Main() {
  const threads = useThreads()
  console.log(threads)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
      {threads?.data?.map((thread) => (
        <Thread.Provider key={thread.id} value={thread}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', alignItems: 'flex-start' }}>
            <Thread.Title />
            <Thread.Body />
            <Thread.CreatedAt />
          </div>
        </Thread.Provider>
      ))}
    </div>
  )
}

export default App
