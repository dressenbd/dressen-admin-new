# Backend Fix for Banner Replacement Issue

## Problem
When replacing a banner at a specific position, it's adding a new banner instead of replacing the existing one.

## Root Cause
Backend is not properly mapping new files to their intended positions.

## Frontend FormData Structure
```javascript
// When replacing banner at position 1:
sliderImages: [newFile]                    // The new file
newFilePosition_0: "1"                     // This new file goes to position 1
existingBanner_0: "existing-banner-0.jpg" // Keep position 0
existingBanner_1: ""                       // Replace position 1 with new file
existingBanner_2: "existing-banner-2.jpg" // Keep position 2
sliderImageUrl_0: "https://url0.com"       // URL for position 0
sliderImageUrl_1: "https://url1.com"       // URL for position 1
sliderImageUrl_2: "https://url2.com"       // URL for position 2
```

## Backend Controller Fix
```javascript
const updateSettings = async (req, res) => {
  try {
    const newFiles = req.files?.sliderImages || [];
    const sliderImages = [];
    
    // Create position mapping for new files
    const newFilePositions = {};
    let fileIndex = 0;
    
    // Map new files to their positions
    while (req.body[`newFilePosition_${fileIndex}`] !== undefined) {
      const position = parseInt(req.body[`newFilePosition_${fileIndex}`]);
      newFilePositions[position] = newFiles[fileIndex];
      fileIndex++;
    }
    
    // Build final slider array
    for (let i = 0; i < 3; i++) {
      const existingBanner = req.body[`existingBanner_${i}`];
      const url = req.body[`sliderImageUrl_${i}`] || "";
      
      if (newFilePositions[i]) {
        // Use new file for this position
        sliderImages.push({
          image: newFilePositions[i].path,
          url: url
        });
      } else if (existingBanner) {
        // Keep existing banner
        sliderImages.push({
          image: existingBanner,
          url: url
        });
      }
      // If both are empty, skip this position
    }
    
    // Update settings with new sliderImages array
    const settings = await Settings.findOneAndUpdate(
      {},
      { sliderImages: sliderImages.filter(item => item.image) },
      { new: true, upsert: true }
    );
    
    res.json({
      success: true,
      message: "Settings updated successfully!",
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
```

## Key Changes Needed in Backend:

1. **Map new files to positions** using `newFilePosition_X` fields
2. **Replace at exact position** instead of appending
3. **Preserve existing banners** at unchanged positions
4. **Filter out empty positions** in final array

This ensures that when you replace banner at position 1, it actually replaces position 1, not adds a 4th banner.