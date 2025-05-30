import os

# Definimos los caracteres hexadecimales (puedes ajustarlos)
HEX_CHARS = [f"{i:x}" for i in range(16)]  # ['0', '1', ..., 'f']

# Función para generar carpetas recursivamente
def generate_folders(base_path, current_level, max_level):
    if current_level > max_level:
        return

    # Generar todas las combinaciones de 4 caracteres hexadecimales
    for c1 in HEX_CHARS:
        for c2 in HEX_CHARS:
            for c3 in HEX_CHARS:
                for c4 in HEX_CHARS:
                    folder_name = f"{c1}{c2}{c3}{c4}"
                    new_path = os.path.join(base_path, folder_name)
                    
                    # Crear la carpeta si no existe
                    os.makedirs(new_path, exist_ok=True)
                    
                    # Llamar recursivamente si no hemos alcanzado el nivel máximo
                    if current_level < max_level:
                        generate_folders(new_path, current_level + 1, max_level)

# Carpeta base
BASE_DIR = "Cuarentena"

# Eliminar contenido previo si existe
if os.path.exists(BASE_DIR):
    print(f"Eliminando carpeta existente: {BASE_DIR}")
    for root, dirs, files in os.walk(BASE_DIR, topdown=False):
        for dir_name in dirs:
            os.rmdir(os.path.join(root, dir_name))
    os.rmdir(BASE_DIR)

# Crear la carpeta base
os.makedirs(BASE_DIR, exist_ok=True)

# Iniciar generación de carpetas (2 niveles)
print("Generando estructura de carpetas...")
generate_folders(BASE_DIR, 1, 2)

print("✅ Estructura de carpetas creada con éxito (2 niveles).")