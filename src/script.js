const fileInput = document.getElementById('fileInput');
const imageSection = document.getElementById('imageSection');
const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');
const selectedColor = document.getElementById('selectedColor');
const rgbValue = document.getElementById('rgbValue');
const hexValue = document.getElementById('hexValue');
const colorPreview = document.getElementById('colorPreview');
const colorHistory = document.getElementById('colorHistory');

let currentImage = null;
let scale = 1;

fileInput.addEventListener('change', handleFileSelect);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('click', handleClick);
canvas.addEventListener('mouseleave', () => {
    colorPreview.classList.add('hidden');
});

window.addEventListener('resize', () => {
    if (currentImage) {
        resizeCanvas();
        drawImage();
    }
});

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            currentImage = new Image();
            currentImage.onload = () => {
                imageSection.classList.remove('hidden');
                resizeCanvas();
                drawImage();
            };
            currentImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function resizeCanvas() {
    const containerWidth = canvas.parentElement.clientWidth;
    scale = containerWidth / currentImage.width;
    
    canvas.width = currentImage.width;
    canvas.height = currentImage.height;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
}

function drawImage() {
    ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

function handleMouseMove(e) {
    const pos = getMousePos(e);
    const pixel = ctx.getImageData(pos.x, pos.y, 1, 1).data;
    updateColorDisplay(pixel);
    updateColorPreview(e, pixel);
}

function handleClick(e) {
    const pos = getMousePos(e);
    const pixel = ctx.getImageData(pos.x, pos.y, 1, 1).data;
    addToHistory(pixel);
}

function updateColorDisplay(pixel) {
    const [r, g, b] = pixel;
    const rgbString = `rgb(${r}, ${g}, ${b})`;
    const hexString = rgbToHex(r, g, b);

    selectedColor.style.backgroundColor = rgbString;
    rgbValue.textContent = rgbString;
    hexValue.textContent = hexString;
}

function updateColorPreview(e, pixel) {
    const rect = canvas.getBoundingClientRect();
    const [r, g, b] = pixel;
    
    colorPreview.style.left = `${e.clientX - rect.left - 12}px`;
    colorPreview.style.top = `${e.clientY - rect.top - 12}px`;
    colorPreview.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    colorPreview.classList.remove('hidden');
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
}

function addToHistory(pixel) {
    const [r, g, b] = pixel;
    const rgbString = `rgb(${r}, ${g}, ${b})`;
    const hexString = rgbToHex(r, g, b);

    const colorDiv = document.createElement('div');
    colorDiv.className = 'w-8 h-8 rounded-lg cursor-pointer border border-gray-200 transition-transform hover:scale-110';
    colorDiv.style.backgroundColor = rgbString;
    colorDiv.title = hexString;
    
    colorDiv.addEventListener('click', () => {
        selectedColor.style.backgroundColor = rgbString;
        rgbValue.textContent = rgbString;
        hexValue.textContent = hexString;
    });

    if (colorHistory.children.length >= 10) {
        colorHistory.removeChild(colorHistory.firstChild);
    }
    colorHistory.appendChild(colorDiv);
}

function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent;
    navigator.clipboard.writeText(text).then(() => {
        element.classList.add('bg-green-100');
        setTimeout(() => {
            element.classList.remove('bg-green-100');
        }, 500);
    });
}

// drag and drop handlers
document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        fileInput.files = e.dataTransfer.files;
        fileInput.dispatchEvent(new Event('change'));
    }
});