import fs from 'fs';
import { fileURLToPath } from 'url';
import { Logger, AppConfig, Platform, RestAutomation, EventScriptEngine } from 'mercury-composable';
import { HelloWorld } from '../functions/hello-world.js';

const log = Logger.getInstance();

function getRootFolder() {
    const folder = fileURLToPath(new URL('..', import.meta.url));
    const filePath = folder.includes('\\') ? folder.replaceAll('\\', '/') : folder;
    const colon = filePath.indexOf(':');
    return colon === 1 ? filePath.substring(colon + 1) : filePath;
}

export class ComposableLoader {
    private static loaded = false;

    static async initialize() {
        if (!ComposableLoader.loaded) {
            ComposableLoader.loaded = true;
            try {
                const resourcePath = getRootFolder() + 'resources';
                if (!fs.existsSync(resourcePath)) {
                    throw new Error('Missing resources folder - run "npm run build" first');
                }
                const config = AppConfig.getInstance(resourcePath);
                const platform = Platform.getInstance();

                // Register the HelloWorld composable function
                platform.register('v1.hello.world', new HelloWorld(), 5);

                await new EventScriptEngine().start();
                if ('true' == config.getProperty('rest.automation')) {
                    await RestAutomation.getInstance().start();
                }
                platform.runForever();
                await platform.getReady();
            } catch (e) {
                log.error(`Unable to start - ${e.message}`);
            }
        }
    }
}
