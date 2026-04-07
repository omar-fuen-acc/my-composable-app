import fs from 'fs';
import { fileURLToPath } from 'url';
import { Logger, AppConfig, Platform, RestAutomation, EventScriptEngine } from 'mercury-composable';
import { HelloWorld } from '../functions/hello-world.js';
import { GetProducts } from '../functions/get-products.js';
import { GetProductById } from '../functions/get-product-by-id.js';
import { AddToCart } from '../functions/add-to-cart.js';
import { GetShoppingList } from '../functions/get-shopping-list.js';

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

                platform.register('v1.hello.world', new HelloWorld(), 5);
                platform.register('v1.get.products', new GetProducts(), 5);
                platform.register('v1.get.product.by.id', new GetProductById(), 5);
                platform.register('v1.add.to.cart', new AddToCart(), 5);
                platform.register('v1.get.shopping.list', new GetShoppingList(), 5);

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
