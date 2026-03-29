import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workImageApi } from '@/entities/work/api/workImageApi'
import { toast } from 'sonner'

export function useWorkImages(workId: number | null) {
  return useQuery({
    queryKey: ['workImages', workId],
    queryFn: () => workImageApi.getWorkImages(workId!),
    enabled: !!workId,
  })
}

export function useUploadWorkImage(workId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ file, fileType }: { file: File; fileType?: string }) => {
      // 1. Get presigned URL
      const { presignedUrl, publicUrl } = await workImageApi.getPresignedUrl(
        file.name,
        file.type || 'application/octet-stream'
      )

      // 2. Upload to S3
      await workImageApi.uploadToS3(presignedUrl, file)

      // 3. Save to database
      return await workImageApi.addWorkImage(workId, publicUrl, file.name, fileType)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workImages', workId] })
      const fileType = variables.fileType || 'image'
      toast.success(fileType === 'mmd' ? 'MMD 파일이 업로드되었습니다.' : '이미지가 업로드되었습니다.')
    },
    onError: (_, variables) => {
      const fileType = variables.fileType || 'image'
      toast.error(fileType === 'mmd' ? 'MMD 파일 업로드에 실패했습니다.' : '이미지 업로드에 실패했습니다.')
    },
  })
}

export function useDeleteWorkImage(workId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (imageId: number) => workImageApi.deleteWorkImage(workId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workImages', workId] })
      toast.success('이미지가 삭제되었습니다.')
    },
    onError: () => {
      toast.error('이미지 삭제에 실패했습니다.')
    },
  })
}
