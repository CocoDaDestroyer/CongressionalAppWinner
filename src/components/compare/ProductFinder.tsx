import { useCallback, useMemo, useState, type FormEvent } from 'react'
import { Camera, ScanBarcode } from 'lucide-react'
import { toGtin14 } from '../../lib/gtin'
import type { CatalogRepository } from '../../lib/repository'
import { Button } from '../ui/Button'
import { Field, inputClass } from '../ui/Field'
import { canUseCamera } from '../../lib/camera'
import { CameraScanner } from './CameraScanner'

interface ProductFinderProps {
  repo: CatalogRepository
  packageId: string
  onSelect: (packageId: string) => void
  /** A well-formed barcode the catalog does not know. */
  onUnknown: (gtin: string) => void
}

/**
 * Pick a product or type its barcode. Both feed the same comparison, so what
 * shows below is the real ranking either way.
 */
export function ProductFinder({ repo, packageId, onSelect, onUnknown }: ProductFinderProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)

  const groups = useMemo(
    () =>
      repo
        .getConcepts()
        .map((concept) => ({
          concept,
          packages: repo.getSiblingPackages(concept.id),
        }))
        .filter((g) => g.packages.length > 0),
    [repo],
  )

  // The camera and the typed field resolve a code through the same path.
  const resolve = useCallback(
    (raw: string) => {
      setScanning(false)
      const gtin = toGtin14(raw)
      if (!gtin) {
        setCode(raw)
        setError('Barcodes are 8, 12, 13 or 14 digits.')
        return
      }
      setError(null)
      const found = repo.getPackageByGtin(gtin)
      if (found) {
        onSelect(found.id)
        setCode('')
      } else {
        onUnknown(gtin)
      }
    },
    [repo, onSelect, onUnknown],
  )

  function lookUp(event: FormEvent) {
    event.preventDefault()
    resolve(code)
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
      <Field label="Product">
        <select
          className={`${inputClass} font-semibold`}
          value={packageId}
          onChange={(e) => onSelect(e.target.value)}
        >
          {groups.map(({ concept, packages }) => (
            <optgroup key={concept.id} label={concept.name}>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayName}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </Field>

      <form onSubmit={lookUp} noValidate>
        <label htmlFor="barcode" className="mb-1.5 block text-sm font-semibold text-ink-muted">
          Or enter a barcode
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <ScanBarcode
              className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-ink-faint"
              aria-hidden="true"
            />
            <input
              id="barcode"
              className={`${inputClass} pl-10 tabular`}
              inputMode="numeric"
              autoComplete="off"
              placeholder="00013000006415"
              value={code}
              aria-invalid={error !== null}
              aria-describedby={error ? 'barcode-error' : undefined}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary">
            Look up
          </Button>
          {canUseCamera() && (
            <Button
              variant="secondary"
              aria-label="Scan with camera"
              icon={<Camera className="size-5" aria-hidden="true" />}
              onClick={() => setScanning(true)}
            />
          )}
        </div>
        {scanning && (
          <div className="mt-3">
            <CameraScanner onCode={resolve} onClose={() => setScanning(false)} />
          </div>
        )}
        {error && (
          <p id="barcode-error" className="mt-1.5 text-sm text-danger">
            {error}
          </p>
        )}
      </form>
    </div>
  )
}
