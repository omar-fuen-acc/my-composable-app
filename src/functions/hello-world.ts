import { preload, Composable, EventEnvelope } from 'mercury-composable';

export class HelloWorld implements Composable {

    @preload('v1.hello.world', 5)
    initialize(): Composable {
        return this;
    }

    async handleEvent(_evt: EventEnvelope): Promise<object> {
        return {
            message: 'Hello, World!'
        };
    }
}
