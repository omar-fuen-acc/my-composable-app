import fs from 'fs';
import { fileURLToPath } from 'url';
import { preload, Composable, EventEnvelope } from 'mercury-composable';

function getMockFolder() {
    const folder = fileURLToPath(new URL('..', import.meta.url));
    const filePath = folder.includes('\\') ? folder.replaceAll('\\', '/') : folder;
    const colon = filePath.indexOf(':');
    return colon === 1 ? filePath.substring(colon + 1) : filePath;
}

export class GetProducts implements Composable {

    @preload('v1.get.products', 5)
    initialize(): Composable {
        return this;
    }

    async handleEvent(_evt: EventEnvelope): Promise<object> {
        const filePath = getMockFolder() + 'mock/products.json';
        const raw = fs.readFileSync(filePath, 'utf-8');
        const products = JSON.parse(raw);
        return { products };
    }
}
