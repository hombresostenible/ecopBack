import sequelize from '../../../db';
import Sustainability from '../../../schema/User/sustainability.schema';
import { ISustainability } from "../../../types/User/sustainability.types";
import { ServiceError } from '../../../types/Responses/responses.types';

//DATA PARA CREAR REGISTROS DE SOSTENIBILIDAD
export const postSustainabilityData = async (body: ISustainability, userId: string, userType: string): Promise<any> => {
    const t = await sequelize.transaction();
    try {
        const newSustainability = await Sustainability.create({
            ...body,
            userId: userType === 'User' ? userId : null,
            companyId: userType === 'Company' ? userId : null,
        }, { transaction: t });
        await t.commit();
        return newSustainability;
    } catch (error) {
        await t.rollback();
        throw new ServiceError(500, `Error al crear el registro de sustentabilidad: ${error}`);
    }
};



//DATA PARA OBTENER TODOS LOS REGISTROS DE SOSTENIBILIDAD DE UN USER
export const getSustainabilitiesByUserIdData = async (userId: string): Promise<any> => {
    try {
        const userSustainabilities = await Sustainability.findAll({
            where: { userId: userId },
        });        
        return userSustainabilities;
    } catch (error) {
        throw error;
    }
};



//DATA PARA OBTENER TODOS LOS REGISTROS DE SOSTENIBILIDAD DE UNA COMPANY
export const getSustainabilitiesByCompanyIdData = async (companyId: string): Promise<any> => {
    try {
        const companySustainabilities = await Sustainability.findAll({
            where: { companyId: companyId },
        });
        return companySustainabilities;
    } catch (error) {
        throw error;
    }
};



//DATA PARA OBTENER TODOS LOS REGISTROS DE SOSTENIBILIDAD POR SEDE DE UN USER O COMPANY
export const getSustainabilityBranchByIdData = async (idBranch: string): Promise<any> => {
    try {
        const sustainabilityFound = await Sustainability.findAll({
            where: { branchId: idBranch }
        });
        return sustainabilityFound;
    } catch (error) {
        throw error;
    }
};



//DATA PARA OBTENER TODOS LOS SERVICIOS DE ENERGIA DEL USER O COMPANY DE LA TABLA ACCOUNTSBOOK SCHEMA
export const getEnergyConsumptionData = async (userId: string, userType: string): Promise<any> => {
    try {
        if(userType === 'User') {
            const energyConsumption = await Sustainability.findAll({ 
                where: { userId: userId, typeExpenses: 'Electricity' }
            });
            return energyConsumption;
        }
        if(userType === 'Company') {
            const energyConsumption = await Sustainability.findAll({ 
                where: { companyId: userId, typeExpenses: 'Electricity' }
            });
            return energyConsumption;
        }
    } catch (error) {
        throw error;
    }
};



//
export const getSustainabilityByIdData = async (idSustainability: string, userId: string, userType: string): Promise<any> => {
    try {
        if (userType === 'User') {
            const existingRecord = await Sustainability.findOne({
                where: { id: idSustainability, userId: userId }
            });
            return existingRecord || null;
        }
        if (userType === 'Company') {
            const existingRecord = await Sustainability.findOne({
                where: { id: idSustainability, companyId: userId }
            });
            return existingRecord || null;
        }
    } catch (error) {
        throw error;
    }
};



//DATA PARA OBTENER TODOS LOS SERVICIOS DE ENERGIA POR SEDE DEL USER O COMPANY
export const getEnergyConsumptionBranchData = async (idBranch: string, userId: string, userType: string): Promise<any> => {
    try {
        if(userType === 'User') {
            const energyConsumption = await Sustainability.findAll({ 
                where: { branchId: idBranch, userId: userId, typeExpenses: 'Electricity' },
            });
            return energyConsumption;
        }
        if(userType === 'Company') {
            const energyConsumption = await Sustainability.findAll({ 
                where: { branchId: idBranch, companyId: userId, typeExpenses: 'Electricity' },
            });
            return energyConsumption;
        }
    } catch (error) {
        throw error;
    }
};



//DATA PARA OBTENER TODOS LOS SERVICIOS DE AGUA DEL USER O COMPANY DE LA TABLA ACCOUNTSBOOK SCHEMA
export const getWaterConsumptionData = async (userId: string, userType: string): Promise<any> => {
    try {
        if(userType === 'User') {
            const energyConsumption = await Sustainability.findAll({ 
                where: { userId: userId, typeExpenses: 'Water' }
            });
            return energyConsumption;
        }
        if(userType === 'Company') {
            const energyConsumption = await Sustainability.findAll({ 
                where: { companyId: userId, typeExpenses: 'Water' },
            });
            return energyConsumption;
        }
    } catch (error) {
        throw error;
    }
};



//DATA PARA OBTENER TODOS LOS SERVICIOS DE ENERGIA POR SEDE DEL USER O COMPANY DE LA TABLA ACCOUNTSBOOK SCHEMA
export const getWaterConsumptionBranchData = async (idBranch: string, userId: string, userType: string): Promise<any> => {
    try {
        if(userType === 'User') {
            const energyConsumption = await Sustainability.findAll({ 
                where: { branchId: idBranch, userId: userId, typeExpenses: 'Water', },
            });
            return energyConsumption;
        }
        if(userType === 'Company') {
            const energyConsumption = await Sustainability.findAll({ 
                where: { branchId: idBranch, companyId: userId, typeExpenses: 'Water', },
            });
            return energyConsumption;
        }
    } catch (error) {
        throw error;
    }
};



//DATA PARA ACTUALIZAR UN REGISTRO DE SOSTENIBILIDAD DEL USER O COMPANY
export const putSustainabilityData = async (idSustainability: string, body: ISustainability, userId: string, userType: string): Promise<ISustainability | null> => {
    try {
        if (userType === 'User') {
            const existingSustainability = await Sustainability.findOne({
                where: { userId: userId, id: idSustainability },
            });
            if (!existingSustainability) throw new ServiceError(403, "No se encontró el registro");
        }    
        if (userType === 'Company') {
            const existingSustainability = await Sustainability.findOne({
                where: { userId: userId, id: idSustainability },
            });
            if (!existingSustainability) throw new ServiceError(403, "No se encontró el registro");
        }
        const [rowsUpdated] = await Sustainability.update(body, { where: { id: idSustainability } });
        if (rowsUpdated === 0) throw new ServiceError(403, "No se encontró ningún registro para actualizar");
        const updatedProduct = await Sustainability.findByPk(idSustainability);
        if (!updatedProduct) throw new ServiceError(404, "No se encontró ningún registro para actualizar");
        return updatedProduct as unknown as ISustainability;
    } catch (error) {
        throw error;
    }
};



//DATA PARA ELIMINAR UN REGISTRO DE SOSTENIBILIDAD PERTENECIENTE AL USER O COMPANY
export const deleteSustainabilityData = async (idSustainability: string, userId: string, userType: string): Promise<void> => {
    try {
        const sustainabilityFound = await Sustainability.findOne({
            where: { id: idSustainability, userId: userId, userType: userType }
        });
        if (!sustainabilityFound) throw new Error("Registro no encontrado");
        await Sustainability.destroy({ where: { id: idSustainability } });
    } catch (error) {
        throw error;
    }
};