const fs = require('fs');
const path = require('path');

// Icon sizes for PWA
const iconSizes = [16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512];

// Create a simple HTML file that will generate the icons
const generateIconsHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Icon Generator</title>
    <style>
        body { margin: 0; padding: 20px; background: #f0f0f0; }
        .icon-container { display: inline-block; margin: 10px; text-align: center; }
        canvas { border: 1px solid #ccc; }
    </style>
</head>
<body>
    <div id="icons"></div>
    <script>
        const sizes = [${iconSizes.join(', ')}];
        const iconContainer = document.getElementById('icons');
        
        // Create canvas and load SVG
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            sizes.forEach(size => {
                const container = document.createElement('div');
                container.className = 'icon-container';
                
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                
                // Draw the SVG to canvas
                ctx.drawImage(img, 0, 0, size, size);
                
                // Create download link
                const link = document.createElement('a');
                link.download = \`icon-\${size}x\${size}.png\`;
                link.href = canvas.toDataURL('image/png');
                link.textContent = \`Download \${size}x\${size}\`;
                link.style.display = 'block';
                link.style.marginTop = '5px';
                
                container.appendChild(canvas);
                container.appendChild(link);
                iconContainer.appendChild(container);
            });
        };
        
        // Load the SVG as data URL
        fetch('icons/icon.svg')
            .then(response => response.text())
            .then(svgText => {
                const svgBlob = new Blob([svgText], {type: 'image/svg+xml'});
                const url = URL.createObjectURL(svgBlob);
                img.src = url;
            });
    </script>
</body>
</html>
`;

// Write the HTML file
fs.writeFileSync('generate-icons.html', generateIconsHTML);

console.log('Icon generator HTML created: generate-icons.html');
console.log('Open this file in a browser to generate icons');
console.log('Then download each icon and place them in the icons/ directory'); 