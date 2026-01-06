import { inject, injectable } from "inversify";
import container from "../inversify.config";
import { MessageBroker } from "../message-broker";
import { TYPES } from "../types";
import { IMessageHandler } from "./imessage-handler";
import { MappedResponder } from "./mapped-responder/mapped-responder";

@injectable()
export class MessageHandlerService {
    private messageHandlers: IMessageHandler[] = new Array<IMessageHandler>();

    constructor(
        @inject(TYPES.MessageBroker)
        private messageBroker: MessageBroker,
        @inject(TYPES.ResponseMap)
        private responseMap: Map<string, string | string[]>,
    ) {
        // Setup mapped responders
        for (const responseKey of Array.from(this.responseMap.keys())) {
            const mappedHandler = container.get<MappedResponder>(
                TYPES.MappedResponder,
            );
            const response = this.responseMap.get(responseKey);
            response && mappedHandler.setup(responseKey, response);
            this.messageHandlers.push(mappedHandler);
        }
    }

    public registerResponder(): void {
        this.messageHandlers.forEach((handler: IMessageHandler) =>
            this.messageBroker.onMessageReceived$
                // .pipe(
                // 	filter(message => message instanceof Message)
                // )
                .subscribe((message) => handler.Handle(message)),
        );
    }
}
