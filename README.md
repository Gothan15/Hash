<div align="center">

# HashBro: Analizador de Archivos con VirusTotal, Segurmatica y Firebase

_Optimizando el análisis seguro de archivos con una eficiencia impecable._

<img alt="last-commit" src="https://img.shields.io/github/last-commit/Gothan15/Hash?style=flat&logo=git&logoColor=white&color=0080ff" class="inline-block mx-1" style="margin: 0px 2px;">
<img alt="repo-top-language" src="https://img.shields.io/github/languages/top/Gothan15/Hash?style=flat&color=0080ff" class="inline-block mx-1" style="margin: 0px 2px;">
<img alt="repo-language-count" src="https://img.shields.io/github/languages/count/Gothan15/Hash?style=flat&color=0080ff" class="inline-block mx-1" style="margin: 0px 2px;">

<p><em>Construido con las herramientas y tecnologías:</em></p>

<img alt="Express" src="https://img.shields.io/badge/Express-000000.svg?style=flat&logo=Express&logoColor=white" class="inline-block mx-1" style="margin: 0px 2px;">
<img alt="JSON" src="https://img.shields.io/badge/JSON-000000.svg?style=flat&logo=JSON&logoColor=white" class="inline-block mx-1" style="margin: 0px 2px;">
<img alt="npm" src="https://img.shields.io/badge/npm-CB3837.svg?style=flat&logo=npm&logoColor=white" class="inline-block mx-1" style="margin: 0px 2px;">
<img alt="Firebase" src="https://img.shields.io/badge/Firebase-DD2C00.svg?style=flat&logo=Firebase&logoColor=white" class="inline-block mx-1" style="margin: 0px 2px;">
<img alt=".ENV" src="https://img.shields.io/badge/.ENV-ECD53F.svg?style=flat&logo=dotenv&logoColor=black" class="inline-block mx-1" style="margin: 0px 2px;">
<img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=flat&logo=JavaScript&logoColor=black" class="inline-block mx-1" style="margin: 0px 2px;">
<img alt="Nodemon" src="https://img.shields.io/badge/Nodemon-76D04B.svg?style=flat&logo=Nodemon&logoColor=white" class="inline-block mx-1" style="margin: 0px 2px;">
<img alt="React" src="https://img.shields.io/badge/React-61DAFB.svg?style=flat&logo=React&logoColor=black" class="inline-block mx-1" style="margin: 0px 2px;">

<br>

<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=flat&logo=TypeScript&logoColor=white" class="inline-block mx-1" style="margin: 0px 2px;">
<img alt="Zod" src="https://img.shields.io/badge/Zod-3E67B1.svg?style=flat&logo=Zod&logoColor=white" class="inline-block mx-1" style="margin: 0px 2px;">
<img alt="Vite" src="https://img.shields.io/badge/Vite-646CFF.svg?style=flat&logo=Vite&logoColor=white" class="inline-block mx-1" style="margin: 0px 2px;">
<img alt="ESLint" src="https://img.shields.io/badge/ESLint-4B32C3.svg?style=flat&logo=ESLint&logoColor=white" class="inline-block mx-1" style="margin: 0px 2px;">
<img alt="Axios" src="https://img.shields.io/badge/Axios-5A29E4.svg?style=flat&logo=Axios&logoColor=white" class="inline-block mx-1" style="margin: 0px 2px;">
<img alt="datefns" src="https://img.shields.io/badge/datefns-770C56.svg?style=flat&logo=date-fns&logoColor=white" class="inline-block mx-1" style="margin: 0px 2px;">
<img alt="React Hook Form" src="https://img.shields.io/badge/React%20Hook%20Form-EC5990.svg?style=flat&logo=React-Hook-Form&logoColor=white" class="inline-block mx-1" style="margin: 0px 2px;">

</div>

HashBro es una aplicación web construida con React y Vite que permite a los usuarios subir archivos, calcular sus hashes (MD5, SHA1, SHA256) y consultar la información de seguridad de estos archivos utilizando dos motores de análisis: la API de VirusTotal y el antivirus Segurmatica. La información y los metadatos de los archivos se almacenan en Firebase Firestore.

## Características Principales

- Carga de archivos y cálculo de hashes (MD5, SHA1, SHA256) en el cliente.
- Integración con la API de VirusTotal para obtener informes de análisis de archivos.
- Análisis local de archivos con el antivirus Segurmatica.
- Almacenamiento de metadatos de archivos y resultados en Firebase Firestore.
- Interfaz de usuario creada con React y Vite.
- Funciones Cloud de Firebase para interactuar con la API de VirusTotal de forma segura.

## Tecnologías Utilizadas

- **Frontend:** React, Vite
- **Backend:** Firebase (Firestore, Cloud Functions), Express (para Segurmatica)
- **API Externa:** VirusTotal API
- **Antivirus Local:** Segurmatica Antivirus
- **Linting:** ESLint

## Configuración del Proyecto

### Prerrequisitos

- Node.js (versión especificada en [`functions/package.json`](d:\hashbro\functions\package.json))
- Cuenta de Firebase y proyecto configurado.
- API Key de VirusTotal.
- Segurmatica Antivirus instalado (para análisis local).

### Pasos de Configuración

1.  **Clonar el repositorio:**

    ```bash
    git clone <url-del-repositorio>
    cd hashbro
    ```

2.  **Instalar dependencias del frontend:**

    ```bash
    npm install
    ```

3.  **Instalar dependencias de Firebase Functions:**

    ```bash
    cd functions
    npm install
    cd ..
    ```

4.  **Configurar Firebase:**

    - Asegúrate de tener `firebase-tools` instalado globalmente (`npm install -g firebase-tools`).
    - Inicia sesión en Firebase: `firebase login`.
    - Configura tu proyecto de Firebase localmente. Puedes copiar la configuración de tu proyecto desde la consola de Firebase en [`src/services/firebase.js`](d:\hashbro\src\services\firebase.js) y [`src/firebaseConfig.js`](d:\hashbro\src\firebaseConfig.js) (aunque parece que ya están configurados).
    - Asegúrate de que las reglas de Firestore en [`firestore.rules`](d:\hashbro\firestore.rules) y los índices en `firestore.indexes.json` estén desplegados en tu proyecto de Firebase.

5.  **Configurar Variables de Entorno para Firebase Functions:**
    - La API Key de VirusTotal se utiliza en las Cloud Functions. Actualmente está hardcodeada en [`functions/index.cjs`](d:\hashbro\functions\index.cjs) como fallback, pero es **altamente recomendable** configurarla como una variable de entorno en Firebase:
      ```bash
      firebase functions:config:set virustotal.key="TU_API_KEY_DE_VIRUSTOTAL"
      ```
    - Si prefieres usar un archivo `.env` localmente para las funciones (como se indica con `require("dotenv").config();`), crea un archivo `.env` dentro del directorio `functions` con el siguiente contenido:
      ```
      # filepath: d:\hashbro\functions\.env
      VT_API_KEY=TU_API_KEY_DE_VIRUSTOTAL
      ```

## Cómo Ejecutar el Proyecto

1.  **Iniciar el emulador de Firebase (opcional pero recomendado para desarrollo):**
    Abre una terminal y ejecuta:

    ```bash
    firebase emulators:start --only functions,firestore
    ```

    Esto iniciará los emuladores para Cloud Functions y Firestore. La UI de los emuladores estará disponible en `http://localhost:4000`.

2.  **Iniciar la aplicación Vite (frontend):**
    Abre otra terminal y ejecuta:

    ```bash
    npm run dev
    ```

    La aplicación estará disponible en `http://localhost:5173` (o el puerto que Vite asigne).

3.  **Desplegar en Firebase:**
    - **Frontend (Hosting):**
      ```bash
      npm run build
      firebase deploy --only hosting
      ```
    - **Backend (Cloud Functions):**
      ```bash
      firebase deploy --only functions
      ```
    - **Reglas de Firestore:**
      ```bash
      firebase deploy --only firestore:rules
      ```
    - **Índices de Firestore:**
      ```bash
      firebase deploy --only firestore:indexes
      ```
    - **Todo:**
      ```bash
      firebase deploy
      ```

## Estructura del Proyecto (Resumen)

- `public/`: Archivos estáticos y [`index.html`](d:\hashbro\public\index.html) base.
- `src/`: Código fuente del frontend React.
  - `components/`: Componentes de React.
  - `services/`: Módulos para interactuar con servicios externos como Firebase ([`firebase.js`](d:\hashbro\src\services\firebase.js)).
  - [`firebaseConfig.js`](d:\hashbro\src\firebaseConfig.js): Configuración de Firebase para el cliente.
- `functions/`: Código de las Cloud Functions de Firebase.
  - [`index.cjs`](d:\hashbro\functions\index.cjs): Lógica principal de las funciones (ej. `fetchFileInfo`).
  - [`package.json`](d:\hashbro\functions\package.json): Dependencias de las funciones.
- [`firebase.json`](d:\hashbro\firebase.json): Configuración de despliegue de Firebase (hosting, functions, firestore).
- [`firestore.rules`](d:\hashbro\firestore.rules): Reglas de seguridad para Firestore.
- `firestore.indexes.json`: Definiciones de índices para Firestore.
- [`eslint.config.js`](d:\hashbro\eslint.config.js): Configuración de ESLint.
- [`serverSegurmatica.cjs`](d:\hashbro\serverSegurmatica.cjs): Servidor Express para integración con Segurmatica Antivirus.

## Integración con Segurmatica Antivirus

HashBro incluye una integración completa con el antivirus Segurmatica, permitiendo el análisis local de archivos para detección de malware. Esta integración es una parte fundamental del sistema y complementa el análisis basado en la nube de VirusTotal.

### Configuración de Segurmatica

1. **Instalación del Antivirus:**

   - Es necesario tener instalado Segurmatica Antivirus en el servidor o máquina donde se ejecuta la aplicación.
   - La ruta predeterminada al ejecutable de escaneo es: `C:/Program Files (x86)/SEGURMATICA/Segurmatica Antivirus 2/segavcmd.exe`.
   - Si tu instalación se encuentra en otra ubicación, deberás modificar la ruta en [`serverSegurmatica.cjs`](d:\hashbro\serverSegurmatica.cjs).

2. **Servidor Express para Segurmatica:**

   - El proyecto incluye un servidor Express dedicado ([`serverSegurmatica.cjs`](d:\hashbro\serverSegurmatica.cjs)) que actúa como intermediario entre la aplicación web y el antivirus local.
   - Este servidor se ejecuta por defecto en el puerto 3001.
   - Gestiona la carga temporal de archivos y la comunicación con el ejecutable de línea de comandos de Segurmatica.

3. **Iniciar el Servidor de Segurmatica:**
   Para usar la funcionalidad de análisis con Segurmatica, debes iniciar el servidor Express:
   ```bash
   node serverSegurmatica.cjs
   ```
   O, utilizando nodemon para desarrollo:
   ```bash
   nodemon serverSegurmatica.cjs
   ```

### Funcionamiento de Segurmatica en la Aplicación

1. **Flujo de Escaneo:**

   - Cuando un usuario sube un archivo, el componente [`SegurmaticaScan.jsx`](d:\hashbro\src\components\file\SegurmaticaScan.jsx) se encarga de enviar el archivo al servidor Express local.
   - El servidor recibe el archivo, lo guarda temporalmente en la carpeta `uploads/` y ejecuta el comando de escaneo de Segurmatica.
   - Los resultados del análisis son interpretados y devueltos al frontend como una respuesta JSON.
   - La aplicación clasifica los archivos en diferentes categorías según el resultado: "limpio", "infectado", "sospechoso" o "desconocido".

2. **Integración en la Interfaz de Usuario:**

   - Los resultados del análisis de Segurmatica se muestran en la interfaz de usuario con indicadores visuales claros.
   - Los usuarios pueden ver un resumen del estado de seguridad del archivo, incluyendo si Segurmatica detectó alguna amenaza.
   - También es posible volver a escanear archivos previamente analizados.

3. **Almacenamiento de Resultados:**

   - Los resultados del análisis de Segurmatica se almacenan en Firestore junto con los hashes del archivo y otros metadatos.
   - Esto permite un seguimiento histórico de los análisis realizados y facilita la comparación de resultados a lo largo del tiempo.

4. **Mejores Prácticas:**
   - Mantén siempre actualizado el antivirus Segurmatica para garantizar la detección de las amenazas más recientes.
   - Configura adecuadamente los permisos en el sistema para que la aplicación pueda ejecutar los comandos de escaneo.
   - Revisa periódicamente la carpeta de `uploads/` para eliminar archivos temporales innecesarios.

## TODOs y Mejoras Potenciales

- Implementar autenticación de usuarios.
- Mejorar la gestión de errores y feedback al usuario.
- Añadir más pruebas unitarias y de integración.
- Optimizar el rendimiento y la carga de la aplicación.
- Utilizar Timestamps de Firestore en lugar de strings para las fechas.
- Refinar las reglas de seguridad de Firestore una vez implementada la autenticación.
