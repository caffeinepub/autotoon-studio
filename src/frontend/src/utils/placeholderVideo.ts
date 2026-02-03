/**
 * Loads a valid placeholder video from static assets
 * Returns bytes suitable for ExternalBlob.fromBytes() uploads
 * 
 * Validates that the loaded asset is a real MP4 file (not a stub)
 */
export async function loadPlaceholderVideo(): Promise<Uint8Array<ArrayBuffer>> {
  try {
    const response = await fetch('/assets/placeholders/minimal-placeholder.mp4');
    if (!response.ok) {
      throw new Error(`Placeholder video asset not found or could not be loaded (HTTP ${response.status}). Please ensure /assets/placeholders/minimal-placeholder.mp4 exists and is accessible.`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer) as Uint8Array<ArrayBuffer>;
    
    // Validate minimum size (real MP4s are at least a few KB)
    const MIN_VALID_SIZE = 1024; // 1 KB minimum
    if (bytes.length < MIN_VALID_SIZE) {
      throw new Error(
        `Placeholder video asset is invalid (only ${bytes.length} bytes). A valid MP4 file must be at least ${MIN_VALID_SIZE} bytes. Please replace /assets/placeholders/minimal-placeholder.mp4 with a real MP4 video file.`
      );
    }
    
    // Basic MP4 signature check (ftyp box)
    const hasMP4Signature = 
      bytes.length >= 8 &&
      bytes[4] === 0x66 && // 'f'
      bytes[5] === 0x74 && // 't'
      bytes[6] === 0x79 && // 'y'
      bytes[7] === 0x70;   // 'p'
    
    if (!hasMP4Signature) {
      throw new Error(
        'Placeholder video asset does not appear to be a valid MP4 file (missing ftyp signature). Please replace /assets/placeholders/minimal-placeholder.mp4 with a real MP4 video file.'
      );
    }
    
    console.log(`✓ Loaded valid placeholder video: ${bytes.length} bytes`);
    return bytes;
    
  } catch (error) {
    console.error('Error loading placeholder video:', error);
    // Fail fast with actionable error message
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to load placeholder video asset. The file /assets/placeholders/minimal-placeholder.mp4 is missing or could not be loaded.'
    );
  }
}
