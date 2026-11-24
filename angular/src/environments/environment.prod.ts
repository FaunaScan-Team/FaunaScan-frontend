export const environment = {
  production: true,
  apiUrl: 'http://IP_PUBLICA_EC2:6868/api',
  // SA-03: Cloudinary (API externa para las fotos). El preset es "unsigned": no se necesita API secret en el frontend.
  cloudinaryCloudName: 'doqzrdmep',
  cloudinaryUploadPreset: 'faunascan',
};
