import { useQuery } from '@tanstack/react-query'
import { workspaceApi } from '@/entities/workspace/api/workspaceApi'

export function useWorkspaceTree() {
  return useQuery({
    queryKey: ['workspace', 'tree'],
    queryFn: workspaceApi.getNodeTree,
  })
}
