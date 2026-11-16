// services/groupPhotoService.js
// Cloudinary upload (ProfileScreen er moto same cloud name + preset)
const CLOUD_NAME = 'y84gtvow';
const UPLOAD_PRESET = 'expense_tracker';

// base64 (ImagePicker er base64: true) -> Cloudinary -> secure_url
export async function uploadGroupPhoto(base64) {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            file: `data:image/jpeg;base64,${base64}`,
            upload_preset: UPLOAD_PRESET,
        }),
    });
    const data = await res.json();
    if (!data.secure_url) throw new Error(data.error?.message || 'Image upload failed');
    return data.secure_url;
}