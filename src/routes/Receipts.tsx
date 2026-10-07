/**
 * Receipts: the main way prices stay current. Each saved receipt becomes
 * price observations for everyone and a spending record for the shopper.
 */
import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Receipt } from '../lib/catalog'
import { plural } from '../lib/labels'
import { catalogStore, pricesUpdatedBy } from '../lib/store'
import { useCatalog, useReceipts } from '../lib/useCatalog'
import { SEED_NOW } from '../data/seed'
import { PageHeader } from '../components/ui/PageHeader'
import { Toast } from '../components/ui/Toast'
import { ReceiptForm } from '../components/receipts/ReceiptForm'
import { SavedReceipts } from '../components/receipts/SavedReceipts'

interface SavedNotice {
  updated: number
  packageId: string
}

export function Receipts() {
  const repo = useCatalog()
  const receipts = useReceipts()
  const [notice, setNotice] = useState<SavedNotice | null>(null)
  const dismiss = useCallback(() => setNotice(null), [])

  function saved(receipt: Receipt) {
    setNotice({
      updated: pricesUpdatedBy(catalogStore.getRepository(), receipt),
      packageId: receipt.lines[0].packageId,
    })
  }

  return (
    <>
      <PageHeader
        title="Receipts"
        description="Type in a receipt and its prices update Compare and Trip for everyone, then count toward your spending."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start lg:gap-8">
        <ReceiptForm repo={repo} defaultDate={SEED_NOW.toISOString().slice(0, 10)} onSaved={saved} />
        <SavedReceipts repo={repo} receipts={receipts} />
      </div>

      {notice && (
        <Toast onClose={dismiss}>
          <p className="font-semibold">
            Receipt saved.{' '}
            {notice.updated > 0
              ? `Updated ${plural(notice.updated, 'price')}.`
              : 'Newer prices were already on file, so it counts toward spending only.'}
          </p>
          {notice.updated > 0 && (
            <Link
              to={`/compare?product=${notice.packageId}`}
              className="font-semibold text-leaf-soft underline"
            >
              See it in Compare
            </Link>
          )}
        </Toast>
      )}
    </>
  )
}
