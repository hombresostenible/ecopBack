import { v2 as cloudinary } from 'cloudinary';

// OBTIENE EL ID DE LA IMAGEN DE CLOUDINARY
export function extractPublicIdFromUrlCloudinaryProfiles(url: string) {
    const parts = url.split('/');
    const folderIndex = parts.indexOf('profiles'); // 'profiles' es el nombre de tu carpeta
    if (folderIndex === -1) {
        throw new Error('No se encontró la carpeta "profiles" en la URL');
    }
    const publicIdParts = parts.slice(folderIndex);
    const publicId = publicIdParts.join('/').split('.')[0]; // Une las partes y elimina la extensión
    return publicId;
};



// CONSIGURACION DE CLOUDINARY USADA PARA ELIMINAR IMAGENES
export const configureCloudinary = () => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
};

// Configura Cloudinary una vez cuando se carga el módulo
configureCloudinary();

export default cloudinary;