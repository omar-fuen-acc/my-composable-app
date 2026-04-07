import fs from 'fs';
import { fileURLToPath } from 'url';
import { preload, Composable, EventEnvelope, AppException } from 'mercury-composable';

function getMockFolder() {
    const folder = fileURLToPath(new URL('..', import.meta.url));
    const filePath = folder.includes('\\') ? folder.replaceAll('\\', '/') : folder;
    const colon = filePath.indexOf(':');
    return colon === 1 ? filePath.substring(colon + 1) : filePath;
}

export class GetShoppingList implements Composable {

    @preload('v1.get.shopping.list', 5)
    initialize(): Composable {
        return this;
    }

    async handleEvent(evt: EventEnvelope): Promise<object> {
        const userId = evt.getHeader('user_id');
        if (!userId) {
            throw new AppException(400, 'user_id query parameter is required');
        }

        const cartsPath = getMockFolder() + 'mock/shoppingCarts.json';
        if (!fs.existsSync(cartsPath)) {
            throw new AppException(404, 'No shopping carts found');
        }

        const carts: object[] = JSON.parse(fs.readFileSync(cartsPath, 'utf-8'));
        const cart = carts.find((c: any) => c['user_id'] === userId);
        if (!cart) {
            throw new AppException(404, `No shopping cart found for user_id: ${userId}`);
        }

        return cart;
    }
}
