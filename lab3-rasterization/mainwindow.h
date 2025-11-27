#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QPushButton>
#include <QLabel>
#include <QLineEdit>
#include <QComboBox>
#include <QSlider>
#include <QVBoxLayout>
#include <QHBoxLayout>
#include <QGroupBox>
#include "canvas.h"

class MainWindow : public QMainWindow {
    Q_OBJECT

public:
    MainWindow(QWidget *parent = nullptr);
    ~MainWindow();

private slots:
    void onDrawClicked();
    void onScaleChanged(int value);
    void onMethodChanged(int index);

private:
    Canvas *canvas;
    
    // Элементы интерфейса
    QLineEdit *editX1, *editY1, *editX2, *editY2, *editRadius;
    QComboBox *comboMethod;
    QLabel *labelTime;
    QLabel *labelScale;
    QSlider *sliderScale;
    QGroupBox *groupLineParams;
    QGroupBox *groupCircleParams;

    void setupUi();
};

#endif // MAINWINDOW_H