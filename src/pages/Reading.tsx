import { BookOpen } from 'lucide-react'

export default function Reading() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <BookOpen size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
      <h2 className="text-xl font-bold mb-2">阅读训练</h2>
      <p className="text-gray-500 dark:text-gray-400">即将上线</p>
    </div>
  )
}
