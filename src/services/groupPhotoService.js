// services/groupPhotoService.js
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Local image uri -> Firebase Storage -> download URL
export async function uploadGroupPhoto(uri, uid) {
    const blob = await (await fetch(uri)).blob();
    const r = ref(getStorage(), `groupPhotos/${uid}_${Date.now()}.jpg`);
    await uploadBytes(r, blob, { contentType: 'image/jpeg' });
    return getDownloadURL(r);
}