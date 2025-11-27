cmake_minimum_required(VERSION 3.16)
project(RasterizationLab LANGUAGES CXX)
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTOUIC ON)
set(CMAKE_AUTORCC ON)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_PREFIX_PATH "D:/Install/Qt/6.10.1/mingw_64")
find_package(Qt6 REQUIRED COMPONENTS Core Gui Widgets)
add_executable(RasterizationLab
    main.cpp
    mainwindow.cpp
    mainwindow.h
    canvas.cpp
    canvas.h
    algorithms.h
)
target_link_libraries(RasterizationLab PRIVATE Qt6::Widgets)