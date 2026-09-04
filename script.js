const fileInput = document.getElementById('fileInput');
const folderInput = document.getElementById('folderInput');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const gallery = document.getElementById('gallery');
const loader = document.getElementById('loader');
const loaderStatus = document.getElementById('loaderStatus');

let processedFiles = [];

fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
folderInput.addEventListener('change', (e) => handleFiles(e.target.files));

function showLoader(text) {
  loaderStatus.innerText = text;
  loader.classList.remove('hidden');
}

function hideLoader() {
  loader.classList.add('hidden');
}

function handleFiles(files) {
  const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
  if (imageFiles.length === 0) return;

  gallery.innerHTML = '';
  processedFiles = [];
  downloadAllBtn.disabled = true;

  showLoader('Uploading & Orienting Photos...');

  let processedCount = 0;

  imageFiles.forEach(file => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;

        // Flip image 180 degrees
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.PI);
        ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2);

        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const fileName = `flipped_${file.name}`;
          
          processedFiles.push({ name: fileName, blob: blob });

          // Render Image Card
          const card = document.createElement('div');
          card.className = 'card';

          const previewImg = document.createElement('img');
          previewImg.src = url;

          const downloadLink = document.createElement('a');
          downloadLink.href = url;
          downloadLink.download = fileName;
          downloadLink.innerText = 'Download Frame';

          card.appendChild(previewImg);
          card.appendChild(downloadLink);
          gallery.appendChild(card);

          processedCount++;
          if (processedCount === imageFiles.length) {
            hideLoader();
            downloadAllBtn.disabled = false;
          }
        }, file.type || 'image/jpeg');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

downloadAllBtn.addEventListener('click', () => {
  showLoader('Packaging Zip Archive...');

  setTimeout(() => {
    const zip = new JSZip();
    processedFiles.forEach(file => {
      zip.file(file.name, file.blob);
    });

    zip.generateAsync({ type: 'blob' }).then((content) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = 'flipped_35mm_scans.zip';
      a.click();
      hideLoader();
    });
  }, 100);
});
