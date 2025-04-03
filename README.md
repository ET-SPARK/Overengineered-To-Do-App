📝 Overengineered To-Do App
A full-stack CRUD To-Do web application built with PostgreSQL, Node.js, Express, Redux Toolkit (RTK), React Vite, Tailwind CSS, and ShadCN. This app follows clean architecture principles, ensuring scalability, maintainability, and a smooth user experience.
🚀 Tech Stack
Frontend
⚛️ React (Vite)

🎨 Tailwind CSS

🏗 ShadCN UI

🔄 Redux Toolkit (RTK)

⚡ TypeScript

Backend
🖥 Node.js

🚀 Express.js

🗄 PostgreSQL

🌍 RESTful API

🛠 TypeScript

🗃 Database Schema
Collections Table
Column	      Type	        Description
id	          INT	          Primary Key
name	        STRING	      Collection name


CREATE TABLE collections (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

Seeded Data:
id        	name
1	          School
2          	Personal
3          	Design
4          	Groceries

Tasks             Table

Column	          Type	        Description
task_id	          SERIAL	      Primary Key
title	            VARCHAR(255)	Task title
date	            TIMESTAMP	    Task creation date
completed	        BOOLEAN	      Task completion status
collection_id    	INT	          Foreign Key (linked to Collections)

CREATE TABLE tasks (
  task_id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  date TIMESTAMP NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  collection_id INT NOT NULL,
  FOREIGN KEY (collection_id) REFERENCES collections(collection_id) ON DELETE CASCADE
);

Sub-tasks             Table

Column	              Type	        Description
subtask_id	          SERIAL	      Primary Key
title	                VARCHAR(255)	Task title
date	                TIMESTAMP	    Task creation date
completed	            BOOLEAN	      Task completion status
task_id              	INT	          Foreign Key (linked to tasks)

CREATE TABLE subtasks (
  subtask_id SERIAL PRIMARY KEY,
  task_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
);

✨ Features
✅ Create Tasks – Add tasks with a title, collection, and completion status.
✅ Edit Tasks – Modify task details, toggle completion, and manage subtasks.
✅ Delete Tasks – Remove tasks and their associated subtasks.
✅ Subtasks – Nest subtasks under parent tasks.
✅ Group Tasks – Organize tasks by collection.
✅ Responsive UI – Adaptive layout using Tailwind CSS.
✅ Dark Mode – Theming support with ShadCN.
✅ Redux Toolkit – State management for a smooth user experience.

🔧 Setup & Installation
Backend
1 Clone the repository: 
git clone https://github.com/ET-SPARK/Overengineered-To-Do-App.git
cd Backend

2 Install dependencies: 
npm install

3 Configure environment variables (.env file):
1 create .env file in root directory
2 add this to your .env file
PORT=3000
DB_USER='your Pg DB User'
DB_HOST='your Pg DB Host'
DB_NAME='your Pg DB Name'
DB_PASSWORD='your  Pg DB Password'
DB_PORT='your Pg DB Port'

Note: Change the env value to yours 

4 Start the backend server:
npm run dev

Frontend
1 Clone the repository: 
git clone https://github.com/ET-SPARK/Overengineered-To-Do-App.git
cd Frontend

2 Install dependencies: 
npm install

3 Start the frontend server:
npm run dev

📸 Screenshots and Video link 

Video link https://drive.google.com/file/d/1I7i-t9WE47r89HjR831J3NHtSE0AvjGi/view?usp=sharing 
image link https://drive.google.com/file/d/1XqEsQs6i2yf3EUUFA5ZOgmMfGKsW8cUw/view?usp=sharing


🏛️ Architectural Decisions
Used PostgreSQL for structured task management and better database interaction.

Node.js & Express for a scalable backend with RESTful API design.

Redux Toolkit (RTK) for efficient state management.

ShadCN UI for customizable and consistent UI components.

React Vite for fast build times and improved developer experience.

Applied clean architecture to keep backend and frontend modular.

📬 Contributions & Feedback
Feel free to fork, submit pull requests, or report issues. Contributions are welcome!
