import { Link } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { sidebarStore } from '@/entities/menu/model/sidebarStore'
import { authStore } from '@/entities/user/model/authStore'
import { sidebarConfig, filterSidebarByAuthority } from '@/config/sidebar'

export function Sidebar() {
  const { isOpen, selectedCategory } = useStore(sidebarStore, (state) => state)
  const auth = useStore(authStore, (state) => state)

  if (!isOpen || !selectedCategory) return null

  // 선택된 카테고리에 해당하는 사이드바 설정 가져오기
  const sections = sidebarConfig[selectedCategory]
  if (!sections) return null

  // 사용자 권한으로 필터링
  const userAuthorities = auth.user?.authorities || []
  const filteredSections = filterSidebarByAuthority(sections, userAuthorities)

  if (filteredSections.length === 0) return null

  return (
    <aside className="w-64 bg-card border-r border-border flex-shrink-0">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">
          {selectedCategory === 'admin' ? '관리자' : selectedCategory}
        </h2>
        <nav className="space-y-6">
          {filteredSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                      activeProps={{
                        className: 'bg-accent font-medium',
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  )
}
