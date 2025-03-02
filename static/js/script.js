document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('idCardForm');
    const previewElements = {
        participantImage: document.getElementById('participantImagePreview'),
        participantName: document.getElementById('participantNamePreview'),
        participantRole: document.getElementById('participantRolePreview'),
        idNumber: document.getElementById('idNumberPreview'),
        department: document.getElementById('departmentPreview'),
        email: document.getElementById('emailPreview'),
        phone: document.getElementById('phonePreview'),
        barcode: document.getElementById('barcodePreview')
    };

    const cropModal = document.querySelector('.crop-modal');
    const cropperImage = document.getElementById('cropperImage');
    const participantImageInput = document.getElementById('participantImage');
    const previewImg = document.getElementById('participantImagePreview');
    const imageUploadArea = document.getElementById('imageUploadArea');
    const uploadAreaPreview = document.getElementById('uploadAreaPreview');
    let cropper = null;

    imageUploadArea.addEventListener('click', function() {
        participantImageInput.click();
    });

    participantImageInput.addEventListener('change', function(e) {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                cropModal.classList.add('active');
                cropperImage.src = e.target.result;
                
                if (cropper) {
                    cropper.destroy();
                }
                
                
                if (cropper) {
                    cropper.destroy();
                }
                
                cropper = new Cropper(cropperImage, {
                    aspectRatio: 1,
                    viewMode: 1,
                    dragMode: 'move',
                    autoCropArea: 1,
                    restore: false,
                    guides: true,
                    center: true,
                    highlight: false,
                    cropBoxMovable: false,
                    cropBoxResizable: false,
                    toggleDragModeOnDblclick: false,
                });
            };
            
            reader.readAsDataURL(this.files[0]);
        }
    });

    JsBarcode("#barcodePreview svg", "1234567890", {
        format: "CODE128",
        width: 1.5,
        height: 50,
        displayValue: false,
        lineColor: "#2c3e50",
        background: "transparent"  
    });

    participantImageInput.addEventListener('change', function(e) {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                cropModal.classList.add('active');
                cropperImage.src = e.target.result;
                
                if (cropper) {
                    cropper.destroy();
                }
                
                cropper = new Cropper(cropperImage, {
                    aspectRatio: 1,
                    viewMode: 1,
                    dragMode: 'move',
                    autoCropArea: 1,
                    restore: false,
                    guides: true,
                    center: true,
                    highlight: false,
                    cropBoxMovable: false,
                    cropBoxResizable: false,
                    toggleDragModeOnDblclick: false,
                });
            };
            
            reader.readAsDataURL(this.files[0]);
        }
    });

    document.querySelector('.action-btn.cancel').addEventListener('click', function() {
        cropModal.classList.remove('active');
        participantImageInput.value = ''; 
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
    });

    document.querySelector('.action-btn.confirm').addEventListener('click', function() {
        if (!cropper) return;
        
        const canvas = cropper.getCroppedCanvas({
            width: 400, 
            height: 400,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
        });

        canvas.toBlob(function(blob) {
            const croppedImageUrl = URL.createObjectURL(blob);
            
            previewImg.src = croppedImageUrl;
            uploadAreaPreview.src = croppedImageUrl;

            participantImageInput.cropped = blob;
        }, 'image/jpeg', 0.9);

        cropModal.classList.remove('active');
        cropper.destroy();
        cropper = null;
    });

    const textInputs = {
        'participantName': 'participantNamePreview',
        'participantRole': 'participantRolePreview',
        'idNumber': 'idNumberPreview',
        'department': 'departmentPreview',
        'email': 'emailPreview',
        'phone': 'phonePreview'
    };

    Object.keys(textInputs).forEach(inputId => {
        const input = document.getElementById(inputId);
        
        let debounceTimeout;
        
        input.addEventListener('input', function() {
            clearTimeout(debounceTimeout);
            
            debounceTimeout = setTimeout(() => {
                const value = this.value || 'xxxxxxxxxx';
                
                if (Array.isArray(textInputs[inputId])) {
                    textInputs[inputId].forEach(previewId => {
                        const element = document.getElementById(previewId);
                        updateWithAnimation(element, value, inputId === 'idNumber');
                    });
                } else {
                    const element = document.getElementById(textInputs[inputId]);
                    updateWithAnimation(element, value);
                }
                
                if (inputId === 'idNumber') {
                    JsBarcode("#barcodePreview svg", value || "1234567890", {
                        format: "CODE128",
                        width: 1.5,
                        height: 50,
                        displayValue: false,
                        lineColor: "#2c3e50",
                        background: "transparent"  
                    });
                }
            }, 300); 
        });
    });

    function updateWithAnimation(element, newValue, isIdNumber = false) {
        const displayValue = newValue;
            
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.textContent = displayValue;
            element.style.opacity = '1';
        }, 150);
    }

    document.getElementById('downloadBtn').addEventListener('click', async function() {
        try {
            this.textContent = 'Downloading...';
            this.disabled = true;
            
            const frontCard = document.querySelector('.id-card.front');
            const backCard = document.querySelector('.id-card.back');
            
            const frontCanvas = await html2canvas(frontCard, {
                scale: 2,
                allowTaint: true,
                useCORS: true,
                backgroundColor: null,
                removeContainer: true,
                logging: false,
                imageTimeout: 0,  
                onclone: function(clonedDoc) {
                    const clonedImages = clonedDoc.querySelectorAll('img');
                    clonedImages.forEach(img => {
                        img.style.maxHeight = '100%';
                        img.style.width = 'auto';
                        img.style.objectFit = 'contain';
                    });
                }
            });
            
            const backCanvas = await html2canvas(backCard, {
                scale: 2,
                allowTaint: true,
                useCORS: true,
                backgroundColor: null,
                removeContainer: true,
                imageTimeout: 0,  
                onclone: function(clonedDoc) {
                    const clonedImages = clonedDoc.querySelectorAll('img');
                    clonedImages.forEach(img => {
                        img.style.maxHeight = '100%';
                        img.style.width = 'auto';
                        img.style.objectFit = 'contain';
                    });
                }
            });
            
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            const frontAspectRatio = frontCanvas.width / frontCanvas.height;
            const maxWidth = pageWidth - 40;
            const maxHeight = pageHeight - 40;
            
            let cardWidth, cardHeight;
            if (frontAspectRatio > maxWidth / maxHeight) {
                cardWidth = maxWidth;
                cardHeight = cardWidth / frontAspectRatio;
            } else {
                cardHeight = maxHeight;
                cardWidth = cardHeight * frontAspectRatio;
            }
            
            const xOffset = (pageWidth - cardWidth) / 2;
            const yOffset = (pageHeight - cardHeight) / 2;
            
            pdf.addImage(
                frontCanvas.toDataURL('image/png', 1.0),
                'PNG',
                xOffset,
                yOffset,
                cardWidth,
                cardHeight,
                '',
                'FAST'
            );
            
            pdf.addPage();
            
            pdf.addImage(
                backCanvas.toDataURL('image/png', 1.0),
                'PNG',
                xOffset,
                yOffset,
                cardWidth,
                cardHeight,
                '',
                'FAST'
            );
            
            pdf.save('id-card.pdf');
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            this.textContent = 'Download ID Card';
            this.disabled = false;
        }
    });
});