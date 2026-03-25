# Task Management Folder Input Debugging Guide

## Issue
- User cannot create folders by pressing Enter
- Input field appears but submission doesn't work

## Flow Analysis

### 1. Input Event Handler

#### Input Component (`TasksPage.tsx:183-197`)
```tsx
<input
  autoFocus
  value={inlineFolderName}
  onChange={(e) => setInlineFolderName(e.target.value)}
  onKeyDown={(e) => {
    if (e.nativeEvent.isComposing) return  // Prevent Korean IME issues
    if (e.key === 'Enter') handleCreateFolder()
    if (e.key === 'Escape') {
      setInlineFolderInput(null)
      setInlineFolderName('')
    }
  }}
  placeholder="Enter folder name and press Enter"
  className="flex-1 border border-blue-400 rounded px-1.5 py-0.5 text-xs min-w-0 focus:outline-none focus:ring-1 focus:ring-blue-400"
/>
```

**Key Points:**
- `e.nativeEvent.isComposing`: Prevents premature submission during Korean IME composition
- Enter key triggers `handleCreateFolder()`
- Escape key clears the input state

### 2. Folder Creation Handler

#### `handleCreateFolder` (TasksPage.tsx:161-176)
```typescript
const handleCreateFolder = () => {
  const trimmedName = inlineFolderName.trim()
  console.log('[TasksPage] handleCreateFolder called:', { trimmedName, parentId: inlineFolderInput?.parentId })

  if (!trimmedName) {
    console.log('[TasksPage] Folder name empty, cancelling')
    toast.error('Please enter a folder name')
    return
  }

  console.log('[TasksPage] createFolderMutation.mutate called')
  createFolderMutation.mutate({
    name: trimmedName,
    parentId: inlineFolderInput?.parentId ?? null,
  })
}
```

**Validation Points:**
1. **Empty name validation prevents submission**
   - If name is empty after trimming, shows error and returns early
   - Solution: Check if toast error appears

2. **Mutation may be in pending state**
   - If mutation is already pending, input might not clear
   - Solution: Clear input in onSuccess callback

### 3. Mutation Hook

#### `useCreateFolderMutation` (useTask.ts:14-28)
```typescript
export function useCreateFolderMutation(onSuccess?: (parentId: number | null) => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: TaskFolderDto) => taskApi.createFolder(dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['taskFolders'] })
      toast.success('Folder created successfully')
      if (onSuccess) onSuccess(variables.parentId)
    },
    onError: (error: any) => {
      console.error('[useCreateFolderMutation] Error:', error)
      toast.error('Failed to create folder: ' + (error?.message || 'Unknown error'))
    },
  })
}
```

**Error Handling:**
- `onError` handler added
- Displays error toast with detailed message

### 4. onSuccess Callback (TasksPage.tsx:54-58)

```typescript
const createFolderMutation = useCreateFolderMutation((parentId) => {
  setInlineFolderInput(null)  // Clear input state
  setInlineFolderName('')     // Clear name
  if (parentId !== null) setExpandedFolders((p) => new Set(p).add(parentId))
})
```

**Expected Flow:**
1. mutation.mutate() called
2. API call succeeds
3. onSuccess callback triggered
4. Input state cleared + folder tree refreshed

## Possible Causes

### Check Console Logs
After implementation, check these console messages:

1. **Enter key pressed**
   ```
   [TasksPage] handleCreateFolder called: { trimmedName: "New Folder", parentId: null }
   ```

2. **Empty name validation**
   ```
   [TasksPage] Folder name empty, cancelling
   ```

3. **Mutation called**
   ```
   [TasksPage] createFolderMutation.mutate called
   ```

4. **Error occurred**
   ```
   [useCreateFolderMutation] Error: ...
   ```

### Check Network Tab
1. Verify `POST /tasks/folders` request (should NOT be `/api/tasks/folders` due to baseURL)
2. Check response status (200, 400, 500 etc.)
3. Verify request payload:
   ```json
   {
     "name": "Folder Name",
     "parentId": null
   }
   ```

## Known Issues

### 1. Korean IME Composition
- `e.nativeEvent.isComposing` returns true during composition
- Enter key during composition is correctly ignored
- **Solution**: This is correct behavior, user should press Enter after composition completes

### 2. Backend API Error
- Check network errors
- Verify DTO validation
- Check database constraints

### 3. Frontend State Issues
- API response pending during state update
- Input state not clearing properly

## Implemented Solutions

### Debugging Added
1. **Console logging** - Track execution flow
2. **onError handler** - Display error messages
3. **Empty name validation toast** - User feedback for validation errors

### Potential Improvements
1. **Loading indicator**
   ```typescript
   {createFolderMutation.isPending && <Spinner />}
   ```

2. **Disable input during pending**
   ```tsx
   <input disabled={createFolderMutation.isPending} />
   ```

3. **Enhanced Escape handling**
   - Already implemented correctly

## Test Scenarios

1. **Normal creation**
   - Type folder name and press Enter → Input should clear

2. **Empty name**
   - Press Enter without typing → Show "Please enter a folder name" error

3. **Korean IME**
   - Type "새폴더" and press Enter during composition → Ignored
   - Complete composition and press Enter → Create folder

4. **API Error**
   - Simulate network error → Show "Failed to create folder" error
   - Input should remain (user can retry)

5. **Escape key**
   - Press Escape → Input clears

## Summary

**When debugging folder creation issues:**
1. Start the development server
2. Check console logs
3. Verify network tab for API request/response
4. Check for execution flow gaps based on console output
