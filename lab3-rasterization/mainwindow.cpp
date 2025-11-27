#include "mainwindow.h"
#include "algorithms.h"
#include <chrono>
#include <QIntValidator>

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent) {
    setupUi();
}

MainWindow::~MainWindow() {}

void MainWindow::setupUi() {
    QWidget *centralWidget = new QWidget(this);
    setCentralWidget(centralWidget);

    QHBoxLayout *mainLayout = new QHBoxLayout(centralWidget);
    QVBoxLayout *controlsLayout = new QVBoxLayout();

    comboMethod = new QComboBox();
    comboMethod->addItem("Пошаговый алгоритм");
    comboMethod->addItem("Алгоритм ЦДА (DDA)");
    comboMethod->addItem("Брезенхем (Линия)");
    comboMethod->addItem("Брезенхем (Окружность)");
    connect(comboMethod, QOverload<int>::of(&QComboBox::currentIndexChanged), this, &MainWindow::onMethodChanged);
    controlsLayout->addWidget(new QLabel("Метод:"));
    controlsLayout->addWidget(comboMethod);

    groupLineParams = new QGroupBox("Координаты отрезка");
    QGridLayout *lineLayout = new QGridLayout();
    editX1 = new QLineEdit("0"); editY1 = new QLineEdit("0");
    editX2 = new QLineEdit("10"); editY2 = new QLineEdit("5");
    lineLayout->addWidget(new QLabel("X1:"), 0, 0); lineLayout->addWidget(editX1, 0, 1);
    lineLayout->addWidget(new QLabel("Y1:"), 0, 2); lineLayout->addWidget(editY1, 0, 3);
    lineLayout->addWidget(new QLabel("X2:"), 1, 0); lineLayout->addWidget(editX2, 1, 1);
    lineLayout->addWidget(new QLabel("Y2:"), 1, 2); lineLayout->addWidget(editY2, 1, 3);
    groupLineParams->setLayout(lineLayout);
    controlsLayout->addWidget(groupLineParams);

    groupCircleParams = new QGroupBox("Параметры окружности");
    QGridLayout *circleLayout = new QGridLayout();
    editRadius = new QLineEdit("10");
    circleLayout->addWidget(new QLabel("Радиус R:"), 0, 0); circleLayout->addWidget(editRadius, 0, 1);
    groupCircleParams->setLayout(circleLayout);
    groupCircleParams->hide();
    controlsLayout->addWidget(groupCircleParams);

    controlsLayout->addWidget(new QLabel("Масштаб сетки:"));
    sliderScale = new QSlider(Qt::Horizontal);
    sliderScale->setRange(5, 50);
    sliderScale->setValue(20);
    connect(sliderScale, &QSlider::valueChanged, this, &MainWindow::onScaleChanged);
    controlsLayout->addWidget(sliderScale);
    labelScale = new QLabel("20 px");
    controlsLayout->addWidget(labelScale);

    QPushButton *btnDraw = new QPushButton("Построить");
    connect(btnDraw, &QPushButton::clicked, this, &MainWindow::onDrawClicked);
    controlsLayout->addWidget(btnDraw);

    labelTime = new QLabel("Время: 0 нс");
    labelTime->setStyleSheet("font-weight: bold; color: green;");
    controlsLayout->addWidget(labelTime);

    controlsLayout->addStretch();

    canvas = new Canvas();
    canvas->setMinimumSize(600, 600);

    mainLayout->addLayout(controlsLayout, 1);
    mainLayout->addWidget(canvas, 4);
    
    QIntValidator *val = new QIntValidator(-1000, 1000, this);
    editX1->setValidator(val); editY1->setValidator(val);
    editX2->setValidator(val); editY2->setValidator(val);
    editRadius->setValidator(new QIntValidator(1, 1000, this));
}

void MainWindow::onMethodChanged(int index) {
    bool isCircle = (index == 3);
    groupLineParams->setVisible(!isCircle);
    groupCircleParams->setVisible(isCircle);
}

void MainWindow::onScaleChanged(int value) {
    labelScale->setText(QString("%1 px").arg(value));
    canvas->setGridSize(value);
}

void MainWindow::onDrawClicked() {
    std::vector<QPoint> result;
    int method = comboMethod->currentIndex();

    auto start = std::chrono::high_resolution_clock::now();

    if (method == 3) {
        int x1 = editX1->text().toInt();
        int y1 = editY1->text().toInt();
        int r = editRadius->text().toInt();
        result = Rasterizer::bresenhamCircle(x1, y1, r);
    } else {
        int x1 = editX1->text().toInt();
        int y1 = editY1->text().toInt();
        int x2 = editX2->text().toInt();
        int y2 = editY2->text().toInt();

        if (method == 0) result = Rasterizer::stepByStep(x1, y1, x2, y2);
        else if (method == 1) result = Rasterizer::dda(x1, y1, x2, y2);
        else if (method == 2) result = Rasterizer::bresenhamLine(x1, y1, x2, y2);
    }

    auto end = std::chrono::high_resolution_clock::now();
    auto duration = std::chrono::duration_cast<std::chrono::nanoseconds>(end - start).count();

    labelTime->setText(QString("Время: %1 нс").arg(duration));
    canvas->setPixels(result);
}