import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pilotImageApi } from '@/entities/pilot/api/pilotImageApi'
import { toast } from 'sonner'

export function usePilotImages(pilotId: number | null) {
  return useQuery({
    queryKey: ['pilotImages', pilotId],
    queryFn: () => pilotImageApi.getPilotImages(pilotId!),
    enabled: !!pilotId,
  })
}

export function useUploadPilotImage(pilotId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ file, fileType }: { file: File; fileType?: string }) => {
      const { presignedUrl, publicUrl } = await pilotImageApi.getPresignedUrl(
        file.name,
        file.type || 'application/octet-stream'
      )
      await pilotImageApi.uploadToS3(presignedUrl, file)
      return await pilotImageApi.addPilotImage(pilotId, publicUrl, file.name, fileType)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pilotImages', pilotId] })
      const fileType = variables.fileType || 'image'
      toast.success(fileType === 'mmd' ? 'MMD 파일이 업로드되었습니다.' : '이미지가 업로드되었습니다.')
    },
    onError: (_, variables) => {
      const fileType = variables.fileType || 'image'
      toast.error(fileType === 'mmd' ? 'MMD 파일 업로드에 실패했습니다.' : '이미지 업로드에 실패했습니다.')
    },
  })
}

export function useDeletePilotImage(pilotId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (imageId: number) => pilotImageApi.deletePilotImage(pilotId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilotImages', pilotId] })
      toast.success('이미지가 삭제되었습니다.')
    },
    onError: () => {
      toast.error('이미지 삭제에 실패했습니다.')
    },
  })
}
