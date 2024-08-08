import { Op, Sequelize } from 'sequelize';
import sequelize from '../../db';
import Assets from '../../schema/User/assets.schema';
import { IAssets } from "../../types/User/assets.types";
import { ServiceError } from '../../types/Responses/responses.types';

//CREAR UN EQUIPO, HERRAMIENTA O MAQUINA EN LA SEDE DE UN USER
export const postAssetData = async (body: IAssets, userId: string): Promise<any> => {
    try {
        const existingAsset = await Assets.findOne({
            where: { nameItem: body.nameItem, branchId: body.branchId },
        });
        if (existingAsset) {
            if (existingAsset.userId === userId) return null;
            throw new ServiceError(400, "Ya existe un equipo, máquina o herramienta con el mismo nombre en esta sede, cámbialo");
        }
        // Si el activo no existe, crearlo en la base de datos
        const newAsset = await Assets.create({
            ...body,
            userId: userId,
        });
        return newAsset;
    } catch (error) {
        throw error;
    }
};



//CREAR DE FORMA MASIVA UN EQUIPO, HERRAMIENTA O MAQUINA EN LA SEDE DE UN USER DESDE EL EXCEL
export const postManyAssetData = async (body: IAssets, userId: string, typeRole: string): Promise<any> => {
    const t = await sequelize.transaction();
    try {
        // Verificar si el activo ya existe en la sede proporcionada
        const existingAsset = await Assets.findOne({
            where: { nameItem: body.nameItem, branchId: body.branchId },
            transaction: t,
        });
        // Si el activo ya existe, devuelve null
        if (existingAsset) {
            await t.rollback();
            return null;
        }
        // Si el activo no existe, crearlo en la base de datos
        const newAsset = await Assets.create({
            ...body,
        }, { transaction: t });
        await t.commit();
        return newAsset;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};



//OBTENER TODOS LOS EQUIPOS, HERRAMIENTAS O MAQUINAS DE UN USER
export const getAssetsData = async (userId: string): Promise<any> => {
    try {
        const userAsset = await Assets.findAll({
            where: { userId: userId },
            order: [ ['nameItem', 'ASC'] ]
        }); 
        return userAsset;
    } catch (error) {
        throw error;
    }
};



//OBTENER UN EQUIPO, HERRAMIENTA O MAQUINA POR ID PERTENECIENTE AL USER
export const getAssetByIdData = async (idAssets: string): Promise<any> => {
    try {
        const assetFound = await Assets.findOne({
            where: { id: idAssets },
            order: [ ['nameItem', 'ASC'] ]
        });
        return assetFound;
    } catch (error) {
        throw error;
    }
};



//OBTENER TODOS LOS EQUIPOS, HERRAMIENTAS O MAQUINAS POR SEDE PARA USER
export const getAssetBranchData = async (idBranch: string): Promise<any> => {
    try {
        const customerAssetFound = await Assets.findAll({
            where: {branchId: idBranch },
            order: [ ['nameItem', 'ASC'] ]
        });
        return customerAssetFound;
    } catch (error) {
        throw error;
    }
};



//OBTENER TODOS LOS EQUIPOS, HERRAMIENTAS O MAQUINAS DEL USER QUE TENGAN UNIDADES DADAS DE BAJA
export const getAssetsOffData = async (userId: string): Promise<any> => {
    try {
        const assetSFound = await Assets.findAll({
            where: {
                userId: userId,
                [Op.and]: [ Sequelize.literal(`json_length(inventoryOff) > 0`) ]
            },
            order: [ ['nameItem', 'ASC'] ]
        });
        return assetSFound;
    } catch (error) {
        throw error;
    }
};



//OBTENER TODOS LOS EQUIPOS, HERRAMIENTAS O MAQUINAS POR SEDE DEL USER QUE TENGAN UNIDADES DADAS DE BAJA
export const getAssetsOffByBranchData = async (idBranch: string, userId: string): Promise<any> => {
    try {
        const assetsWithInventoryOff = await Assets.findAll({
            where: {
                branchId: idBranch,
                userId: userId,
                [Op.and]: [
                    Sequelize.literal(`json_length(inventoryOff) > 0`)  // Filtrar donde inventoryOff no esté vacío
                ]
            },
            order: [ ['nameItem', 'ASC'] ]
        });
        return assetsWithInventoryOff;
    } catch (error) {
        throw error;
    }
};



//ACTUALIZAR UN EQUIPO, HERRAMIENTA O MAQUINA DEL USER
export const putAssetData = async (idAssets: string, body: IAssets, userId: string): Promise<IAssets | null> => {
    try {
        const existingBranchWithSameName = await Assets.findOne({
            where: { userId: userId, nameItem: body.nameItem, id: { [Op.not]: idAssets } },
        });
        if (existingBranchWithSameName) throw new ServiceError(403, "No es posible actualizar el equipo, máquina o herramienta porque ya existe una con ese mismo nombre");
        const [rowsUpdated] = await Assets.update(body, { where: { id: idAssets } });
        if (rowsUpdated === 0) throw new ServiceError(403, "No se encontró ningún equipo, máquina o herramienta para actualizar");
        const updatedAsset = await Assets.findByPk(idAssets);
        if (!updatedAsset) throw new ServiceError(404, "No se encontró ningún equipo, máquina o herramienta para actualizar");
        return updatedAsset;
    } catch (error) {
        throw error;
    }
};



//ACTUALIZAR DE FORMA MASIVA VARIOS EQUIPOS, HERRAMIENTAS O MAQUINAS DEL USER
export const putUpdateManyAssetData = async (body: IAssets, userId: string): Promise<any> => {
    const t = await sequelize.transaction();
    try {
        // Verificar si el activo ya existe en la sede proporcionado
        const existingBranchWithSameName = await Assets.findOne({
            where: { nameItem: body.nameItem, branchId: body.branchId, id: { [Op.not]: body.id } },
        });
        if (existingBranchWithSameName) throw new ServiceError(403, "No es posible actualizar el equipo, máquina o herramienta porque ya existe una con ese mismo nombre");
        // Actualizar el activo
        const [rowsUpdated] = await Assets.update(body, { where: { id: body.id } });
        if (rowsUpdated === 0) throw new ServiceError(403, "No se encontró ningún equipo, máquina o herramienta para actualizar");
        const updatedAsset = await Assets.findByPk(body.id);
        if (!updatedAsset) throw new ServiceError(404, "No se encontró ningún equipo, máquina o herramienta para actualizar");
        return updatedAsset;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};



//DAR DE BAJA UN EQUIPO, HERRAMIENTA O MAQUINA DEL USER
export const patchAssetData = async (idAssets: string, body: Partial<IAssets>): Promise<IAssets | null> => {
    const t = await sequelize.transaction();
    try {
        let whereClause: Record<string, any> = { id: idAssets };
        const existingAsset = await Assets.findOne({
            where: whereClause,
            transaction: t,
        });

        if (!existingAsset) throw new ServiceError(404, "No se encontró el activo");
        if (body.inventory !== undefined && body.inventory > existingAsset.inventory) throw new ServiceError(400, "No hay suficientes activos disponibles para dar de baja");
    
        if (body.inventoryOff !== undefined && body.inventoryOff.length > 0) {
            const IInventoryOffItem = body.inventoryOff[0]; // Accede al primer elemento de inventoryOff
            const currentDate = new Date(); // Obtener la fecha actual

            // Actualizar el inventario y agregar un nuevo elemento a inventoryOff
            existingAsset.inventory -= IInventoryOffItem.quantity || 0; // Restar la cantidad de activos dañados del inventario actual

            existingAsset.inventoryOff = existingAsset.inventoryOff.concat({ 
                date: currentDate, 
                quantity: (IInventoryOffItem.quantity || 0),
                reason: IInventoryOffItem.reason || 'Baja de activo',
                description: IInventoryOffItem.description,
            });
        }

        const [rowsUpdated] = await Assets.update({
            inventory: existingAsset.inventory,
            inventoryOff: existingAsset.inventoryOff
        }, {
            where: whereClause,
            transaction: t,
        });

        if (rowsUpdated === 0) throw new ServiceError(403, "No se encontró ningún equipo, máquina o herramienta para actualizar");
        const updatedAsset = await Assets.findByPk(idAssets, {
            transaction: t,
        });

        if (!updatedAsset) throw new ServiceError(404, "No se encontró ningún equipo, máquina o herramienta para actualizar");

        await t.commit();
        return updatedAsset;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};



//AUMENTA UNIDADES DEL INVENTARIO DE UN EQUIPO, HERRAMIENTA O MAQUINA DEL USER
export const patchAddInventoryAssetData = async (idAssets: string, body: Partial<IAssets>, userId: string): Promise<IAssets | null> => {
    try {
        let whereClause: Record<string, any> = { id: idAssets };
        whereClause.userId = userId;
        const existingAsset = await Assets.findOne({
            where: whereClause,
        });
        if (!existingAsset) throw new ServiceError(404, "No se encontró el equipo, máquina o herramienta");
        const addInventory = existingAsset.inventory + (body?.inventory ?? 0);
        const [rowsUpdated] = await Assets.update({ inventory: addInventory }, {
            where: whereClause,
        });
        if (rowsUpdated === 0) throw new ServiceError(403, "No se encontró ningún equipo, máquina o herramienta para actualizar");
        const updatedRawMaterial = await Assets.findByPk(idAssets);
        if (!updatedRawMaterial) throw new ServiceError(404, "No se encontró ningún equipo, máquina o herramienta para actualizar");
        return updatedRawMaterial;
    } catch (error) {
        throw error;
    }
};



//ELIMINAR UN EQUIPO, HERRAMIENTA O MAQUINA DEL USER
export const deleteAssetData = async (idAssets: string): Promise<void> => {
    try {
        const productFound = await Assets.findOne({ where: { id: idAssets } });
        if (!productFound) throw new Error("equipo, Máquina o herramienta no encontrada");
        await Assets.destroy({ where: { id: idAssets } });
    } catch (error) {
        throw error;
    }
};