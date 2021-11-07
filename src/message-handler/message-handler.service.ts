import { Message } from "discord.js";
import { inject, injectable } from "inversify";
import { filter } from "rxjs";
import container from "../inversify.config";
import { MessageBroker } from "../message-broker";
import { TYPES } from "../types";
import { IMessageHandler } from "./imessage-handler";
import { MappedResponder } from "./mapped-responder/mapped-responder";

@injectable()
export class MessageHandlerService {

    private messageHandlers: IMessageHandler[] = new Array<IMessageHandler>();

    constructor(
        @inject(TYPES.MessageBroker) private messageBroker: MessageBroker,
        @inject(TYPES.ResponseMap) private responseMap: Map<string, string | string[]>
    ) {
        // Setup mapped responders
        for (let responseKey of Array.from(this.responseMap.keys())) {
            let mappedHandler = container.get<MappedResponder>(TYPES.MappedResponder);
            mappedHandler.setup(responseKey, this.responseMap.get(responseKey));
            this.messageHandlers.push(mappedHandler)
        }
    }

    public registerResponder(): void {
        this.messageHandlers.forEach((handler: IMessageHandler) =>
            this.messageBroker.onMessageReceived$
                .pipe(filter(message => message instanceof Message))
                .subscribe((message: Message) => handler.Handle(message)))
    }
}