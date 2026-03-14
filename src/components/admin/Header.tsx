import { Bell, Search, Settings, LogOut, User } from 'lucide-react'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Input } from '../ui/input'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function Header() {
  const navigate = useNavigate()
  const { logout, adminUser } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between px-6 shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search users, transactions, bookings..."
            className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-96 overflow-y-auto">
              <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">High-risk transaction flagged</p>
                    <p className="text-xs text-gray-500 mt-1">Transaction #TX-892471 requires review</p>
                    <p className="text-xs text-gray-400 mt-1">2 minutes ago</p>
                  </div>
                </div>
              </div>
              <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">New KYC submission</p>
                    <p className="text-xs text-gray-500 mt-1">5 applications awaiting review</p>
                    <p className="text-xs text-gray-400 mt-1">15 minutes ago</p>
                  </div>
                </div>
              </div>
              <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Support ticket escalated</p>
                    <p className="text-xs text-gray-500 mt-1">Ticket #SUP-1247 needs attention</p>
                    <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-700 dark:text-primary-400" />
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-sm font-medium">{adminUser?.name ?? 'Admin'}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {adminUser?.role?.replace('_', ' ') ?? 'Super Admin'}
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
