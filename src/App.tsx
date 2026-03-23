import { useAppStore } from './store/useAppStore'

function App() {
  const { count, increment } = useAppStore()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-gray-900">
      <h1 className="text-4xl font-bold mb-8 text-blue-600">Vite + React + TS + Tailwind</h1>
      <div className="bg-white p-8 rounded-xl shadow-lg text-center">
        <p className="text-xl mb-4">Zustand Counter: <span className="font-bold text-2xl">{count}</span></p>
        <button 
          onClick={increment}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Increment
        </button>
      </div>
    </div>
  )
}

export default App
