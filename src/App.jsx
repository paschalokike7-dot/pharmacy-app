import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function App() {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editQuantity, setEditQuantity] = useState('')

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
      .insert({ name, quantity: Number(quantity) })
    if (error) setError(error.message)
    else {
      setName('')
      setQuantity('')
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
  }

  async function saveEdit(id) {
    setError('')
    const { error } = await supabase
      .from('pharmacy')
      .update({ name: editName, quantity: Number(editQuantity) })
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
        <button type="submit">Add</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {items.map((i) => (
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
                <button onClick={() => saveEdit(i.id)}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                {i.name}: {i.quantity}{' '}
                <button onClick={() => startEdit(i)}>Edit</button>
                <button onClick={() => deleteItem(i.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
