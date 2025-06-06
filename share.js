document.getElementById('captureAndShareBtn').addEventListener('click', function() {
    if (typeof html2canvas !== 'function') {
        alert("html2canvas is not loaded correctly.");
        return;
    }
    const resultsDiv = document.getElementById('results');
    const items = resultsDiv.querySelectorAll('div');
    
    if (items.length === 0) {
        alert("No items to capture.");
        return;
    }

    let tempContent = '';
    items.forEach(item => {
        const img = item.querySelector('img').src;
        const status = item.querySelector('p:nth-child(2)').innerText;
        const material = item.querySelector('p:nth-child(3)').innerText;
        const location = item.querySelector('p:nth-child(4)').innerText;
        const lastWorn = item.querySelector('p:nth-child(5)').innerText;

        tempContent += `
            <div style="margin-bottom: 20px; font-size: 18px; max-width: 300px;">
                <img src="${img}" style="width: 150px; height: 150px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <p><strong>Status:</strong> ${status}</p>
                <p><strong>Material:</strong> ${material}</p>
                <p><strong>Location:</strong> ${location}</p>
                <p><strong>Last Worn:</strong> ${lastWorn}</p>
            </div>
        `;
    });

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = tempContent;
    document.body.appendChild(tempDiv);  

    html2canvas(tempDiv).then(canvas => {
        const base64Image = canvas.toDataURL('image/png');
        document.body.removeChild(tempDiv);
        sessionStorage.setItem('capturedImage', base64Image);
        window.location.href = 'render.html';
    }).catch(error => {
        console.error("Error generating image:", error);
        alert("Error generating image. Please try again.");
    });
});
