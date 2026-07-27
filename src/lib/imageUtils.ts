export const processAndCompressImage = (
  file: File, 
  maxWidth = 350, 
  maxHeight = 350, 
  quality = 0.85
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("Không tìm thấy tệp ảnh."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Không thể đọc tệp ảnh. Tệp có thể bị hỏng."));
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) {
        reject(new Error("Nội dung ảnh rỗng."));
        return;
      }

      const img = new Image();
      img.onerror = () => {
        // If image object fails to decode as canvas, fallback to raw data URL
        resolve(rawDataUrl);
      };
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          let width = img.width || maxWidth;
          let height = img.height || maxHeight;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }

          // Fill white background to support transparent PNG converting to JPEG cleanly
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedDataUrl);
        } catch (err) {
          console.warn("Canvas compression fallback:", err);
          resolve(rawDataUrl);
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
};
