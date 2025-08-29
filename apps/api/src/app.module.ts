import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { ChildrenModule } from './modules/children/children.module';
import { ContentModule } from './modules/content/content.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { AttemptsModule } from './modules/attempts/attempts.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReviewModule } from './modules/review/review.module';
import { BillingModule } from './modules/billing/billing.module';
import { TutorModule } from './modules/tutor/tutor.module';
import { PronunciationModule } from './modules/pronunciation/pronunciation.module';
import { PWAModule } from './modules/pwa/pwa.module';
import { EmailModule } from './modules/email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    ProfilesModule,
    ChildrenModule,
    ContentModule,
    LessonsModule,
    AttemptsModule,
    DashboardModule,
    ReviewModule,
    BillingModule,
    TutorModule,
    PronunciationModule,
    PWAModule,
    EmailModule,
  ],
})
export class AppModule {}
