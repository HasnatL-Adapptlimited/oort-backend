import express from 'express';
import { graphqlUploadExpress } from 'graphql-upload';
import apollo from './apollo';
import { createServer, Server } from 'http';
import {
  corsMiddleware,
  authMiddleware,
  graphqlMiddleware,
  rateLimitMiddleware,
} from './middlewares';
import { router } from '../routes';
import { ApolloServer } from 'apollo-server-express';
import EventEmitter from 'events';
import i18next from 'i18next';
import Backend from 'i18next-node-fs-backend';
import i18nextMiddleware from 'i18next-http-middleware';
import { logger } from '../services/logger.service';
import { winstonLogger } from './middlewares/winston';
import { Form, ReferenceData, Resource } from '@models';
import buildSchema from '@utils/schema/buildSchema';
import { GraphQLSchema } from 'graphql';
import * as Sentry from '@sentry/node';

/**
 * Definition of the main server.
 */
class SafeServer {
  public app: any;

  public httpServer: Server;

  public apolloServer: ApolloServer;

  public status = new EventEmitter();

  /** Adds listeners to relevant collections in order to rebuild schema */
  constructor() {
    Form.watch().on('change', (data) => {
      if (data.operationType === 'insert' || data.operationType === 'delete') {
        // Reload schema on new form or form deletion
        this.update();
      } else if (data.operationType === 'update') {
        // When a form is updated, only reload schema if name, structure or status were updated
        const fieldsThatRequireSchemaUpdate = ['name', 'status', 'structure'];
        const updatedDocFields = Object.keys(
          data.updateDescription.updatedFields
        );
        if (
          updatedDocFields.some((f) =>
            fieldsThatRequireSchemaUpdate.includes(f)
          )
        ) {
          this.update();
        }
      }
    });

    // All reference data changes require schema update
    ReferenceData.watch().on('change', () => {
      this.update();
    });

    // All resource changes require schema update
    Resource.watch().on('change', (data) => {
      if (data.operationType === 'update') {
        // When a form is updated, only reload schema if name, structure or status were updated
        const fieldsThatRequireSchemaUpdate = ['fields'];
        const updatedDocFields = Object.keys(
          data.updateDescription.updatedFields
        );
        if (
          updatedDocFields.some(
            (f) =>
              fieldsThatRequireSchemaUpdate.includes(f) &&
              data.updateDescription.updatedFields[f].some(
                (field) => field.isCalculated === true
              )
          )
        ) {
          this.update();
        }
      }
    });
  }

  /**
   * Starts the server
   *
   * @param schema GraphQL schema.
   */
  public async start(schema: GraphQLSchema): Promise<void> {
    // === Sentry ===
    Sentry.init({
      dsn: 'https://37ca208310369a4cee685fd50e1105ad@o4504696331632640.ingest.sentry.io/4505997745782784',
      integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // enable Express.js middleware tracing
        new Sentry.Integrations.Express({
          // to trace all requests to the default router
          app: this.app,
          // alternatively, you can specify the routes you want to trace:
          // router: someRouter,
        }),
      ],

      // We recommend adjusting this value in production, or using tracesSampler
      // for finer control
      // tracesSampleRate: 1.0,
    });

    // === EXPRESS ===
    this.app = express();

    // === REQUEST SIZE ===
    this.app.use(express.json({ limit: '5mb' }));
    this.app.use(express.urlencoded({ limit: '5mb', extended: true }));

    // === ADD MIDDLEWARES ===
    this.app.use(Sentry.Handlers.requestHandler() as express.RequestHandler);
    this.app.use(winstonLogger);

    i18next
      .use(Backend)
      .use(i18nextMiddleware.LanguageDetector)
      .init({
        backend: {
          loadPath: 'src/i18n/{{lng}}.json',
        },
        fallbackLng: 'en',
        preload: ['en', 'test'],
      });
    this.app.use(rateLimitMiddleware);
    this.app.use(corsMiddleware);
    this.app.use(authMiddleware);
    this.app.use('/graphql', graphqlMiddleware);
    this.app.use(
      '/graphql',
      graphqlUploadExpress({ maxFileSize: 7340032, maxFiles: 10 })
    );
    this.app.use(i18nextMiddleware.handle(i18next));

    // === APOLLO ===
    this.apolloServer = await apollo(schema);
    this.apolloServer.applyMiddleware({ app: this.app });

    // === SUBSCRIPTIONS ===
    this.httpServer = createServer(this.app);
    this.apolloServer.installSubscriptionHandlers(this.httpServer);

    // === REST ===
    this.app.use(router);

    this.status.emit('ready');

    this.app.get('/', function rootHandler(req, res) {
      res.end('Hello world!');
    });

    this.app.use(Sentry.Handlers.errorHandler() as express.ErrorRequestHandler);

    this.app.use(function onError(err, req, res, next) {
      // The error id is attached to `res.sentry` to be returned
      // and optionally displayed to the user for support.
      res.statusCode = 500;
      res.end(res.sentry + '\n');
    });

    this.app.listen(4200);
  }

  /** Re-launches the server with updated schema */
  private async update(): Promise<void> {
    const schema = await buildSchema();
    this.httpServer.removeListener('request', this.app);
    this.httpServer.close();
    logger.info('🛑 Stopping server');
    this.apolloServer.stop().then(() => {
      logger.info('🔁 Reloading server');
      this.start(schema);
    });
  }
}

export { SafeServer };
