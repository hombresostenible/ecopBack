import RawMaterial from "../../../schema/User/rawMaterial.schema";
import { IItemsAccountsBook } from '../../../types/User/accountsBook.types';
import { ServiceError } from '../../../types/Responses/responses.types';

export const incomeFromCashSaleRawMaterials = async (item: IItemsAccountsBook, branchId: string, transactionType: string): Promise<any> => {
    const rawMaterialFound = await RawMaterial.findOne({
        where: { id: item.id, nameItem: item.nameItem, branchId: branchId },
    });
    if (!rawMaterialFound) throw new ServiceError(400, "La materia prima no existe en esta sede");

    if (transactionType === 'Ingreso') {
        if (item.quantity !== undefined) {
            try {
                rawMaterialFound.inventory -= item.quantity;
                rawMaterialFound.salesCount += item.quantity;

                const currentDate = new Date().toISOString();
                const quantity = -item.quantity;

                rawMaterialFound.setDataValue('inventoryChanges', rawMaterialFound.inventoryChanges.concat({ date: currentDate, quantity: quantity, type: 'Salida' }));
                await rawMaterialFound.save();
            } catch (error) {
                throw error;
            }
        } else {
            throw new ServiceError(400, "La cantidad no está definida para el descuento en el inventario de la materia prima");
        }
    }
};