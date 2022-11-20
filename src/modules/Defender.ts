import type { users as User } from '@prisma/client';
import { Module } from '../structures/Module';

export class DefenderModule extends Module {
    public constructor(context: Module.Context, options: Module.Options) {
        super(context, {
            ...options,
            name: 'defender',
            localization: 'modulesDefenderName',
            cronIncludeAPIData: true,
            cronRequireOnlineStatusAPI: true,
        });
    }

    public override async cron(_user: User) {
        /**
         * Defender module will:
         * - Will operate on the upcoming mod
         * - Will operate on an interval (x minutes) to detect unknown logins
         *   - 5 minutes is probably too close to being "heavy continuous polling of data"
         *   - 15?
         */
    }
}
