import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

function expiryStatus(dateStr) {
  if (!dateStr) return { label: 'No expiry date', color: 'gray' }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const exp = new Date(dateStr + 'T00:00:00')
  const days = Math.round((exp - today) / 86400000)
  if (days < 0) return { label: `EXPIRED ${-days} days ago`, color: 'red' }
  if (days <= 30) return { label: `Expires in ${days} days`, color: 'orange' }
  return { label: `Expires ${dateStr}`, color: 'green' }
}

export default function App() {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [expiry, setExpiry] = useState('')
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editQuantity, setEditQuantity] = useState('')
  const [editExpiry, setEditExpiry] = useState('')

  async function loadItems() {
    const { data, error } = await supabase
      .from('pharmacy')
      .select('*')
      .order('id', { ascending: false })
    if (error) setError(error.message)
    else setItems(data)
  }

  useEffect(() => {
    loadItems()
  }, [])

  async function addItem(e) {
    e.preventDefault()
    setError('')
    const { error } = await supabase
      .from('pharmacy')
      .insert({ name, quantity: Number(quantity), expiry_date: expiry || null })
    if (error) setError(error.message)
    else {
      setName('')
      setQuantity('')
      setExpiry('')
      loadItems()
    }
  }

  async function deleteItem(id) {
    if (!window.confirm('Delete this drug?')) return
    setError('')
    const { error } = await supabase.from('pharmacy').delete().eq('id', id)
    if (error) setError(error.message)
    else loadItems()
  }

  function startEdit(item) {
    setEditingId(item.id)
    setEditName(item.name)
    setEditQuantity(String(item.quantity))
    setEditExpiry(item.expiry_date || '')
  }

  async function saveEdit(id) {
    setError('')
    const { error } = await supabase
      .from('pharmacy')
      .update({
        name: editName,
        quantity: Number(editQuantity),
        expiry_date: editExpiry || null,
      })
      .eq('id', id)
    if (error) setError(error.message)
    else {
      setEditingId(null)
      loadItems()
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Pharmacy Stock</h1>
      <form onSubmit={addItem}>
        <input
          placeholder="Drug name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          placeholder="Quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
        <input
          type="date"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {items.map((i) => {
          const status = expiryStatus(i.expiry_date)
          return (
            <li key={i.id}>
              {editingId === i.id ? (
                <>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <input
                    type="number"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                  />
                  <input
                    type="date"
                    value={editExpiry}
                    onChange={(e) => setEditExpiry(e.target.value)}
                  />
                  <button onClick={() => saveEdit(i.id)}>Save</button>
                  <button onClick={() => setEditingId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  {i.name}: {i.quantity}{' '}
                  <span style={{ color: status.color, fontWeight: 'bold' }}>
                    ({status.label})
                  </span>{' '}
                  <button onClick={() => startEdit(i)}>Edit</button>
                  <button onClick={() => deleteItem(i.id)}>Delete</button>
                </>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

