import { useEffect, useState } from 'react'
import { getApiBaseUrl } from '../api/client'

type Props = {
  listingId: string
  assetId: string
  kind: string
  className?: string
  style?: React.CSSProperties
}

function getToken(): string | null {
  return localStorage.getItem('nexa_admin_token')
}

export function ListingMediaPreview({ listingId, assetId, kind, className, style }: Props) {
  const [url, setUrl] = useState<string | null>(null)
  const [err, setErr] = useState(false)

  useEffect(() => {
    const token = getToken()
    const base = getApiBaseUrl().replace(/\/$/, '')
    const fetchUrl = `${base}/admin/stays/listings/${listingId}/media/${assetId}`
    let cancelled = false
    let objectUrl: string | null = null
    setErr(false)
    setUrl(null)
    fetch(fetchUrl, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status))
        return r.blob()
      })
      .then((blob) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      })
      .catch(() => {
        if (!cancelled) setErr(true)
      })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [listingId, assetId])

  const commonStyle: React.CSSProperties = {
    width: '100%',
    maxHeight: 220,
    objectFit: 'cover',
    borderRadius: 8,
    background: 'var(--surf2)',
    ...style,
  }

  if (err) {
    return (
      <div className={className} style={{ ...commonStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--muted)' }}>
        Failed to load
      </div>
    )
  }
  if (!url) {
    return (
      <div className={className} style={{ ...commonStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--muted)' }}>
        Loading…
      </div>
    )
  }

  if (kind === 'WALKTHROUGH' || kind === 'VIDEO') {
    return <video className={className} src={url} controls muted playsInline style={commonStyle} />
  }

  return <img className={className} src={url} alt="" style={commonStyle} />
}
