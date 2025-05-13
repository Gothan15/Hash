# HashBro: Analizador de Archivos con VirusTotal y Firebase

HashBro es una aplicación web construida con React y Vite que permite a los usuarios subir archivos, calcular sus hashes (MD5, SHA1, SHA256) y consultar la información de seguridad de estos hashes utilizando la API de VirusTotal. La información y los metadatos de los archivos se almacenan en Firebase Firestore.

## Características Principales

- Carga de archivos y cálculo de hashes (MD5, SHA1, SHA256) en el cliente.
- Integración con la API de VirusTotal para obtener informes de análisis de archivos.
- Almacenamiento de metadatos de archivos y resultados en Firebase Firestore.
- Interfaz de usuario creada con React y Vite.
- Funciones Cloud de Firebase para interactuar con la API de VirusTotal de forma segura.

## Tecnologías Utilizadas

- **Frontend:** React, Vite
- **Backend:** Firebase (Firestore, Cloud Functions)
- **API Externa:** VirusTotal API
- **Linting:** ESLint

## Configuración del Proyecto

### Prerrequisitos

- Node.js (versión especificada en [`functions/package.json`](d:\hashbro\functions\package.json))
- Cuenta de Firebase y proyecto configurado.
- API Key de VirusTotal.

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

## TODOs y Mejoras Potenciales

- Implementar autenticación de usuarios.
- Mejorar la gestión de errores y feedback al usuario.
- Añadir más pruebas unitarias y de integración.
- Optimizar el rendimiento y la carga de la aplicación.
- Utilizar Timestamps de Firestore en lugar de strings para las fechas.
- Refinar las reglas de seguridad de Firestore una vez implementada la autenticación.

````// filepath: d:\hashbro\README.md
# HashBro: Analizador de Archivos con VirusTotal y Firebase

HashBro es una aplicación web construida con React y Vite que permite a los usuarios subir archivos, calcular sus hashes (MD5, SHA1, SHA256) y consultar la información de seguridad de estos hashes utilizando la API de VirusTotal. La información y los metadatos de los archivos se almacenan en Firebase Firestore.

## Características Principales

*   Carga de archivos y cálculo de hashes (MD5, SHA1, SHA256) en el cliente.
*   Integración con la API de VirusTotal para obtener informes de análisis de archivos.
*   Almacenamiento de metadatos de archivos y resultados en Firebase Firestore.
*   Interfaz de usuario creada con React y Vite.
*   Funciones Cloud de Firebase para interactuar con la API de VirusTotal de forma segura.

## Tecnologías Utilizadas

*   **Frontend:** React, Vite
*   **Backend:** Firebase (Firestore, Cloud Functions)
*   **API Externa:** VirusTotal API
*   **Linting:** ESLint

## Configuración del Proyecto

### Prerrequisitos

*   Node.js (versión especificada en [`functions/package.json`](d:\hashbro\functions\package.json))
*   Cuenta de Firebase y proyecto configurado.
*   API Key de VirusTotal.

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
    *   Asegúrate de tener `firebase-tools` instalado globalmente (`npm install -g firebase-tools`).
    *   Inicia sesión en Firebase: `firebase login`.
    *   Configura tu proyecto de Firebase localmente. Puedes copiar la configuración de tu proyecto desde la consola de Firebase en [`src/services/firebase.js`](d:\hashbro\src\services\firebase.js) y [`src/firebaseConfig.js`](d:\hashbro\src\firebaseConfig.js) (aunque parece que ya están configurados).
    *   Asegúrate de que las reglas de Firestore en [`firestore.rules`](d:\hashbro\firestore.rules) y los índices en `firestore.indexes.json` estén desplegados en tu proyecto de Firebase.

5.  **Configurar Variables de Entorno para Firebase Functions:**
    *   La API Key de VirusTotal se utiliza en las Cloud Functions. Actualmente está hardcodeada en [`functions/index.cjs`](d:\hashbro\functions\index.cjs) como fallback, pero es **altamente recomendable** configurarla como una variable de entorno en Firebase:
        ```bash
        firebase functions:config:set virustotal.key="TU_API_KEY_DE_VIRUSTOTAL"
        ```
    *   Si prefieres usar un archivo `.env` localmente para las funciones (como se indica con `require("dotenv").config();`), crea un archivo `.env` dentro del directorio `functions` con el siguiente contenido:
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
    *   **Frontend (Hosting):**
        ```bash
        npm run build
        firebase deploy --only hosting
        ```
    *   **Backend (Cloud Functions):**
        ```bash
        firebase deploy --only functions
        ```
    *   **Reglas de Firestore:**
        ```bash
        firebase deploy --only firestore:rules
        ```
    *   **Índices de Firestore:**
        ```bash
        firebase deploy --only firestore:indexes
        ```
    *   **Todo:**
        ```bash
        firebase deploy
        ```

## Estructura del Proyecto (Resumen)

*   `public/`: Archivos estáticos y [`index.html`](d:\hashbro\public\index.html) base.
*   `src/`: Código fuente del frontend React.
    *   `components/`: Componentes de React.
    *   `services/`: Módulos para interactuar con servicios externos como Firebase ([`firebase.js`](d:\hashbro\src\services\firebase.js)).
    *   [`firebaseConfig.js`](d:\hashbro\src\firebaseConfig.js): Configuración de Firebase para el cliente.
*   `functions/`: Código de las Cloud Functions de Firebase.
    *   [`index.cjs`](d:\hashbro\functions\index.cjs): Lógica principal de las funciones (ej. `fetchFileInfo`).
    *   [`package.json`](d:\hashbro\functions\package.json): Dependencias de las funciones.
*   [`firebase.json`](d:\hashbro\firebase.json): Configuración de despliegue de Firebase (hosting, functions, firestore).
*   [`firestore.rules`](d:\hashbro\firestore.rules): Reglas de seguridad para Firestore.
*   `firestore.indexes.json`: Definiciones de índices para Firestore.
*   [`eslint.config.js`](d:\hashbro\eslint.config.js): Configuración de ESLint.

## TODOs y Mejoras Potenciales

*   Implementar autenticación de usuarios.
*   Mejorar la gestión de errores y feedback al usuario.
*   Añadir más pruebas unitarias y de integración.
*   Optimizar el rendimiento y la carga de la aplicación.
*   Utilizar Timestamps de Firestore en lugar de strings para las fechas.
*   Refinar las reglas de seguridad de Firestore una vez implementada la autenticación.
````
