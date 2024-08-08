import { Request, Response, NextFunction } from 'express';

// MIDDLEWARE QUE VERIFICA SI EL USUARIO TIENE EL ROL DE SUPERADMIN
export const checkRoleAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && (req.user.typeRole === 'Superadmin')) {
        // Si el usuario tiene un rol permitido, pasa al siguiente middleware
        next();
    } else return res.status(403).json({ error: 'Acceso denegado. Tu rol no está autorizado para ejecutar esta acción' });
};



// MIDDLEWARE QUE VERIFICA SI EL USUARIO TIENE EL ROL AUTORIZADO PARA CREAR REGISTROS
export const checkRole = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && (req.user.typeRole === 'Superadmin')) {
        next();
    } else if (req.user.typeRole === 'Administrador') {
        next();
    } else return res.status(403).json({ error: 'Acceso denegado. Tu rol no está autorizado para ejecutar esta acción' });
};



// MIDDLEWARE QUE VERIFICA EL ROL AUTORIZADO PARA CREAR UN USUARIO DE PLATAFORMA. EL 'SUPERADMIN' PUEDE CREAR CUALQUIERA, Y EL 'ADMINISTRADOR' NO PUEDE CREAR OTRO 'ADMINISTRADOR', PERO SÍ 'VENDEDOR', 'CAJERO', 'OPERATIVO' Y 'CONTADOR'
export const checkRoleCreateUserPlatform = (req: Request, res: Response, next: NextFunction) => {
    const { typeRole } = req.user;
    const newUserTypeRole = req.body.typeRole;

    if (typeRole === 'Superadmin') {
        // Los Superadmin pueden crear cualquier tipo de usuario
        next();
    } else if (typeRole === 'Administrador' && newUserTypeRole === 'Administrador') {
        // Los Administrador no pueden crear otros Administrador
        res.status(403).json({ error: 'Tu rol como Administrador no permite crear otros Administradores' });
    } else if (typeRole === 'Administrador' && newUserTypeRole && newUserTypeRole !== 'Administrador') {
        // Los Administrador solo pueden crear 'Vendedor', 'Cajero', 'Operativo' y 'Contador'
        next();
    } else res.status(403).json({ error: 'Acceso denegado. Tu rol no está autorizado para ejecutar esta acción' });
};



// MIDDLEWARE QUE VERIFICA EL ROL AUTORIZADO PARA CREAR MASIVAMENTE USUARIOS DE PLATAFORMA. EL 'SUPERADMIN' PUEDE CREAR CUALQUIERA, Y EL 'ADMINISTRADOR' NO PUEDE CREAR OTRO 'ADMINISTRADOR', PERO SÍ 'VENDEDOR', 'CAJERO', 'OPERATIVO' Y 'CONTADOR'
export const checkRoleArrayCreateUserPlatform = (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    if (!user) return res.status(401).json({ error: 'Usuario no autenticado' });
    const { typeRole } = user;
    if (typeRole === 'Superadmin') return next();
    // Verifica si el usuario es 'Administrador'
    if (typeRole === 'Administrador') {
        // Si es 'Administrador', verifica cada objeto en el array
        if (!Array.isArray(req.body)) return res.status(400).json({ error: 'Se esperaba un array en el cuerpo de la solicitud' });

        for (const obj of req.body) {
            // Verifica si el 'Administrador' está tratando de crear otro 'Administrador'
            if (obj.typeRole === 'Administrador') return res.status(403).json({ error: 'Tu rol como Administrador no permite crear otros Administradores' });
            // Verifica si el 'Administrador' está autorizado para crear usuarios en la misma sucursal
            // if (obj.branchId !== userBranchId) return res.status(403).json({ error: 'Acceso denegado. Tu rol no está autorizado para ejecutar esta acción para uno o más registros' });
        }
        return next();
    }
    return res.status(403).json({ error: 'Acceso denegado. Tu rol no está autorizado para ejecutar esta acción' });
};



// MIDDLEWARE QUE VERIFICA SI EL USUARIO TIENE EL ROL AUTORIZADO PARA CREAR MASIVAMENTE REGISTROS (ASSETS, MERCHANDISES, ETC)
export const checkRoleArray = (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    if (!user) return res.status(401).json({ error: 'Usuario no autenticado' });
    const { typeRole } = user;
    if (typeRole === 'Superadmin') {
        return next();
    } else if (typeRole === 'Administrador') {
        if (Array.isArray(req.body)) {
            return next();
        } else return res.status(400).json({ error: 'Se esperaba un array en el cuerpo de la solicitud' });
    } else return res.status(403).json({ error: 'Acceso denegado. Tu rol no está autorizado para ejecutar esta acción' });
};