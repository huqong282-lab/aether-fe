import axios from 'axios'
import { apiClient } from '../api'

export type UploadSignatureRequest = {
  fileName: string
  fileType: string
  fileSize: number
}

export type UploadSignatureResponse = {
  signature: string
  timestamp: number
  apiKey: string
  cloudName: string
  folder: string
  resourceType: string
  uploadUrl: string
  fileName: string
  fileType: string
  fileSize: number
}

export type CloudinaryUploadResponse = {
  public_id: string
  secure_url: string
  resource_type: string
  format: string
  bytes: number
  thumbnail_url?: string | null
}

export type UploadConfirmRequest = {
  channelId: string
  publicId: string
  secureUrl: string
  fileName: string
  fileType: string
  fileSize: number
  resourceType: string
  format: string
}

export type UploadConfirmResponse = {
  channelId: string
  fileUrl: string
  thumbnailUrl: string | null
  fileType: string
  fileSize: number
  fileName: string
  publicId: string
  resourceType: string
  format: string
}

export async function requestUploadSignature(channelId: string, payload: UploadSignatureRequest) {
  const response = await apiClient.post(`/upload/signature/${channelId}`, payload)
  return response.data as { data: UploadSignatureResponse }
}

export async function confirmUploadRequest(payload: UploadConfirmRequest) {
  const response = await apiClient.post('/upload/confirm', payload)
  return response.data as { data: UploadConfirmResponse }
}

export async function uploadFileToCloudinary(params: {
  uploadUrl: string
  file: File
  apiKey: string
  signature: string
  timestamp: number
  folder: string
  resourceType: string
  onProgress?: (progress: number) => void
}) {
  const formData = new FormData()
  formData.append('file', params.file)
  formData.append('api_key', params.apiKey)
  formData.append('signature', params.signature)
  formData.append('timestamp', String(params.timestamp))
  formData.append('folder', params.folder)

  const response = await axios.post<CloudinaryUploadResponse>(params.uploadUrl, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    params: {
      resource_type: params.resourceType,
    },
    onUploadProgress: (event) => {
      if (!event.total) {
        return
      }

      const progress = Math.min(100, Math.round((event.loaded / event.total) * 100))
      params.onProgress?.(progress)
    },
  })

  return response.data
}
