import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@src/supabase/Supabase';

/**
 * @param {Function} setError - State setter to update any error messages.
 * @param {Function} setUploading - State setter to toggle the uploading state.
 * @param {Function} setUploadProgress - State setter to update the upload progress percentage.
 * @param {Function} setLatestModel - State setter to set the latest uploaded model with its name and URL.
 * @returns {Function} - The function that opens the file input and handles file upload.
 */
export const createFileUploader = (
  setError,
  setUploading,
  setUploadProgress,
  setLatestModel
) => {
  return async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.gltf,.fbx,.glb'; // Accept only GLTF, GLB, or FBX files

    console.log("Creating file input...");


    input.onchange = async (e) => {
      
      const file = e.target.files?.[0];
      if (!file) return;
      const fileExtension = file.name.split('.').pop()?.toLowerCase(); // Get the file extension
      if (!['gltf', 'fbx', 'glb'].includes(fileExtension)) {
        setError('Please select a GLTF, GLB, or FBX file'); // Error if the file type is invalid
        return;
      }

      try {
        setError(null); // Reset any previous errors
        setUploading(true); // Start uploading
        const fileName = `${uuidv4()}.${fileExtension}`; // Generate a unique filename using UUID

        // Get the bucket name from environment variables
        const bucketName = import.meta.env.VITE_SUPABASE_BUCKET_NAME;

        // Upload the file to Supabase storage
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file, {
            cacheControl: '3600',
            onUploadProgress: (progress) => {
              const percentage = (progress.loaded / progress.total) * 100;
              setUploadProgress(Math.round(percentage));
            },
          });

        if (error) throw error;

        // Generate a signed URL for the uploaded file
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(fileName, 3600); // URL valid for 3600 seconds (1 hour)

        if (signedUrlError) throw signedUrlError;

        // Update the latest model with the signed URL
        setLatestModel({ name: file.name, url: signedUrlData.signedUrl });
      } catch (error) {
        setError(error.message); // Handle errors
      } finally {
        setUploading(false); // Stop uploading state
        setUploadProgress(0);
      }
    };

    input.click(); // Trigger the file input click event to open the file picker
    console.log("File input clicked!");

  };
};
