import { useQuery } from '@tanstack/react-query'
import { organizationApi } from '@/entities/organization/api/organizationApi'

export function useOrganizations() {
  return useQuery({
    queryKey: ['admin', 'organizations'],
    queryFn: () => organizationApi.getTree(),
  })
}
