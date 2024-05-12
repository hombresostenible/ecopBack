import { Op } from 'sequelize';
import sequelize from '../../db';
import Merchandise from '../../schema/User/merchandise.schema';
import { IMerchandise } from "../../types/User/merchandise.types";
import { ServiceError } from '../../types/Responses/responses.types';

//DATA PARA CREAR UNA MERCANCIA POR SEDE PARA USER
export const postMerchandiseData = async (body: IMerchandise, userId: string, userType: string, employerId: string, typeRole: string): Promise<any> => {
    const t = await sequelize.transaction();
    try {
        const existingMerchandise = await Merchandise.findOne({
            where: { nameItem: body.nameItem, branchId: body.branchId },
            transaction: t,
        });
        if (existingMerchandise) {
            if (existingMerchandise.getDataValue('userId') === userId && userType === 'User') {
                await t.rollback();
                return null;
            }
            await t.rollback();
            throw new ServiceError(400, "La mercancía ya existe en esta sede");
        }
        //Inventario por pimera vez
        const currentDate = new Date().toISOString(); // Obtén la fecha actual en formato ISO
        const initialInventory = body.inventory || 0;
        if (typeRole === 'Superadmin') {
            const newMerchandise = await Merchandise.create({
                ...body,
                userId: userType === 'User' ? userId : null,
                inventoryChanges: [{ date: currentDate, quantity: initialInventory, type: 'Ingreso' }],
            }, { transaction: t });
            await t.commit();
            return newMerchandise;
        }
        if (typeRole === 'Administrador') {            
            const newMerchandise = await Merchandise.create({
                ...body,
                userId: userType === 'User' ? employerId : null,
                inventoryChanges: [{ date: currentDate, quantity: initialInventory, type: 'Ingreso' }],
            }, { transaction: t });
            await t.commit();
            return newMerchandise;
        }
    } catch (error) {
        throw error;
    }
};



//DATA PARA CREAR MUCHAS MERCANCIAS POR SEDE PARA USER DESDE EL EXCEL
export const postManyMerchandiseData = async (body: IMerchandise, userId: string, userType: string, employerId: string, typeRole: string): Promise<any> => {
    const t = await sequelize.transaction();

    try {
        // Verificar si ls mercancía ya existe en la sede proporcionada
        const existingMerchandise = await Merchandise.findOne({
            where: { nameItem: body.nameItem, branchId: body.branchId },
            transaction: t,
        });
        // Si la mercancía ya existe, devuelve null
        if (existingMerchandise) {
            await t.rollback();
            return null;
        }
        // Si la mercancía no existe, crearlo en la base de datos
        if (typeRole === 'Superadmin') {
            const newMerchandise = await Merchandise.create({
                ...body,
                userId: userType === 'User' ? userId : null,
            }, { transaction: t });        
            await t.commit();
            return newMerchandise;            
        }
        if (typeRole === 'Administrador') {
            const newMerchandise = await Merchandise.create({
                ...body,
                userId: userType === 'User' ? employerId : null,
            }, { transaction: t });        
            await t.commit();
            return newMerchandise;            
        }
    } catch (error) {
        throw error;
    }
};



//DATA PARA OBTENER TODA LA MERCANCIA DEL USER
export const getMerchandiseByUserIdData = async (userId: string): Promise<any> => {
    try {
        const userProducts = await Merchandise.findAll({
            where: { userId: userId },
        });        
        return userProducts;
    } catch (error) {
        throw error;
    }
};



//DATA PARA OBTENER TODA LA MERCANCIA DE UNA SEDE PARA USER
export const getMerchandiseBranchByIdData = async (idBranch: string): Promise<any> => {
    try {
        const merchandisesFound = await Merchandise.findAll({
            where: { branchId: idBranch }
        });
        return merchandisesFound;
    } catch (error) {
        throw error;
    }
};



//DATA PARA OBTENER UNA MERCANCIA POR ID PERTENECIENTE AL USER
export const getMerchandiseByIdData = async (idMerchandise: string): Promise<any> => {
    try {
        const merchandiseFound = await Merchandise.findOne({ where: { id: idMerchandise } });
        return merchandiseFound;
    } catch (error) {
        throw error;
    }
};



//DATA PARA ACTUALIZAR UN PRODUCTO PERTENECIENTE AL USER
export const putMerchandiseData = async (idMerchandise: string, body: IMerchandise, userId: string, userType: string): Promise<IMerchandise | null> => {
    try {
        if (userType === 'User') {
            const existingBranchWithSameName = await Merchandise.findOne({
                where: { userId: userId, nameItem: body.nameItem, id: { [Op.not]: idMerchandise } },
            });
            if (existingBranchWithSameName) throw new ServiceError(403, "No es posible actualizar la mercancía porque ya existe uno con ese mismo nombre");
        }
        const [rowsUpdated] = await Merchandise.update(body, { where: { id: idMerchandise } });
        if (rowsUpdated === 0) throw new ServiceError(403, "No se encontró ninguna mercancía para actualizar");
        const updatedMerchandise = await Merchandise.findByPk(idMerchandise);
        if (!updatedMerchandise) throw new ServiceError(404, "No se encontró ninguna mercancía para actualizar");
        return updatedMerchandise;
    } catch (error) {
        throw error;
    }
};



//DATA PARA ACTUALIZAR DE FORMA MASIVA VARIAS MERCANCIAS
export const putUpdateManyMerchandiseData = async (body: IMerchandise, userId: string, userType: string): Promise<any> => {
    const t = await sequelize.transaction();

    try {
        if (userType === 'User') {
            const existingBranchWithSameName = await Merchandise.findOne({
                where: { nameItem: body.nameItem, branchId: body.branchId, id: { [Op.not]: body.id } },
            });
            if (existingBranchWithSameName) throw new ServiceError(403, "No es posible actualizar la mercancía porque ya existe una con ese mismo nombre");
        }
        const [rowsUpdated] = await Merchandise.update(body, { where: { id: body.id } });
        if (rowsUpdated === 0) throw new ServiceError(403, "No se encontró ninguna mercancía para actualizar");
        const updatedMachinery = await Merchandise.findByPk(body.id);
        if (!updatedMachinery) throw new ServiceError(404, "No se encontró ninguna mercancía para actualizar");
        return updatedMachinery;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};



//DATA PARA DAR DE BAJA UNA MERCANCIA DEL USER
export const patchMerchandiseData = async (idAssets: string, body: Partial<IMerchandise>, userId: string, userType: string): Promise<IMerchandise | null> => {
    try {
        let whereClause: Record<string, any> = { id: idAssets };
        if (userType === 'User') {
            whereClause.userId = userId;
        }
        const existingMerchandise = await Merchandise.findOne({
            where: whereClause,
        });
        if (!existingMerchandise) throw new ServiceError(404, "No se encontró el producto");
        const newInventory = existingMerchandise.inventory - (body?.quantityManualDiscountingInventory ?? 0);
        const [rowsUpdated] = await Merchandise.update({ inventory: newInventory }, {
            where: whereClause,
        });
        if (rowsUpdated === 0) throw new ServiceError(403, "No se encontró ninguna mercancía para actualizar");
        const updatedMerchandise = await Merchandise.findByPk(idAssets);
        if (!updatedMerchandise) throw new ServiceError(404, "No se encontró ninguna mercancía para actualizar");
        return updatedMerchandise;
    } catch (error) {
        throw error;
    }
};



//DATA PARA ELIMINAR UNA MERCANCIA PERTENECIENTE AL USER
export const deleteMerchandiseData = async (idMerchandise: string): Promise<void> => {
    try {
        const merchandiseFound = await Merchandise.findOne({ where: { id: idMerchandise } });
        if (!merchandiseFound) throw new Error("Maercancía no encontrada");
        await Merchandise.destroy({ where: { id: idMerchandise } });
    } catch (error) {
        throw error;
    }
};