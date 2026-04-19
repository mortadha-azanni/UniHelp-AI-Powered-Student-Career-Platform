# CV Save and Display Implementation Summary

## Overview
Implemented a complete CV save and display system that allows users to:
1. Generate CVs and save them to the database
2. Automatically attach CVs to job applications
3. View saved CVs from the job application list
4. Display LaTeX code and open CVs directly in Overleaf

## Changes Made

### 1. Database Model Updates

#### CV Model (`server/models/CV.js`)
- **Added:** `jobApplication` field to reference the associated job application
  - Type: `ObjectId` referencing `JobApplication`
  - Optional field for bidirectional relationship

### 2. Backend Updates

#### CV Controller (`server/controllers/cvController.js`)
- **Modified:** `saveGeneratedCV` function
  - Now saves `jobApplicationId` in the CV document
  - Creates bidirectional relationship between CV and JobApplication
  - Updates the job application's `cvVersion` field when a CV is saved with `jobApplicationId`

#### Job Application Controller (`server/controllers/jobApplicationController.js`)
- **Updated:** All `populate()` calls for `cvVersion` field
  - Added `latexCode` to the populated fields
  - Previous: `.populate('cvVersion', 'versionName generatedDate')`
  - Current: `.populate('cvVersion', 'versionName generatedDate latexCode')`
  - Affects: `getApplications`, `createApplication`, `updateApplication`, `updateApplicationStatus`

### 3. Frontend Updates

#### ApplicationsTable Component (`client/src/components/ApplicationsTable.jsx`)

**CV Display in Table:**
- **Replaced** single "Voir CV" button with two buttons:
  1. **"📄 Voir LaTeX"** - Opens modal to view LaTeX code
  2. **"🚀 Overleaf"** - Opens CV directly in Overleaf editor
- Both buttons appear side-by-side in a flex container
- Green styling for Overleaf button (#4CAF50)

**CV Viewer Modal:**
- **Changed** from profile snapshot display to LaTeX code display
- Shows CV metadata (name, generation date, description)
- Displays LaTeX code in a styled code block:
  - Dark theme (#1e293b background)
  - Monospace font (Consolas, Monaco)
  - Scrollable container (max-height: 400px)
  - Syntax-friendly formatting
- **Added** "Open in Overleaf" button in modal footer
- Removed profile snapshot preview (kept LaTeX focused)

**Data Handling:**
- Simplified CV version retrieval
- Now uses populated `app.cvVersion` directly instead of searching in `cvVersions` array

### 4. User Workflow

#### Generating and Saving a CV:
1. User selects a job application
2. Clicks "Générer mon CV Maintenant"
3. System generates LaTeX code via n8n webhook
4. User enters a CV name
5. Clicks "Sauvegarder et attacher à la candidature"
6. CV is saved to database with:
   - Reference to user
   - Reference to job application
   - LaTeX code
   - Profile snapshot
7. Job application is updated with CV reference

#### Viewing Saved CVs from Job Applications:
1. Navigate to job applications list
2. For applications with CVs, two buttons appear:
   - **"Voir LaTeX"**: Opens modal showing code
   - **"Overleaf"**: Opens in Overleaf editor
3. In the modal:
   - View complete LaTeX code
   - Click "Ouvrir dans Overleaf" to edit
   - Close modal when done

## Technical Implementation Details

### Overleaf Integration
The app uses Overleaf's snippet URI feature:
```javascript
const base64 = btoa(unescape(encodeURIComponent(cvVersion.latexCode)));
const dataUri = 'data:text/x-tex;base64,' + base64;
window.open('https://www.overleaf.com/docs?snip_uri=' + encodeURIComponent(dataUri), '_blank');
```

This allows users to:
- Open LaTeX directly in Overleaf without manual copy/paste
- Edit and compile in a proper LaTeX environment
- Download PDF from Overleaf

### Data Flow
```
User Action → Generate CV → Save to DB (with jobApplicationId)
                                ↓
                         Update JobApplication.cvVersion
                                ↓
                         Fetch Applications (with populated CV)
                                ↓
                         Display in Table with Buttons
                                ↓
                    View LaTeX or Open in Overleaf
```

## Benefits

1. **Seamless Integration**: CVs are automatically linked to their job applications
2. **Easy Access**: View and edit CVs directly from the application list
3. **Professional Workflow**: Direct Overleaf integration for editing
4. **Data Persistence**: All CVs saved with complete LaTeX code
5. **Two-Way Relationship**: Both CV and JobApplication reference each other

## Testing Checklist

- [ ] Generate a CV for a job application
- [ ] Save CV with "Sauvegarder et attacher"
- [ ] Navigate to job applications page
- [ ] Verify CV buttons appear for the application
- [ ] Click "Voir LaTeX" to view code in modal
- [ ] Click "Overleaf" button (both in table and modal)
- [ ] Verify Overleaf opens with the CV code
- [ ] Check that CV persists after page reload
