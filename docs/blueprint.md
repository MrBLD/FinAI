# **App Name**: FinanceFlow Dashboard

## Core Features:

- CSV Data Upload: Upload CSV files containing financial transactions; data will be parsed and stored in Firestore.
- Data Parsing: Parse uploaded CSV data into the required Firestore schema including transformations and calculations, using a fixed optimised code
- Overview Dashboard: Display KPI cards (Total Income, Expense, Net Cashflow, Savings Rate, Budget Variance) and charts (Monthly Income vs Expense, Account Usage, Category Spend, Expense by Day of Week).
- Long Term Trends: Visualize net cashflow trend, cumulative net cashflow, and spending trends of top categories over time.
- Transaction Table: Display a sortable and filterable data table of all transactions with details like date, type, account, category, amount, and comment.
- Sidebar Navigation: Implement a sidebar to navigate between the Overview, Long Term, and Transactions views.
- Global Filters: Apply date range, type, account, category, subcategory, and amount filters across all views and charts.

## Style Guidelines:

- Primary color: A calm, professional blue (#5DADE2) for trust and stability, reflecting financial prudence.
- Background color: Light gray (#F0F4F8), providing a neutral backdrop that emphasizes data clarity and readability.
- Accent color: A muted green (#82E0AA) for positive indicators like income or savings, offering a subtle contrast against the blue primary.
- Body and headline font: 'Inter', a grotesque-style sans-serif providing a modern, objective, and neutral look.
- Use clean, minimalist icons from a library like FontAwesome or Material Icons to represent financial concepts and navigation elements.
- Adopt a 'wide' layout similar to Streamlit, maximizing screen real estate for data visualization. Use Tailwind CSS for a modern and responsive design.
- Incorporate subtle transitions and animations to improve user experience, such as chart loading animations and hover effects on interactive elements.