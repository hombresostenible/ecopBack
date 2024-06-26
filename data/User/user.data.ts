import { Op } from 'sequelize';
import sequelize from '../../db';
import User from '../../schema/User/user.schema';
import {
    transporterZoho,
    mailUserWelcome,
} from '../../libs/nodemailer';
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
            verificationDigit: body.verificationDigit,
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
export const findUserData = async (id: string): Promise<User | null> => {
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