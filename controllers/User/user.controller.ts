import express, { Request, Response } from "express";
import {
    postRegisterUserService,
    getSearchEmailUserPasswordChangeService,
    putResetPasswordService,
    putProfileUserService,
    patchLogoUserService,
    patchDeleteLogoUserService,
    putResetPasswordUserIsBlockedService,
} from "../../services/User/user.services";
import { authRequired } from '../../middlewares/Token/Token.middleware';
import { validateSchema } from '../../middlewares/Schema/Schema.middleware.js';
import { registerUserSchema } from '../../validations/User/user.zod';
import { ServiceError } from '../../types/Responses/responses.types';
const router = express.Router();

//REGISTRO DE UN USUARIO
router.post("/register", validateSchema(registerUserSchema), async (req: Request, res: Response): Promise<void> => {
    try {
        const body = req.body;
        const user = await postRegisterUserService(body);
        if (user.result) {
            const { serResult, token } = user.result;
            res.cookie("token", token);
            res.json({ serResult, token });
        } else {
            res.status(user.code).json({ message: user.message });
        }        
    } catch (error) {
        const errorController = error as ServiceError;
        res.status(errorController.code).json(errorController.message);
    }
}); // POST - http://localhost:3000/api/user/register con { "name": "Carlos", "lastName": "Reyes", "corporateName": null, "typeDocumentId": "Cedula de Ciudadania", "documentId": "1110521285", "verificationDigit": "5", "commercialName": "Todo Software a la mano", "logo": "string", "typeRole": "Superadmin", "economicSector": "Servicios", "codeCiiu": "5820", "department": "Bogota D.C.", "city": "Bogota D.C.", "codeDane": "11001", "subregionCodeDane": "11", "address": "Cra 10 # 10 -10", "postalCode": "110001", "phone": "3128082002", "email": "carlosmario.reyesp@gmail.com", "password": "password", "isAceptedConditions": true }



//RECIBE EL CORREO DE SOLICITUD POR CAMBIO DE CONTRASEÑA DE USER O USUARIO DE PLATAFORMA
router.get("/email-user", async (req: Request, res: Response): Promise<void> => {
    try {
        const email = req.query.email as string;
        const serviceLayerResponse = await getSearchEmailUserPasswordChangeService(email);
        if(!serviceLayerResponse) {
            res.status(401).json({ message: 'Correo electrónico no registrado' });
            return;
        } else res.status(serviceLayerResponse.code).json(serviceLayerResponse);               
    } catch (error) {
        const errorController = error as ServiceError;
        res.status(errorController.code).json(errorController.message);
    }                
}); // GET - http://localhost:3000/api/user/email-user?email=carlosmario.reyesp@yahoo.com



//CAMBIO DE CONTRASEÑA USER O USUARIO DE PLATAFORMA
router.put("/reset-password/:idUser/:passwordResetCode", async (req: Request, res: Response): Promise<void> => {
    try {
        const { idUser, passwordResetCode } = req.params;
        const body = req.body;
        const serviceLayerResponse = await putResetPasswordService(idUser, passwordResetCode, body);
        if (!serviceLayerResponse) {
            res.status(401).json({ message: 'Usuario no encontrado' });
            return;
        }    
        res.status(serviceLayerResponse.code).json(serviceLayerResponse.result);
    } catch (error) {
        const errorController = error as ServiceError;
        res.status(errorController.code).json(errorController.message);
    }    
}); // PUT - http://localhost:3000/api/user/reset-password/:idUser/:passwordResetCode con { "email": "carlosmario.reyesp@gmail.com", "password": "passwordC" }



//ACTUALIZAR EL PERFIL DEL USER
router.put("/profile-user", authRequired, async (req: Request, res: Response): Promise<void> => {
    try {
        const body = req.body;
        const { id } = req.user;
        const serviceLayerResponse = await putProfileUserService(body, id);
        if (!serviceLayerResponse) {
            res.status(401).json({ message: 'Usuario no encontrado' });
            return;
        }
        res.status(serviceLayerResponse.code).json(serviceLayerResponse.result);
    } catch (error) {
        const errorController = error as ServiceError;
        res.status(errorController.code).json(errorController.message);
    }
}); // PUT - http://localhost:3000/api/user/profile-user con { "name": "Mario ACT", "lastName": "Reyes", "corporateName": null, "typeDocumentId": "Cedula de Ciudadania", "documentId": "110521284", "typeRole": "Superadmin", "department": "Tolima", "city": "Ibagué", "address": "Cra 10 # 3 - 20", "phone": "3001002020", "email": "carlosmario.reyesp@gmail.com", "password": "password" }



//SUBIR LA IMAGEN DE PERFIL DEL USER
router.patch("/logo-user", authRequired, async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const { id } = req.user;
        const serviceLayerResponse = await patchLogoUserService(id, body);
        res.status(serviceLayerResponse.code).json(serviceLayerResponse);
    } catch (error) {
        const errorController = error as ServiceError;
        res.status(errorController.code).json(errorController.message);
    }
});  // PATCH - http://localhost:3000/api/user/logo-user con { "logo": "" }



//ELIMINAR LA IMAGEN DE PERFIL DEL USER
router.patch("/delete-logo", authRequired, async (req: Request, res: Response) => {
    try {
        const { id } = req.user;
        const serviceLayerResponse = await patchDeleteLogoUserService(id);
        res.status(serviceLayerResponse.code).json(serviceLayerResponse);
    } catch (error) {
        const errorController = error as ServiceError;
        res.status(errorController.code).json(errorController.message);
    }
});  // PATCH - http://localhost:3000/api/user/delete-logo con { "logo": "" }



//DESBLOQUEO DE CUENTA Y CAMBIO DE CONTRASEÑA USER
router.put("/reset-password-user-blocked/:idUser", async (req: Request, res: Response): Promise<void> => {
    try {
        const { idUser } = req.params;
        const body = req.body;
        const serviceLayerResponse = await putResetPasswordUserIsBlockedService(idUser, body);
        if (!serviceLayerResponse) {
            res.status(401).json({ message: 'Usuario no encontrado' });
            return;
        }
        res.status(serviceLayerResponse.code).json(serviceLayerResponse.result);
    } catch (error) {
        const errorController = error as ServiceError;
        res.status(errorController.code).json(errorController.message);
    }
});

export default router;