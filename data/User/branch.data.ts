import { Op } from 'sequelize';
import sequelize from '../../db';
import Branch from '../../schema/User/branch.schema';
import User from '../../schema/User/user.schema';
import { IBranch } from "../../types/User/branch.types";
import { ServiceError } from "../../types/Responses/responses.types";

//DATA PARA CREAR UNA SEDE PARA USER
export const postBranchData = async (body: IBranch, userId: string): Promise<IBranch> => {
    try {
        const existingBranchWithSameNameAndCode = await Branch.findOne({
            where: { userId: userId, nameBranch: body.nameBranch },
        });
        const existingBranchWithSameName = await Branch.findOne({
            where: { userId: userId, nameBranch: body.nameBranch },
        });
        if (existingBranchWithSameNameAndCode) throw new ServiceError(403, "Ya existe una sede con ese mismo nombre y código");
        if (existingBranchWithSameName) throw new ServiceError(403, "Ya existe una sede con el mismo nombre");
        const newBranch = new Branch({
            ...body,
            userId: userId,
        });
        await newBranch.save();
        return newBranch;
    } catch (error) {
        throw error;
    };
};



//DATA PARA CREAR MASIVAMENTE SEDES PARA USER DESDE EL EXCEL
export const postManyBranchData = async (body: IBranch, userId: string): Promise<any> => {
    const t = await sequelize.transaction();
    try {
        const existingBranch = await Branch.findOne({
            where: { nameBranch: body.nameBranch },
            transaction: t,
        });
        if (existingBranch) {
            await t.rollback();
            return null;
        }
        // Si la sede no existe, crearla en la base de datos
        const newBranch = await Branch.create({
            ...body,
            userId: userId,
        }, { transaction: t });

        await t.commit();
        return newBranch;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};



//DATA PARA OBTENER TODAS LAS SEDES DE UN USER
export const getBranchsByUserIdData = async (userId: string): Promise<any> => {
    try {
        const userBranchs = await Branch.findAll({
            where: { userId: userId },
            // include: [
            //     {
            //         model: User,
            //         as: 'user', // Asociación con el alias definido en el modelo Branch
            //     },
            // ],
        });
        return userBranchs;
    } catch (error) {
        throw error;
    }
};



//DATA PARA OBTENER UNA SEDE POR ID PERTENECIENTE AL USER
export const getBranchByIdData = async (idBranch: string): Promise<any> => {
    try {
        const branch = await Branch.findByPk(idBranch, {
            include: [
                {
                    model: User,
                    as: 'user', // Asociación con el alias definido en el modelo Branch
                },
            ],
        });
        return branch;
    } catch (error) {
        throw error;
    }
};



//DATA PARA ACTUALIZAR UNA SEDE PERTENECIENTE AL USER
export const putBranchData = async (idBranch: string, body: IBranch, userId: string): Promise<IBranch> => {
    try {
        const existingBranchWithSameNameAndCode = await Branch.findOne({
            where: { userId: userId, nameBranch: body.nameBranch, id: { [Op.not]: idBranch } },
        });
        if (existingBranchWithSameNameAndCode) throw new ServiceError(403, "No es posible actualizar la sede porque ya existe una sede con ese mismo nombre y código");

        const existingBranchWithSameName = await Branch.findOne({
            where: { userId: userId, nameBranch: body.nameBranch, id: { [Op.not]: idBranch } },
        });
        if (existingBranchWithSameName) throw new ServiceError(403, "No es posible actualizar la sede porque ya existe una sede con el mismo nombre");
        const [rowsUpdated] = await Branch.update(body, { where: { id: idBranch } });
        if (rowsUpdated === 0) throw new ServiceError(403, "No se encontró ninguna sede para actualizar");
        const updatedbranch = await Branch.findByPk(idBranch);
        if (!updatedbranch) throw new ServiceError(404, "No se encontró ninguna sede actualizada");
        return updatedbranch;
    } catch (error) {
        throw error;
    }
};



//DATA PARA ELIMINAR UNA SEDE PERTENECIENTE AL USER
export const deleteBranchData = async (idBranch: string): Promise<void> => {
    try {
        const branchFound = await Branch.findOne({ where: { id: idBranch } });
        if (!branchFound) throw new Error('Sede no encontrada');
        await Branch.destroy({ where: { id: idBranch } });
    } catch (error) {
        throw error;
    }
};
