cmake_minimum_required(VERSION 3.16)

# Название проекта
project(RasterizationLab LANGUAGES CXX)

# Включаем автоматическую обработку Qt-макросов (Q_OBJECT и т.д.)
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTOUIC ON)
set(CMAKE_AUTORCC ON)

# Стандарт C++17
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Указываем путь к Qt6
set(CMAKE_PREFIX_PATH "D:/Install/Qt/6.10.1/mingw_64")

# Находим пакеты Qt (Здесь ищем Qt6, если у вас Qt5 - смените цифру 6 на 5 везде ниже)
find_package(Qt6 REQUIRED COMPONENTS Core Gui Widgets)

# Добавляем все ваши файлы
add_executable(RasterizationLab
    main.cpp
    mainwindow.cpp
    mainwindow.h
    canvas.cpp
    canvas.h
    algorithms.h
)

# Линкуем библиотеки Qt к проекту
target_link_libraries(RasterizationLab PRIVATE Qt6::Widgets)