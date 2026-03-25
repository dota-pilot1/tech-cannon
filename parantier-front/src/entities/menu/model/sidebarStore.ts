import { Store } from '@tanstack/react-store'

interface SidebarState {
  isOpen: boolean
  selectedCategory: string | null // 이제 카테고리 키만 저장 (예: 'admin')
}

const initialState: SidebarState = {
  isOpen: false,
  selectedCategory: null,
}

export const sidebarStore = new Store(initialState)

export const sidebarActions = {
  open: (categoryKey: string) => {
    sidebarStore.setState(() => ({
      isOpen: true,
      selectedCategory: categoryKey,
    }))
  },
  close: () => {
    sidebarStore.setState(() => ({
      isOpen: false,
      selectedCategory: null,
    }))
  },
  toggle: (categoryKey: string) => {
    const currentState = sidebarStore.state
    if (currentState.isOpen && currentState.selectedCategory === categoryKey) {
      sidebarActions.close()
    } else {
      sidebarActions.open(categoryKey)
    }
  },
}
