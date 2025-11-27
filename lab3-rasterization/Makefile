.PHONY: all build clean run

all: build

build:
	cmake -S . -B build -G "MinGW Makefiles"
	cmake --build build

run:
	set PATH=D:\Install\Qt\6.10.1\mingw_64\bin;%PATH% && cd build && RasterizationLab.exe

clean:
	rmdir /s /q build
