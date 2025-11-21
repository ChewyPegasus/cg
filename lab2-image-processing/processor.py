import cv2
import numpy as np
import base64
import matplotlib
matplotlib.use('Agg')  # Для работы без GUI
import matplotlib.pyplot as plt
from io import BytesIO

class ImageProcessor:
    @staticmethod
    def bytes_to_image(file_bytes):
        """Конвертирует байты от браузера в формат OpenCV"""
        nparr = np.frombuffer(file_bytes, np.uint8)
        return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    @staticmethod
    def image_to_base64(image, quality=85):
        """Конвертирует изображение обратно в строку Base64 для HTML с сжатием"""
        # Используем JPEG для меньшего размера файла
        encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
        _, buffer = cv2.imencode('.jpg', image, encode_param)
        img_str = base64.b64encode(buffer).decode('utf-8')
        return f"data:image/jpeg;base64,{img_str}"
    
    @staticmethod
    def create_histogram(image):
        """Создает гистограмму для изображения и возвращает в base64"""
        plt.figure(figsize=(8, 4))
        
        # Если изображение цветное
        if len(image.shape) == 3:
            colors = ('b', 'g', 'r')
            labels = ('Blue', 'Green', 'Red')
            for i, (color, label) in enumerate(zip(colors, labels)):
                hist = cv2.calcHist([image], [i], None, [256], [0, 256])
                plt.plot(hist, color=color, label=label, linewidth=2)
            plt.legend()
        else:
            # Для grayscale
            hist = cv2.calcHist([image], [0], None, [256], [0, 256])
            plt.plot(hist, color='black', linewidth=2)
        
        plt.xlabel('Яркость')
        plt.ylabel('Количество пикселей')
        plt.title('Гистограмма')
        plt.grid(alpha=0.3)
        plt.tight_layout()
        
        # Сохраняем в буфер
        buf = BytesIO()
        plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
        buf.seek(0)
        plt.close()
        
        # Конвертируем в base64
        img_str = base64.b64encode(buf.read()).decode('utf-8')
        return f"data:image/png;base64,{img_str}"

    @staticmethod
    def apply_canny(image, t1, t2):
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, t1, t2)
        return edges

    @staticmethod
    def apply_hough_lines(image, threshold, min_len, max_gap):
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        # Сначала Canny для выделения краев
        edges = cv2.Canny(gray, 50, 150)
        lines_img = image.copy()
        
        lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold, 
                                minLineLength=min_len, maxLineGap=max_gap)
        
        if lines is not None:
            for line in lines:
                x1, y1, x2, y2 = line[0]
                cv2.line(lines_img, (x1, y1), (x2, y2), (0, 255, 0), 2)
        return lines_img

    @staticmethod
    def apply_linear_contrast(image):
        # Нормализация (растяжение гистограммы) от min/max к 0/255
        return cv2.normalize(image, None, alpha=0, beta=255, 
                             norm_type=cv2.NORM_MINMAX)

    @staticmethod
    def apply_equalize_rgb(image):
        # Разделяем каналы, эквализируем каждый, собираем обратно
        channels = cv2.split(image)
        eq_channels = [cv2.equalizeHist(ch) for ch in channels]
        return cv2.merge(eq_channels)

    @staticmethod
    def apply_equalize_hsv(image):
        # Конвертируем в HSV -> эквализируем только яркость (V) -> обратно
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        h, s, v = cv2.split(hsv)
        v_eq = cv2.equalizeHist(v)
        hsv_eq = cv2.merge((h, s, v_eq))
        return cv2.cvtColor(hsv_eq, cv2.COLOR_HSV2BGR)

    @staticmethod
    def process(file_bytes, method, params):
        img = ImageProcessor.bytes_to_image(file_bytes)
        original_b64 = ImageProcessor.image_to_base64(img)
        original_hist = ImageProcessor.create_histogram(img)
        res_img = img

        if method == "canny":
            res_img = ImageProcessor.apply_canny(img, int(params.get('canny_t1')), int(params.get('canny_t2')))
        
        elif method == "hough":
            res_img = ImageProcessor.apply_hough_lines(img, int(params.get('hough_thresh')), 
                                                       int(params.get('hough_min_len')), 
                                                       int(params.get('hough_max_gap')))
        
        elif method == "contrast":
            res_img = ImageProcessor.apply_linear_contrast(img)
        
        elif method == "eq_rgb":
            res_img = ImageProcessor.apply_equalize_rgb(img)
            
        elif method == "eq_hsv":
            res_img = ImageProcessor.apply_equalize_hsv(img)

        result_hist = ImageProcessor.create_histogram(res_img)
        
        return {
            'result': ImageProcessor.image_to_base64(res_img),
            'original': original_b64,
            'original_hist': original_hist,
            'result_hist': result_hist
        }