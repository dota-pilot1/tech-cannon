# Context Menu Implementation Plan

## Date
2026-03-23

## Goal
Implement context menu for tree nodes to add/edit/delete child menus

## Current Issues

### 1. Cannot Add Child Menus
- Only root level menus can be added
- No way to specify parentId

### 2. Cannot Change Parent Menu
- MenuEditForm has no parentId selection UI
- Hierarchy management is difficult

### 3. Not Intuitive
- Unclear which menu to add under

## Solution: Context Menu

### UX Flow
1. Right-click on tree node
2. Show context menu
   - Add Child Menu
   - Edit
   - Delete
3. Click "Add Child Menu"
4. Show form with parentId auto-set
5. Save → Update tree + Auto expand

## Implementation Steps

### Phase 1: Basic Context Menu (1-2h)

#### 1.1 Create ContextMenu Component
File: `components/ContextMenu.tsx`

```tsx
interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
  onAddChild: () => void
  onEdit: () => void
  onDelete: () => void
}
```

Checklist:
- [ ] Create ContextMenu component
- [ ] Tailwind styling
- [ ] Menu item click handlers

#### 1.2 Add Right-click Event to TreeNode
File: `components/TreeNode.tsx`

```tsx
const handleContextMenu = (e: React.MouseEvent) => {
  e.preventDefault()
  onContextMenu(e.clientX, e.clientY, menu)
}
```

Checklist:
- [ ] Add onContextMenu prop
- [ ] Prevent browser default menu

#### 1.3 State Management in MenusPage
```tsx
const [contextMenu, setContextMenu] = useState<{
  x: number
  y: number
  menu: Menu
} | null>(null)
```

Checklist:
- [ ] Add contextMenu state
- [ ] Close on outside click
- [ ] Close on ESC key

### Phase 2: Add Child Menu (2-3h)

#### 2.1 Support parentId in MenuEditForm
```tsx
interface MenuEditFormProps {
  menu: Menu | null
  parentMenu?: Menu | null  // Add this
  // ...
}
```

Checklist:
- [ ] Add parentMenu prop
- [ ] Initialize parentId in formData
- [ ] Display parent menu info UI

#### 2.2 Connect Context Menu Actions
```tsx
const handleAddChildMenu = () => {
  setParentMenu(contextMenu.menu)
  setIsCreating(true)
  setExpandedIds(prev => new Set(prev).add(contextMenu.menu.id))
}
```

Checklist:
- [ ] Add parentMenu state
- [ ] Implement handleAddChildMenu
- [ ] Auto-expand parent menu
- [ ] Implement handleEditMenu
- [ ] Implement handleDeleteMenu

### Phase 3: UX Improvements (1-2h)

#### 3.1 Outside Click & Keyboard
```tsx
useEffect(() => {
  const handleClickOutside = () => closeContextMenu()
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeContextMenu()
  }
  // ...
}, [contextMenu])
```

Checklist:
- [ ] Detect outside clicks
- [ ] ESC key to close
- [ ] Highlight right-clicked menu
- [ ] Handle screen boundaries

### Phase 4: API Integration (1h)

#### 4.1 Backend API
```
POST /api/admin/menus
Body: { name, path, parentId, menuType, ... }
```

Checklist:
- [ ] Confirm API endpoint
- [ ] Verify parentId parameter support

#### 4.2 Frontend API
```tsx
const createMenuMutation = useMutation({
  mutationFn: menuApi.createMenu,
  onSuccess: () => {
    queryClient.invalidateQueries(['menus', 'tree'])
    toast.success('Menu added')
  },
})
```

Checklist:
- [ ] Implement createMenu
- [ ] Implement updateMenu
- [ ] Implement deleteMenu
- [ ] Error handling

### Phase 5: Advanced Features (Optional, 2-3h)

#### 5.1 Prevent Deleting Menus with Children
```tsx
const hasChildren = menus.some(m => m.parentId === contextMenu.menu.id)
if (hasChildren) {
  toast.error('Cannot delete menu with children')
  return
}
```

Checklist:
- [ ] Check for child menus
- [ ] Show warning message

#### 5.2 Duplicate Menu
```tsx
const duplicatedMenu = {
  ...contextMenu.menu,
  id: undefined,
  name: `${contextMenu.menu.name} (copy)`,
}
```

Checklist:
- [ ] Add duplicate button
- [ ] Append (copy) to name

## UI Styling

```tsx
<div className="fixed bg-white shadow-lg rounded-md border border-gray-200 py-1 min-w-[200px] z-50">
  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-3">
    <span className="text-lg">➕</span>
    <span className="flex-1">Add Child Menu</span>
  </button>
  <div className="border-t border-gray-200 my-1" />
  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-3">
    <span className="text-lg">✏️</span>
    <span className="flex-1">Edit</span>
  </button>
  <button className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-3">
    <span className="text-lg">🗑️</span>
    <span className="flex-1">Delete</span>
  </button>
</div>
```

## Estimated Time

| Phase | Task | Time |
|-------|------|------|
| Phase 1 | Basic context menu | 1-2h |
| Phase 2 | Add child menu | 2-3h |
| Phase 3 | UX improvements | 1-2h |
| Phase 4 | API integration | 1h |
| Phase 5 | Advanced (optional) | 2-3h |
| **Total** | | **5-8h** |

## Completion Checklist

### Phase 1
- [ ] ContextMenu component
- [ ] TreeNode right-click event
- [ ] MenusPage state management

### Phase 2
- [ ] MenuEditForm parentId support
- [ ] Connect context menu actions

### Phase 3
- [ ] Outside click detection
- [ ] ESC key support
- [ ] Highlight
- [ ] Screen boundary handling

### Phase 4
- [ ] API confirmation and integration
- [ ] CRUD implementation

### Phase 5 (Optional)
- [ ] Prevent child menu deletion
- [ ] Menu duplication

## Tech Stack

- React (Hooks)
- TailwindCSS
- TanStack Query
- Sonner (Toast)
- Pure implementation (no library)

## Success Criteria

1. Right-click → Add child → Save → Tree updates
2. Intuitive and bug-free UX
3. Instant response
4. Perfect error handling

## Next Steps

1. Drag & drop (reorder/reparent)
2. Search with auto-expand
3. Icon picker UI
