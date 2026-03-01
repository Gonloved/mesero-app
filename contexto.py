import os

# --- CONFIGURACIÓN ---
# Nombre del archivo que se generará
ARCHIVO_SALIDA = "contexto_completo.txt"

# Carpetas que la IA NO necesita ver (Ahorra tokens y evita basura)
CARPETAS_IGNORAR = {
    'node_modules', '.git', '__pycache__', 'venv', 'env', 
    '.idea', '.vscode', 'build', 'dist', 'coverage', 
    'migrations' # Opcional: a veces las migraciones de DB son ruido
}

# Archivos específicos a ignorar
ARCHIVOS_IGNORAR = {
    'package-lock.json', 'yarn.lock', '.DS_Store', 
    'restaurante.db', 'db.sqlite3', # No subir la base de datos real
    'preparar_contexto.py', ARCHIVO_SALIDA
}

# Extensiones de código que SÍ queremos leer
EXTENSIONES_VALIDAS = {
    # Backend (Python)
    '.py', 
    # Frontend (React/Web)
    '.js', '.jsx', '.ts', '.tsx', '.html', '.css',
    # Configuración / Datos
    '.json', '.sql', '.md', '.txt'
}

def es_archivo_valido(nombre_archivo):
    ext = os.path.splitext(nombre_archivo)[1].lower()
    return (ext in EXTENSIONES_VALIDAS) and (nombre_archivo not in ARCHIVOS_IGNORAR)

def crear_contexto():
    print(f"🚀 Iniciando escaneo del proyecto...")
    
    contador_archivos = 0
    
    with open(ARCHIVO_SALIDA, 'w', encoding='utf-8') as f_out:
        # Escribimos una pequeña introducción para la IA
        f_out.write("CONTEXTO DEL PROYECTO:\n")
        f_out.write("Este archivo contiene todo el código fuente del sistema POS (React + Python).\n")
        f_out.write("Usa esto para entender la estructura completa.\n")
        f_out.write("-" * 50 + "\n\n")

        # Recorremos todas las carpetas desde la raíz
        for root, dirs, files in os.walk("."):
            # Filtrar carpetas prohibidas para no entrar en ellas
            dirs[:] = [d for d in dirs if d not in CARPETAS_IGNORAR]
            
            for file in files:
                if es_archivo_valido(file):
                    ruta_completa = os.path.join(root, file)
                    
                    try:
                        # Leemos el contenido del archivo
                        with open(ruta_completa, 'r', encoding='utf-8') as f_in:
                            contenido = f_in.read()
                        
                        # Escribimos el encabezado y el contenido en el archivo final
                        f_out.write(f"\n{'='*60}\n")
                        f_out.write(f"RUTA: {ruta_completa}\n")
                        f_out.write(f"{'='*60}\n")
                        f_out.write(contenido)
                        f_out.write("\n")
                        
                        print(f"✅ Agregado: {ruta_completa}")
                        contador_archivos += 1
                        
                    except Exception as e:
                        print(f"❌ Error leyendo {ruta_completa}: {e}")

    print(f"\n✨ ¡Terminado! Se han compactado {contador_archivos} archivos.")
    print(f"📂 Archivo generado: {ARCHIVO_SALIDA}")
    print("👉 Sube este archivo al chat de AI Studio.")

if __name__ == "__main__":
    crear_contexto()