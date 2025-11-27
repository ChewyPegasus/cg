#ifndef CANVAS_H
#define CANVAS_H

#include <QWidget>
#include <QPainter>
#include <vector>
#include <QPoint>

class Canvas : public QWidget {
    Q_OBJECT

public:
    explicit Canvas(QWidget *parent = nullptr);
    void setPixels(const std::vector<QPoint>& pixels);
    void setGridSize(int size);

protected:
    void paintEvent(QPaintEvent *event) override;

private:
    std::vector<QPoint> m_pixels;
    int m_gridSize = 20;

    void drawGrid(QPainter &painter);
    void drawAxes(QPainter &painter);
    void drawPixels(QPainter &painter);

    QPoint toScreen(QPoint logicalPos);
};

#endif // CANVAS_H