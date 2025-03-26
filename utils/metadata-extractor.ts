/**
 * Utilities for extracting metadata from files to demonstrate sanitization
 */

import { cleanFileMetadata } from "./file-sanitizer";

/**
 * Metadata entry with name and value
 */
export type MetadataEntry = {
  name: string;
  value: string | number | null;
  category?: 'basic' | 'location' | 'device' | 'timestamp' | 'other';
};

/**
 * Extract EXIF metadata from an image file
 * @param imageFile The image file to extract metadata from
 * @returns Promise resolving to array of metadata entries
 */
export async function extractImageMetadata(
  imageFile: File
): Promise<MetadataEntry[]> {
  return new Promise((resolve) => {
    const metadata: MetadataEntry[] = [
      { name: "Filename", value: imageFile.name, category: 'basic' },
      { name: "File size", value: `${(imageFile.size / 1024).toFixed(2)} KB`, category: 'basic' },
      { name: "MIME type", value: imageFile.type, category: 'basic' },
      {
        name: "Last modified",
        value: new Date(imageFile.lastModified).toISOString(),
        category: 'timestamp'
      },
    ];

    // Check if it's an image file we can process
    if (!imageFile.type.startsWith("image/")) {
      resolve(metadata);
      return;
    }

    // Look for patterns in the filename that might indicate location data
    const filename = imageFile.name.toLowerCase();
    const locationPattern = /(gps|loc|location|coord|lat|lng|lon|latitude|longitude|position|geo|map)/i;
    if (locationPattern.test(filename)) {
      metadata.push({ 
        name: "Possible location in filename", 
        value: "Filename contains location-related terms",
        category: 'location'
      });
    }

    // Create an image element to load the file
    const img = new Image();
    img.onload = () => {
      // Add image dimensions
      metadata.push({ name: "Width", value: img.naturalWidth, category: 'basic' });
      metadata.push({ name: "Height", value: img.naturalHeight, category: 'basic' });

      // If we have access to the EXIF library, extract full EXIF data
      // This would be better with a library like exif-js
      if ("exifdata" in img) {
        const exifData = (img as any).exifdata;

        if (exifData) {
          // Location data
          const locationTags = [
            'GPSLatitude', 'GPSLongitude', 'GPSAltitude', 
            'GPSLatitudeRef', 'GPSLongitudeRef', 'GPSAltitudeRef',
            'GPSDateStamp', 'GPSTimeStamp', 'GPSProcessingMethod'
          ];
          
          // Device data
          const deviceTags = [
            'Make', 'Model', 'Software', 'CameraSerialNumber', 
            'LensMake', 'LensModel', 'BodySerialNumber'
          ];
          
          // Time data
          const timeTags = [
            'DateTime', 'DateTimeOriginal', 'DateTimeDigitized',
            'SubsecTime', 'SubsecTimeOriginal', 'SubsecTimeDigitized'
          ];
          
          // Other potentially identifying data
          const otherTags = [
            'Artist', 'Copyright', 'UserComment', 'OwnerName',
            'SerialNumber', 'ImageUniqueID'
          ];
          
          // Process all EXIF data
          Object.keys(exifData).forEach(tag => {
            if (exifData[tag] !== undefined) {
              let category: MetadataEntry['category'] = 'other';
              
              if (locationTags.includes(tag)) category = 'location';
              else if (deviceTags.includes(tag)) category = 'device';
              else if (timeTags.includes(tag)) category = 'timestamp';
              
              metadata.push({ 
                name: tag, 
                value: exifData[tag],
                category 
              });
            }
          });
        }
      }

      resolve(metadata);
    };

    img.onerror = () => {
      resolve(metadata);
    };

    img.src = URL.createObjectURL(imageFile);
  });
}

/**
 * Compare metadata before and after sanitization
 * @param originalFile The original file
 * @returns Promise resolving to comparison results
 */
export async function compareMetadataSanitization(originalFile: File): Promise<{
  beforeSanitization: MetadataEntry[];
  afterSanitization: MetadataEntry[];
}> {
  // Extract metadata before sanitization
  const beforeMetadata = await extractImageMetadata(originalFile);

  // Clean the file
  const cleanedFile = await cleanFileMetadata(originalFile);

  // Extract metadata after sanitization
  const afterMetadata = await extractImageMetadata(cleanedFile);

  return {
    beforeSanitization: beforeMetadata,
    afterSanitization: afterMetadata,
  };
}
