import {
    getRawMaterialBranchByIdData,
    getRawMaterialByIdData,
} from "../data/User/rawMaterial.data";
import { ServiceError } from '../types/Responses/responses.types';

//CHEQUEA SI LAS RAWMATERIAL PERTENECEN A LA SEDE DE USER O COMPANY
export const checkPermissionForBranchRawMaterial = async (idBranch: string, userId: string, userType: string): Promise<boolean> => {
    try {
        const products = await getRawMaterialBranchByIdData(idBranch);
        if (!products) return false;
        for (const product of products) if ((userType === 'User' && product.userId !== userId) || (userType === 'Company' && product.companyId !== userId)) return false;
        return true;
    } catch (error) {
        if (error instanceof Error) {
            const customErrorMessage = error.message;
            throw new ServiceError(500, customErrorMessage, error);
        } else throw error;
    };
};



//CHEQUEA SI LA RAWMATERIAL PERTENECE A LA SEDE DE USER O COMPANY
export const checkPermissionForRawMaterial = async (idRawMaterial: string, userId: string, userType: string): Promise<boolean> => {
    try {
        const rawMaterial = await getRawMaterialByIdData(idRawMaterial);
        if (!rawMaterial) return false;
        if (userType === 'User' && rawMaterial.userId !== userId) return false; 
        if (userType === 'Company' && rawMaterial.companyId !== userId) return false;
        return true;
    } catch (error) {
        if (error instanceof Error) {
            const customErrorMessage = error.message;
            throw new ServiceError(500, customErrorMessage, error);
        } else throw error;
    };
};