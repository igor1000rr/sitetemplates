'use client'

import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api'
import Link from 'next/link'

export default function AdminPosts() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    adminApi.posts({ status: filter || undefined }).then(({ data }) => {
      setPosts(data.data || [])
      setLoading(false)
    })
  }, [filter])

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить статью?')) return
    await adminApi.postDelete(id)
    setPosts(posts.filter(p => p.id !== id))
  }

  if (loading) return <div className="animate-pulse text-white/20">Загрузка...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold">Статьи блога ({posts.length})</h2>
        <Link href="/admin/posts/new" className="bg-accent text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-accent-dark transition">
          + Новая статья
        </Link>
      </div>

      <div className="flex gap-1 mb-5">
        {['', 'draft', 'published'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs transition ${filter === s ? 'bg-accent/15 text-accent-pale' : 'text-white/25 hover:text-white/50'}`}>
            {s === '' ? 'Все' : s === 'draft' ? 'Черновики' : 'Опубликованные'}
          </button>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="text-white/15 text-sm text-center py-12 bg-bg-card rounded-xl border border-white/[0.05]">Статей нет</div>
      ) : (
        <div className="space-y-2">
          {posts.map((p: any) => (
            <div key={p.id} className="flex items-center gap-4 p-4 bg-bg-card rounded-xl border border-white/[0.05]">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Link href={`/admin/posts/${p.id}`} className="text-sm font-semibold hover:text-accent-pale transition truncate">{p.title}</Link>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${p.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-white/[0.06] text-white/30'}`}>
                    {p.status === 'published' ? 'Опубликована' : 'Черновик'}
                  </span>
                </div>
                <div className="text-white/20 text-xs">
                  {p.category || 'Без категории'} · {p.author} · {p.views_count} просм. · {p.published_at || p.created_at}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link href={`/admin/posts/${p.id}`} className="text-white/25 hover:text-white/60 text-xs transition">Ред.</Link>
                <button onClick={() => handleDelete(p.id)} className="text-red-400/30 hover:text-red-400 text-xs transition">Удалить</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
