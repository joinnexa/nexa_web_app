import { Star } from 'lucide-react'
import { Card } from '../../components/ui/Card'

export default function StaysReviews() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reviews Moderation</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Moderate guest and host reviews</p>
      </div>

      <Card className="p-12 flex flex-col items-center justify-center min-h-[400px] text-center">
        <Star className="h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No reviews API</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md">
          The reviews API is not yet available. When implemented, this page will allow moderating guest and host reviews for Nexa Stays listings.
        </p>
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-left max-w-sm w-full text-sm text-gray-600 dark:text-gray-400">
          <p className="font-medium mb-2">Planned structure:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Pending review moderation</li>
            <li>Flagged reviews</li>
            <li>Rating distribution</li>
            <li>Review history</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}
