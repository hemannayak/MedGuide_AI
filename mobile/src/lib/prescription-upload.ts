import { request } from './api';
export type UploadImage = { uri: string; mimeType?: string | null; fileSize?: number; fileName?: string | null };
const extensions: Record<string,string> = {'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
export function validateUploadImage(image: UploadImage) {
  if (!/^(file|content):\/\//.test(image.uri)) throw new Error('Choose a local prescription image.');
  if (!image.mimeType || !extensions[image.mimeType]) throw new Error('Choose a JPEG, PNG or WebP image. HEIC and PDF are not supported here.');
  if (!Number.isFinite(image.fileSize) || !image.fileSize || image.fileSize < 1) throw new Error('The image size could not be checked. Choose another image.');
  if (image.fileSize > 10 * 1024 * 1024) throw new Error('Choose an image smaller than or equal to 10 MB.');
}
export async function uploadPrescription(image: UploadImage, confirmed: boolean) {
  if (!confirmed) throw new Error('Confirm permission to upload before continuing.');
  validateUploadImage(image);
  const form = new FormData();
  // Do not disclose the original camera filename or unnecessary picker metadata.
  form.append('file', {uri:image.uri,name:`prescription.${extensions[image.mimeType!]}`,type:image.mimeType} as unknown as Blob);
  const result = await request<{prescription_id:string;verification_status:string}>('/prescriptions/upload',form,'POST');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(result.prescription_id)) throw new Error('The upload response was incomplete. Check your care records before retrying.');
  return result;
}
