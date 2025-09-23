# Azkar and Quran API
![Thehco](designs.png)
This is a Node.js Express server that provides API endpoints for accessing data related to Azkar (Islamic supplications) and Quranic Surahs. It serves as a backend for mobile or web applications, delivering structured data for Quran Surahs and Azkar sections.

## Features

### Quran Surahs
- **Retrieve all Surahs**: Get a list of all Surahs (chapters) from the Quran.
- **Surah details**: Fetch detailed information for a specific Surah, including its name, associated PDF, and audio URLs.

### Azkar (Supplications)
- **List Azkar sections**: Retrieve all Azkar categories/sections (e.g., Morning, Evening, Sleep).
- **Section-specific Azkar**: Get all Azkar for a specific section.
- **Complete dataset**: Fetch all sections and their associated Azkar in a single request.

## Technologies Used
- **Node.js**: JavaScript runtime environment.
- **Express.js**: Web application framework for building the API.
- **pg (node-postgres)**: Non-blocking PostgreSQL client for Node.js.
- **cors**: Middleware to enable Cross-Origin Resource Sharing (CORS).
- **dotenv**: Loads environment variables from a `.env` file.

## Getting Started

### Prerequisites
- Node.js installed on your machine.
- A PostgreSQL database set up and running.

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your database connection string:
   ```
   DATABASE_URL="your_postgresql_connection_string"
   ```
   Example:
   ```
   DATABASE_URL="postgres://user:password@host:port/database"
   ```

### Database Schema
Ensure your PostgreSQL database includes the following tables:

#### `surahs`
- `id` (INTEGER, PRIMARY KEY)
- `name` (VARCHAR)

#### `surah_pdfs`
- `id` (INTEGER, PRIMARY KEY)
- `surah_id` (INTEGER, FOREIGN KEY to `surahs.id`)
- `pdf_url` (VARCHAR)

#### `surah_audio`
- `id` (INTEGER, PRIMARY KEY)
- `surah_id` (INTEGER, FOREIGN KEY to `surahs.id`)
- `audio_url` (VARCHAR)

#### `azkar_sections`
- `id` (VARCHAR, PRIMARY KEY)
- `name` (VARCHAR)

#### `azkar`
- `id` (SERIAL, PRIMARY KEY)
- `section_id` (VARCHAR, FOREIGN KEY to `azkar_sections.id`)
- `azkar_id` (INTEGER)
- `text` (TEXT)
- `description` (TEXT)

### Running the Server
Start the server with:
```bash
node server.js
```
The server will run on the port specified in the `.env` file or default to port `3000`.

## API Endpoints

### Quran Endpoints
- **GET /api/surahs**
  - **Description**: Retrieves a list of all Surahs.
  - **Response**: 
    ```json
    [{ "id": 1, "name": "Al-Fatihah" }, ...]
    ```

- **GET /api/surahs/:id**
  - **Description**: Retrieves data for a specific Surah.
  - **URL Params**: `id` - The ID of the Surah (e.g., `1`).
  - **Response**:
    ```json
    { "name": "Al-Fatihah", "pdfs": ["url1"], "audio": ["url2"] }
    ```

### Azkar Endpoints
- **GET /api/azkar/sections**
  - **Description**: Retrieves a list of all Azkar sections.
  - **Response**:
    ```json
    [{ "id": "morning", "name": "Morning Azkar" }, ...]
    ```

- **GET /api/azkar/:sectionId**
  - **Description**: Retrieves Azkar for a specific section.
  - **URL Params**: `sectionId` - The ID of the section (e.g., `morning`).
  - **Response**:
    ```json
    { 
      "section": { "id": "morning", "name": "Morning Azkar" }, 
      "azkar": [{ "id": 1, "text": "...", "description": "..." }, ... ] 
    }
    ```

- **GET /api/azkar**
  - **Description**: Retrieves a complete dataset of all Azkar sections and their associated supplications.
  - **Response**:
    ```json
    { 
      "sections": [...], 
      "azkarData": { "morning": [...], "evening": [...], ... } 
    }
    ```
