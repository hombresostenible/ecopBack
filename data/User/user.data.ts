import { Op } from 'sequelize';
import sequelize from '../../db';
import User from '../../schema/User/user.schema';
import {
    transporterZoho,
    mailUserWelcome,
    mailUpdateUserProfile,
} from '../../libs/nodemailer';
import { extractPublicIdFromUrlCloudinaryProfiles } from '../../helpers/Cloudinary/cloudinary.helper';
import cloudinary from '../../helpers/Cloudinary/cloudinary.helper';
import { IUser } from '../../types/User/users.types';
import { ServiceError } from '../../types/Responses/responses.types';

//REGISTRO DE UN USUARIO
export const postRegisterUserData = async (body: IUser): Promise<User | null> => {
    const t = await sequelize.transaction();
    try {
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { email: body.email },
                    { documentId: body.documentId }
                ]
            },
            transaction: t,
        });
        if (existingUser) {
            if (existingUser.email === body.email && existingUser.documentId === body.documentId) {
                throw new ServiceError(400, 'El correo y el documento de identificación ya están registrados');
            } else if (existingUser.email === body.email) {
                await t.rollback(); // Revertir la transacción antes de lanzar el error
                throw new ServiceError(400, 'El correo ya está registrado');
            } else if (existingUser.documentId === body.documentId) {
                await t.rollback(); // Revertir la transacción antes de lanzar el error
                throw new ServiceError(400, 'El documento de identificación ya está registrado');
            }
            return null;
        }
        const newUser = new User({
            name: body.name,
            lastName: body.lastName,
            corporateName: body.corporateName,
            typeDocumentId: body.typeDocumentId,
            documentId: body.documentId,
            commercialName: body.commercialName,
            logo: body.logo,
            typeRole: body.typeRole,
            economicSector: body.economicSector,
            codeCiiu: body.codeCiiu,
            department: body.department,
            city: body.city,
            codeDane: body.codeDane,
            subregionCodeDane: body.subregionCodeDane,
            address: body.address,
            postalCode: body.postalCode,
            phone: body.phone,
            email: body.email,
            password: body.password,
            isAceptedConditions: body.isAceptedConditions,
        });
        const nameToUse = body.name ?? body.corporateName;
        try {
            const mailOptions = mailUserWelcome(body.email, nameToUse || '');
            await newUser.save({ transaction: t });
            await transporterZoho.sendMail(mailOptions);
            console.log('Correo electrónico de bienvenida enviado con éxito.');
            await t.commit();
            return newUser;
        } catch (emailError) {
            await t.rollback();
            throw new ServiceError(500, 'Error al enviar el correo electrónico de bienvenida');
        }
    } catch (error) {
        await t.rollback();
        throw new ServiceError(500, `${error}`);
    }
};



//RECIBE EL CORREO DE SOLICITUD POR CAMBIO DE CONTRASEÑA DE USER O USUARIO DE PLATAFORMA
export const getSearchEmailUserPasswordChangeData = async (email: string, token: string, dateNow: Date): Promise<any> => {
    try {
        const user = await User.findOne({ where: { email: email } });        
        if (!user) throw new Error("Correo electrónico no registrado");
        user.passwordResetCode = token;
        user.passwordResetCodeDate = dateNow;
        await user.save();
        return user;
    } catch (error) {
        throw error;
    }
};



//CAMBIO DE CONTRASEÑA USER O USUARIO DE PLATAFORMA
export const putResetPasswordData = async (id: string): Promise<User | null> => {
    try {
        const userFound = await User.findOne({ where: { id: id } });
        if (!userFound) {
            throw new Error("usuario no encontrado")
        } else if (userFound.isBlocked === true) throw new Error("Tu cuenta se encuentra bloqueada, por favor realiza el proceso de desbloqueo");
        return userFound;
    } catch (error) {
        throw error;
    }
};



//ACTUALIZAR EL PERFIL DEL USER
export const putProfileUserData = async (body: IUser, userId: string): Promise<IUser | null> => {
    const t = await sequelize.transaction();
    try {
        const [rowsUpdated] = await User.update(body, { where: { id: userId }, transaction: t });
        if (rowsUpdated === 0) {
            await t.rollback();
            throw new ServiceError(403, "No se encontró ningún usuario para actualizar");
        }
        const updatedUser = await User.findByPk(userId, { transaction: t });
        if (!updatedUser) {
            await t.rollback();
            throw new ServiceError(404, "No se encontró ningún usuario para actualizar");
        }
        const mailOptions = mailUpdateUserProfile(updatedUser.email, updatedUser.name);
        try {
            await transporterZoho.sendMail(mailOptions);
            console.log('Correo electrónico de actualización de perfil enviado con éxito.');
            await t.commit();
            return updatedUser;
        } catch (emailError) {
            await t.rollback();
            throw new ServiceError(500, 'Error al enviar el correo electrónico de actualización de perfil');
        }
    } catch (error) {
        await t.rollback();
        throw error;
    }
};



//SUBIR LA IMAGEN DE PERFIL DEL USER
export const patchLogoUserData = async (idUser: string, body: Partial<IUser>): Promise<IUser | null> => {
    try {
        const existingUser = await User.findOne({
            where: { id: idUser },
        });
        if (!existingUser) throw new ServiceError(404, "No se encontró el usuario");
        if (existingUser && body.logo) {
            existingUser.logo = body.logo;
            await existingUser.save();
        }
        return existingUser;
    } catch (error) {
        throw error;
    }
};



//ELIMINAR LA IMAGEN DE PERFIL DEL USER
export const patchDeleteLogoUserData = async (userId: string) => {
    try {
        // Buscar el usuario por su ID
        const updateClient = await User.findByPk(userId);
        if (!updateClient) throw new Error("No se encontró el usuario para actualizar su logo");

        // Guardar la URL del logo antes de actualizar
        const logoUrl = updateClient.logo;

        // Actualizar la propiedad logo a una cadena vacía y guardar los cambios
        updateClient.logo = '';
        await updateClient.save();

        // Configurar Cloudinary (debería estar configurado en un lugar central)
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        // Eliminar la imagen de Cloudinary si la URL del logo existía
        if (logoUrl) {
            const publicId = extractPublicIdFromUrlCloudinaryProfiles(logoUrl);
            await cloudinary.uploader.destroy(publicId);
        }

        // Volver a buscar el usuario actualizado (opcional, dependiendo de cómo se quiera manejar el flujo)
        const existingUser = await User.findOne({
            where: { id: userId }
        });
        if (!existingUser) throw new ServiceError(404, "No se encontró el usuario");

        // Retornar el usuario actualizado
        return existingUser;
    } catch (error) {
        throw error;
    }
};




//DESBLOQUEO DE CUENTA Y CAMBIO DE CONTRASEÑA USER
export const findUserBlockedData = async (idUser: string): Promise<User | null> => {
    try {
        const userFound = await User.findOne({ where: { id: idUser } });
        if (!userFound) throw new Error("usuario no encontrado");
        return userFound;
    } catch (error) {
        throw error;
    }
};