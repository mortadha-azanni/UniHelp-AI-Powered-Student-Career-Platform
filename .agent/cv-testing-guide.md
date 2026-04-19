# How to Test CV Save and Display Feature

## Prerequisites
- Server running on port 5000
- Client running on port 5173
- At least one job application created
- User profile completed

## Test Steps

### 1. Generate and Save a CV

1. Navigate to the **Generate CV** page
2. Select a job application from the dropdown
3. Click **"✨ Générer mon CV Maintenant"**
4. Wait for the CV generation (LaTeX code should appear)
5. Enter a CV name (e.g., "CV Google - Software Engineer")
6. Click **"Sauvegarder et attacher à la candidature"**
7. ✅ Success message should appear

### 2. View CV from Job Applications List

1. Navigate to the **Job Applications** page
2. Find the job application you just generated a CV for
3. In the **CV column**, you should see **two buttons**:
   - 📄 **Voir LaTeX** (blue button)
   - 🚀 **Overleaf** (green button)

### 3. Test "Voir LaTeX" Button

1. Click the **"📄 Voir LaTeX"** button
2. A modal should open showing:
   - CV name as the title
   - Generation date
   - Complete LaTeX code in a dark code block
   - "Open in Overleaf" button
   - "Fermer" (Close) button
3. Verify the LaTeX code is displayed correctly
4. Click **"Fermer"** to close the modal

### 4. Test "Open in Overleaf" Button (from table)

1. Click the **"🚀 Overleaf"** button in the table
2. A new browser tab should open with Overleaf
3. The CV LaTeX code should be loaded in Overleaf editor
4. You can compile and view the PDF in Overleaf

### 5. Test "Open in Overleaf" Button (from modal)

1. Click **"📄 Voir LaTeX"** to open the modal
2. In the modal footer, click **"🚀 Ouvrir dans Overleaf"**
3. Overleaf should open with the CV code
4. You can edit and compile the CV

### 6. Verify Persistence

1. Refresh the page
2. The CV buttons should still appear
3. Clicking them should still work
4. The LaTeX code should be the same

## Expected Behavior

### When CV is NOT attached:
- The CV column shows a dash (-) with no buttons

### When CV IS attached:
- Two buttons appear side by side
- "Voir LaTeX" button (blue) shows the code in a modal
- "Overleaf" button (green) opens in Overleaf editor
- Both buttons work from the table and modal

## Troubleshooting

### If buttons don't appear:
1. Check that the CV was saved successfully (check success message)
2. Refresh the job applications page
3. Check browser console for errors
4. Verify the application has a `cvVersion` populated

### If Overleaf doesn't open:
1. Check browser pop-up blocker settings
2. Verify the LaTeX code is not empty
3. Check browser console for encoding errors

### If LaTeX code doesn't display:
1. Verify the CV was generated with LaTeX code
2. Check that `latexCode` field is populated in the database
3. Check server response includes `latexCode` field

## Success Criteria

✅ CV saves to database with jobApplication reference  
✅ Job application updates with cvVersion reference  
✅ Two buttons appear in job applications table  
✅ "Voir LaTeX" button opens modal with code  
✅ "Overleaf" button opens in Overleaf editor  
✅ LaTeX code displays correctly in dark code block  
✅ CV persists after page refresh  
✅ All buttons work consistently
