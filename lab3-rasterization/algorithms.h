#ifndef ALGORITHMS_H
#define ALGORITHMS_H

#include <vector>
#include <cmath>
#include <algorithm>
#include <QPoint>

class Rasterizer {
public:
    // 1. Пошаговый алгоритм (Step-by-Step)
    static std::vector<QPoint> stepByStep(int x1, int y1, int x2, int y2) {
        std::vector<QPoint> points;
        if (x1 == x2) { // Вертикальная линия
            int start = std::min(y1, y2);
            int end = std::max(y1, y2);
            for (int y = start; y <= end; ++y) points.emplace_back(x1, y);
            return points;
        }

        double k = (double)(y2 - y1) / (x2 - x1);
        double b = y1 - k * x1;

        int start = std::min(x1, x2);
        int end = std::max(x1, x2);

        for (int x = start; x <= end; ++x) {
            int y = std::round(k * x + b);
            points.emplace_back(x, y);
        }
        return points;
    }

    // 2. Алгоритм ЦДА (DDA)
    static std::vector<QPoint> dda(int x1, int y1, int x2, int y2) {
        std::vector<QPoint> points;
        int dx = x2 - x1;
        int dy = y2 - y1;
        int steps = std::max(std::abs(dx), std::abs(dy));

        float xInc = dx / (float)steps;
        float yInc = dy / (float)steps;

        float x = x1;
        float y = y1;

        for (int i = 0; i <= steps; ++i) {
            points.emplace_back(std::round(x), std::round(y));
            x += xInc;
            y += yInc;
        }
        return points;
    }

    // 3. Алгоритм Брезенхема (Отрезок)
    static std::vector<QPoint> bresenhamLine(int x1, int y1, int x2, int y2) {
        std::vector<QPoint> points;
        int dx = std::abs(x2 - x1);
        int dy = std::abs(y2 - y1);
        int sx = (x1 < x2) ? 1 : -1;
        int sy = (y1 < y2) ? 1 : -1;
        int err = dx - dy;

        while (true) {
            points.emplace_back(x1, y1);
            if (x1 == x2 && y1 == y2) break;
            int e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x1 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y1 += sy;
            }
        }
        return points;
    }

    // 4. Алгоритм Брезенхема (Окружность)
    static std::vector<QPoint> bresenhamCircle(int xc, int yc, int r) {
        std::vector<QPoint> points;
        int x = 0;
        int y = r;
        int d = 3 - 2 * r;

        auto addPoints = [&](int x, int y) {
            points.emplace_back(xc + x, yc + y);
            points.emplace_back(xc - x, yc + y);
            points.emplace_back(xc + x, yc - y);
            points.emplace_back(xc - x, yc - y);
            points.emplace_back(xc + y, yc + x);
            points.emplace_back(xc - y, yc + x);
            points.emplace_back(xc + y, yc - x);
            points.emplace_back(xc - y, yc - x);
        };

        while (y >= x) {
            addPoints(x, y);
            x++;
            if (d > 0) {
                y--;
                d = d + 4 * (x - y) + 10;
            } else {
                d = d + 4 * x + 6;
            }
        }
        return points;
    }
};

#endif // ALGORITHMS_H