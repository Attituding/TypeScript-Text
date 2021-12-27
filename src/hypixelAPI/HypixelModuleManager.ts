import type { RawUserAPIData, UserAPIData } from '../@types/database';
import { Client } from 'discord.js';
import { formattedUnix } from '../util/utility';
import { HypixelModuleDataManager } from './HypixelModuleDataManager';
import { HypixelModuleErrors } from './HypixelModuleErrors';
import { HypixelModuleInstance } from './HypixelModuleInstance';
import { HypixelModuleRequest } from './HypixelModuleRequest';
import { keyLimit } from '../../config.json';
import { RequestErrorHandler } from '../util/errors/handlers/RequestErrorHandler';
import { setTimeout } from 'node:timers/promises';
import { SQLiteWrapper } from '../database';
import Constants from '../util/Constants';
import { ModuleHandler } from '../module/ModuleHandler';

export class HypixelModuleManager {
    instance: HypixelModuleInstance;
    errors: HypixelModuleErrors;
    client: Client;
    request: HypixelModuleRequest;

    constructor(client: Client) {
        this.client = client;
        this.instance = new HypixelModuleInstance();
        this.errors = new HypixelModuleErrors(this.instance);
        this.request = new HypixelModuleRequest(this.instance);
    }

    async forever() {
        while (true) {
            await this.refreshData(); //eslint-disable-line no-await-in-loop
        }
    }

    async refreshData() {
        try {
            if (this.instance.resumeAfter > Date.now()) {
                await setTimeout(this.instance.resumeAfter - Date.now());
            }

            const allUsers = (await SQLiteWrapper.getAllUsers<
                RawUserAPIData,
                UserAPIData
            >({
                table: Constants.tables.api,
                columns: [
                    'discordID',
                    'uuid',
                    'modules',
                    'lastLogin',
                    'lastLogout',
                ],
            })) as UserAPIData[];

            const users = allUsers.filter(user => user.modules.length > 0);

            const keyQueryLimit = keyLimit * this.instance.keyPercentage;
            const intervalBetweenRequests =
                (60 / keyQueryLimit) * Constants.ms.second;

            for (const user of users) {
                const urls = this.request.generateURLS(user);
                (async () => {
                    try {
                        if (
                            this.instance.resumeAfter > Date.now() ||
                            this.client.config.enabled === false
                        ) {
                            return;
                        }

                        console.log(
                            formattedUnix({ date: true, utc: false }),
                            user.uuid,
                        );

                        const [cleanHypixelPlayer, cleanHypixelStatusData] =
                            await this.request.executeRequest(user, urls);

                        const oldUserAPIData = (await SQLiteWrapper.getUser<
                            RawUserAPIData,
                            UserAPIData
                        >({
                            discordID: user.discordID,
                            table: Constants.tables.api,
                            columns: ['*'],
                            allowUndefined: false,
                        })) as UserAPIData;

                        const hypixelModuleDataManager =
                            new HypixelModuleDataManager({
                                oldUserAPIData,
                                cleanHypixelPlayer,
                                cleanHypixelStatusData,
                            });

                        await hypixelModuleDataManager.updateUserAPIData();

                        const moduleHandler = new ModuleHandler(this.client, hypixelModuleDataManager);
                        await moduleHandler.init();
                    } catch (error) {
                        await new RequestErrorHandler(error, this)
                            .systemNotify();
                    }
                })();
                await setTimeout(intervalBetweenRequests * urls.length); //eslint-disable-line no-await-in-loop
            }
        } catch (error) {
            await new RequestErrorHandler(error, this)
                .systemNotify();
        }
    }
}
