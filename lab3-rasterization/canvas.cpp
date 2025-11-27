#include "canvas.h"

Canvas::Canvas(QWidget *parent) : QWidget(parent) {
    setBackgroundRole(QPalette::Base);
    setAutoFillBackground(true);
}

void Canvas::setPixels(const std::vector<QPoint> &pixels) {
    m_pixels = pixels;
    update();
}

void Canvas::setGridSize(int size) {
    m_gridSize = size;
    update();
}

void Canvas::paintEvent(QPaintEvent *event) {
    Q_UNUSED(event);
    QPainter painter(this);
    
    painter.fillRect(rect(), Qt::white);

    drawGrid(painter);
    drawAxes(painter);
    drawPixels(painter);
}

void Canvas::drawGrid(QPainter &painter) {
    painter.setPen(QPen(Qt::lightGray, 1, Qt::DotLine));
    
    int w = width();
    int h = height();
    int cx = w / 2;
    int cy = h / 2;

    for (int x = cx; x < w; x += m_gridSize) painter.drawLine(x, 0, x, h);
    for (int x = cx; x > 0; x -= m_gridSize) painter.drawLine(x, 0, x, h);

    for (int y = cy; y < h; y += m_gridSize) painter.drawLine(0, y, w, y);
    for (int y = cy; y > 0; y -= m_gridSize) painter.drawLine(0, y, w, y);
}

void Canvas::drawAxes(QPainter &painter) {
    painter.setPen(QPen(Qt::black, 2));
    
    int cx = width() / 2;
    int cy = height() / 2;

    painter.drawLine(0, cy, width(), cy);
    painter.drawLine(cx, 0, cx, height());

    painter.drawText(width() - 20, cy - 5, "X");
    painter.drawText(cx + 5, 15, "Y");
    
    painter.drawText(cx + 5, cy + 15, "0");
}

void Canvas::drawPixels(QPainter &painter) {
    painter.setBrush(Qt::blue);
    painter.setPen(Qt::NoPen);

    for (const auto& p : m_pixels) {
        QPoint screenPos = toScreen(p);
        painter.drawRect(screenPos.x(), screenPos.y(), m_gridSize, m_gridSize);
    }
}

QPoint Canvas::toScreen(QPoint logicalPos) {
    int cx = width() / 2;
    int cy = height() / 2;
    
    return QPoint(cx + logicalPos.x() * m_gridSize, cy - logicalPos.y() * m_gridSize - m_gridSize);
}