
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const COMPANY = 'GTF Pharmacy'
const LOW_STOCK = 10

function expiryStatus(dateStr) {
  if (!dateStr) return { kind: 'none', label: 'No date' }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const exp = new Date(dateStr + 'T00:00:00')
  const days = Math.round((exp - today) / 86400000)
  if (days < 0) return { kind: 'expired', label: `Expired ${-days}d ago` }
  if (days <= 30) return { kind: 'soon', label: `${days}d left` }
  return { kind: 'ok', label: 'In date' }
}

export default function App() {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [expiry, setExpiry] = useState('')
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
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

  const expiredCount = items.filter((i) => expiryStatus(i.expiry_date).kind === 'expired').length
  const soonCount = items.filter((i) => expiryStatus(i.expiry_date).kind === 'soon').length
  const lowCount = items.filter((i) => i.quantity < LOW_STOCK).length
  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <header className="header">
        <div className="brand">
          <div className="logo">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
              <path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7z" />
            </svg>
          </div>
          <div>
            <h1>{COMPANY}</h1>
            <p>Stock &amp; Expiry Manager</p>
          </div>
        </div>
      </header>

      <main className="container">
        <section className="stats">
          <div className="stat">
            <span className="stat-num">{items.length}</span>
            <span className="stat-label">Drugs in stock</span>
          </div>
          <div className="stat stat-red">
            <span className="stat-num">{expiredCount}</span>
            <span className="stat-label">Expired</span>
          </div>
          <div className="stat stat-amber">
            <span className="stat-num">{soonCount}</span>
            <span className="stat-label">Expiring in 30 days</span>
          </div>
          <div className="stat stat-low">
            <span className="stat-num">{lowCount}</span>
            <span className="stat-label">Low stock</span>
          </div>
        </section>

        <section className="card">
          <h2>Add a drug</h2>
          <form className="form" onSubmit={addItem}>
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
            <button className="btn btn-primary" type="submit">
              Add drug
            </button>
          </form>
          {error && <p className="error">{error}</p>}
        </section>

        <section className="card">
          <div className="toolbar">
            <h2>Current stock</h2>
            <input
              className="search"
              placeholder="Search drugs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {filtered.length === 0 ? (
            <p className="empty">No drugs found.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Drug</th>
                    <th>Qty</th>
                    <th>Expiry date</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((i) => {
                    const s = expiryStatus(i.expiry_date)
                    const editing = editingId === i.id
                    return (
                      <tr key={i.id}>
                        {editing ? (
                          <>
                            <td>
                              <input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                value={editQuantity}
                                onChange={(e) => setEditQuantity(e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="date"
                                value={editExpiry}
                                onChange={(e) => setEditExpiry(e.target.value)}
                              />
                            </td>
                            <td></td>
                            <td>
                              <div className="actions">
                                <button
                                  className="btn btn-primary btn-small"
                                  onClick={() => saveEdit(i.id)}
                                >
                                  Save
                                </button>
                                <button
                                  className="btn btn-ghost btn-small"
                                  onClick={() => setEditingId(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="drug-name">{i.name}</td>
                            <td>
                              {i.quantity}
                              {i.quantity < LOW_STOCK && (
                                <span className="badge badge-low">Low</span>
                              )}
                            </td>
                            <td>{i.expiry_date || '—'}</td>
                            <td>
                              <span className={`badge badge-${s.kind}`}>{s.label}</span>
                            </td>
                            <td>
                              <div className="actions">
                                <button
                                  className="btn btn-ghost btn-small"
                                  onClick={() => startEdit(i)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn btn-danger btn-small"
                                  onClick={() => deleteItem(i.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} {COMPANY} · Demo data only
      </footer>
    </div>
  )
}
