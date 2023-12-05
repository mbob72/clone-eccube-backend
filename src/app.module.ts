import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MollieModule } from './mollie/mollie.module';
import {
  TypeOrmModule,
  // TypeOrmModuleOptions
} from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config/configuration';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { UsersModule } from './users/users.module';
import * as path from 'path';

@Module({
  imports: [
    // SYSTEM MODULES

    // .env || https://docs.nestjs.com/techniques/configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),

    // Just free playground database
    // ElephantSQL: https://api.elephantsql.com/console/9ca44960-3a70-432b-a47d-5de3c46000d7/details
    // ----------------------------------------
    // use DBeaver to connect to database
    // instructions: https://technology.amis.nl/database/quick-start-with-free-managed-postgresql-database-on-elephantsql/
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres', // configService.get<string>('DB_DIALECT') as TypeOrmModuleOptions['type'],
        url: configService.get<string>('DB_HOST'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        // entities: ['dist/**/*.entity.js'],
        // entities: [User],
        synchronize: true, // TODO: shouldn't be used in production - otherwise you can lose production data.
      }),
    }),

    // internalization
    // https://nestjs-i18n.com/quick-start
    I18nModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.getOrThrow('FALLBACK_LANGUAGE'),
        loaderOptions: {
          path: path.join(__dirname, '/i18n/'),
          watch: true,
        },
        typesOutputPath: path.join(
          __dirname,
          '../src/generated/i18n.generated.ts',
        ),
      }),
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),

    // APP MODULES

    AuthModule,
    MollieModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
