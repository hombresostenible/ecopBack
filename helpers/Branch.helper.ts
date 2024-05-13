import { getBranchByIdData } from "../data/User/branch.data";
import Branch from '../schema/User/branch.schema';
import { ServiceError } from '../types/Responses/responses.types';

//CHEQUEA SI LA BRANCH PERTENECE A UN USER O COMPANY
export const checkPermissionForBranch = async (idBranch: string, userId: string, userType: string): Promise<boolean> => {
    try {
        const branch = await getBranchByIdData(idBranch);
        if (!branch) return false;
        if (userType === 'User' && branch.userId !== userId) return false; 
        if (userType === 'Company' && branch.companyId !== userId) return false;
        return true;
    } catch (error) {
        if (error instanceof Error) {
            const customErrorMessage = error.message;
            throw new ServiceError(500, customErrorMessage, error);
        } else throw error;
    };
};

//VALIDA SI EL ROL ES SUPERADMIN Y LA SEDE PERTENECE AL MISMO USER
export const isBranchAssociatedUserSuperadminRole = async ( userId: string, typeRole: string): Promise<boolean> => {
    try {
        if (typeRole === 'Superadmin') {
            const branch = await Branch.findOne({
                where: { userId: userId },
            });
            return !!branch;
        };
        
        // Si el tipo de rol no es 'Superadmin', devolvemos false
        return false;
    } catch (error) {
        throw error;
    };
};



//VALIDA SI E ROL ES SUPERADMIN Y LA SEDE PERTENECE A LA MISMA COMPANY
export const isBranchAssociatedCompanySuperadminRole = async ( companyId: string, typeRole: string): Promise<boolean> => {
    try {
        if (typeRole === 'Superadmin') {
            const branch = await Branch.findOne({
                where: { companyId: companyId },
            });
            return !!branch;
        };

        // Si el tipo de rol no es 'Superadmin', devolvemos false
        return false;
    } catch (error) {
        throw error;
    };
};



//VALIDA SI EL ROL ES SUPERADMIN O ADMINISTRADOR Y LA SEDE PERTENECE AL MISMO USER
export const isBranchAssociatedWithUserRole = async ( branchId: string, userId: string, employerId: string, typeRole: string, userBranchId: string): Promise<boolean> => {
    try {
        if (typeRole === 'Superadmin') {
            const branch = await Branch.findOne({
                where: { id: branchId, userId: userId },
            });
            return !!branch;
        };
        if (typeRole === 'Administrador') {
            const branch = await Branch.findOne({
                where: { id: userBranchId, userId: employerId },
            });
            return !!branch;
        };
        
        // Si el tipo de rol no es ni 'Superadmin' ni 'Administrador', devolvemos false
        return false;
    } catch (error) {
        throw error;
    };
};



//VALIDA SI EL ROL ES SUPERADMIN O ADMINISTRADOR Y LA SEDE PERTENECE AL MISMO USER
export const isBranchAssociatedWithCompanyRole = async ( branchId: string, companyId: string, employerId: string, typeRole: string, userBranchId: string): Promise<boolean> => {
    try {
        if (typeRole === 'Superadmin') {
            const branch = await Branch.findOne({
                where: { id: branchId, companyId: companyId },
            });
            return !!branch;
        }
        if (typeRole === 'Administrador') {
            const branch = await Branch.findOne({
                where: { id: userBranchId, companyId: employerId },
            });
            return !!branch;
        }

        // Si el tipo de rol no es ni 'Superadmin' ni 'Administrador', devolvemos false
        return false;
    } catch (error) {
        throw error;
    }
};



//VALIDA SI LA SEDE DONDE SE CREARÁ EL REGISTRO, PERTENECE AL MISMO USER
export const isRegisterTransactionAssociatedWithUser = async (userId: string, branchId: string): Promise<boolean> => {
    try {
        const branch = await Branch.findOne({
            where: { id: branchId, userId: userId },
        });
        return !!branch;
    } catch (error) {
        throw error;
    }
};



//VALIDA SI LA SEDE DONDE SE CREARÁ EL REGISTRO, PERTENECE A LA MISMA COMPANY
export const isRegisterTransactionAssociatedWithCompany = async (companyId: string, branchId: string): Promise<boolean> => {
    try {
        const branch = await Branch.findOne({
            where: { id: branchId, companyId: companyId },
        });
        return !!branch;
    } catch (error) {
        throw error;
    }
};