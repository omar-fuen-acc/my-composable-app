import fs from 'fs';
import { fileURLToPath } from 'url';
import { preload, Composable, EventEnvelope } from 'mercury-composable';

function getMockFolder() {
    const folder = fileURLToPath(new URL('..', import.meta.url));
    const filePath = folder.includes('\\') ? folder.replaceAll('\\', '/') : folder;
    const colon = filePath.indexOf(':');
    return colon === 1 ? filePath.substring(colon + 1) : filePath;
}

export class GetProductById implements Composable {

    @preload('v1.get.product.by.id', 5)
    initialize(): Composable {
        return this;
    }

    async handleEvent(evt: EventEnvelope): Promise<EventEnvelope> {
        const id = parseInt(evt.getHeader('id'), 10);
        const filePath = getMockFolder() + 'mock/products.json';
        const products: object[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        const product = products.find((p: any) => p['item_id'] === id);

        if (!product) {
            return new EventEnvelope()
                .setStatus(302)
                .setHeader('location', '/api/products');
        }

        return new EventEnvelope().setStatus(200).setBody(product);
    }
}
