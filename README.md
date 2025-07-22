<<<<<<< HEAD
<<<<<<< HEAD
# SAINT Explorer (SAINT X)

## Overview

**SAINT Explorer (SAINT X)** is the web-based graphical user interface for the **Security Analysis, Integration, and Normalization Toolkit (SAINT)** platform. It provides security analysts, detection engineers, and security leadership with a powerful and intuitive interface to search, analyze, and manage the organization's security detection rule-set.

This application serves as the primary window into the detection-as-code repository, where security rules for SIEM platforms like Elastic and Microsoft Sentinel are managed. While Git remains the single source of truth for all rule logic, SAINT X provides the necessary context, visualization, and enrichment capabilities to make that data actionable.

## Core Features

SAINT X is designed to streamline the detection engineering lifecycle with a rich set of features:

* **Dashboard**: A high-level overview of the detection landscape, showcasing key metrics, recent rule changes, and coverage statistics.
* **Rules Explorer**: A comprehensive tool to search, filter, and inspect every detection rule. Users can view rule logic, metadata, and operational notes in a user-friendly format.
* **MITRE ATT&CK® Matrix**: A dynamic visualization of rule coverage mapped across the MITRE ATT&CK framework, allowing teams to quickly identify both strengths and gaps in their defenses.
* **Insights & Analytics**: A dedicated section for visualizing trends, distributions, and analytics across the entire rule-set.
* **GitLab Integration**: Seamlessly connects to the underlying GitLab repository to streamline feedback and development workflows.
    * **Issue Creator (In Progress)**: Allows users to create GitLab issues for rule tuning or false positive investigations directly from the UI.

## Technology Stack

The SAINT Explorer frontend is built with a modern, robust technology stack:

* **Framework**: React with TypeScript
* **Build Tool**: Vite
* **UI Components**: Material-UI (MUI)
* **Data Fetching & State**:
    * **Server State**: TanStack Query (React Query)
    * **Client State**: Zustand
* **Authentication**: AWS Cognito, integrated using `react-oidc-context`
* **Charting**: Recharts for data visualizations

## Development Setup

To get a local development environment running, follow these steps.

### Prerequisites

* Node.js (LTS version recommended)
* `npm` or `yarn` package manager
* Access to the backend SAINT API and an AWS Cognito user pool.

### Installation & Configuration

1.  **Clone the repository:**
    ```bash
    git clone https://sync.git.mil/USG/DOD/DISA/cyber-executive/disa-cssp/disa-cols-na/cte-mitre-app.git
    cd saint-explorer/webapp
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure environment variables:**
    Create a `.env.local` file in the `webapp` directory. This file will store your environment-specific configuration and is ignored by Git. Populate it with the necessary variables for the API endpoint and Cognito configuration.

    ```
    VITE_API_BASE_URL=[https://api.your-domain.com](https://api.your-domain.com)
    VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxx
    VITE_COGNITO_APP_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxx
    VITE_COGNITO_DOMAIN=your-cognito-domain.auth.us-east-1.amazoncognito.com
    VITE_POST_LOGOUT_REDIRECT_URI=http://localhost:5173
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application should now be running on `http://localhost:5173`.

## Project Structure

The `src` directory is organized to maintain a clean and scalable codebase:

* `api/`: Contains all logic for interacting with the backend API, including client setup, endpoint definitions, and TanStack Query hooks.
* `components/`: Shared, reusable React components (e.g., `Card`, `StatusBadge`, layout components).
* `contexts/`: React context providers for managing global UI state.
* `hooks/`: Custom React hooks for business logic and UI behavior.
* `pages/`: Top-level components that correspond to the application's routes (e.g., `Dashboard`, `RulesExplorer`).
* `store/`: Zustand stores for managing global client-side state.
* `utils/`: Utility functions and constants.

## Roadmap & Future Enhancements

Our goal is to continue evolving SAINT X into a comprehensive workbench for detection engineering. Key features on the roadmap include:

* **Browser-Based Rule Editor**: A full-featured, in-app editor that allows users to create and modify detection rules. This feature will integrate directly with the GitLab workflow by automatically creating branches and merge requests.
* **Enhanced Analytics**: Deeper integration with SIEM platforms to pull rule performance metrics (e.g., alert volume, false positive rates).
* **Collaborative Features**: Real-time collaboration features, allowing multiple analysts to work on rule enrichment and notes simultaneously.
=======
# SAINT EX - Security Analysis & Intelligence Tool Executive Dashboard
=======
# SAINT Explorer (SAINT X)
>>>>>>> 33fb71b (updated redirect_uri)

## Overview

**SAINT Explorer (SAINT X)** is the web-based graphical user interface for the **Security Analysis, Integration, and Normalization Toolkit (SAINT)** platform. It provides security analysts, detection engineers, and security leadership with a powerful and intuitive interface to search, analyze, and manage the organization's security detection rule-set.

This application serves as the primary window into the detection-as-code repository, where security rules for SIEM platforms like Elastic and Microsoft Sentinel are managed. While Git remains the single source of truth for all rule logic, SAINT X provides the necessary context, visualization, and enrichment capabilities to make that data actionable.

## Core Features

SAINT X is designed to streamline the detection engineering lifecycle with a rich set of features:

* **Dashboard**: A high-level overview of the detection landscape, showcasing key metrics, recent rule changes, and coverage statistics.
* **Rules Explorer**: A comprehensive tool to search, filter, and inspect every detection rule. Users can view rule logic, metadata, and operational notes in a user-friendly format.
* **MITRE ATT&CK® Matrix**: A dynamic visualization of rule coverage mapped across the MITRE ATT&CK framework, allowing teams to quickly identify both strengths and gaps in their defenses.
* **Insights & Analytics**: A dedicated section for visualizing trends, distributions, and analytics across the entire rule-set.
* **GitLab Integration**: Seamlessly connects to the underlying GitLab repository to streamline feedback and development workflows.
    * **Issue Creator (In Progress)**: Allows users to create GitLab issues for rule tuning or false positive investigations directly from the UI.

## Technology Stack

The SAINT Explorer frontend is built with a modern, robust technology stack:

* **Framework**: React with TypeScript
* **Build Tool**: Vite
* **UI Components**: Material-UI (MUI)
* **Data Fetching & State**:
    * **Server State**: TanStack Query (React Query)
    * **Client State**: Zustand
* **Authentication**: AWS Cognito, integrated using `react-oidc-context`
* **Charting**: Recharts for data visualizations

## Development Setup

To get a local development environment running, follow these steps.

### Prerequisites

* Node.js (LTS version recommended)
* `npm` or `yarn` package manager
* Access to the backend SAINT API and an AWS Cognito user pool.

### Installation & Configuration

1.  **Clone the repository:**
    ```bash
    git clone https://sync.git.mil/USG/DOD/DISA/cyber-executive/disa-cssp/disa-cols-na/cte-mitre-app.git
    cd saint-explorer/webapp
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure environment variables:**
    Create a `.env.local` file in the `webapp` directory. This file will store your environment-specific configuration and is ignored by Git. Populate it with the necessary variables for the API endpoint and Cognito configuration.

    ```
    VITE_API_BASE_URL=[https://api.your-domain.com](https://api.your-domain.com)
    VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxx
    VITE_COGNITO_APP_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxx
    VITE_COGNITO_DOMAIN=your-cognito-domain.auth.us-east-1.amazoncognito.com
    VITE_POST_LOGOUT_REDIRECT_URI=http://localhost:5173
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application should now be running on `http://localhost:5173`.

## Project Structure

The `src` directory is organized to maintain a clean and scalable codebase:

* `api/`: Contains all logic for interacting with the backend API, including client setup, endpoint definitions, and TanStack Query hooks.
* `components/`: Shared, reusable React components (e.g., `Card`, `StatusBadge`, layout components).
* `contexts/`: React context providers for managing global UI state.
* `hooks/`: Custom React hooks for business logic and UI behavior.
* `pages/`: Top-level components that correspond to the application's routes (e.g., `Dashboard`, `RulesExplorer`).
* `store/`: Zustand stores for managing global client-side state.
* `utils/`: Utility functions and constants.

## Roadmap & Future Enhancements

Our goal is to continue evolving SAINT X into a comprehensive workbench for detection engineering. Key features on the roadmap include:

<<<<<<< HEAD
### Production Build

Create a production build:

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `dist/` directory.

## AWS Backend Integration

SAINT EX integrates with AWS services for backend functionality:

- **API Gateway**: Provides RESTful API endpoints
- **Lambda Functions**: Processes API requests and interacts with DynamoDB
- **DynamoDB**: Stores detection rules and related data
- **CloudFormation**: Defines the infrastructure as code

## API Endpoints

The application uses the following API endpoints:

- `/rules` - Get all rules with filtering and pagination
- `/rules/{id}` - Get a rule by ID
- `/rules/technique/{techniqueId}` - Get rules by technique
- `/rules/platform/{platform}` - Get rules by platform
- `/techniques/coverage` - Get technique coverage statistics

## Copyright

© 2025 All Rights Reserved. This project and all its associated source code is proprietary. No part of this code may be reproduced, distributed, or transmitted in any form or by any means without the prior written permission of the copyright owner.

## Contact

For questions or support, please contact [your-email@example.com].
>>>>>>> a380730 (Initial deployment)
=======
* **Browser-Based Rule Editor**: A full-featured, in-app editor that allows users to create and modify detection rules. This feature will integrate directly with the GitLab workflow by automatically creating branches and merge requests.
* **Enhanced Analytics**: Deeper integration with SIEM platforms to pull rule performance metrics (e.g., alert volume, false positive rates).
* **Collaborative Features**: Real-time collaboration features, allowing multiple analysts to work on rule enrichment and notes simultaneously.
>>>>>>> 33fb71b (updated redirect_uri)
