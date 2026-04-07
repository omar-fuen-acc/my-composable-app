import fs from 'fs';
import { fileURLToPath } from 'url';
import { preload, Composable, EventEnvelope, AppException } from 'mercury-composable';

function getMockFolder() {
    const folder = fileURLToPath(new URL('..', import.meta.url));
    const filePath = folder.includes('\\') ? folder.replaceAll('\\', '/') : folder;
    const colon = filePath.indexOf(':');
    return colon === 1 ? filePath.substring(colon + 1) : filePath;
}

interface CartItem {
    item_id: number;
    [key: string]: unknown;
}

interface ShoppingCart {
    user_id: string;
    items: CartItem[];
}

export class AddToCart implements Composable {

    @preload('v1.add.to.cart', 5)
    initialize(): Composable {
        return this;
    }

    async handleEvent(evt: EventEnvelope): Promise<object> {
        const input = evt.getBody() as Record<string, unknown>;
        const body = input['body'] as Record<string, unknown>;

        // 1. Validate request body
        if (!body || typeof body['user_id'] !== 'string' || !body['user_id']) {
            throw new AppException(400, 'user_id is required and must be a string');
        }
        if (!Array.isArray(body['items']) || body['items'].length === 0) {
            throw new AppException(400, 'items is required and must be a non-empty array of numbers');
        }
        const itemIds: number[] = (body['items'] as unknown[]).map((id, i) => {
            const n = Number(id);
            if (!Number.isInteger(n)) {
                throw new AppException(400, `items[${i}] must be a number`);
            }
            return n;
        });
        const userId: string = body['user_id'] as string;
        const mockFolder = getMockFolder();

        // 2. Match item IDs against products.json
        const products: CartItem[] = JSON.parse(fs.readFileSync(mockFolder + 'mock/products.json', 'utf-8'));
        const matchedProducts = products.filter(p => itemIds.includes(p['item_id'] as number));
        if (matchedProducts.length === 0) {
            throw new AppException(404, 'None of the provided item IDs exist in the product catalogue');
        }

        // 3. Read shoppingCarts.json
        const cartsPath = mockFolder + 'mock/shoppingCarts.json';
        const carts: ShoppingCart[] = JSON.parse(fs.readFileSync(cartsPath, 'utf-8'));

        // 4. Find existing cart or create a new one
        const existingIndex = carts.findIndex(c => c.user_id === userId);

        if (existingIndex !== -1) {
            // 5a. User exists — add only products not already in the cart
            const existingIds = new Set(carts[existingIndex].items.map(i => i.item_id));
            const newItems = matchedProducts.filter(p => !existingIds.has(p['item_id'] as number));
            carts[existingIndex].items.push(...newItems);
        } else {
            // 5b. New user — create cart record
            carts.push({ user_id: userId, items: matchedProducts });
        }

        // 6. Persist updated carts file
        fs.writeFileSync(cartsPath, JSON.stringify(carts, null, 2), 'utf-8');

        // 7. Return the user's current cart
        const updatedCart = carts.find(c => c.user_id === userId);
        return updatedCart;
    }
}
