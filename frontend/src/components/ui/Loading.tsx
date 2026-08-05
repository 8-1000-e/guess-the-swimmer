export default function Loading({ label = 'Chargement' }: { label?: string }) {
  return (
    <p className="loading-row" role="status">
      <span className="spinner" aria-hidden="true" />
      {label}
    </p>
  )
}
