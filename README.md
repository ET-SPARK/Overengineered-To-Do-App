# 📝 Overengineered To-Do App
A full-stack CRUD To-Do web application built with PostgreSQL, Node.js, Express, Redux Toolkit (RTK), React Vite, Tailwind CSS, and ShadCN. This app follows clean architecture principles, ensuring scalability, maintainability, and a smooth user experience.

---

## 🚀 Tech Stack
### Frontend
- ⚛️ **React (Vite)**
- 🎨 **Tailwind CSS**
- 🏗 **ShadCN UI**
- 🔄 **Redux Toolkit (RTK)**
- ⚡ **TypeScript**

### Backend
- 🖥 **Node.js**
- 🚀 **Express.js**
- 🗄 **PostgreSQL**
- 🌍 **RESTful API**
- 🛠 **TypeScript**

---

## 🗃 Database Schema

### Collections Table
```sql
CREATE TABLE collections (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);
```

#### Seeded Data:
| id | name      |
|----|----------|
| 1  | School   |
| 2  | Personal |
| 3  | Design   |
| 4  | Groceries |

### Tasks Table
```sql
CREATE TABLE tasks (
  task_id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  date TIMESTAMP NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  collection_id INT NOT NULL,
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
);
```

### Subtasks Table
```sql
CREATE TABLE subtasks (
  subtask_id SERIAL PRIMARY KEY,
  task_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
);
```

---

## ✨ Features
- ✅ **Create Tasks** – Add tasks with a title, collection, and completion status.
- ✅ **Edit Tasks** – Modify task details, toggle completion, and manage subtasks.
- ✅ **Delete Tasks** – Remove tasks and their associated subtasks.
- ✅ **Subtasks** – Nest subtasks under parent tasks.
- ✅ **Group Tasks** – Organize tasks by collection.
- ✅ **Responsive UI** – Adaptive layout using Tailwind CSS.
- ✅ **Dark Mode** – Theming support with ShadCN.
- ✅ **Redux Toolkit** – State management for a smooth user experience.

---

## 🔧 Setup & Installation

### Backend
1. Clone the repository:
   ```sh
   git clone https://github.com/ET-SPARK/Overengineered-To-Do-App.git
   cd Backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Configure environment variables (`.env` file):
   1. Create a `.env` file in the root directory.
   2. Add the following environment variables:
      ```env
      PORT=3000
      DB_USER='your_pg_db_user'
      DB_HOST='your_pg_db_host'
      DB_NAME='your_pg_db_name'
      DB_PASSWORD='your_pg_db_password'
      DB_PORT='your_pg_db_port'
      ```
   **Note:** Replace the values with your own PostgreSQL credentials.
4. Start the backend server:
   ```sh
   npm run dev
   ```

### Frontend
1. Clone the repository:
   ```sh
   git clone https://github.com/ET-SPARK/Overengineered-To-Do-App.git
   cd Frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the frontend server:
   ```sh
   npm run dev
   ```

---

## 📸 Screenshots and Video
- **[Video Demo](https://drive.google.com/file/d/1I7i-t9WE47r89HjR831J3NHtSE0AvjGi/view?usp=sharing)**
- **[Image Preview](https://drive.google.com/file/d/1XqEsQs6i2yf3EUUFA5ZOgmMfGKsW8cUw/view?usp=sharing)**

---

## 🏛️ Architectural Decisions
- **PostgreSQL** for structured task management and better database interaction.
- **Node.js & Express** for a scalable backend with RESTful API design.
- **Redux Toolkit (RTK)** for efficient state management.
- **ShadCN UI** for customizable and consistent UI components.
- **React Vite** for fast build times and improved developer experience.
- **Clean architecture** to keep backend and frontend modular.

---

## 📬 Contributions & Feedback
Feel free to **fork**, **submit pull requests**, or **report issues**. Contributions are welcome! 🎉

