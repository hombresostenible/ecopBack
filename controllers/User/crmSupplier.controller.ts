import express, { Request, Response } from "express";
import {
    postRegisterCRMSuppliersService,
    getCRMSuppliersUserService,
    getCRMSuppliersBranchService,
    getCRMSupplierByIdService,
    putCRMSupplierService,
    deleteCRMSupplierService,
} from "../../services/User/crmSupplier.service";
import { authRequired } from '../../middlewares/Token/Token.middleware';
import { validateSchema } from '../../middlewares/Schema/Schema.middleware';
import { checkRole } from '../../middlewares/User/Role.middleware';
import { crmSupplierSchema } from '../../validations/User/crmSupplier.zod';
import { ServiceError } from "../../types/Responses/responses.types";
const router = express.Router();

//CONTROLLER PARA CREAR UN PROVEEDOR DEL USER
router.post("/", authRequired, validateSchema(crmSupplierSchema), async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const { id } = req.user;
        const serviceLayerResponse = await postRegisterCRMSuppliersService(body, id);
        res.status(serviceLayerResponse.code).json(serviceLayerResponse.result);
    } catch (error) {
        const errorController = error as ServiceError;
        res.status(errorController.code).json(errorController.message);
    }
}); // POST - http://localhost:3000/api/crmSupplier con { "entityUserId": "6dde1b74-2e3c-4915-bc93-6e39ac77afc8", "name": "Carlos", "lastName": "Reyes", "typeDocumentId": "Cedula de Ciudadania", "documentId": "1110521285", "verificationDigit": "5", "email": "carlosmario.reyesp@outlook.com", "phone": "3128082002", "department": "Caldas", "city": "La Dorada", "address": "Cra 100 # 200 - 300" }



//CONTROLLER PARA OBTENER TODOS LOS PROVEEDORES DE UN USER
router.get("/", authRequired, async (req: Request, res: Response) => {
    try {
        const { id } = req.user;
        const serviceLayerResponse = await getCRMSuppliersUserService(id);
        if (Array.isArray(serviceLayerResponse.result)) {
            res.status(200).json(serviceLayerResponse.result);
        } else {
            res.status(500).json({ message: "Error al obtener los proveedores del usuario" });
        }
    } catch (error) {
        const errorController = error as ServiceError;
        res.status(errorController.code).json(errorController.message);
    }
}); // GET - http://localhost:3000/api/crmSupplier



//CONTROLLER PARA OBTENER UN PROVEEDOR POR ID PERTENECIENTE AL USER
router.get("/:idCrmSupplier", authRequired, async (req: Request, res: Response) => {
    try {
        const { idCrmSupplier } = req.params;
        const { id } = req.user;
        const serviceLayerResponse = await getCRMSupplierByIdService(idCrmSupplier, id);
        res.status(serviceLayerResponse.code).json(serviceLayerResponse.result);
    } catch (error) {
        const errorController = error as ServiceError;
        res.status(errorController.code).json(errorController.message);
    }
}); // GET - http://localhost:3000/api/crmSupplier/:idCrmSupplier



//CONTROLLER PARA OBTENER TODOS LOS PROVEEDORES POR SEDE DE USER
router.get("/crmSupplier-branch/:idBranch", authRequired, async (req: Request, res: Response) => {
    try {
        const { idBranch } = req.params;
        const { id } = req.user;
        const serviceLayerResponse = await getCRMSuppliersBranchService(idBranch, id);
        if (Array.isArray(serviceLayerResponse.result)) {
            res.status(200).json(serviceLayerResponse.result);
        } else {            
            res.status(500).json({ message: "No se pudieron obtener los proveedores por sede del usuario" });
        }
    } catch (error) {
        const errorController = error as ServiceError;
        res.status(errorController.code).json(errorController.message);
    }
}); // GET - http://localhost:3000/api/crmSupplier/crmSupplier-branch/:idBranch



//CONTROLLER PARA ACTUALIZAR UN PROVEEDOR PERTENECIENTE AL USER
router.put("/:idCrmSupplier", authRequired, validateSchema(crmSupplierSchema), async (req: Request, res: Response) => {
    try {
        const { idCrmSupplier } = req.params;
        const body = req.body;
        const { id } = req.user;
        const serviceLayerResponse = await putCRMSupplierService(idCrmSupplier, body, id);
        res.status(serviceLayerResponse.code).json(serviceLayerResponse);
    } catch (error) {
        const errorController = error as ServiceError;
        res.status(errorController.code).json(errorController.message);
    }
}); // PUT - http://localhost:3000/api/crmSupplier/:idCrmSupplier con { "entityUserId": "6dde1b74-2e3c-4915-bc93-6e39ac77afc8", "name": "Carlos", "lastName": "Reyes", "typeDocumentId": "Cedula de Ciudadania", "documentId": "1110521285", "verificationDigit": "5", "email": "carlosmario.reyesp@outlook.com", "phone": "3128082002", "department": "Caldas", "city": "La Dorada", "address": "Cra 100 # 200 - 300" }



//CONTROLLER PARA ELIMINAR UN PROVEEDOR PERTENECIENTE AL USER
router.delete('/:idCrmSupplier', authRequired, checkRole, async (req: Request, res: Response) => {
    try {
        const { idCrmSupplier } = req.params;
        const { id } = req.user;
        const serviceLayerResponse = await deleteCRMSupplierService(idCrmSupplier, id); 
        res.status(serviceLayerResponse.code).json(serviceLayerResponse.message);
    } catch (error) {
        const errorController = error as ServiceError;
        res.status(errorController.code).json(errorController.message);
    }
}); // DELETE - http://localhost:3000/api/crmSupplier/:idCrmSupplier



export default router;