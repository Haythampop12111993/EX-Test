# ExSystem - Advanced Pest Control Management System

## 📋 Overview
ExSystem is a modern enterprise-grade web application built with **Angular 21**, designed to manage pest control operations, monitoring, and resources. It features a comprehensive control panel, dynamic data management, and real-time operational tracking.

The application leverages **PrimeNG** for a rich UI experience and **Tailwind CSS** for responsive design, offering a seamless user experience for managing complex data like pests, pesticides, and field operations.

## 🚀 Tech Stack
*   **Framework:** [Angular v21](https://angular.dev/)
*   **UI Components:** [PrimeNG v21](https://primeng.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) & PrimeFlex
*   **Internationalization:** [ngx-translate](http://www.ngx-translate.com/) (Arabic & English support)
*   **Data Handling:** RxJS & Reactive Forms
*   **Testing:** Vitest
*   **Utilities:** XLSX (Excel Export), File-Saver

## ✨ Key Features

### 🛡️ Authentication & Security
*   **Secure Login:** JWT-based authentication.
*   **Guards:** Route protection based on authentication state.
*   **Interceptors:** Automatic token injection for API requests.

### 🎛️ Control Panel
*   **Dashboard:** Real-time overview of system metrics and key performance indicators.
*   **Pests Management:** Full CRUD operations for pest cataloging, including image uploads (max 5MB) with live preview.
*   **Pesticides Management:** Inventory tracking and management.
*   **Users Management:** Administration of system users and roles.
*   **Operations & Evaluation:** Comprehensive tools for managing Scouting and Control operations.

### 📊 Data Visualization & Management
*   **Dynamic Data Tables:**
    *   Advanced sorting and pagination.
    *   Global search filtering.
    *   Export data to Excel (`.xlsx`).
    *   Custom status badges and visual indicators.
*   **Dynamic Forms:**
    *   Configuration-driven form generation (JSON-based).
    *   Built-in validation and error handling.
    *   Support for various input types: Text, Select, Date, File, etc.

## 🛠️ Installation & Setup

### Prerequisites
*   Node.js (Latest LTS recommended)
*   npm

### Steps
1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd EX-Test
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run development server**
    ```bash
    npm start
    # or
    ng serve
    ```
    Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

4.  **Build for production**
    ```bash
    npm run build
    ```
    The build artifacts will be stored in the `dist/` directory.

## 📂 Project Structure

```text
src/app/
├── core/                 # Singleton services, guards, interceptors
│   ├── auth/             # Authentication logic (Guard, Interceptor)
│   └── i18n/             # Localization loaders
├── layouts/              # Main layout templates
│   ├── auth-layout/      # Layout for login/register pages
│   └── main-layout/      # Application layout (Sidebar, Header)
├── pages/                # Feature modules and pages
│   ├── auth/             # Login page
│   ├── control-panel/    # Admin modules (Pests, Users, etc.)
│   ├── monitoring/       # Monitoring operations
│   └── operations/       # Field operations
└── shared/               # Reusable components and models
    ├── components/
    │   ├── data-table/   # Generic table component
    │   └── dynamic-form/ # Generic form builder
    └── models/           # TypeScript interfaces
```

## 🧩 Key Components Usage

### Dynamic Form (`app-dynamic-form`)
Renders a form based on a configuration array, reducing boilerplate code.

```html
<app-dynamic-form
    [config]="formConfig"
    [initialData]="data"
    (formSubmit)="onSave($event)">
</app-dynamic-form>
```

### Data Table (`app-data-table`)
Displays data with built-in features like search and export.

```html
<app-data-table
    [data]="listData"
    [cols]="columns"
    [title]="'Page Title'"
    (add)="onAdd()"
    (edit)="onEdit($event)">
</app-data-table>
```

## 🤝 Contributing
1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---
**ExSystem** © 2026
