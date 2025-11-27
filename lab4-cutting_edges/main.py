import tkinter as tk
from tkinter import filedialog, messagebox
import math

CANVAS_WIDTH = 800
CANVAS_HEIGHT = 600
PADDING = 50
EPSILON = 0.01

INSIDE = 0
LEFT = 1
RIGHT = 2
BOTTOM = 4
TOP = 8

class ClippingApp(tk.Frame):
    def __init__(self, master=None):
        super().__init__(master)
        self.master = master
        self.master.title("ЛР №24: Отсечение отрезков и многоугольников")
        self.pack()
        
        self.segments = []
        self.rect_window = None
        self.poly_window = []
        
        self.create_widgets()
        self.setup_scaling()

    def create_widgets(self):
        self.canvas = tk.Canvas(self, width=CANVAS_WIDTH, height=CANVAS_HEIGHT, bg='white')
        self.canvas.pack(side="top", fill="both", expand=True)

        control_frame = tk.Frame(self)
        control_frame.pack(side="bottom", fill="x", pady=10)

        tk.Button(control_frame, text="Загрузить данные", command=self.load_data).pack(side="left", padx=5)
        tk.Button(control_frame, text="Отсечь (Midpoint)", command=lambda: self.clip_segments(algorithm='midpoint')).pack(side="left", padx=5)
        tk.Button(control_frame, text="Отсечь (Cyrus-Beck)", command=lambda: self.clip_segments(algorithm='cyrus_beck')).pack(side="left", padx=5)
        tk.Button(control_frame, text="Сброс", command=self.reset_canvas).pack(side="right", padx=5)

    def setup_scaling(self):
        """Определяет масштаб и границы 'мировых' координат."""
        self.X_WORLD_MIN = 0
        self.Y_WORLD_MIN = 0
        self.X_WORLD_MAX = 160
        self.Y_WORLD_MAX = 160
        
        self.scale_x = (CANVAS_WIDTH - 2 * PADDING) / (self.X_WORLD_MAX - self.X_WORLD_MIN)
        self.scale_y = (CANVAS_HEIGHT - 2 * PADDING) / (self.Y_WORLD_MAX - self.Y_WORLD_MIN)

    def W2S(self, x, y):
        """Перевод мировых координат (World) в экранные пиксели (Screen)."""
        sx = PADDING + (x - self.X_WORLD_MIN) * self.scale_x
        sy = CANVAS_HEIGHT - PADDING - (y - self.Y_WORLD_MIN) * self.scale_y
        return sx, sy

    def load_data(self):
        """Загружает и парсит данные из файла."""
        filepath = filedialog.askopenfilename(defaultextension=".txt", filetypes=[("Text files", "*.txt")])
        if not filepath:
            return

        try:
            with open(filepath, 'r') as f:
                lines = [line.strip() for line in f if line.strip()]
            
            if not lines:
                raise ValueError("Файл пуст.")
            
            num_segments = int(lines[0])
            
            self.segments = []
            for i in range(1, num_segments + 1):
                coords = list(map(float, lines[i].split()))
                if len(coords) == 4:
                    self.segments.append((coords[0], coords[1], coords[2], coords[3]))
                else:
                    raise ValueError(f"Неверное число координат в строке {i+1}")

            last_line_coords = list(map(float, lines[num_segments + 1].split()))
            
            self.rect_window = (
                min(last_line_coords[0], last_line_coords[2]),
                min(last_line_coords[1], last_line_coords[3]),
                max(last_line_coords[0], last_line_coords[2]),
                max(last_line_coords[1], last_line_coords[3])
            )
            
            if len(last_line_coords) > 4:
                poly_coords = last_line_coords[4:]
                if len(poly_coords) % 2 != 0:
                    raise ValueError("Координаты многоугольника должны быть парными (X Y)")
                self.poly_window = [(poly_coords[i], poly_coords[i+1]) for i in range(0, len(poly_coords), 2)]
            else:
                self.poly_window = []
            
            messagebox.showinfo("Успех", f"Загружено {num_segments} отрезков.")
            self.redraw()
            
        except Exception as e:
            messagebox.showerror("Ошибка парсинга", f"Произошла ошибка при чтении файла: {e}")

    def draw_coordinate_system(self):
        """Отрисовывает оси координат с масштабом."""
        self.canvas.delete("axis") 
        
        sx_min, sy_max = self.W2S(self.X_WORLD_MIN, self.Y_WORLD_MIN)
        sx_max, sy_min = self.W2S(self.X_WORLD_MAX, self.Y_WORLD_MAX)
        
        self.canvas.create_rectangle(sx_min, sy_min, sx_max, sy_max, outline="gray", tags="axis")
        
        step = 20
        for i in range(0, int(self.X_WORLD_MAX) + 1, step):
            sx, _ = self.W2S(i, 0)
            self.canvas.create_line(sx, sy_max, sx, sy_max + 5, fill="gray", tags="axis")
            self.canvas.create_text(sx, sy_max + 15, text=str(i), anchor="n", fill="gray", font=("Arial", 8), tags="axis")
            
        for i in range(0, int(self.Y_WORLD_MAX) + 1, step):
            _, sy = self.W2S(0, i)
            self.canvas.create_line(sx_min - 5, sy, sx_min, sy, fill="gray", tags="axis")
            self.canvas.create_text(sx_min - 15, sy, text=str(i), anchor="e", fill="gray", font=("Arial", 8), tags="axis")
            
    def draw_initial_data(self):
        """Отрисовывает исходные отрезки и отсекающие окна."""
        
        if self.rect_window:
            xmin, ymin, xmax, ymax = self.rect_window
            sx1, sy1 = self.W2S(xmin, ymax) 
            sx2, sy2 = self.W2S(xmax, ymin)
            self.canvas.create_rectangle(sx1, sy1, sx2, sy2, outline="blue", width=2, dash=(5, 3), tags="window_rect")
        
        if self.poly_window:
            screen_coords = [coord for point in self.poly_window for coord in self.W2S(point[0], point[1])]
            self.canvas.create_polygon(screen_coords, outline="purple", fill="", width=2, dash=(5, 3), tags="window_poly")

        for x1, y1, x2, y2 in self.segments:
            sx1, sy1 = self.W2S(x1, y1)
            sx2, sy2 = self.W2S(x2, y2)
            self.canvas.create_line(sx1, sy1, sx2, sy2, fill="lightgray", width=2, tags="initial_segment")

    def redraw(self):
        self.canvas.delete("all")
        self.draw_coordinate_system()
        self.draw_initial_data()

    def reset_canvas(self):
        self.segments = []
        self.rect_window = None
        self.poly_window = []
        self.redraw()
        messagebox.showinfo("Сброс", "Данные и холст очищены.")

    def clip_segments(self, algorithm):
        if not self.segments:
            messagebox.showerror("Ошибка", "Сначала загрузите данные!")
            return
            
        self.canvas.delete("clipped_result")
        clipped_segments = []
        
        if algorithm == 'midpoint':
            if not self.rect_window:
                messagebox.showerror("Ошибка", "Прямоугольное окно не задано (данные в файле отсутствуют)!")
                return
            for segment in self.segments:
                res = self.midpoint_clip(segment, self.rect_window)
                if res:
                    clipped_segments.append(res)
            
        elif algorithm == 'cyrus_beck':
            if not self.poly_window or len(self.poly_window) < 3:
                messagebox.showerror("Ошибка", "Многоугольник не задан корректно (меньше 3 вершин)!")
                return
            for segment in self.segments:
                res = self.cyrus_beck_clip(segment, self.poly_window)
                if res:
                    clipped_segments.append(res)
            
        self.draw_clipped_results(clipped_segments)
        
        algo_name = "Средней точки" if algorithm == 'midpoint' else "Кируса-Бека"
        messagebox.showinfo("Результат", f"Алгоритм: {algo_name}\nВидимых отрезков: {len(clipped_segments)}")

    def draw_clipped_results(self, clipped_segments):
        for x1, y1, x2, y2 in clipped_segments:
            sx1, sy1 = self.W2S(x1, y1)
            sx2, sy2 = self.W2S(x2, y2)
            self.canvas.create_line(sx1, sy1, sx2, sy2, fill="red", width=3, tags="clipped_result")
            r = 3
            self.canvas.create_oval(sx1-r, sy1-r, sx1+r, sy1+r, fill="red", outline="black")
            self.canvas.create_oval(sx2-r, sy2-r, sx2+r, sy2+r, fill="red", outline="black")

    def _get_code(self, x, y, xmin, ymin, xmax, ymax):
        """Вычисляет код точки для алгоритма Коэна-Сазерленда (используется в Midpoint)."""
        code = INSIDE
        if x < xmin: code |= LEFT
        if x > xmax: code |= RIGHT
        if y < ymin: code |= BOTTOM
        if y > ymax: code |= TOP
        return code

    def midpoint_clip(self, segment, window):
        """
        Алгоритм средней точки (Midpoint Subdivision).
        Использует бинарное разбиение для поиска точки пересечения с границей окна.
        """
        x1, y1, x2, y2 = segment
        xmin, ymin, xmax, ymax = window

        def is_visible(x, y):
            return xmin <= x <= xmax and ymin <= y <= ymax

        if is_visible(x1, y1) and is_visible(x2, y2):
            return (x1, y1, x2, y2)

        code1 = self._get_code(x1, y1, xmin, ymin, xmax, ymax)
        code2 = self._get_code(x2, y2, xmin, ymin, xmax, ymax)

        if code1 & code2 != 0:
            return None

        def find_intersection(P_out, P_in):
            x_out, y_out = P_out
            x_in, y_in = P_in
            
            for _ in range(100):
                if math.hypot(x_out - x_in, y_out - y_in) < EPSILON:
                    return x_in, y_in
                
                xm = (x_out + x_in) / 2
                ym = (y_out + y_in) / 2
                
                if self._get_code(xm, ym, xmin, ymin, xmax, ymax) != 0:
                    x_out, y_out = xm, ym
                else:
                    x_in, y_in = xm, ym
            return x_in, y_in

        return self._midpoint_recursive(segment, window, 0)

    def _midpoint_recursive(self, segment, window, depth):
        x1, y1, x2, y2 = segment
        xmin, ymin, xmax, ymax = window
        
        code1 = self._get_code(x1, y1, xmin, ymin, xmax, ymax)
        code2 = self._get_code(x2, y2, xmin, ymin, xmax, ymax)
        
        if (code1 | code2) == 0:
            return segment
        
        if (code1 & code2) != 0:
            return None
            
        if depth > 10 or math.hypot(x1-x2, y1-y2) < 1.0:
            xm, ym = (x1+x2)/2, (y1+y2)/2
            if self._get_code(xm, ym, xmin, ymin, xmax, ymax) == 0:
                 return (xm, ym, xm, ym)
            return None

        xm, ym = (x1+x2)/2, (y1+y2)/2
        seg_left = self._midpoint_recursive((x1, y1, xm, ym), window, depth+1)
        seg_right = self._midpoint_recursive((xm, ym, x2, y2), window, depth+1)
        
        if seg_left and seg_right:
            return (seg_left[0], seg_left[1], seg_right[2], seg_right[3])
        elif seg_left:
            return seg_left
        elif seg_right:
            return seg_right
        return None

    def cyrus_beck_clip(self, segment, polygon_verts):
        """
        Исправленный алгоритм Кируса-Бека.
        Корректно обрабатывает нормали для CCW (против часовой стрелки) многоугольников.
        """
        x1, y1, x2, y2 = segment
        
        t_entry = 0.0
        t_exit = 1.0
        
        dx = x2 - x1
        dy = y2 - y1
        
        n = len(polygon_verts)
        for i in range(n):
            curr_v = polygon_verts[i]
            next_v = polygon_verts[(i + 1) % n]
            
            edge_x = next_v[0] - curr_v[0]
            edge_y = next_v[1] - curr_v[1]
            
            normal_x = -edge_y
            normal_y = edge_x
            
            W_x = x1 - curr_v[0]
            W_y = y1 - curr_v[1]
            
            D_dot_n = dx * normal_x + dy * normal_y
            W_dot_n = W_x * normal_x + W_y * normal_y
            
            if D_dot_n == 0:
                if W_dot_n < 0:
                    return None
                else:
                    continue
            
            t = -W_dot_n / D_dot_n
            
            if D_dot_n > 0:
                t_entry = max(t_entry, t)
            else:
                t_exit = min(t_exit, t)
                
        if t_entry <= t_exit:
            new_x1 = x1 + dx * t_entry
            new_y1 = y1 + dy * t_entry
            new_x2 = x1 + dx * t_exit
            new_y2 = y1 + dy * t_exit
            return (new_x1, new_y1, new_x2, new_y2)
        
        return None

if __name__ == '__main__':
    root = tk.Tk()
    app = ClippingApp(master=root)
    root.mainloop()