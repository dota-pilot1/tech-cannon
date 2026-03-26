import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { issueImageApi } from '@/entities/issue/api/issueImageApi'
import { toast } from 'sonner'

export function useIssueImages(issueId: number | null) {
  return useQuery({
    queryKey: ['issueImages', issueId],
    queryFn: () => issueImageApi.getIssueImages(issueId!),
    enabled: !!issueId,
  })
}

export function useUploadIssueImage(issueId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ file, fileType }: { file: File; fileType?: string }) => {
      // 1. Get presigned URL
      const { presignedUrl, publicUrl } = await issueImageApi.getPresignedUrl(
        file.name,
        file.type || 'application/octet-stream'
      )

      // 2. Upload to S3
      await issueImageApi.uploadToS3(presignedUrl, file)

      // 3. Save to database
      return await issueImageApi.addIssueImage(issueId, publicUrl, file.name, fileType)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['issueImages', issueId] })
      const fileType = variables.fileType || 'image'
      toast.success(fileType === 'mmd' ? 'MMD 파일이 업로드되었습니다.' : '이미지가 업로드되었습니다.')
    },
    onError: (_, variables) => {
      const fileType = variables.fileType || 'image'
      toast.error(fileType === 'mmd' ? 'MMD 파일 업로드에 실패했습니다.' : '이미지 업로드에 실패했습니다.')
    },
  })
}

export function useDeleteIssueImage(issueId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (imageId: number) => issueImageApi.deleteIssueImage(issueId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issueImages', issueId] })
      toast.success('이미지가 삭제되었습니다.')
    },
    onError: () => {
      toast.error('이미지 삭제에 실패했습니다.')
    },
  })
}
