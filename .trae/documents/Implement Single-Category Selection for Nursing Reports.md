I will modify the nursing report form to enforce a single-category selection workflow, ensuring the report is generated strictly based on the selected report type.

### UI Changes
1.  **Add Report Type Selection**:
    *   Introduce a dropdown menu at the top of the form labeled "نوع گزارش" (Report Type).
    *   Populate this dropdown with the available `ReportCategory` options (e.g., "Level 1", "Respiratory", etc.).
2.  **Conditional Rendering**:
    *   Hide the checklist items until a category is selected.
    *   Once selected, display *only* the items and sub-items belonging to that specific category.

### Logic Updates
1.  **State Management**:
    *   Add `selectedCategoryId` state to track the active report type.
2.  **Report Generation (`generateReport`)**:
    *   Update the text generation logic to only process items from the `selectedCategory`.
    *   Ensure the generated text clearly reflects the context of the selected report type.
3.  **Submission (`onSubmit`)**:
    *   Filter the submitted items to ensure only those belonging to the selected category are sent to the backend.
