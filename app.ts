import express, { Application, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import morgan from 'morgan';
import xml2js from 'xml2js';
import db from './db';
import { routerApi } from './controllers/routes';

class Server {
    private app: Application;
    private port: string;
    static listen: any;

    constructor() {
        this.app = express();
        this.port = process.env.PORT || '8000';

        this.dbConnection();
        this.middlewares();
        this.routes();
    };

    private async dbConnection() {
        try {
            await db.authenticate();
            console.log('Base de datos conectada');
            await db.sync();
            // await db.sync({ force: true }); // En producción, puedes usar `await db.sync();` en lugar de `{ force: true }`,Esto elimina y recrea las tablas en cada reinicio
            console.log('Modelos sincronizados con la base de datos');
        } catch (error) {
            console.error('Error al conectar la base de datos:', error);
            throw new Error('No se pudo conectar a la base de datos');
        }
    };

    private routes() {
        routerApi(this.app);
    };

    private middlewares() {
        // Middleware para verificar las cookies antes de CORS
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            console.log('Cookies recibidas:', req.headers.cookie);
            next();
        });

        // Se define así para permitir más de un dominio autorizado para enviar y recibir las respuestas del servidor
        this.app.use(cors({
            origin: process.env.CORS_ALLOWED_ORIGIN,                // Especifica el origen permitido
            credentials: true,                                      // Habilita el intercambio de cookies entre el frontend y el backend
            allowedHeaders: ['Content-Type', 'Authorization'],      // Especifica los encabezados permitidos
        }));
        this.app.use(express.json());
        this.app.use(morgan('dev'));
        this.app.use(cookieParser());

        // Configurar bodyParser para aumentar el límite de carga
        this.app.use(bodyParser.json({ limit: '50mb' }));
        this.app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

        // Configurar express-fileupload
        this.app.use(fileUpload());

        // Middleware para procesar solicitudes XML
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            if (req.is('application/xml')) {
                let data = '';
                req.setEncoding('utf8');
                req.on('data', (chunk) => {
                    data += chunk;
                });
                req.on('end', () => {
                    xml2js.parseString(data, { explicitArray: false }, (err: any, result: any) => {
                        if (err) {
                            return next(err);
                        }
                        req.body = result;
                        next();
                    });
                });
            } else {
                next();
            }
        });
    };

    public listen() {
        this.app.listen(this.port, () => {
            console.log('SERVER ON PORT ' + this.port);
        }).on('error', (error: NodeJS.ErrnoException) => {
            console.error('Error al iniciar el servidor:', error);
            process.exit(1);
        });
    };
};

export default Server;
