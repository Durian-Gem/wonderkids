import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { ChildrenModule } from './modules/children/children.module';
import { ContentModule } from './modules/content/content.module';

@Module({
  imports: [
    AuthModule,
    ProfilesModule,
    ChildrenModule,
    ContentModule,
  ],
})
export class AppModule {}
