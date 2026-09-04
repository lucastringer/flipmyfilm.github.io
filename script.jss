const fileInput = document.getElementById('fileInput');
const folderInput = document.getElementById('folderInput');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const gallery = document.getElementById('gallery');

let processedFiles = [];

fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
folderInput.addEventListener('change', (e) => handleFiles(e.target.files));

function handleFiles(files) {
  gallery.innerHTML = '';
  processedFiles = [];
  const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));

  if (imageFiles.length === 0) return;

  imageFiles.forEach(file => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;

        // Rotate 180 degrees
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.PI);
        ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2);

        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const fileName = `flipped_${file.name}`;
          
          processedFiles.push({ name: fileName, blob: blob });

          // Render Preview Card
          const card = document.createElement('div');
          card.className = 'card';

          const previewImg = document.createElement('img');
          previewImg.src = url;

          const downloadLink = document.createElement('a');
          downloadLink.href = url;
          downloadLink.download = fileName;
          downloadLink.innerText = 'Download Individual';

          card.appendChild(previewImg);
          card.appendChild(downloadLink);
          gallery.appendChild(card);

          downloadAllBtn.disabled = false;
        }, file.type || 'image/jpeg');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

downloadAllBtn.addEventListener('click', () => {
  const zip = new JSZip();
  processedFiles.forEach(file => {
    zip.file(file.name, file.blob);
  });

  zip.generateAsync({ type: 'blob' }).then((content) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = 'flipped_photos.zip';
    a.click();
  });
});
