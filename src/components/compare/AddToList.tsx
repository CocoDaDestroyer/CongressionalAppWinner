/** Put the product being compared on the Trip list, and say how many are already there. */
import { Link } from 'react-router-dom'
import { Check, ListPlus } from 'lucide-react'
import { shoppingList } from '../../lib/list'
import { useShoppingList } from '../../lib/useCatalog'
import { Button } from '../ui/Button'

export function AddToList({ conceptId, conceptName }: { conceptId: string; conceptName: string }) {
  const onList = useShoppingList()[conceptId] ?? 0
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <Button
        variant="secondary"
        size="sm"
        icon={<ListPlus className="size-4" aria-hidden="true" />}
        onClick={() => shoppingList.add(conceptId)}
      >
        Add {conceptName.toLowerCase()} to trip list
      </Button>
      {onList > 0 && (
        <Link
          to="/trip"
          viewTransition
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal underline-offset-4 hover:underline"
        >
          <Check className="size-4" aria-hidden="true" />
          {onList} on your list · plan the trip
        </Link>
      )}
    </div>
  )
}
