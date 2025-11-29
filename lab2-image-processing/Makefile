.RECIPEPREFIX = 
.SHELLFLAGS = -c

.ONESHELL:
ifeq ($(OS),Windows_NT)
    SHELL = cmd /C chcp 65001 > NUL &&
else
    SHELL = /bin/bash
endif

PROJECT_NAME = fastapi_cv_lab
PYTHON = python
MAIN_APP = main:app
HOST = 127.0.0.1
PORT = 8000
VENV_DIR = .venv
REQS = requirements.txt

ifeq ($(OS),Windows_NT)
    PYTHON_BIN = .venv\Scripts\python.exe
    PIP_BIN = .venv\Scripts\pip.exe
    UVICORN_BIN = .venv\Scripts\uvicorn.exe
    RM = cmd /C rmdir /S /Q
    MKDIR = cmd /C if not exist
else
    PYTHON_BIN = $(VENV_DIR)/bin/python
    PIP_BIN = $(VENV_DIR)/bin/pip
    UVICORN_BIN = $(VENV_DIR)/bin/uvicorn
    RM = rm -rf
    MKDIR = mkdir -p
endif

.PHONY: install run dev clean help venv stop

help:
	@echo "Available commands:"
	@echo "  make install	- Installs dependencies into the virtual environment."
	@echo "  make run		- Runs the application in production mode (no hot reload)."
	@echo "  make dev		- Runs the application in development mode (with hot reload)."
	@echo "  make stop		- Stops all uvicorn processes."
	@echo "  make clean	- Removes the virtual environment and Python cache."
	@echo "  make venv		- Creates a virtual environment if it does not exist."
venv:
	@echo "Creating virtual environment..."
	@$(PYTHON) -m venv $(VENV_DIR)

install: venv
	@echo "Installing dependencies from $(REQS)..."
ifeq ($(OS),Windows_NT)
	@$(PYTHON_BIN) -m pip install -r $(REQS)
else
	@$(PIP_BIN) install -r $(REQS)
endif
	@echo "Installation complete."

run:
	@echo "Starting service at http://$(HOST):$(PORT)..."
ifeq ($(OS),Windows_NT)
	@$(PYTHON_BIN) -m uvicorn $(MAIN_APP) --host $(HOST) --port $(PORT)
else
	@$(UVICORN_BIN) $(MAIN_APP) --host $(HOST) --port $(PORT)
endif

dev:
	@echo "Starting service in development mode (hot reload) at http://$(HOST):$(PORT)..."
ifeq ($(OS),Windows_NT)
	@$(PYTHON_BIN) -m uvicorn $(MAIN_APP) --host $(HOST) --port $(PORT) --reload --limit-max-requests 10000 --timeout-keep-alive 300
else
	@$(UVICORN_BIN) $(MAIN_APP) --host $(HOST) --port $(PORT) --reload --limit-max-requests 10000 --timeout-keep-alive 300
endif

stop:
	@echo "Stopping uvicorn..."
ifeq ($(OS),Windows_NT)
	@taskkill /F /IM uvicorn.exe 2>nul || echo "No uvicorn processes found"
else
	@pkill -f uvicorn || echo "No uvicorn processes found"
endif
	@echo "Done."

clean:
	@echo "Cleaning project..."
ifeq ($(OS),Windows_NT)
	@if exist $(VENV_DIR) $(RM) $(VENV_DIR)
	@for /d /r . %%d in (__pycache__) do @if exist "%%d" rd /s /q "%%d"
else
    @rm -rf $(VENV_DIR)
    @find . -type d -name "__pycache__" -exec rm -rf {} +
endif
	@echo "Clean up complete."