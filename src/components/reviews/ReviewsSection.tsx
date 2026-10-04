import { useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteReview, upsertReview } from '@/services/reviews'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Form'
import { friendlyFirebaseError } from '@/utils/errors'
import { formatDate } from '@/utils/format'
import type { Review } from '@/types'

const STARS = [1, 2, 3, 4, 5]

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {STARS.map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star`}
          onClick={() => onChange(star)}
          className={`text-2xl leading-none transition-colors ${
            star <= value ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400'
          }`}
        >
          ★
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
        {value > 0 ? `${value} star${value > 1 ? 's' : ''}` : 'Rating chuno'}
      </span>
    </div>
  )
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} out of 5 stars`} className="text-sm text-amber-500">
      {'★'.repeat(rating)}
      <span className="text-gray-300">{'★'.repeat(5 - rating)}</span>
    </span>
  )
}

/** Reviews section — logged-out users ko login prompt dikhta hai. */
export function ReviewsSection({
  restaurantId,
  reviews,
  myReview,
  onChanged,
}: {
  restaurantId: string
  reviews: Review[]
  myReview: Review | null
  onChanged: () => void
}) {
  const { user, profile } = useAuth()
  const [rating, setRating] = useState(myReview?.rating ?? 0)
  const [comment, setComment] = useState(myReview?.comment ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit() {
    if (!user) return
    if (rating === 0) {
      setError('Pehle star rating chuno.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await upsertReview({
        restaurantId,
        userId: user.uid,
        userName: profile?.displayName ?? 'Guest',
        rating,
        comment,
      })
      setDone(true)
      onChanged()
    } catch (err) {
      setError(friendlyFirebaseError(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!user) return
    setBusy(true)
    setError(null)
    try {
      await deleteReview(restaurantId, user.uid)
      setRating(0)
      setComment('')
      setDone(false)
      onChanged()
    } catch (err) {
      setError(friendlyFirebaseError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Reviews & ratings</h2>

      {!user ? (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Review likhne ke liye{' '}
          <Link to="/login" className="font-medium text-red-600 hover:underline">
            login
          </Link>{' '}
          karo.
        </p>
      ) : (
        <div className="mt-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {myReview ? 'Apna review update karo' : 'Apna review likho'}
          </p>
          <div className="mt-2">
            <StarPicker value={rating} onChange={setRating} />
          </div>
          <div className="mt-3">
            <Textarea
              label="Comment"
              name="review-comment"
              rows={3}
              placeholder="Food kaisa tha? Delivery kaisi thi?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          {error && (
            <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
              {error}
            </p>
          )}
          {done && !error && (
            <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950/50 dark:text-green-300">
              Review save ho gaya! Shukriya.
            </p>
          )}

          <div className="mt-3 flex items-center gap-3">
            <Button loading={busy} onClick={() => void handleSubmit()}>
              {myReview ? 'Update review' : 'Submit review'}
            </Button>
            {myReview && (
              <Button variant="danger" loading={busy} onClick={() => void handleDelete()}>
                Delete
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="mt-5">
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Abhi koi review nahi. Pehla aap likho!</p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((review) => (
              <li key={review.id} className="border-t border-gray-100 pt-4 first:border-0 first:pt-0 dark:border-gray-800">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{review.userName}</p>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(review.createdAt)}</span>
                </div>
                <div className="mt-1">
                  <StarDisplay rating={review.rating} />
                </div>
                {review.comment && (
                  <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}