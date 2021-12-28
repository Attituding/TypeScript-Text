import type { Differences } from '../@types/modules';
import type { UserAPIData } from '../@types/database';
import { Client } from 'discord.js';
import { ModuleData } from './ModuleData';
import { ModuleErrorHandler } from '../util/errors/handlers/ModuleErrorHandler';

export class ModuleHandler {
    readonly client: Client;
    readonly differences: Differences;
    readonly userAPIData: UserAPIData;

    constructor(
        client: Client,
        {
            differences,
            userAPIData,
        }: ModuleData,
    ) {
        this.client = client;
        this.differences = differences;
        this.userAPIData = userAPIData;
    }

    async init() {
        try {
            const promises = [];

            for (const module of this.userAPIData.modules) {
                promises.push(
                    this.client.modules
                        .get(module)!
                        .execute(this),
                );
            }

            await Promise.all(promises);
        } catch (error) {
            await new ModuleErrorHandler(error, this.userAPIData.discordID)
                .systemNotify();
        }
    }
}