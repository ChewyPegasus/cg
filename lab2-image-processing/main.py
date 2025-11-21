from fastapi import FastAPI, Request, UploadFile, File, Form
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from processor import ImageProcessor

app = FastAPI(title="Image Processing Lab")

# Настройка шаблонов
templates = Jinja2Templates(directory="templates")

# Увеличиваем лимит размера запроса
from starlette.requests import Request as StarletteRequest
StarletteRequest.max_body_size = 50 * 1024 * 1024  # 50MB

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    """Отображает главную страницу"""
    return templates.TemplateResponse("index.html", {"request": request, "result": None})

@app.post("/process", response_class=HTMLResponse)
async def process_image(
    request: Request,
    file: UploadFile = File(None),
    method: str = Form(...),
    original_data: str = Form(None),
    # Параметры формы (делаем их Optional, так как не все нужны сразу)
    canny_t1: int = Form(50),
    canny_t2: int = Form(150),
    hough_thresh: int = Form(50),
    hough_min_len: int = Form(50),
    hough_max_gap: int = Form(10),
):
    # Читаем файл: либо новый, либо из base64
    if file and file.filename:
        file_bytes = await file.read()
    elif original_data:
        # Декодируем base64 обратно в байты
        import base64
        # Убираем префикс "data:image/png;base64,"
        img_data = original_data.split(',')[1] if ',' in original_data else original_data
        file_bytes = base64.b64decode(img_data)
    else:
        return templates.TemplateResponse("index.html", {
            "request": request, 
            "error": "Необходимо загрузить изображение"
        })
    
    # Собираем параметры в словарь
    params = {
        "canny_t1": canny_t1, "canny_t2": canny_t2,
        "hough_thresh": hough_thresh, "hough_min_len": hough_min_len, "hough_max_gap": hough_max_gap
    }

    # Запускаем обработку
    try:
        result_data = ImageProcessor.process(file_bytes, method, params)
    except Exception as e:
        return templates.TemplateResponse("index.html", {
            "request": request, 
            "error": f"Ошибка обработки: {str(e)}"
        })

    # Возвращаем страницу с результатом
    return templates.TemplateResponse("index.html", {
        "request": request, 
        "result": result_data['result'],
        "original": result_data['original'],
        "original_hist": result_data['original_hist'],
        "result_hist": result_data['result_hist'],
        "selected_method": method,
        "params": params
    })

if __name__ == "__main__":
    import uvicorn
    # Увеличиваем лимит для multipart form data
    uvicorn.run(app, host="127.0.0.1", port=8000, limit_max_requests=10000, 
                limit_concurrency=1000, timeout_keep_alive=120)