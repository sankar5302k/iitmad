import { ClockIcon } from "./ClockIcon"
import { CommentIcon } from "./CommentIcon"

interface BlogCardProps {
  imageUrl: string
  title: string
  description: string
  timeAgo: string
  commentCount: number
}

export function BlogCard({ imageUrl, title, description, timeAgo, commentCount }: BlogCardProps) {
  return (
    <div className="rounded overflow-hidden shadow-lg flex flex-col">
      <div className="relative">
        <a href="#">
          <img className="w-full" src={imageUrl || "/placeholder.svg"} alt={title} />
          <div className="hover:bg-transparent transition duration-300 absolute bottom-0 top-0 right-0 left-0 bg-gray-900 opacity-25"></div>
        </a>
        <a href="#!">
          <div className="text-xs absolute top-0 right-0 bg-indigo-600 px-4 py-2 text-white mt-3 mr-3 hover:bg-white hover:text-indigo-600 transition duration-500 ease-in-out">
            Cooking
          </div>
        </a>
      </div>
      <div className="px-6 py-4 mb-auto">
        <a
          href="#"
          className="font-medium text-lg inline-block hover:text-indigo-600 transition duration-500 ease-in-out mb-2"
        >
          {title}
        </a>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>
      <div className="px-6 py-3 flex flex-row items-center justify-between bg-gray-100">
        <span className="py-1 text-xs font-regular text-gray-900 mr-1 flex flex-row items-center">
          <ClockIcon />
          <span className="ml-1">{timeAgo}</span>
        </span>
        <span className="py-1 text-xs font-regular text-gray-900 mr-1 flex flex-row items-center">
          <CommentIcon />
          <span className="ml-1">{commentCount} Comments</span>
        </span>
      </div>
    </div>
  )
}

