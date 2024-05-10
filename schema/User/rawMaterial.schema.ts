import { DataTypes, Model } from 'sequelize';
import db from '../../db';
import Branch from './branch.schema';
import User from './user.schema';
import Company from './company.schema';

class RawMaterial extends Model {
    public id!: string;
    public nameItem!: string;
    public barCode!: string;
    public inventory!: number;
    public unitMeasure!: 'Unidades' | 'Ristra' | 'Decena' | 'Docena' | 'Miligramo' | 'Gramo' | 'Media libra' | 'Libra' | 'Kilogramo' | 'Caja' | 'Paca' | 'Arroba' | 'Bulto' | 'Saco' | 'Tonelada' | 'Mililitro' | 'Onza' | 'Litro' | 'Galon' | 'Pimpina' | 'Metro cubico' | 'Milimetro' | 'Centrimetro' | 'Pulgada' | 'Metro' | 'Centimetro cuadrado' | 'Metro cuadrado';
    public inventoryIncrease!: 'Si' | 'No';
    public periodicityAutomaticIncrease!: 'Diario' | 'Semanal' | 'Quincenal' | 'Mensual' | 'Bimestral' | 'Trimestral' | 'Semestral';
    public automaticInventoryIncrease!: number;
    public purchasePriceBeforeTax!: number;
    public IVA!: number;
    public packaged!: 'Si' | 'No';
    public primaryPackageType!: 'Ninguno' | 'Papel' | 'Papel de archivo' | 'Carton' | 'Aluminio' | 'Plegadiza' | 'Vidrio' | 'PET / PETE Polietileno Tereftalato' | 'HDPE Polietileno de alta densidad' | 'PVC Policloruro de Vinilo' | 'LDPE Polietileno de baja densidad' | 'PP Polipropileno' | 'PS Poliestireno' | 'Otros plasticos (Policarbonato, estireno, nylon)' | 'Hierro' | 'Icopor' | 'Biodegradable' | 'Plastico de burbujas';
    public expirationDate!: Date;    
    public returnablePackaging!: 'Si' | 'No';
    public quantityPerPackage!: number;
    public individualPackaging!: 'Si' | 'No';
    public secondaryPackageType!: 'Ninguno' | 'Papel' | 'Papel de archivo' | 'Carton' | 'Aluminio' | 'Plegadiza' | 'Vidrio' | 'PET / PETE Polietileno Tereftalato' | 'HDPE Polietileno de alta densidad' | 'PVC Policloruro de Vinilo' | 'LDPE Polietileno de baja densidad' | 'PP Polipropileno' | 'PS Poliestireno' | 'Otros plasticos (Policarbonato, estireno, nylon)' | 'Hierro' | 'Icopor' | 'Biodegradable' | 'Plastico de burbujas';
    public inventoryChanges!: { date: string; quantity: number, type: 'Ingreso' | 'Salida' }[];
    public sellingPrice!: number;
    public reasonManualDiscountingInventory!: 'Donado' | 'Desechado' | 'Caducado' | 'Perdido' | 'Hurtado';
    public quantityManualDiscountingInventory!: number;
    public salesCount!: number;
    
    //RELACION CON OTRAS TABLAS
    public branchId!: string;
    public userId!: string;
    public companyId!: string;
}

RawMaterial.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        nameItem: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        barCode: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        inventory: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        unitMeasure: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: [[ 'Unidades', 'Ristra', 'Decena', 'Docena', 'Miligramo', 'Gramo', 'Media libra', 'Libra', 'Kilogramo', 'Caja', 'Paca', 'Arroba', 'Bulto', 'Saco', 'Tonelada', 'Mililitro', 'Onza', 'Litro', 'Galon', 'Pimpina', 'Metro cubico', 'Milimetro', 'Centrimetro', 'Pulgada', 'Metro', 'Centimetro cuadrado', 'Metro cuadrado' ]],
            },
        },
        inventoryIncrease: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
              isIn: [[ 'Si', 'No' ]],
            },
            defaultValue: 'No',
        },
        periodicityAutomaticIncrease: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isIn: [[ 'Diario', 'Semanal', 'Quincenal', 'Mensual', 'Bimestral', 'Trimestral', 'Semestral' ]],
            },
        },        
        automaticInventoryIncrease: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
        },
        purchasePriceBeforeTax: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
        },
        IVA: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
        },
        packaged: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: [[ 'Si', 'No' ]],
            },
            defaultValue: 'No',
        },
        primaryPackageType: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isIn: [[ 'Ninguno', 'Papel', 'Papel de archivo', 'Carton', 'Aluminio', 'Plegadiza', 'Vidrio', 'PET / PETE Polietileno Tereftalato', 'HDPE Polietileno de alta densidad', 'PVC Policloruro de Vinilo', 'LDPE Polietileno de baja densidad', 'PP Polipropileno', 'PS Poliestireno', 'Otros plasticos (Policarbonato, estireno, nylon)', 'Hierro', 'Icopor', 'Biodegradable', 'Plastico de burbujas' ]],
            },
            defaultValue: 'Ninguno',
        },
        expirationDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        returnablePackaging: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
              isIn: [[ 'Si', 'No' ]],
            },
            defaultValue: 'No',
        },
        quantityPerPackage: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        individualPackaging: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
              isIn: [[ 'Si', 'No' ]],
            },
            defaultValue: 'No',
        },
        secondaryPackageType: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isIn: [[ 'Ninguno', 'Papel', 'Papel de archivo', 'Carton', 'Aluminio', 'Plegadiza', 'Vidrio', 'PET / PETE Polietileno Tereftalato', 'HDPE Polietileno de alta densidad', 'PVC Policloruro de Vinilo', 'LDPE Polietileno de baja densidad', 'PP Polipropileno', 'PS Poliestireno', 'Otros plasticos (Policarbonato, estireno, nylon)', 'Hierro', 'Icopor', 'Biodegradable', 'Plastico de burbujas' ]],
            },
            defaultValue: 'Ninguno',
        },
        inventoryChanges: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
        },
        sellingPrice: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
        },
        reasonManualDiscountingInventory: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isIn: [[ 'Donado', 'Desechado', 'Caducado', 'Perdido', 'Hurtado' ]],
            },
        },        
        quantityManualDiscountingInventory: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        salesCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },

        //RELACION CON OTRAS TABLAS
        branchId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        companyId: {
            type: DataTypes.UUID,
            allowNull: true,
        },
    },
    {
        sequelize: db,
        modelName: 'RawMaterial',
    }
);

RawMaterial.belongsTo(Branch, {
    foreignKey: 'branchId',
    as: 'branch',
});

RawMaterial.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
});

RawMaterial.belongsTo(Company, {
    foreignKey: 'companyId',
    as: 'company',
});

export default RawMaterial;