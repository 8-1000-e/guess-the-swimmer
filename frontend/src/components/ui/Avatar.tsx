interface AvatarProps {
  src: string | null
  login: string
  size?: 'sm' | 'md' | 'lg'
}

export default function Avatar({ src, login, size = 'md' }: AvatarProps) {
  const cls = `avatar ${size === 'md' ? '' : size}`.trim()

  if (!src)
    return (
      <span className={cls} aria-hidden="true" data-initial={login.slice(0, 1)}>
        <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none">
          <circle cx="12" cy="9" r="3.4" fill="currentColor" opacity="0.35" />
          <path
            d="M4.5 20c1.2-3.6 4-5.4 7.5-5.4s6.3 1.8 7.5 5.4"
            fill="currentColor"
            opacity="0.35"
          />
        </svg>
      </span>
    )

  return <img className={cls} src={src} alt="" />
}
