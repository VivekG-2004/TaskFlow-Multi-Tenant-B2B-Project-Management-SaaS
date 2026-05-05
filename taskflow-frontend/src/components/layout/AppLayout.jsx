import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function AppLayout({ title, children }) {
  return (
    <div className="flex min-h-screen bg-neutral-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title={title} />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}