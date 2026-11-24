export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  // SA-03: Cloudinary (API externa para las fotos). El preset es "unsigned": no se necesita API secret en el frontend.
  cloudinaryCloudName: 'doqzrdmep',
  cloudinaryUploadPreset: 'faunascan',
};
