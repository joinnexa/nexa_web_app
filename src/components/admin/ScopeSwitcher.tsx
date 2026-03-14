import { useLocation, useNavigate } from 'react-router-dom'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'
import { AdminScope, ADMIN_SCOPES } from '../../theme/constants'

export function ScopeSwitcher({ scope }: { scope: AdminScope }) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleScopeChange = (value: string) => {
    const newScope = value as AdminScope
    switch (newScope) {
      case ADMIN_SCOPES.SUPER:
        navigate('/')
        break
      case ADMIN_SCOPES.PAY:
        navigate('/pay/overview')
        break
      case ADMIN_SCOPES.GO:
        navigate('/go/overview')
        break
      case ADMIN_SCOPES.STAYS:
        navigate('/stays/overview')
        break
    }
  }

  return (
    <div className="bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800 px-6 py-3">
      <Tabs value={scope} onValueChange={handleScopeChange}>
        <TabsList className="bg-gray-100 dark:bg-gray-800 p-1">
          <TabsTrigger value={ADMIN_SCOPES.SUPER} className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
            Super Admin
          </TabsTrigger>
          <TabsTrigger value={ADMIN_SCOPES.PAY} className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
            <span className="flex items-center gap-2">
              Nexa Pay
              <span className="w-2 h-2 rounded-full bg-teal-500" />
            </span>
          </TabsTrigger>
          <TabsTrigger value={ADMIN_SCOPES.GO} className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
            <span className="flex items-center gap-2">
              Nexa Go
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
            </span>
          </TabsTrigger>
          <TabsTrigger value={ADMIN_SCOPES.STAYS} className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
            <span className="flex items-center gap-2">
              Nexa Stays
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
