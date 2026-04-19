# Fix for 414 Request-URI Too Large Error

## Problem

When clicking the "Overleaf" button for large CVs, users encountered a **414 Request-URI Too Large** error. This happened because:

1. The entire LaTeX code was being encoded as base64
2. The encoded data was appended to the URL as a query parameter
3. Large CVs created URLs exceeding the server's maximum length (~8KB)

## Root Cause

```javascript
// Previous code - creates very long URLs for large CVs
const base64 = btoa(unescape(encodeURIComponent(latexCode)));
const dataUri = 'data:text/x-tex;base64,' + base64;
window.open('https://www.overleaf.com/docs?snip_uri=' + encodeURIComponent(dataUri), '_blank');
```

For a typical CV with 200+ lines of LaTeX code, the resulting URL could be 10,000+ characters long, exceeding server limits.

## Solution

Implemented an intelligent fallback mechanism:

1. **Try Overleaf first** - Calculate URL length before opening
2. **Fallback to download** - If URL > 8000 characters, download .tex file instead
3. **User guidance** - Show clear instructions for manual upload to Overleaf

### Implementation

```javascript
// New code with URL length check
const base64 = btoa(unescape(encodeURIComponent(latexCode)));
const dataUri = 'data:text/x-tex;base64,' + base64;
const overleafUrl = 'https://www.overleaf.com/docs?snip_uri=' + encodeURIComponent(dataUri);

// Check if URL is too long (most servers limit to ~8KB for URLs)
if (overleafUrl.length > 8000) {
    // Fallback: Download the .tex file instead
    const blob = new Blob([latexCode], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cv.tex';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    alert('⚠️ Le CV est trop volumineux pour être ouvert directement.\n\n' +
          '📥 Le fichier .tex a été téléchargé.\n\n' +
          '📝 Pour utiliser Overleaf:\n' +
          '1. Allez sur overleaf.com\n' +
          '2. Créez un nouveau projet\n' +
          '3. Uploadez le fichier .tex téléchargé');
} else {
    window.open(overleafUrl, '_blank');
}
```

## Files Modified

1. **ApplicationsTable.jsx** - Updated both Overleaf buttons:
   - Table row button
   - Modal footer button

2. **GenerateCVPage.jsx** - Updated Overleaf button in CV generation page

## User Experience

### For Small CVs (< 8KB encoded):
- Clicks "Overleaf" button
- ✅ Opens directly in Overleaf
- Can compile and edit immediately

### For Large CVs (> 8KB encoded):
- Clicks "Overleaf" button
- 📥 .tex file downloads automatically
- 💬 Alert shows with clear instructions:
  - Go to overleaf.com
  - Create new project
  - Upload downloaded .tex file
- Can then compile and edit in Overleaf

## Benefits

1. **No errors** - Eliminates 414 error completely
2. **Graceful degradation** - Works for all CV sizes
3. **Clear guidance** - Users know exactly what to do
4. **Maintains workflow** - Still very easy to get CV into Overleaf
5. **Automatic detection** - No user configuration needed

## Technical Details

### URL Length Calculation
- Average LaTeX CV: ~3,000-5,000 characters
- After base64 encoding: ~4,000-6,700 characters
- After URL encoding: ~8,000-13,000 characters
- Threshold set at 8,000 to be safe (most servers accept ~8KB URLs)

### Browser Blob API
Uses the Blob API to create downloadable files:
- Creates in-memory blob from LaTeX code
- Generates temporary download URL
- Programmatically triggers download
- Cleans up temporary URL

### File Naming
Downloads use semantic names:
- In table/modal: `{versionName}.tex`
- On generation page: `{cvName}.tex`
- Fallback: `cv.tex`

## Testing

### Test Case 1: Small CV
1. Generate a simple CV (~100 lines)
2. Click Overleaf button
3. ✅ Should open in Overleaf directly

### Test Case 2: Large CV
1. Generate a comprehensive CV (~500+ lines)
2. Click Overleaf button
3. ✅ File should download
4. ✅ Alert should appear with instructions

### Test Case 3: Multiple Locations
1. Test from job applications table
2. Test from modal viewer
3. Test from generation page
4. ✅ All should handle large CVs correctly

## Future Improvements

Potential enhancements for even better UX:

1. **Backend proxy endpoint**
   - Store CV temporarily on server
   - Provide short URL for Overleaf
   - Allows all CVs to open directly

2. **Overleaf API integration**
   - Use official Overleaf API
   - Requires OAuth setup
   - Can create projects programmatically

3. **Visual indicator**
   - Show file size estimate
   - Indicate which method will be used
   - Add CV compression option

4. **Copy to clipboard**
   - Alternative to download
   - User can paste directly in Overleaf
   - One less step than file upload
