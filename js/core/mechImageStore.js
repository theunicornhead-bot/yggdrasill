"use strict";

const MECH_IMAGE_DB_NAME = "yggdrasil_mech_images_v1";
const MECH_IMAGE_STORE_NAME = "mechImages";

function openMechImageDb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB is not available"));
      return;
    }
    const request = window.indexedDB.open(MECH_IMAGE_DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(MECH_IMAGE_STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Failed to open IndexedDB"));
  });
}

async function withMechImageStore(mode, callback) {
  const db = await openMechImageDb();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(MECH_IMAGE_STORE_NAME, mode);
      const store = transaction.objectStore(MECH_IMAGE_STORE_NAME);
      let result;
      transaction.oncomplete = () => resolve(result);
      transaction.onerror = () => reject(transaction.error || new Error("IndexedDB transaction failed"));
      transaction.onabort = () => reject(transaction.error || new Error("IndexedDB transaction aborted"));
      result = callback(store);
    });
  } finally {
    db.close();
  }
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDB request failed"));
  });
}

async function imageBlobFromDataUrl(dataUrl) {
  const image = new Image();
  image.decoding = "async";
  image.src = dataUrl;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || image.width || 1024;
  canvas.height = image.naturalHeight || image.height || 1024;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return await new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("WebP conversion failed"));
    }, "image/webp", 0.9);
  });
}

window.saveMechImageBlob = async function saveMechImageBlob(imageId, blob) {
  if (!imageId || !blob) return false;
  await withMechImageStore("readwrite", (store) => store.put(blob, imageId));
  return true;
};

window.saveMechImageFromSource = async function saveMechImageFromSource(imageId, imageSource) {
  if (!imageId || !imageSource) return false;
  let blob = null;
  if (String(imageSource).startsWith("data:image/")) {
    blob = await imageBlobFromDataUrl(imageSource);
  } else {
    const response = await fetch(imageSource);
    if (!response.ok) throw new Error(`image fetch failed: HTTP ${response.status}`);
    const sourceBlob = await response.blob();
    const objectUrl = URL.createObjectURL(sourceBlob);
    try {
      blob = await imageBlobFromDataUrl(objectUrl);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }
  await window.saveMechImageBlob(imageId, blob);
  return true;
};

window.getMechImageBlob = async function getMechImageBlob(imageId) {
  if (!imageId) return null;
  return await withMechImageStore("readonly", (store) => requestToPromise(store.get(imageId)));
};

window.deleteMechImageBlob = async function deleteMechImageBlob(imageId) {
  if (!imageId) return false;
  await withMechImageStore("readwrite", (store) => store.delete(imageId));
  return true;
};

window.hydrateMechImages = async function hydrateMechImages(root = document) {
  const images = Array.from(root.querySelectorAll("img[data-mech-image-id]"));
  await Promise.all(images.map(async (image) => {
    const imageId = image.dataset.mechImageId;
    const blob = await window.getMechImageBlob(imageId).catch(() => null);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const previousUrl = image.dataset.objectUrl;
    image.src = url;
    image.dataset.objectUrl = url;
    if (previousUrl) URL.revokeObjectURL(previousUrl);
  }));
};
