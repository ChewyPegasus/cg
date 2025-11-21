# Computer Graphics Labs

Monorepo containing lab projects for Computer Graphics course.

## 📦 Projects

### Lab 1 - Color Model Converter 🎨
React app for converting between RGB, CMYK, HSV, HSL, XYZ, LAB color models.

**Stack:** React, Bootstrap, ColorJoe

### Lab 2 - Image Processing 🖼️
FastAPI app for image processing with filters and histogram visualization.

**Stack:** FastAPI, OpenCV, NumPy, Matplotlib

**Features:** Canny edges, Hough lines, contrast stretching, histogram equalization

---

## 🚀 Deployment

### Lab 1 → Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import this repository
3. **Root Directory:** `lab1-color-model`
4. **Framework Preset:** Create React App
5. Deploy

**Live:** [Add your URL]

### Lab 2 → Render.com

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect this repository
4. Render will auto-detect `render.yaml`
5. Deploy

> ⚠️ Lab 2 cannot use Vercel (OpenCV ~100MB, Vercel limit 50MB)

**Live:** [Add your URL]

---

## 💻 Local Development

**Lab 1:**
```bash
cd lab1-color-model
npm install
npm start
```

**Lab 2:**
```bash
cd lab2-image-processing
make install
make dev
```

---

## 📁 Structure

```
cg/
├── lab1-color-model/      # React app
├── lab2-image-processing/ # FastAPI app
├── vercel.json           # Lab 1 config
└── render.yaml           # Lab 2 config
```
