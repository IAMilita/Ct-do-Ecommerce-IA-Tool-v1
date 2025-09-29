
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove prefix e.g. "data:image/jpeg;base64,"
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const processImage = (base64String: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = `data:image/png;base64,${base64String}`;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const targetSize = 1200;
            canvas.width = targetSize;
            canvas.height = targetSize;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Não foi possível obter o contexto do canvas'));
            }

            // Preenche o fundo com branco para garantir que não haja transparência nas bordas
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, targetSize, targetSize);

            // Calcula as novas dimensões para caber no container 1200x1200 mantendo a proporção
            const aspectRatio = img.width / img.height;
            let newWidth, newHeight, x, y;

            if (aspectRatio > 1) { // Imagem mais larga que alta
                newWidth = targetSize;
                newHeight = targetSize / aspectRatio;
                x = 0;
                y = (targetSize - newHeight) / 2;
            } else { // Imagem mais alta que larga ou quadrada
                newHeight = targetSize;
                newWidth = targetSize * aspectRatio;
                y = 0;
                x = (targetSize - newWidth) / 2;
            }

            // Desenha a imagem redimensionada no canvas
            ctx.drawImage(img, x, y, newWidth, newHeight);

            // Adiciona as marcas nos cantos
            const lineLength = 76; // Aproximadamente 2cm a 96 DPI
            const offset = 20; // Espaçamento do canto
            const lineEndCoord = offset + Math.round(lineLength / Math.sqrt(2)); // Delta de ~54px para uma linha a 45 graus

            ctx.strokeStyle = '#808080'; // Cor cinza para a linha
            ctx.lineWidth = 2; // Aproximadamente 1mm de largura
            ctx.beginPath();

            // Canto superior esquerdo
            ctx.moveTo(offset, offset);
            ctx.lineTo(lineEndCoord, lineEndCoord);

            // Canto inferior direito
            ctx.moveTo(targetSize - offset, targetSize - offset);
            ctx.lineTo(targetSize - lineEndCoord, targetSize - lineEndCoord);

            ctx.stroke();

            // Obtém data URL como JPEG com alta qualidade
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            resolve(dataUrl); // Retorna a data URL completa para exibição/download
        };

        img.onerror = (error) => {
            reject(error);
        };
    });
};

export const getFormattedFileName = (title: string): string => {
    if (!title) return 'produto';
    return title
        .trim()
        .split(' ')
        .slice(0, 2)
        .join('_')
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '');
};